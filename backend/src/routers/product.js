import { Router } from 'express';
import productController from '../controllers/product.js';
import upload from '../utils/cloudinaryConfig.js';

const router = Router();

router.route('/')
    .get(productController.getProducts)
    .post(upload.array('images', 5), productController.insertProduct);

router.route('/:id')
    .get(productController.getProductById)
    .put(upload.array('images', 5), productController.updateProduct)
    .delete(productController.deleteProduct);

export default router;
