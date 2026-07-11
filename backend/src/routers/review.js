import { Router } from 'express';
import controller from '../controllers/review.js';
import { verifyToken } from '../middleware/auth.js';

const router = Router();

router.route('/').post(verifyToken, controller.create);
router.route('/mine').get(verifyToken, controller.getMine);
router.route('/product/:productId').get(controller.getByProduct);

export default router;
