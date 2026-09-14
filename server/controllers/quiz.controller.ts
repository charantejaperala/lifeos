import { Request, Response, NextFunction } from 'express';
import { OllamaService } from '../services/ollama.service';
import { QuizResultModel } from '../models/QuizResult.model';

export class QuizController {
  static async generateQuiz(req: Request, res: Response, next: NextFunction) {
    try {
      const { level, model } = req.body;
      const questions = await OllamaService.generateQuizQuestions(level || 'All', model);
      res.json({ questions, count: questions.length, engine: 'Ollama AI (2026 Trends)' });
    } catch (err) {
      next(err);
    }
  }

  static async submitQuiz(req: Request, res: Response, next: NextFunction) {
    try {
      const { score, totalQuestions, level, badge, questionsAnswered } = req.body;
      const userId = (req as any).user?.id || (req as any).user?._id;
      const userEmail = (req as any).user?.email;

      const result = await QuizResultModel.create({
        userId,
        userEmail,
        score: score || 0,
        totalQuestions: totalQuestions || 5,
        level: level || 'All',
        badge: badge || 'Financial Aspirant',
        questionsAnswered: questionsAnswered || [],
      });

      res.status(201).json({ message: 'Quiz attempt saved to database', result });
    } catch (err) {
      next(err);
    }
  }

  static async getHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id || (req as any).user?._id;
      const history = await QuizResultModel.find({ userId }).sort({ createdAt: -1 }).limit(20);
      res.json({ history });
    } catch (err) {
      next(err);
    }
  }
}
