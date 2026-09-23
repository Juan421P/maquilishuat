import { Router } from 'express';
import saleController from '../controllers/sale.js';
import { verifyToken, requireRole } from '../middleware/auth.js';

const router = Router();

router.route('/')
    .get(verifyToken, requireRole('Admin'), saleController.getSales)
    .post(verifyToken, saleController.insertSale);

router.route('/mine')
    .get(verifyToken, saleController.getMySales);

router.route('/:id')
    .get(verifyToken, requireRole('Admin'), saleController.getSaleById)
    .put(verifyToken, requireRole('Admin'), saleController.updateSale)
    .delete(verifyToken, requireRole('Admin'), saleController.deleteSale);

export default router;
