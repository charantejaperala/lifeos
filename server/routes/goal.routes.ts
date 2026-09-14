import { Router } from 'express';
import { GoalController } from '../controllers/goal.controller';
import { authenticateJWT } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', authenticateJWT as any, GoalController.getAllGoals);
router.post('/', authenticateJWT as any, GoalController.createOrUpdateGoal);
router.put('/:id', authenticateJWT as any, GoalController.updateGoal);
router.delete('/:id', authenticateJWT as any, GoalController.deleteGoal);

export default router;
