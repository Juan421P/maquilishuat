import { Router } from 'express';
import controller from '../controllers/shopping_cart.js';
import { verifyToken, requireRole } from '../middleware/auth.js';
const router = Router();
router.route('/')
    .get(verifyToken, requireRole('Admin'), controller.get)
    .post(verifyToken, controller.post);
router.route('/:id')
    .get(verifyToken, controller.getById)
    .put(verifyToken, requireRole('Admin'), controller.put)
    .delete(verifyToken, requireRole('Admin'), controller.delete);
export default router;
