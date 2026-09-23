import cartModel from '../models/shopping_cart.js';
import productModel from '../models/product.js';
import { HttpError, isValidObjectId, sendHttpError } from '../utils/validation.js';

const controller = {};

const MAX_ITEMS = 50;
const MAX_AMOUNT_PER_ITEM = 999;

const isAdmin = (req) => req.user?.userType === 'Admin';
const round2 = (n) => Math.round(n * 100) / 100;

controller.get = async (req, res) => {
    try {
        const carts = await cartModel.find()
            .populate('user_id', 'name lastname email')
            .populate('products.product_id', 'name price');
        return res.status(200).json(carts);
    } catch (error) {
        return sendHttpError(res, error, 'Error al obtener los carritos');
    }
};

controller.getById = async (req, res) => {
    try {
        if (!isValidObjectId(req.params.id)) {
            throw new HttpError(400, 'Identificador de carrito inválido');
        }
        const cart = await cartModel.findById(req.params.id)
            .populate('user_id', 'name lastname email')
            .populate('products.product_id', 'name price');
        if (!cart) {
            throw new HttpError(404, 'Carrito no encontrado');
        }
        // Un cliente solo puede ver sus propios carritos (antes cualquier
        // usuario autenticado podía leer el carrito y el correo de otro).
        const ownerId = cart.user_id?._id?.toString() || cart.user_id?.toString();
        if (!isAdmin(req) && ownerId !== req.user.id) {
            throw new HttpError(403, 'No tienes permiso para ver este carrito');
        }
        return res.status(200).json(cart);
    } catch (error) {
        return sendHttpError(res, error, 'Error al obtener el carrito');
    }
};

// Valida la lista que manda el cliente y la normaliza: ids válidos,
// cantidades enteras >= 1 y productos repetidos combinados en una sola línea.
const normalizeItems = (products) => {
    if (!Array.isArray(products) || products.length === 0) {
        throw new HttpError(400, 'El carrito está vacío');
    }
    if (products.length > MAX_ITEMS) {
        throw new HttpError(400, `El carrito no puede tener más de ${MAX_ITEMS} productos distintos`);
    }
    const merged = new Map();
    for (const item of products) {
        const productId = typeof item?.product_id === 'string' ? item.product_id : String(item?.product_id ?? '');
        const amount = Number(item?.amount);
        if (!isValidObjectId(productId)) {
            throw new HttpError(400, 'Producto inválido en el carrito');
        }
        if (!Number.isInteger(amount) || amount < 1 || amount > MAX_AMOUNT_PER_ITEM) {
            throw new HttpError(400, 'La cantidad de cada producto debe ser un número entero mayor que 0');
        }
        merged.set(productId, (merged.get(productId) || 0) + amount);
    }
    return [...merged.entries()].map(([product_id, amount]) => ({ product_id, amount }));
};

// Precios y stock SIEMPRE salen de la base de datos, nunca del cliente.
export const buildCartProducts = async (products) => {
    const items = normalizeItems(products);
    let total = 0;
    const cartProducts = [];
    for (const item of items) {
        const productFound = await productModel.findById(item.product_id);
        if (!productFound) {
            throw new HttpError(404, 'Uno de los productos del carrito ya no está disponible', {
                product_id: item.product_id,
            });
        }
        const stock = Number(productFound.stock) || 0;
        if (item.amount > stock) {
            throw new HttpError(409, stock > 0
                ? `Stock insuficiente para ${productFound.name}. Disponible: ${stock}`
                : `${productFound.name} está agotado`, {
                code: 'INSUFFICIENT_STOCK',
                product_id: item.product_id,
                available: stock,
            });
        }
        const price = Number(productFound.price) || 0;
        const subtotal = round2(price * item.amount);
        total += subtotal;
        cartProducts.push({
            product_id: item.product_id,
            amount: item.amount,
            subtotal
        });
    }
    return { cartProducts, total: round2(total) };
};

// Solo el admin puede aplicar descuentos. Antes el cliente podía mandar
// cualquier `discount` y pagar menos (o nada).
const resolveDiscount = (req, discount, total) => {
    if (!isAdmin(req)) return 0;
    const d = Number(discount) || 0;
    if (d < 0 || d > total) {
        throw new HttpError(400, 'El descuento debe estar entre 0 y el total del carrito');
    }
    return round2(d);
};

controller.post = async (req, res) => {
    try {
        const { products, discount } = req.body;
        const { cartProducts, total } = await buildCartProducts(products);
        const appliedDiscount = resolveDiscount(req, discount, total);
        const newCart = new cartModel({
            products: cartProducts,
            user_id: req.user.id,
            total,
            discount: appliedDiscount,
            total_with_discount: round2(total - appliedDiscount)
        });
        await newCart.save();
        return res.status(200).json({ message: 'shopping cart created', cart: newCart });
    } catch (error) {
        return sendHttpError(res, error, 'Error al crear el carrito');
    }
};

controller.put = async (req, res) => {
    try {
        const { products, user_id, discount } = req.body;
        const { cartProducts, total } = await buildCartProducts(products);
        const appliedDiscount = resolveDiscount(req, discount, total);
        const cart = await cartModel.findByIdAndUpdate(
            req.params.id,
            {
                products: cartProducts,
                user_id,
                total,
                discount: appliedDiscount,
                total_with_discount: round2(total - appliedDiscount)
            },
            { new: true }
        );
        if (!cart) {
            throw new HttpError(404, 'Carrito no encontrado');
        }
        return res.status(200).json({ message: 'shopping cart updated', cart });
    } catch (error) {
        return sendHttpError(res, error, 'Error al actualizar el carrito');
    }
};

controller.delete = async (req, res) => {
    try {
        const cart = await cartModel.findByIdAndDelete(req.params.id);
        if (!cart) {
            throw new HttpError(404, 'Carrito no encontrado');
        }
        return res.status(200).json({ message: 'shopping cart deleted' });
    } catch (error) {
        return sendHttpError(res, error, 'Error al eliminar el carrito');
    }
};

export default controller;
