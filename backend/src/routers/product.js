import { Router } from 'express';
import productController from '../controllers/product.js';
import upload from '../utils/cloudinaryConfig.js';
import { verifyToken, requireRole } from '../middleware/auth.js';

const router = Router();

router.route('/')
    .get(productController.getProducts)
    .post(verifyToken, requireRole('Admin'), upload.array('images', 5), productController.insertProduct);

router.route('/:id')
    .get(productController.getProductById)
    .put(verifyToken, requireRole('Admin'), upload.array('images', 5), productController.updateProduct)
    .delete(verifyToken, requireRole('Admin'), productController.deleteProduct);

export default router;
