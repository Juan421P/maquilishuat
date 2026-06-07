import { Router } from 'express';
import productController from '../controllers/product.js';

const router = Router();

router.route('/')
    .get(productController.getProducts)
    .post(productController.insertProduct);

router.route('/:id')
    .get(productController.getProductById)
    .put(productController.updateProduct)
    .delete(productController.deleteProduct);

export default router;
