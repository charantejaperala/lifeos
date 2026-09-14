import { Router } from 'express';
import { AIController } from '../controllers/ai.controller';
import { authenticateJWT } from '../middlewares/auth.middleware';
import { aiRateLimit } from '../middlewares/rateLimit.middleware';

const router = Router();

router.get('/model', AIController.getModel);
router.post('/model', AIController.setModel);
router.post('/chat', aiRateLimit, authenticateJWT as any, AIController.chat);
router.post('/generate-goals', aiRateLimit, authenticateJWT as any, AIController.generateGoals);

export default router;
