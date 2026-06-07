import { Router } from 'express';
import controller from '../controllers/shopping_cart.js';
const router = Router();
router.route('/')
    .get(controller.get)
    .post(controller.post);
router.route('/:id')
    .get(controller.getById)
    .put(controller.put)
    .delete(controller.delete);
export default router;
