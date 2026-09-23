import { Router } from 'express';
import recoveryClientController from '../controllers/recoveryClientController.js';

const router = Router();

router.route('/requestCode').post(recoveryClientController.requestCode);
router.route('/verifyCode').post(recoveryClientController.verifyCode);
router.route('/newPassword').post(recoveryClientController.newPassword);

export default router;
