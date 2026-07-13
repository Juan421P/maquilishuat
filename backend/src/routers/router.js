import { Router } from 'express';
import admin from './admin.js';
import client from './client.js';
import loginClient from './loginClient.js';
import registerClient from './registerClient.js';
import recoveryClient from './recoveryClient.js';
import logout from './logout.js';
import product from './product.js';
import sale from './sale.js';
import shoppingCart from './shopping_cart.js';
import review from './review.js';
import me from './me.js';

const router = Router();

router.use('/admin', admin);
router.use('/clients', client);
router.use('/products', product);
router.use('/sales', sale);
router.use('/shopping-carts', shoppingCart);
router.use('/reviews', review);
router.use('/login', loginClient);
router.use('/registerClient', registerClient);
router.use('/recoveryClient', recoveryClient);
router.use('/logout', logout);
router.use('/me', me);

export default router;
