import { Router } from 'express';
import admin from './admin.js';
import client from './client.js';
import loginClient from './loginClient.js';
import registerClient from './registerClient.js';
import logout from './logout.js';
import product from './product.js';
import sale from './sale.js';

const router = Router();

router.use('/clients', client);
router.use('/products', product);
router.use('/sales', sale);
router.use('/login', loginClient);
router.use('/registerClient', registerClient);
router.use('/logout', logout);

export default router;
