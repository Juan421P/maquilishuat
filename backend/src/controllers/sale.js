import saleModel from "../models/sale.js";
import cartModel from "../models/shopping_cart.js";
import productModel from "../models/product.js";
import { buildCartProducts } from "./shopping_cart.js";
import {
    HttpError,
    sendHttpError,
    isValidObjectId,
    validateAddress,
    SHIPPING_COST,
    CLIENT_PAYMENT_METHODS,
    ADMIN_PAYMENT_METHODS,
    PAYMENT_STATUSES,
} from "../utils/validation.js";

const saleController = {};

const round2 = (n) => Math.round(n * 100) / 100;

// Datos que se populan al devolver una venta al cliente.
const CART_POPULATE = {
    path: "shopping_cart_id",
    populate: { path: "products.product_id", select: "name price images product_type size flavor" }
};

//SELECT
saleController.getSales = async (req, res) => {
    try {
        const sales = await saleModel.find().populate("shopping_cart_id");
        return res.status(200).json(sales);
    } catch (error) {
        return sendHttpError(res, error);
    }
};

// SELECT de las ventas del cliente autenticado.
// Antes se traían TODAS las ventas de la base y se filtraban en memoria;
// ahora se buscan primero los carritos del usuario y luego solo sus ventas.
saleController.getMySales = async (req, res) => {
    try {
        const myCartIds = await cartModel.find({ user_id: req.user.id }).distinct("_id");
        const mySales = await saleModel.find({ shopping_cart_id: { $in: myCartIds } })
            .populate(CART_POPULATE)
            .sort({ createdAt: -1 });
        return res.status(200).json(mySales);
    } catch (error) {
        return sendHttpError(res, error);
    }
};

//SELECT por id
saleController.getSaleById = async (req, res) => {
    try {
        const sale = await saleModel.findById(req.params.id).populate("shopping_cart_id");
        if (!sale) {
            return res.status(404).json({ message: "Sale not found" });
        }
        return res.status(200).json(sale);
    } catch (error) {
        return sendHttpError(res, error);
    }
};

// Descuenta stock de forma atómica: cada update solo se aplica si todavía
// hay stock suficiente (`stock >= cantidad`), así dos compras simultáneas no
// pueden dejar el stock en negativo. Si algún producto falla, se devuelve el
// stock ya descontado a los anteriores.
const reserveStock = async (items) => {
    const reserved = [];
    try {
        for (const item of items) {
            const updated = await productModel.findOneAndUpdate(
                { _id: item.product_id, stock: { $gte: item.amount } },
                { $inc: { stock: -item.amount } },
                { returnDocument: "after" }
            );
            if (!updated) {
                const product = await productModel.findById(item.product_id).select("name stock");
                const available = Number(product?.stock) || 0;
                throw new HttpError(409, product
                    ? (available > 0
                        ? `Stock insuficiente para ${product.name}. Disponible: ${available}`
                        : `${product.name} está agotado`)
                    : "Uno de los productos ya no está disponible", {
                    code: "INSUFFICIENT_STOCK",
                    product_id: String(item.product_id),
                    available,
                });
            }
            reserved.push(item);
        }
        return reserved;
    } catch (error) {
        await releaseStock(reserved);
        throw error;
    }
};

const releaseStock = async (items) => {
    for (const item of items) {
        try {
            await productModel.updateOne({ _id: item.product_id }, { $inc: { stock: item.amount } });
        } catch (error) {
            console.log("error devolviendo stock " + error);
        }
    }
};

