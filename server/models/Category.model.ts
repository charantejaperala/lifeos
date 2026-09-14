import mongoose, { Schema, Document } from 'mongoose';

export interface ICategory extends Document {
  id: string;
  name: string;
  isCustom: boolean;
  icon?: string;
  description?: string;
}

const CategorySchema: Schema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    isCustom: { type: Boolean, default: false },
    icon: String,
    description: String,
  },
  { timestamps: true }
);

export const CategoryModel = mongoose.model<ICategory>('Category', CategorySchema);
