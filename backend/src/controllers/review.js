import reviewModel from "../models/review.js";
import cartModel from "../models/shopping_cart.js";
import saleModel from "../models/sale.js";

const controller = {};

controller.getByProduct = async (req, res) => {
    try {
        const reviews = await reviewModel.find({ product_id: req.params.productId })
            .populate('user_id', 'name lastname')
            .sort({ createdAt: -1 });

        const average = reviews.length
            ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
            : 0;

        return res.status(200).json({ reviews, average, count: reviews.length });
    } catch (error) {
        return res.status(500).json({
            message: 'error retrieving reviews',
            error: error.message
        });
    }
};

controller.getMine = async (req, res) => {
    try {
        const reviews = await reviewModel.find({ user_id: req.user.id })
            .populate('product_id', 'name');
        return res.status(200).json(reviews);
    } catch (error) {
        return res.status(500).json({
            message: 'error retrieving reviews',
            error: error.message
        });
    }
};

controller.create = async (req, res) => {
    try {
        const { product_id, rating, comment } = req.body;

        if (!product_id || !rating) {
            return res.status(400).json({ message: 'product_id and rating are required' });
        }
        if (rating < 1 || rating > 5) {
            return res.status(400).json({ message: 'rating must be between 1 and 5' });
        }

        // Solo puede calificar quien tiene una venta con ese producto
        const cartsWithProduct = await cartModel.find({
            user_id: req.user.id,
            products: { $elemMatch: { product_id } }
        }).select('_id');

        if (cartsWithProduct.length === 0) {
            return res.status(403).json({ message: 'solo puedes calificar productos que hayas comprado' });
        }

        const cartIds = cartsWithProduct.map(c => c._id);
        const purchase = await saleModel.findOne({ shopping_cart_id: { $in: cartIds } });

        if (!purchase) {
            return res.status(403).json({ message: 'solo puedes calificar productos que hayas comprado' });
        }

        const review = new reviewModel({ product_id, user_id: req.user.id, rating, comment });
        await review.save();

        return res.status(201).json({ message: 'review created', review });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'ya calificaste este producto' });
        }
        return res.status(500).json({
            message: 'error creating review',
            error: error.message
        });
    }
};

export default controller;
