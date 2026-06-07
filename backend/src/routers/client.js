import { Router } from 'express';
import clientController from '../controllers/client.js';
import upload from '../utils/cloudinaryConfig.js';

const router = Router();

router.route('/').get(clientController.getClient);
router.route('/:id')
    .put(upload.single('picture'), clientController.updateClient)
    .delete(clientController.deleteClient);

export default router;
