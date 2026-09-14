import { Goal, LifeEvent } from '../types';

export const FX_RATES: Record<string, number> = {
  INR: 1,
  USD: 86.5,
  EUR: 92.0,
  GBP: 110.0,
};

export const FX_SYMBOLS: Record<string, string> = {
  INR: '₹',
  USD: '$',
  EUR: '€',
  GBP: '£',
};

/**
 * Format currency amount based on selected currency
 */
export function formatCurrency(amount: number, currency = 'INR'): string {
  const symbol = FX_SYMBOLS[currency] || '₹';
  
  if (currency === 'INR') {
    if (Math.abs(amount) >= 10000000) { // 1 Cr
      return `${symbol}${(amount / 10000000).toFixed(2)} Cr`;
    }
    if (Math.abs(amount) >= 100000) { // 1 Lakh
      return `${symbol}${(amount / 100000).toFixed(2)} L`;
    }
    return `${symbol}${Math.round(amount).toLocaleString('en-IN')}`;
  } else {
    if (Math.abs(amount) >= 1000000) {
      return `${symbol}${(amount / 1000000).toFixed(2)} M`;
    }
    if (Math.abs(amount) >= 1000) {
      return `${symbol}${(amount / 1000).toFixed(1)} K`;
    }
    return `${symbol}${Math.round(amount).toLocaleString('en-US')}`;
  }
}

/**
 * Convert amount from one currency to base currency (INR) or target currency
 */
export function convertCurrency(amount: number, fromCurr: string, toCurr: string): number {
  if (fromCurr === toCurr) return amount;
  const inrValue = amount * (FX_RATES[fromCurr] || 1);
  return inrValue / (FX_RATES[toCurr] || 1);
}

/**
 * Calculate years remaining between current date and target date
 */
export function getYearsRemaining(targetDateStr: string): number {
  const target = new Date(targetDateStr);
  const now = new Date();
  const diffMs = target.getTime() - now.getTime();
  const years = diffMs / (1000 * 60 * 60 * 24 * 365.25);
  return Math.max(0.1, Math.round(years * 10) / 10);
}

/**
 * Calculate Inflation-Adjusted Target Amount: Target * (1 + inflation)^years
 */
export function calculateInflationAdjustedTarget(
  targetAmount: number,
  inflationRatePct: number,
  targetDateStr: string
): number {
  const years = getYearsRemaining(targetDateStr);
  const rate = inflationRatePct / 100;
  return targetAmount * Math.pow(1 + rate, years);
}

/**
 * Calculate required monthly contribution considering expected investment return rate (ROI)
 */
export function calculateRequiredMonthlyContribution(
  targetAmount: number,
  currentSaved: number,
  inflationRatePct: number,
  expectedReturnPct: number,
  targetDateStr: string
): {
  inflationAdjustedTarget: number;
  remainingAmount: number;
  requiredMonthly: number;
  requiredAnnual: number;
  projectedAmountAtTarget: number;
  shortfallOrSurplus: number; // positive = surplus, negative = shortfall
  probabilityScore: number; // 0 to 100%
} {
  const years = getYearsRemaining(targetDateStr);
  const totalMonths = Math.max(1, Math.round(years * 12));
  const infRate = inflationRatePct / 100;
  const returnRate = expectedReturnPct / 100;

  const inflationAdjustedTarget = targetAmount * Math.pow(1 + infRate, years);
  
  // Future value of existing saved amount growing at expected return rate
  const futureSavedValue = currentSaved * Math.pow(1 + returnRate, years);
  
  const remainingNeeded = Math.max(0, inflationAdjustedTarget - futureSavedValue);

  // Monthly interest rate for investment returns
  const rMonthly = returnRate / 12;
  
  let requiredMonthly = 0;
  if (remainingNeeded > 0) {
    if (rMonthly > 0) {
      // Future Value formula of ordinary annuity: FV = PMT * [ ( (1 + r)^n - 1 ) / r ]
      // PMT = FV * r / [ (1 + r)^n - 1 ]
      const factor = (Math.pow(1 + rMonthly, totalMonths) - 1) / rMonthly;
      requiredMonthly = remainingNeeded / factor;
    } else {
      requiredMonthly = remainingNeeded / totalMonths;
    }
  }

  const requiredAnnual = requiredMonthly * 12;

  // Calculate projected amount based on current monthly contribution
  // Defaulting to user's monthly contribution if available
  const projectedFromSaved = futureSavedValue;
  
  // Projected shortfall/surplus
  const shortfallOrSurplus = currentSaved >= inflationAdjustedTarget ? 
    currentSaved - inflationAdjustedTarget : 
    futureSavedValue - inflationAdjustedTarget;

  // Probability score based on ratio of saved/contribution to target
  let probabilityScore = 0;
  if (inflationAdjustedTarget > 0) {
    const ratio = Math.min(1.2, (futureSavedValue + (currentSaved * 0.5)) / inflationAdjustedTarget);
    probabilityScore = Math.min(100, Math.round(ratio * 100));
  }

  return {
    inflationAdjustedTarget,
    remainingAmount: Math.max(0, inflationAdjustedTarget - currentSaved),
    requiredMonthly: Math.round(requiredMonthly),
    requiredAnnual: Math.round(requiredAnnual),
    projectedAmountAtTarget: Math.round(futureSavedValue),
    shortfallOrSurplus: Math.round(shortfallOrSurplus),
    probabilityScore: Math.max(15, probabilityScore),
  };
}

/**
 * Detect conflicts between user's available monthly cash surplus and total active goal contribution demands
 */
export function detectCashFlowConflicts(
  goals: Goal[],
  monthlySurplusINR: number
): {
  totalRequiredMonthlyINR: number;
  availableSurplusINR: number;
  hasConflict: boolean;
  deficitINR: number;
  conflictingGoals: Goal[];
} {
  const activeGoals = goals.filter(g => g.status !== 'COMPLETED' && g.status !== 'CANCELLED');
  
  let totalRequiredMonthlyINR = 0;
  const conflictingGoals: Goal[] = [];

  activeGoals.forEach(goal => {
    const calc = calculateRequiredMonthlyContribution(
      goal.targetAmount,
      goal.currentAmount,
      goal.expectedInflation,
      goal.expectedReturn,
      goal.targetDate
    );
    
    // Convert required monthly to INR
    const monthlyInr = convertCurrency(calc.requiredMonthly, goal.currency, 'INR');
    totalRequiredMonthlyINR += monthlyInr;
    conflictingGoals.push(goal);
  });

  const deficitINR = Math.max(0, totalRequiredMonthlyINR - monthlySurplusINR);
  const hasConflict = deficitINR > 500; // threshold ₹500

  return {
    totalRequiredMonthlyINR: Math.round(totalRequiredMonthlyINR),
    availableSurplusINR: monthlySurplusINR,
    hasConflict,
    deficitINR: Math.round(deficitINR),
    conflictingGoals,
  };
}
