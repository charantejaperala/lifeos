import mongoose, { Schema, Document } from 'mongoose';

export interface ISubGoal {
  id: string;
  name: string;
  budget: number;
  actualSpending: number;
  targetDate: string;
  status: string;
  contribution: number;
  notes?: string;
}

export interface IBudgetItem {
  id: string;
  name: string;
  category: string;
  amount: number;
  actualSpent: number;
  currency: string;
  notes?: string;
}

export interface IFundingSource {
  id: string;
  name: string;
  plannedAmount: number;
  actualAmount: number;
}

export interface IContributionLog {
  id: string;
  date: string;
  amount: number;
  source: string;
  notes?: string;
}

export interface IGoal extends Document {
  id: string;
  name: string;
  description?: string;
  goalType: string;
  category: string;
  customCategory?: string;
  targetAmount: number;
  currency: string;
  targetDate: string;
  startDate: string;
  priority: string;
  priorityOrder?: number;
  owner: string;
  beneficiaries: string[];
  currentAmount: number;
  monthlyContribution: number;
  oneTimeContribution: number;
  expectedInflation: number;
  expectedReturn: number;
  fundingSources: IFundingSource[];
  notes?: string;
  attachments?: string[];
  tags: string[];
  subGoals: ISubGoal[];
  budgetItems: IBudgetItem[];
  contributions: IContributionLog[];
  dependencies: string[];
  status: string;
  isTemplate?: boolean;
  actualFinalCost?: number;
  completedDate?: string;
}

const SubGoalSchema = new Schema({
  id: String,
  name: String,
  budget: Number,
  actualSpending: Number,
  targetDate: String,
  status: String,
  contribution: Number,
  notes: String,
});

const BudgetItemSchema = new Schema({
  id: String,
  name: String,
  category: String,
  amount: Number,
  actualSpent: Number,
  currency: String,
  notes: String,
});

const FundingSourceSchema = new Schema({
  id: String,
  name: String,
  plannedAmount: Number,
  actualAmount: Number,
});

const ContributionLogSchema = new Schema({
  id: String,
  date: String,
  amount: Number,
  source: String,
  notes: String,
});

const GoalSchema: Schema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    description: String,
    goalType: { type: String, default: 'Custom' },
    category: { type: String, required: true },
    customCategory: String,
    targetAmount: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    targetDate: String,
    startDate: String,
    priority: { type: String, default: 'High' },
    priorityOrder: Number,
    owner: String,
    beneficiaries: [String],
    currentAmount: { type: Number, default: 0 },
    monthlyContribution: { type: Number, default: 0 },
    oneTimeContribution: { type: Number, default: 0 },
    expectedInflation: { type: Number, default: 6 },
    expectedReturn: { type: Number, default: 10 },
    fundingSources: [FundingSourceSchema],
    notes: String,
    attachments: [String],
    tags: [String],
    subGoals: [SubGoalSchema],
    budgetItems: [BudgetItemSchema],
    contributions: [ContributionLogSchema],
    dependencies: [String],
    status: { type: String, default: 'ON TRACK' },
    isTemplate: Boolean,
    actualFinalCost: Number,
    completedDate: String,
  },
  { timestamps: true }
);

export const GoalModel = mongoose.model<IGoal>('Goal', GoalSchema);
