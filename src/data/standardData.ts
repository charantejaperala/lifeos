import { Goal, LifeEvent, GoalCategory } from '../types';

export interface StandardUser {
  id: string;
  name: string;
  email: string;
  role: 'superadmin' | 'user';
  avatar: string;
  joinedDate: string;
  tier: string;
}

export interface StandardConnectedAccount {
  id: string;
  providerName: string;
  logoUrl?: string;
  accountType: 'Bank Account' | 'Investment Broker' | 'Mutual Funds' | 'US Stocks' | 'Aggregator';
  accountNumber: string;
  balanceINR: number;
  lastSynced: string;
  status: 'Connected' | 'Syncing' | 'Error';
  category: 'Banking' | 'Wealth' | 'Stocks' | 'Crypto' | 'Aggregator';
  isRealApi?: boolean;
}

export const STANDARD_GUEST_USER: StandardUser = {
  id: 'guest_standard_01',
  name: 'Rajesh Kumar',
  email: 'rajesh.kumar@example.com',
  role: 'user',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  joinedDate: '2025-01-15',
  tier: 'PRO',
};

export const PRESEEDED_ADMIN_USER: StandardUser = {
  id: 'usr_admin_charanteja',
  name: 'Charan Teja (Super Admin)',
  email: 'charanteja_admin.lifeos.io',
  role: 'superadmin',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  joinedDate: '2026-01-01',
  tier: 'SUPER ADMIN',
};

export const PRESEEDED_REGULAR_USER: StandardUser = {
  id: 'usr_user_charanteja',
  name: 'Charan Teja',
  email: 'charanteja_user.lifeos.io',
  role: 'user',
  avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  joinedDate: '2026-01-01',
  tier: 'PRO USER',
};


export const STANDARD_CATEGORIES: GoalCategory[] = [
  { id: 'cat-family', name: 'Family', isCustom: false, icon: 'Users' },
  { id: 'cat-housing', name: 'Housing', isCustom: false, icon: 'Home' },
  { id: 'cat-education', name: 'Education', isCustom: false, icon: 'GraduationCap' },
  { id: 'cat-health', name: 'Health', isCustom: false, icon: 'HeartPulse' },
  { id: 'cat-lifestyle', name: 'Lifestyle', isCustom: false, icon: 'Sparkles' },
  { id: 'cat-travel', name: 'Travel', isCustom: false, icon: 'Plane' },
  { id: 'cat-investment', name: 'Investment', isCustom: false, icon: 'TrendingUp' },
  { id: 'cat-retirement', name: 'Retirement', isCustom: false, icon: 'ShieldCheck' },
  { id: 'cat-business', name: 'Business', isCustom: false, icon: 'Briefcase' },
  { id: 'cat-debt', name: 'Debt', isCustom: false, icon: 'CreditCard' },
  { id: 'cat-parents', name: 'Parents', isCustom: false, icon: 'Heart' },
  { id: 'cat-children', name: 'Children', isCustom: false, icon: 'Smile' },
  { id: 'cat-marriage', name: 'Marriage', isCustom: false, icon: 'Ring' },
  { id: 'cat-purchase', name: 'Major Purchase', isCustom: false, icon: 'ShoppingBag' },
  { id: 'cat-emergency', name: 'Emergency', isCustom: false, icon: 'AlertTriangle' },
  { id: 'cat-fam-resp', name: 'Family Responsibilities', isCustom: true, icon: 'ShieldAlert', description: 'Parents healthcare, gold, sibling education & family functions' },
  { id: 'cat-other', name: 'Other', isCustom: false, icon: 'Folder' },
];

