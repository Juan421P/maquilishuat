import { Router } from 'express';
import loginClientController from '../controllers/loginClientController.js';

const router = Router();

router.route('/').post(loginClientController.login);

export default router;
