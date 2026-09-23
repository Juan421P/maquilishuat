import reviewModel from "../models/review.js";
import cartModel from "../models/shopping_cart.js";
import saleModel from "../models/sale.js";
import { HttpError, sendHttpError, isValidObjectId } from "../utils/validation.js";

const controller = {};

const COMMENT_MAX = 500;

controller.getByProduct = async (req, res) => {
    try {
        if (!isValidObjectId(req.params.productId)) {
            throw new HttpError(400, "Producto inválido");
        }
        const reviews = await reviewModel.find({ product_id: req.params.productId })
            .populate('user_id', 'name lastname')
            .sort({ createdAt: -1 });
        const average = reviews.length
            ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
            : 0;
        return res.status(200).json({ reviews, average, count: reviews.length });
    } catch (error) {
        return sendHttpError(res, error, "Error al obtener las reseñas");
    }
};

controller.getMine = async (req, res) => {
    try {
        const reviews = await reviewModel.find({ user_id: req.user.id })
            .populate('product_id', 'name images product_type')
            .sort({ createdAt: -1 });
        return res.status(200).json(reviews);
    } catch (error) {
        return sendHttpError(res, error, "Error al obtener tus reseñas");
    }
};

controller.create = async (req, res) => {
    try {
        const { product_id } = req.body;
        const rating = Number(req.body.rating);
        const comment = typeof req.body.comment === "string" ? req.body.comment.trim() : "";

        if (req.user.userType !== "Client") {
            throw new HttpError(403, "Solo los clientes pueden calificar productos");
        }
        if (!product_id || !isValidObjectId(String(product_id))) {
            throw new HttpError(400, "Producto inválido");
        }
        if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
            throw new HttpError(400, "La calificación debe ser un número entero de 1 a 5");
        }
        if (comment.length > COMMENT_MAX) {
            throw new HttpError(400, `El comentario no puede superar ${COMMENT_MAX} caracteres`);
        }
        // Solo puede calificar quien tiene una venta con ese producto
        const cartsWithProduct = await cartModel.find({
            user_id: req.user.id,
            "products.product_id": product_id
        }).select('_id');
        const purchase = cartsWithProduct.length
            ? await saleModel.findOne({ shopping_cart_id: { $in: cartsWithProduct.map(c => c._id) } })
            : null;
        if (!purchase) {
            throw new HttpError(403, "Solo puedes calificar productos que hayas comprado", { code: "NOT_PURCHASED" });
        }
        if (await reviewModel.exists({ product_id, user_id: req.user.id })) {
            throw new HttpError(409, "Ya calificaste este producto", { code: "ALREADY_REVIEWED" });
        }
        const review = new reviewModel({ product_id, user_id: req.user.id, rating, comment });
        await review.save();
        return res.status(201).json({ message: 'review created', review });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({ message: "Ya calificaste este producto", code: "ALREADY_REVIEWED" });
        }
        return sendHttpError(res, error, "No se pudo guardar la reseña");
    }
};

export default controller;