export const STANDARD_GOALS: Goal[] = [
  {
    id: 'goal-marriage',
    name: 'Marriage',
    description: 'Grand wedding celebration, reception, venue booking & family gifts.',
    goalType: 'Predefined',
    category: 'Marriage',
    customCategory: 'Family Responsibilities',
    targetAmount: 1500000,
    currency: 'INR',
    targetDate: '2030-11-15',
    startDate: '2025-01-01',
    priority: 'Critical',
    priorityOrder: 1,
    owner: 'Rajesh Kumar',
    beneficiaries: ['Self', 'Fiancée', 'Family'],
    currentAmount: 620000,
    monthlyContribution: 25000,
    oneTimeContribution: 50000,
    expectedInflation: 7,
    expectedReturn: 10,
    status: 'ON TRACK',
    tags: ['Wedding', 'Family', 'High Priority'],
    notes: 'Venue booking requires advance payment 12 months prior in late 2029.',
    fundingSources: [
      { id: 'fs-1', name: 'Salary Savings', plannedAmount: 1000000, actualAmount: 420000 },
      { id: 'fs-2', name: 'FD Maturity', plannedAmount: 300000, actualAmount: 150000 },
      { id: 'fs-3', name: 'Annual Bonus', plannedAmount: 200000, actualAmount: 50000 },
    ],
    subGoals: [
      { id: 'sg-1', name: 'Venue & Banquet', budget: 400000, actualSpending: 50000, targetDate: '2029-12-01', status: 'ON TRACK', contribution: 120000 },
      { id: 'sg-2', name: 'Jewellery & Gold', budget: 300000, actualSpending: 150000, targetDate: '2030-06-01', status: 'ON TRACK', contribution: 180000 },
      { id: 'sg-3', name: 'Catering & Dining', budget: 300000, actualSpending: 0, targetDate: '2030-10-01', status: 'NOT STARTED', contribution: 90000 },
      { id: 'sg-4', name: 'Photography & Videography', budget: 100000, actualSpending: 20000, targetDate: '2030-08-01', status: 'ON TRACK', contribution: 40000 },
    ],
    budgetItems: [
      { id: 'bi-1', name: 'Palace Resort Venue', category: 'Venue', amount: 400000, actualSpent: 50000, currency: 'INR', notes: 'Advance deposit paid' },
      { id: 'bi-2', name: 'Gourmet Buffet Catering', category: 'Catering', amount: 300000, actualSpent: 0, currency: 'INR' },
      { id: 'bi-3', name: 'Gold Bridal Set', category: 'Jewellery', amount: 200000, actualSpent: 150000, currency: 'INR' },
    ],
    contributions: [
      { id: 'c-1', date: '2026-01-05', amount: 20000, source: 'Salary Savings', notes: 'Monthly SIP transfer' },
      { id: 'c-2', date: '2026-02-05', amount: 25000, source: 'Salary Savings', notes: 'Increased allocation' },
    ],
    dependencies: [],
  },
  {
    id: 'goal-house',
    name: 'House Purchase',
    description: '3BHK luxury apartment down payment & registration charges in Bangalore.',
    goalType: 'Predefined',
    category: 'Housing',
    targetAmount: 9000000,
    currency: 'INR',
    targetDate: '2030-06-30',
    startDate: '2024-01-01',
    priority: 'High',
    priorityOrder: 2,
    owner: 'Rajesh Kumar',
    beneficiaries: ['Self', 'Family'],
    currentAmount: 1200000,
    monthlyContribution: 35000,
    oneTimeContribution: 200000,
    expectedInflation: 7,
    expectedReturn: 11,
    status: 'BEHIND',
    tags: ['Real Estate', 'Home', 'Asset'],
    notes: 'Targeting 25% down payment + stamp duty.',
    fundingSources: [
      { id: 'fs-h1', name: 'Mutual Fund Equity Portfolio', plannedAmount: 6000000, actualAmount: 900000 },
      { id: 'fs-h2', name: 'PF / EPF Partial Withdrawal', plannedAmount: 2000000, actualAmount: 300000 },
    ],
    subGoals: [
      { id: 'sg-h1', name: 'Down Payment (20%)', budget: 1800000, actualSpending: 1200000, targetDate: '2029-12-01', status: 'BEHIND', contribution: 1200000 },
      { id: 'sg-h2', name: 'Stamp Duty & Registration (6.6%)', budget: 600000, actualSpending: 0, targetDate: '2030-05-01', status: 'NOT STARTED', contribution: 0 },
    ],
    budgetItems: [
      { id: 'bi-h1', name: 'Token Amount & Agreement', category: 'Housing', amount: 500000, actualSpent: 500000, currency: 'INR' },
      { id: 'bi-h2', name: 'Builder Milestone Payments', category: 'Housing', amount: 6500000, actualSpent: 700000, currency: 'INR' },
    ],
    contributions: [
      { id: 'c-h1', date: '2026-01-10', amount: 35000, source: 'Mutual Fund SIP' }
    ],
    dependencies: ['goal-emergency'],
  },
  {
    id: 'goal-parents-gold',
    name: 'Parents Gold',
    description: 'Gold sovereign coins and traditional ornaments for parents.',
    goalType: 'Custom',
    category: 'Parents',
    customCategory: 'Family Responsibilities',
    targetAmount: 500000,
    currency: 'INR',
    targetDate: '2027-12-31',
    startDate: '2025-06-01',
    priority: 'Medium',
    priorityOrder: 3,
    owner: 'Rajesh Kumar',
    beneficiaries: ['Parents'],
    currentAmount: 210000,
    monthlyContribution: 15000,
    oneTimeContribution: 0,
    expectedInflation: 8,
    expectedReturn: 9,
    status: 'ON TRACK',
    tags: ['Parents', 'Gold', 'Asset'],
    notes: 'Purchasing 20 grams Sovereign Gold Bonds annually.',
    fundingSources: [
      { id: 'fs-g1', name: 'Gold ETF / SGB SIP', plannedAmount: 500000, actualAmount: 210000 }
    ],
    subGoals: [],
    budgetItems: [
      { id: 'bi-g1', name: '24K Gold Bars', category: 'Gold', amount: 450000, actualSpent: 210000, currency: 'INR' }
    ],
    contributions: [],
    dependencies: [],
  },
  {
    id: 'goal-retirement',
    name: 'Retirement & FIRE',
    description: 'Financial Independence & Early Retirement corpus generating ₹1.5L/mo passive income.',
    goalType: 'Predefined',
    category: 'Retirement',
    targetAmount: 15000000,
    currency: 'INR',
    targetDate: '2045-12-31',
    startDate: '2020-01-01',
    priority: 'Critical',
    priorityOrder: 5,
    owner: 'Rajesh Kumar',
    beneficiaries: ['Self', 'Spouse'],
    currentAmount: 3500000,
    monthlyContribution: 40000,
    oneTimeContribution: 100000,
    expectedInflation: 6,
    expectedReturn: 12,
    status: 'ON TRACK',
    tags: ['FIRE', 'Retirement', 'Passive Income'],
    notes: 'Allocation: 70% Equity Mutual Funds, 20% NPS/VPF, 10% Gold/Debt.',
    fundingSources: [
      { id: 'fs-r1', name: 'Equity Index & FlexiCap SIPs', plannedAmount: 10000000, actualAmount: 2500000 },
      { id: 'fs-r2', name: 'NPS Tier-1 & VPF', plannedAmount: 5000000, actualAmount: 1000000 }
    ],
    subGoals: [],
    budgetItems: [],
    contributions: [],
    dependencies: [],
  },
  {
    id: 'goal-emergency',
    name: 'Emergency Fund',
    description: '6 Months of liquid living expenses buffer in liquid funds & sweep-in FD.',
    goalType: 'Predefined',
    category: 'Emergency',
    targetAmount: 500000,
    currency: 'INR',
    targetDate: '2026-12-31',
    startDate: '2024-01-01',
    priority: 'Critical',
    priorityOrder: 0,
    owner: 'Rajesh Kumar',
    beneficiaries: ['Self', 'Family'],
    currentAmount: 480000,
    monthlyContribution: 10000,
    oneTimeContribution: 0,
    expectedInflation: 5,
    expectedReturn: 7,
    status: 'COMPLETED',
    tags: ['Safety', 'Emergency', 'Liquid'],
    notes: 'Fully liquid in ICICI Liquid Fund & HDFC Sweep FD.',
    fundingSources: [],
    subGoals: [],
    budgetItems: [],
    contributions: [],
    dependencies: [],
  }
];

