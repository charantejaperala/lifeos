import { Request, Response, NextFunction } from 'express';
import { OllamaService } from '../services/ollama.service.js';

export class AIController {
  static async getModel(req: Request, res: Response, next: NextFunction) {
    try {
      const activeModel = OllamaService.getActiveModel();
      const availableModels = await OllamaService.getAvailableModels();
      res.json({ currentModel: activeModel, availableModels });
    } catch (err) {
      next(err);
    }
  }

  static async setModel(req: Request, res: Response, next: NextFunction) {
    try {
      const { model } = req.body;
      if (!model) {
        return res.status(400).json({ error: 'Model name is required' });
      }
      const updatedModel = OllamaService.setActiveModel(model);
      res.json({ message: `Active AI model updated to ${updatedModel}`, currentModel: updatedModel });
    } catch (err) {
      next(err);
    }
  }

  static async chat(req: Request, res: Response, next: NextFunction) {
    try {
      const { message, goals, model } = req.body;
      if (!message) {
        return res.status(400).json({ error: 'Message parameter is required' });
      }
      const activeModel = model || OllamaService.getActiveModel();
      const responseText = await OllamaService.chat(message, goals, activeModel);
      res.json({ response: responseText, engine: `Ollama (${activeModel})` });
    } catch (err) {
      next(err);
    }
  }

  static async generateGoals(req: Request, res: Response, next: NextFunction) {
    try {
      const { prompt, model } = req.body;
      if (!prompt) {
        return res.status(400).json({ error: 'Prompt parameter is required' });
      }
      const activeModel = model || OllamaService.getActiveModel();
      const goals = await OllamaService.generateGoalsFromText(prompt, activeModel);
      res.json({ goals, engine: `Ollama (${activeModel})` });
    } catch (err) {
      next(err);
    }
  }
}
