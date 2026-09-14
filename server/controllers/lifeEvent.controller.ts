import { Request, Response, NextFunction } from 'express';
import { LifeEventService } from '../services/lifeEvent.service';

export class LifeEventController {
  static async getAllLifeEvents(req: Request, res: Response, next: NextFunction) {
    try {
      const events = await LifeEventService.getAllLifeEvents();
      res.json(events);
    } catch (err) {
      next(err);
    }
  }

  static async createOrUpdateLifeEvent(req: Request, res: Response, next: NextFunction) {
    try {
      const event = await LifeEventService.createOrUpdateLifeEvent(req.body);
      res.status(201).json(event);
    } catch (err) {
      next(err);
    }
  }

  static async deleteLifeEvent(req: Request, res: Response, next: NextFunction) {
    try {
      await LifeEventService.deleteLifeEvent(req.params.id);
      res.json({ message: 'Life event deleted successfully' });
    } catch (err) {
      next(err);
    }
  }
}
