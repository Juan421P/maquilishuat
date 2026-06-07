import { Router } from 'express';
import clientController from '../controllers/client.js';

const router = Router();

router.route('/').get(clientController.getClient);
router.route('/:id')
    .put(clientController.updateClient)
    .delete(clientController.deleteClient);

export default router;
