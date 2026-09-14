import { Request, Response, NextFunction } from 'express';
import { UserModel } from '../models/User.model.js';
import { GoalModel } from '../models/Goal.model.js';
import { LifeEventModel } from '../models/LifeEvent.model.js';
import { OllamaService } from '../services/ollama.service.js';
import mongoose from 'mongoose';

export class AdminController {
  static async getStats(req: Request, res: Response, next: NextFunction) {
    try {
      const userCount = await UserModel.countDocuments();
      const goalCount = await GoalModel.countDocuments();
      const eventCount = await LifeEventModel.countDocuments();
      const activeModel = OllamaService.getActiveModel();
      const availableModels = await OllamaService.getAvailableModels();

      res.json({
        users: userCount,
        goals: goalCount,
        lifeEvents: eventCount,
        dbStatus: mongoose.connection.readyState === 1 ? 'Healthy (Connected)' : 'Disconnected',
        aiEngine: {
          activeModel,
          availableModels,
          status: 'Online',
        },
        uptimeSeconds: Math.floor(process.uptime()),
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      next(err);
    }
  }

  static async getUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const users = await UserModel.find({}, '-password').sort({ createdAt: -1 });
      res.json({ users });
    } catch (err) {
      next(err);
    }
  }

  static async updateUserRole(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId, role } = req.body;
      if (!userId || !role) {
        return res.status(400).json({ error: 'userId and role parameters are required' });
      }
      const updatedUser = await UserModel.findByIdAndUpdate(userId, { role }, { new: true }).select('-password');
      if (!updatedUser) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json({ message: `User role updated to ${role}`, user: updatedUser });
    } catch (err) {
      next(err);
    }
  }
}
