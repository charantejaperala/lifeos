import { Router } from 'express';
import { AIController } from '../controllers/ai.controller';
import { authenticateJWT } from '../middlewares/auth.middleware';

const router = Router();

router.get('/model', AIController.getModel);
router.post('/model', AIController.setModel);
router.post('/chat', authenticateJWT as any, AIController.chat);
router.post('/generate-goals', authenticateJWT as any, AIController.generateGoals);

export default router;
