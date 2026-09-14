import { Request, Response, NextFunction } from 'express';
import { GoalService } from '../services/goal.service.js';

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
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const updated = await GoalService.updateGoal(id, req.body);
      res.json(updated);
    } catch (err) {
      next(err);
    }
  }

  static async deleteGoal(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      await GoalService.deleteGoal(id);
      res.json({ message: 'Goal deleted successfully' });
    } catch (err) {
      next(err);
    }
  }
}
