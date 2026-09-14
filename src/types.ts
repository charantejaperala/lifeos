export type GoalStatus = 'NOT STARTED' | 'ON TRACK' | 'AHEAD' | 'AT RISK' | 'BEHIND' | 'COMPLETED' | 'CANCELLED';

export type GoalPriority = 'Critical' | 'High' | 'Medium' | 'Low';

export type GoalType = 'Predefined' | 'Custom';

export type RecurrenceType = 'One-time' | 'Monthly' | 'Quarterly' | 'Yearly' | 'Custom';

export interface SubGoal {
  id: string;
  name: string;
  budget: number;
  actualSpending: number;
  targetDate: string;
  status: GoalStatus;
  contribution: number;
  notes?: string;
}

export interface BudgetItem {
  id: string;
  name: string;
  category: string;
  amount: number;
  actualSpent: number;
  currency: string;
  notes?: string;
}

export interface FundingSource {
  id: string;
  name: string; // e.g. Salary, Savings, FD, Investment, Bonus, Loan
  plannedAmount: number;
  actualAmount: number;
}

export interface ContributionLog {
  id: string;
  date: string;
  amount: number;
  source: string;
  notes?: string;
}

export interface Goal {
  id: string;
  name: string;
  description: string;
  goalType: GoalType;
  category: string; // Family, Housing, Education, Health, Lifestyle, Travel, Investment, Retirement, Business, Debt, Parents, Children, Marriage, Major Purchase, Emergency, Custom
  customCategory?: string;
  targetAmount: number;
  currency: string; // INR, USD, EUR, GBP
  targetDate: string; // YYYY-MM-DD
  startDate: string; // YYYY-MM-DD
  priority: GoalPriority;
  priorityOrder?: number;
  owner: string;
  beneficiaries: string[];
  currentAmount: number;
  monthlyContribution: number;
  oneTimeContribution: number;
  expectedInflation: number; // e.g. 6% default, 7% marriage, 8% education, 9% health
  expectedReturn: number; // e.g. 10% expected return on savings/investments
  fundingSources: FundingSource[];
  notes?: string;
  attachments?: string[];
  tags: string[];
  subGoals: SubGoal[];
  budgetItems: BudgetItem[];
  contributions: ContributionLog[];
  dependencies: string[]; // Goal IDs this depends on
  status: GoalStatus;
  isTemplate?: boolean;
  actualFinalCost?: number;
  completedDate?: string;
}

export interface LifeEvent {
  id: string;
  name: string;
  date: string;
  estimatedCost: number;
  currency: string;
  inflation: number;
  isRecurring: boolean;
  recurrence: RecurrenceType;
  oneTimeCost: number;
  recurringCost: number;
  dependencies: string[];
  participants: string[];
  location?: string;
  priority: GoalPriority;
  fundingSource: string;
  documents?: string[];
  tasks?: { id: string; text: string; done: boolean }[];
  eventType?: 'Expense' | 'Income' | 'Goal' | 'Asset' | 'Liability' | 'Investment' | 'Event';
  notes?: string;
}

export interface GoalCategory {
  id: string;
  name: string;
  isCustom: boolean;
  icon?: string;
  description?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  createdAt?: string;
}

export interface AuthResponse {
  message?: string;
  token?: string;
  user?: User;
  error?: string;
  resetToken?: string;
}

export interface Scenario {
  id: string;
  name: string; // e.g. Scenario A (₹10L), Scenario B (₹15L), Scenario C (₹25L)
  targetAmount: number;
  targetDate: string;
  monthlySavingsNeeded: number;
  netWorthImpact: number;
  cashFlowImpact: number;
}

