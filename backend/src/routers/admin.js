import { Router } from 'express';
import controller from '../controllers/admin.js';
import upload from '../utils/cloudinaryConfig.js';
const router = Router();

router.route('/')
    .get(controller.get);
router.route('/:id')
    .put(upload.single('picture'), controller.put)
    .delete(controller.delete);

router.route('/register').post(controller.register);
router.route('/register/verify').post(controller.verify);

export default router;
