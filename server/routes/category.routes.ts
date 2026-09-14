import { Router } from 'express';
import { CategoryController } from '../controllers/category.controller.js';
import { authenticateJWT } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/', authenticateJWT as any, CategoryController.getAllCategories);
router.post('/', authenticateJWT as any, CategoryController.createCategory);

export default router;
