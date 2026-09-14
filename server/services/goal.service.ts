import { GoalModel, IGoal } from '../models/Goal.model';

export class GoalService {
  static async getAllGoals(): Promise<IGoal[]> {
    try {
      return await GoalModel.find().sort({ priorityOrder: 1, createdAt: -1 });
    } catch (err) {
      console.warn('⚠️ DB offline, returning [] for goals');
      return [];
    }
  }

  static async createOrUpdateGoal(goalData: Partial<IGoal>): Promise<IGoal> {
    if (!goalData.id) {
      throw { statusCode: 400, message: 'Goal ID is required' };
    }
    const existing = await GoalModel.findOne({ id: goalData.id });
    if (existing) {
      const updated = await GoalModel.findOneAndUpdate({ id: goalData.id }, goalData, { new: true });
      return updated!;
    } else {
      const created = await GoalModel.create(goalData);
      return created;
    }
  }

  static async updateGoal(id: string, updateData: Partial<IGoal>): Promise<IGoal | null> {
    const updated = await GoalModel.findOneAndUpdate({ id }, updateData, { new: true });
    if (!updated) {
      throw { statusCode: 404, message: 'Goal not found' };
    }
    return updated;
  }

  static async deleteGoal(id: string): Promise<void> {
    const res = await GoalModel.findOneAndDelete({ id });
    if (!res) {
      throw { statusCode: 404, message: 'Goal not found' };
    }
  }
}
