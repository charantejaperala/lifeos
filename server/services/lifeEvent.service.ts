import { LifeEventModel, ILifeEvent } from '../models/LifeEvent.model.js';

export class LifeEventService {
  static async getAllLifeEvents(): Promise<ILifeEvent[]> {
    try {
      return await LifeEventModel.find().sort({ date: 1 });
    } catch (err) {
      console.warn('⚠️ DB offline, returning [] for life events');
      return [];
    }
  }

  static async createOrUpdateLifeEvent(eventData: Partial<ILifeEvent>): Promise<ILifeEvent> {
    if (!eventData.id) {
      throw { statusCode: 400, message: 'LifeEvent ID is required' };
    }
    const existing = await LifeEventModel.findOne({ id: eventData.id });
    if (existing) {
      const updated = await LifeEventModel.findOneAndUpdate({ id: eventData.id }, eventData, { new: true });
      return updated!;
    } else {
      const created = await LifeEventModel.create(eventData);
      return created;
    }
  }
  static async deleteLifeEvent(id: string): Promise<void> {
    try {
      await LifeEventModel.deleteOne({ id });
    } catch (err) {
      console.warn('⚠️ DB offline, delete life event skipped');
    }
  }
}
