import { Router } from 'express';
import { QuizController } from '../controllers/quiz.controller.js';
import { authenticateJWT } from '../middlewares/auth.middleware.js';
import { aiRateLimit } from '../middlewares/rateLimit.middleware.js';

const router = Router();

router.post('/generate', aiRateLimit, QuizController.generateQuiz);
router.post('/submit', aiRateLimit, authenticateJWT as any, QuizController.submitQuiz);
router.get('/history', authenticateJWT as any, QuizController.getHistory);

export default router;

