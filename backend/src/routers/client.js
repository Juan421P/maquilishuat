import { Router } from 'express';
import clientController from '../controllers/client.js';
import upload from '../utils/cloudinaryConfig.js';
import { verifyToken, requireRole, requireSelfOrAdmin } from '../middleware/auth.js';

const router = Router();

router.route('/').get(verifyToken, requireRole('Admin'), clientController.getClient);
router.route('/:id')
    // El propio cliente (o un admin) consulta su perfil. La app móvil lo usa
    // para mostrar nombre, apellido, fecha de nacimiento y foto.
    .get(verifyToken, requireSelfOrAdmin(), clientController.getClientById)
    .put(verifyToken, requireSelfOrAdmin(), upload.single('picture'), clientController.updateClient)
    .delete(verifyToken, requireSelfOrAdmin(), clientController.deleteClient);

export default router;
