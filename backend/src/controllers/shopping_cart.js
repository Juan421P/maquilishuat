import cartModel from '../models/shopping_cart.js';
import productModel from '../models/product.js';

const controller = {};

controller.get = async (req, res) => {
    try {
        const carts = await cartModel.find()
            .populate('user_id', 'name lastname email')
            .populate('products.product_id', 'name price');
        return res.status(200).json(carts);
    } catch (error) {
        return res.status(500).json({
            message: 'error retrieving shopping carts',
            error: error.message
        });
    }
};

controller.getById = async (req, res) => {
    try {
        const cart = await cartModel.findById(req.params.id)
            .populate('user_id', 'name lastname email')
            .populate('products.product_id', 'name price');
        if (!cart) {
            return res.status(404).json({ message: 'shopping cart not found' });
        }
        return res.status(200).json(cart);
    } catch (error) {
        return res.status(500).json({
            message: 'error retrieving shopping cart',
            error: error.message
        });
    }
};

const buildCartProducts = async (products) => {
    let total = 0;
    const cartProducts = [];
    for (const item of products) {
        const productFound = await productModel.findById(item.product_id);
        if (!productFound) {
            throw new Error(`product ${item.product_id} not found`);
        }
        const subtotal = productFound.price * item.amount;
        total += subtotal;
        cartProducts.push({
            product_id: item.product_id,
            amount: item.amount,
            subtotal
        });
    }
    return { cartProducts, total };
};

controller.post = async (req, res) => {
    try {
        const { products, user_id, discount } = req.body;
        const { cartProducts, total } = await buildCartProducts(products);
        const appliedDiscount = discount || 0;
        const newCart = new cartModel({
            products: cartProducts,
            user_id,
            total,
            discount: appliedDiscount,
            total_with_discount: total - appliedDiscount
        });
        await newCart.save();
        return res.status(200).json({ message: 'shopping cart created', cart: newCart });
    } catch (error) {
        return res.status(500).json({
            message: 'error creating shopping cart',
            error: error.message
        });
    }
};

controller.put = async (req, res) => {
    try {
        const { products, user_id, discount } = req.body;
        const { cartProducts, total } = await buildCartProducts(products);
        const appliedDiscount = discount || 0;
        const cart = await cartModel.findByIdAndUpdate(
            req.params.id,
            {
                products: cartProducts,
                user_id,
                total,
                discount: appliedDiscount,
                total_with_discount: total - appliedDiscount
            },
            { new: true }
        );
        if (!cart) {
            return res.status(404).json({ message: 'shopping cart not found' });
        }
        return res.status(200).json({ message: 'shopping cart updated', cart });
    } catch (error) {
        return res.status(500).json({
            message: 'error updating shopping cart',
            error: error.message
        });
    }
};

controller.delete = async (req, res) => {
    try {
        const cart = await cartModel.findByIdAndDelete(req.params.id);
        if (!cart) {
            return res.status(404).json({ message: 'shopping cart not found' });
        }
        return res.status(200).json({ message: 'shopping cart deleted' });
    } catch (error) {
        return res.status(500).json({
            message: 'error deleting shopping cart',
            error: error.message
        });
    }
};

export default controller;
