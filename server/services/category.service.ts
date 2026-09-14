import { CategoryModel, ICategory } from '../models/Category.model';

export class CategoryService {
  static async getAllCategories(): Promise<ICategory[]> {
    try {
      return await CategoryModel.find();
    } catch (err) {
      console.warn('⚠️ DB offline, returning [] for categories');
      return [];
    }
  }

  static async createCategory(catData: Partial<ICategory>): Promise<ICategory> {
    if (!catData.name) {
      throw { statusCode: 400, message: 'Category name is required' };
    }
    const created = await CategoryModel.create(catData);
    return created;
  }
}
