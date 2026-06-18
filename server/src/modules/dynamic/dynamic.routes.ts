import { Router } from 'express';
import { dynamicController } from './dynamic.controller';
import { authenticate, authorizeAdmin } from '../../middlewares/auth.middleware';

const router = Router();

// Public READ routes
router.get('/:collection', dynamicController.getAll);
router.get('/:collection/:id', dynamicController.getOne);

// Admin CRUD routes
router.post('/admin/:collection', authenticate, authorizeAdmin, dynamicController.create);
router.put('/admin/:collection/:id', authenticate, authorizeAdmin, dynamicController.update);
router.delete('/admin/:collection/:id', authenticate, authorizeAdmin, dynamicController.delete);

export default router;