export const STANDARD_LIFE_EVENTS: LifeEvent[] = [
  {
    id: 'le-1',
    name: "Father's 60th Birthday Celebration",
    date: '2029-04-01',
    estimatedCost: 200000,
    currency: 'INR',
    inflation: 6,
    isRecurring: false,
    recurrence: 'One-time',
    oneTimeCost: 200000,
    recurringCost: 0,
    dependencies: [],
    participants: ['Family', 'Relatives', 'Friends'],
    location: 'Bangalore Club Banquet',
    priority: 'High',
    fundingSource: 'Bonus & Monthly Surplus',
    notes: 'Grand celebration party with catering for 120 guests.',
    tasks: [
      { id: 't1', text: 'Book banquet hall 6 months in advance', done: false },
      { id: 't2', text: 'Finalize catering menu', done: false },
    ]
  },
  {
    id: 'le-2',
    name: "Annual Europe Vacation",
    date: '2027-05-15',
    estimatedCost: 350000,
    currency: 'INR',
    inflation: 8,
    isRecurring: true,
    recurrence: 'Yearly',
    oneTimeCost: 0,
    recurringCost: 350000,
    dependencies: [],
    participants: ['Self', 'Family'],
    location: 'Switzerland & Italy',
    priority: 'Medium',
    fundingSource: 'Travel Fund SIP',
    notes: 'Summer vacation booking flights & hotels.',
  },
  {
    id: 'le-3',
    name: "Parents Annual Medical Checkup & Insurance",
    date: '2026-10-10',
    estimatedCost: 65000,
    currency: 'INR',
    inflation: 9,
    isRecurring: true,
    recurrence: 'Yearly',
    oneTimeCost: 0,
    recurringCost: 65000,
    dependencies: [],
    participants: ['Father', 'Mother'],
    location: 'Apollo Hospitals',
    priority: 'Critical',
    fundingSource: 'Health Reserve',
  }
];

