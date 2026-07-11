import { Router } from 'express';
import controller from '../controllers/admin.js';
import upload from '../utils/cloudinaryConfig.js';
import { verifyToken, requireRole } from '../middleware/auth.js';
const router = Router();

router.route('/')
    .get(verifyToken, requireRole('Admin'), controller.get);
router.route('/:id')
    .put(verifyToken, requireRole('Admin'), upload.single('picture'), controller.put)
    .delete(verifyToken, requireRole('Admin'), controller.delete);

router.route('/register').post(controller.register);
router.route('/register/verify').post(controller.verify);

export default router;
