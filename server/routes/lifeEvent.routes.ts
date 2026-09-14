import { Router } from 'express';
import { LifeEventController } from '../controllers/lifeEvent.controller';
import { authenticateJWT } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', authenticateJWT as any, LifeEventController.getAllLifeEvents);
router.post('/', authenticateJWT as any, LifeEventController.createOrUpdateLifeEvent);
router.delete('/:id', authenticateJWT as any, LifeEventController.deleteLifeEvent);

export default router;
