import { Router } from 'express';
import { QuizController } from '../controllers/quiz.controller';
import { authenticateJWT } from '../middlewares/auth.middleware';

const router = Router();

router.post('/generate', QuizController.generateQuiz);
router.post('/submit', authenticateJWT as any, QuizController.submitQuiz);
router.get('/history', authenticateJWT as any, QuizController.getHistory);

export default router;
