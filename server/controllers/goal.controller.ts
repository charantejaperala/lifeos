import { Request, Response, NextFunction } from 'express';
import { GoalService } from '../services/goal.service';

export class GoalController {
  static async getAllGoals(req: Request, res: Response, next: NextFunction) {
    try {
      const goals = await GoalService.getAllGoals();
      res.json(goals);
    } catch (err) {
      next(err);
    }
  }

  static async createOrUpdateGoal(req: Request, res: Response, next: NextFunction) {
    try {
      const goal = await GoalService.createOrUpdateGoal(req.body);
      res.status(201).json(goal);
    } catch (err) {
      next(err);
    }
  }

  static async updateGoal(req: Request, res: Response, next: NextFunction) {
    try {
      const updated = await GoalService.updateGoal(req.params.id, req.body);
      res.json(updated);
    } catch (err) {
      next(err);
    }
  }

  static async deleteGoal(req: Request, res: Response, next: NextFunction) {
    try {
      await GoalService.deleteGoal(req.params.id);
      res.json({ message: 'Goal deleted successfully' });
    } catch (err) {
      next(err);
    }
  }
}
