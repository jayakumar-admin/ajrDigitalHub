import { Router } from 'express';
import { settingsController } from './settings.controller';

const router = Router();

router.get('/:key', settingsController.getByKey);
router.put('/:key', settingsController.updateAdmin);

export default router;
