import mongoose, { Schema, Document } from 'mongoose';

export interface ILifeEvent extends Document {
  id: string;
  name: string;
  date: string;
  estimatedCost: number;
  currency: string;
  inflation: number;
  isRecurring: boolean;
  recurrence: string;
  oneTimeCost: number;
  recurringCost: number;
  dependencies: string[];
  participants: string[];
  location?: string;
  priority: string;
  fundingSource: string;
  documents?: string[];
  tasks?: { id: string; text: string; done: boolean }[];
  notes?: string;
}

const LifeEventSchema: Schema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    date: String,
    estimatedCost: Number,
    currency: { type: String, default: 'INR' },
    inflation: Number,
    isRecurring: Boolean,
    recurrence: String,
    oneTimeCost: Number,
    recurringCost: Number,
    dependencies: [String],
    participants: [String],
    location: String,
    priority: String,
    fundingSource: String,
    documents: [String],
    tasks: [{ id: String, text: String, done: Boolean }],
    notes: String,
  },
  { timestamps: true }
);

export const LifeEventModel = mongoose.model<ILifeEvent>('LifeEvent', LifeEventSchema);