//INSERT
saleController.insertSale = async (req, res) => {
    let cart = null;
    let reserved = [];
    try {
        const { shopping_cart_id, delivery_address, payment_method } = req.body;
        // `payment_status` que mande el cliente se IGNORA a propósito: una
        // venta nueva siempre queda "pending" y solo el admin la cambia.

        if (!shopping_cart_id || !isValidObjectId(String(shopping_cart_id))) {
            throw new HttpError(400, "Carrito inválido");
        }

        cart = await cartModel.findById(shopping_cart_id);
        if (!cart) {
            throw new HttpError(404, "El carrito no existe");
        }
        // No se puede comprar con el carrito de otra persona cambiando el id.
        if (!cart.user_id || cart.user_id.toString() !== req.user.id) {
            cart = null; // no es suyo: nunca lo tocamos
            throw new HttpError(403, "Este carrito no te pertenece");
        }
        if (await saleModel.exists({ shopping_cart_id: cart._id })) {
            cart = null; // ya tiene venta: no se limpia
            throw new HttpError(409, "Este pedido ya fue registrado", { code: "DUPLICATE_SALE" });
        }

        const addressError = validateAddress(delivery_address);
        if (addressError) throw new HttpError(400, addressError);
        if (!CLIENT_PAYMENT_METHODS.includes(payment_method)) {
            throw new HttpError(400, "Selecciona un método de pago válido");
        }

        // Recalcula precios con los valores actuales de la base (por si el
        // admin cambió algo entre que se creó el carrito y se confirmó).
        const items = cart.products.map((p) => ({ product_id: String(p.product_id), amount: p.amount }));
        const { cartProducts, total } = await buildCartProducts(items);
        const discount = Math.min(Number(cart.discount) || 0, total);
        cart.products = cartProducts;
        cart.total = total;
        cart.discount = discount;
        cart.total_with_discount = round2(total - discount);

        reserved = await reserveStock(cartProducts);

        const shipping_cost = cart.total_with_discount > 0 ? SHIPPING_COST : 0;
        const newSale = new saleModel({
            shopping_cart_id: cart._id,
            delivery_address: delivery_address.trim(),
            payment_method,
            payment_status: "pending",
            shipping_cost,
            total: round2(cart.total_with_discount + shipping_cost),
        });
        await cart.save();
        await newSale.save();
        reserved = [];

        const sale = await saleModel.findById(newSale._id).populate(CART_POPULATE);
        return res.status(201).json({ message: "Sale saved", sale });
    } catch (error) {
        await releaseStock(reserved);
        if (error?.code === 11000) {
            // Índice único: otra request ya registró la venta de este carrito.
            return res.status(409).json({ message: "Este pedido ya fue registrado", code: "DUPLICATE_SALE" });
        }
        // Si la venta no se pudo crear, el carrito del usuario (sin venta)
        // se elimina para no dejar carritos huérfanos en la base.
        if (cart) {
            try {
                if (!(await saleModel.exists({ shopping_cart_id: cart._id }))) {
                    await cartModel.deleteOne({ _id: cart._id });
                }
            } catch (cleanupError) {
                console.log("error limpiando carrito " + cleanupError);
            }
        }
        return sendHttpError(res, error, "No se pudo registrar el pedido");
    }
};

//UPDATE (solo admin)
saleController.updateSale = async (req, res) => {
    try {
        const { shopping_cart_id, delivery_address, payment_method, payment_status } = req.body;
        if (payment_status !== undefined && !PAYMENT_STATUSES.includes(payment_status)) {
            throw new HttpError(400, "Estado de pago inválido");
        }
        if (payment_method !== undefined && !ADMIN_PAYMENT_METHODS.includes(payment_method)) {
            throw new HttpError(400, "Método de pago inválido");
        }
        const saleUpdated = await saleModel.findByIdAndUpdate(
            req.params.id,
            { shopping_cart_id, delivery_address, payment_method, payment_status },
            { new: true }
        );
        if (!saleUpdated) {
            return res.status(404).json({ message: "Sale not found" });
        }
        return res.status(200).json({ message: "Sale updated" });
    } catch (error) {
        return sendHttpError(res, error);
    }
};

//DELETE (solo admin)
saleController.deleteSale = async (req, res) => {
    try {
        const deletedSale = await saleModel.findByIdAndDelete(req.params.id);
        if (!deletedSale) {
            return res.status(404).json({ message: "Sale not found" });
        }
        return res.status(200).json({ message: "Sale deleted" });
    } catch (error) {
        return sendHttpError(res, error);
    }
};

export default saleController;
