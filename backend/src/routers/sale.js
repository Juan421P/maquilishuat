import { Router } from 'express';
import saleController from '../controllers/sale.js';

const router = Router();

router.route('/')
    .get(saleController.getSales)
    .post(saleController.insertSale);

router.route('/:id')
    .get(saleController.getSaleById)
    .put(saleController.updateSale)
    .delete(saleController.deleteSale);

export default router;