export const STANDARD_CONNECTED_ACCOUNTS: StandardConnectedAccount[] = [
  {
    id: 'acc-hdfc',
    providerName: 'HDFC Bank (Primary Savings)',
    accountType: 'Bank Account',
    accountNumber: '•••• 4821',
    balanceINR: 485000,
    lastSynced: 'Live Sync (2 mins ago)',
    status: 'Connected',
    category: 'Banking',
  },
  {
    id: 'acc-groww',
    providerName: 'Groww Mutual Funds & Equity',
    accountType: 'Mutual Funds',
    accountNumber: '•••• 9102',
    balanceINR: 1240000,
    lastSynced: 'Live API Sync (5 mins ago)',
    status: 'Connected',
    category: 'Wealth',
  },
  {
    id: 'acc-indmoney',
    providerName: 'INDmoney US Stocks & Wealth',
    accountType: 'US Stocks',
    accountNumber: '•••• 6634',
    balanceINR: 620000,
    lastSynced: 'Live API Sync (10 mins ago)',
    status: 'Connected',
    category: 'Stocks',
  },
  {
    id: 'acc-fold',
    providerName: 'Fold Money Open Banking Feed',
    accountType: 'Aggregator',
    accountNumber: '•••• 3311',
    balanceINR: 500000,
    lastSynced: 'Live Account Aggregator (Just now)',
    status: 'Connected',
    category: 'Aggregator',
  },
  {
    id: 'acc-zerodha',
    providerName: 'Zerodha Kite (Stocks & F&O)',
    accountType: 'Investment Broker',
    accountNumber: '•••• 7789',
    balanceINR: 890000,
    lastSynced: 'Kite Connect API (Just now)',
    status: 'Connected',
    category: 'Stocks',
  }
];

export const STANDARD_NOTIFICATIONS = [
  {
    id: 'notif-1',
    title: 'Smart SIP Allocation Tip',
    message: 'Increasing your House Purchase SIP by ₹3,500/mo brings target completion forward by 8 months!',
    timestamp: '10 mins ago',
    read: false,
    type: 'tip' as const,
  },
  {
    id: 'notif-2',
    title: 'Tax Deduction Opportunity (80CCD 1B)',
    message: 'Invest ₹50,000 in NPS Tier-1 before FY end to save an additional ₹15,600 tax in 30% slab.',
    timestamp: '2 hours ago',
    read: false,
    type: 'alert' as const,
  },
  {
    id: 'notif-3',
    title: 'Zerodha Kite & Groww Balances Synced',
    message: 'Your equity portfolios were automatically updated via Live API feeds.',
    timestamp: '1 day ago',
    read: true,
    type: 'system' as const,
  },
  {
    id: 'notif-4',
    title: 'New CA Tax Advisor Joined Platform',
    message: 'Super Admin added CA Advisor Module to assist with zero tax planning.',
    timestamp: '2 days ago',
    read: true,
    type: 'admin' as const,
  }
];
