import { Router } from 'express';
import meController from '../controllers/meController.js';
import { verifyToken } from '../middleware/auth.js';

const router = Router();

router.route('/').get(verifyToken, meController.me);

export default router;
