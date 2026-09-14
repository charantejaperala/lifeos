import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller.js';
import { authenticateJWT } from '../middlewares/auth.middleware.js';
import { authRateLimit } from '../middlewares/rateLimit.middleware.js';

const router = Router();

router.post('/signup', authRateLimit, AuthController.signup);
router.post('/login', authRateLimit, AuthController.login);
router.post('/forgot-password', authRateLimit, AuthController.forgotPassword);
router.post('/reset-password', authRateLimit, AuthController.resetPassword);
router.get('/me', authenticateJWT as any, AuthController.getMe as any);

export default router;
