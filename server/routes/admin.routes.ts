import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller.js';
import { requireSuperAdmin } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/stats', requireSuperAdmin as any, AdminController.getStats);
router.get('/users', requireSuperAdmin as any, AdminController.getUsers);
router.post('/user-role', requireSuperAdmin as any, AdminController.updateUserRole);

export default router;
