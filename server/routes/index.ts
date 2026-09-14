import { Router } from 'express';
import mongoose from 'mongoose';
import authRoutes from './auth.routes';
import goalRoutes from './goal.routes';
import lifeEventRoutes from './lifeEvent.routes';
import categoryRoutes from './category.routes';
import aiRoutes from './ai.routes';
import quizRoutes from './quiz.routes';
import adminRoutes from './admin.routes';
import { GoalModel } from '../models/Goal.model';
import { LifeEventModel } from '../models/LifeEvent.model';
import { CategoryModel } from '../models/Category.model';

const apiRouter = Router();

// Healthcheck
apiRouter.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
  });
});

// Domain Routes
apiRouter.use('/auth', authRoutes);
apiRouter.use('/goals', goalRoutes);
apiRouter.use('/life-events', lifeEventRoutes);
apiRouter.use('/categories', categoryRoutes);
apiRouter.use('/ai', aiRoutes);
apiRouter.use('/quiz', quizRoutes);
apiRouter.use('/admin', adminRoutes);

// Feature & Guest API Endpoints
apiRouter.get('/notifications', (req, res) => {
  res.json([
    {
      id: 'notif-1',
      title: 'Tax Saving Opportunity (Section 80C)',
      message: 'You have ₹45,000 pending under Section 80C before March 31st to claim ₹14,040 in tax savings.',
      timestamp: '10 mins ago',
      category: 'suggestion',
      read: false,
      priority: 'high',
      actionLabel: 'Open CA Zero-Tax',
      actionTab: 'ca-advisor',
    },
    {
      id: 'notif-2',
      title: 'Portfolio Cash Flow Optimization',
      message: '₹2.4L in low-yield savings detected. Deploy to Liquid Fund / Arbitrage for +₹18,000/yr extra yield.',
      timestamp: '1 hour ago',
      category: 'suggestion',
      read: false,
      priority: 'medium',
      actionLabel: 'View Conflicts',
      actionTab: 'conflicts',
    },
    {
      id: 'notif-3',
      title: 'Bank & App Sync Active',
      message: 'HDFC, Groww, INDmoney, and Fold accounts synced successfully.',
      timestamp: '2 hours ago',
      category: 'system',
      read: true,
      priority: 'low',
      actionLabel: 'Manage Sync',
      actionTab: 'bank-sync',
    },
    {
      id: 'notif-4',
      title: '⚡ New Admin Alert: User Registered',
      message: 'Rahul S. created a new account (email: rahul@example.com). System status: Healthy.',
      timestamp: '3 hours ago',
      category: 'admin',
      read: false,
      priority: 'high',
      actionLabel: 'Admin Telemetry',
      actionTab: 'superadmin',
    },
  ]);
});

let inMemoryBankAccounts = [
  { id: 'acc-1', providerName: 'HDFC Bank Ltd', accountNumber: '•••• 4892', balanceINR: 245000, lastSynced: 'Just now (Live AA)', status: 'Connected', category: 'Banking', accountType: 'Bank Account' },
  { id: 'acc-2', providerName: 'Groww Mutual Funds & SIP', accountNumber: '•••• 9120', balanceINR: 890000, lastSynced: '5 mins ago', status: 'Connected', category: 'Wealth', accountType: 'Mutual Funds' },
  { id: 'acc-3', providerName: 'INDmoney US Stocks Portfolio', accountNumber: '•••• 3041', balanceINR: 420000, lastSynced: '10 mins ago', status: 'Connected', category: 'Stocks', accountType: 'US Stocks' },
  { id: 'acc-4', providerName: 'Fold Bank & Expense Sync', accountNumber: '•••• 7719', balanceINR: 115000, lastSynced: 'Live Sync', status: 'Connected', category: 'Aggregator', accountType: 'Aggregator' },
  { id: 'acc-5', providerName: 'Zerodha Coin Equity Holding', accountNumber: '•••• 8832', balanceINR: 650000, lastSynced: '15 mins ago', status: 'Connected', category: 'Stocks', accountType: 'Investment Broker' },
];

apiRouter.get('/bank-accounts', (req, res) => {
  res.json(inMemoryBankAccounts);
});

apiRouter.post('/bank-accounts', (req, res) => {
  const acc = req.body;
  if (!acc.id) acc.id = `acc-${Date.now()}`;
  inMemoryBankAccounts = [acc, ...inMemoryBankAccounts.filter(a => a.id !== acc.id)];
  res.json({ message: 'Account saved successfully', account: acc });
});

apiRouter.delete('/bank-accounts/:id', (req, res) => {
  const { id } = req.params;
  inMemoryBankAccounts = inMemoryBankAccounts.filter(a => a.id !== id);
  res.json({ message: 'Account deleted successfully', id });
});

apiRouter.get('/dashboard/feed', (req, res) => {
  res.json({
    metrics: {
      totalIncomeINR: 130000,
      totalExpensesINR: 72000,
      monthlySurplusINR: 60000,
      baseAssetsINR: 5120000,
      baseLiabilitiesINR: 1484800,
      netWorthINR: 3635200,
    },
    upcomingBills: [
      { title: 'SIP Investment', amountINR: 30000, due: 'Due in 3 days', type: 'Investment', color: '#10b981' },
      { title: 'Home Loan EMI', amountINR: 48500, due: 'Due in 5 days', type: 'Loan', color: '#ef4444' },
      { title: 'Health Insurance Premium', amountINR: 12500, due: 'Due in 12 days', type: 'Insurance', color: '#3b82f6' },
      { title: 'Parents Medical SIP', amountINR: 10000, due: 'Due in 18 days', type: 'Goal', color: '#7c3aed' },
    ],
    recentTransactions: [
      { date: '05 Sep 2026', desc: 'Salary Credit', cat: 'Income', amountINR: 130000, color: '#10b981', type: 'Income' },
      { date: '03 Sep 2026', desc: 'Auto-SIP Deposit (Nifty 50)', cat: 'Investment', amountINR: -10000, color: '#ef4444', type: 'Investment' },
      { date: '01 Sep 2026', desc: 'HDFC Home Loan EMI', cat: 'Loan', amountINR: -48500, color: '#ef4444', type: 'Expense' },
      { date: '28 Aug 2026', desc: 'Groww Mutual Fund Dividend', cat: 'Income', amountINR: 4200, color: '#10b981', type: 'Income' },
    ],
  });
});

apiRouter.get('/ca-tax/summary', (req, res) => {
  res.json({
    grossIncome: 1450000,
    stdDeduction: 75000,
    section80C: 150000,
    nps80CCD: 50000,
    health80D: 50000,
    homeLoanInterest: 200000,
    hraExemption: 180000,
    otherDeductions: 50000,
    recommendedRegime: 'new',
    potentialTaxSavingsINR: 48500,
  });
});

apiRouter.get('/templates', (req, res) => {
  res.json([
    { id: 'tpl-1', name: 'Marriage & Wedding', category: 'Marriage', target: 1500000, inflation: 7, desc: 'Banquet venue, gold jewellery, catering, photography, bridal attire & travel.' },
    { id: 'tpl-2', name: 'House Purchase (Down Payment)', category: 'Housing', target: 9000000, inflation: 7, desc: '3BHK apartment down payment, stamp duty, registration & interior woodwork.' },
    { id: 'tpl-3', name: 'House Construction', category: 'Housing', target: 5000000, inflation: 8, desc: 'Independent villa construction, architect fees, permits & raw materials.' },
    { id: 'tpl-4', name: 'Agricultural Land Purchase', category: 'Major Purchase', target: 1200000, inflation: 7, desc: 'Farmland plot purchase, patta registration & borewell infrastructure.' },
    { id: 'tpl-5', name: 'Parents Gold & Ornaments', category: 'Parents', target: 500000, inflation: 8, desc: '24K Sovereign gold bonds and family heirloom jewellery.' },
    { id: 'tpl-6', name: 'Children Higher Education', category: 'Education', target: 3500000, inflation: 9, desc: 'Undergraduate & Masters college tuition, campus stay & university fees.' },
    { id: 'tpl-7', name: 'Retirement & FIRE Corpus', category: 'Retirement', target: 15000000, inflation: 6, desc: 'Financial Independence corpus generating ₹1.5L/mo inflation-adjusted passive income.' },
    { id: 'tpl-8', name: 'Business Startup Capital', category: 'Business', target: 2500000, inflation: 6, desc: 'Initial seed capital, prototype development, inventory & operational buffer.' },
    { id: 'tpl-9', name: 'International Dream Travel', category: 'Travel', target: 400000, inflation: 7, desc: 'Europe / Japan 14-day holiday flights, luxury hotels & excursion bookings.' },
    { id: 'tpl-10', name: 'Emergency Liquid Buffer', category: 'Emergency', target: 500000, inflation: 5, desc: '6 Months of liquid living expenses saved in sweep-in FDs & liquid funds.' },
  ]);
});

// Reset & Clear All Database Tables Endpoint
apiRouter.post('/reset-database', async (req, res) => {
  try {
    await GoalModel.deleteMany({});
    await LifeEventModel.deleteMany({});
    await CategoryModel.deleteMany({});

    const defaultGoals = [
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
      },
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
        ],
        subGoals: [],
        budgetItems: [],
        contributions: [],
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
        fundingSources: [],
        subGoals: [],
        budgetItems: [],
        contributions: [],
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
        notes: 'Purchasing Sovereign Gold Bonds annually.',
        fundingSources: [],
        subGoals: [],
        budgetItems: [],
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
        fundingSources: [],
        subGoals: [],
        budgetItems: [],
        contributions: [],
        dependencies: [],
      }
    ];

    await GoalModel.insertMany(defaultGoals);

    res.json({
      success: true,
      message: 'All database tables successfully cleared and re-seeded with fresh data!',
      count: defaultGoals.length
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Seed Endpoint
apiRouter.post('/seed', async (req, res) => {
  try {
    const { goals, lifeEvents, categories } = req.body;
    if (goals && goals.length > 0) {
      await GoalModel.deleteMany({});
      await GoalModel.insertMany(goals);
    }
    if (lifeEvents && lifeEvents.length > 0) {
      await LifeEventModel.deleteMany({});
      await LifeEventModel.insertMany(lifeEvents);
    }
    if (categories && categories.length > 0) {
      await CategoryModel.deleteMany({});
      await CategoryModel.insertMany(categories);
    }
    res.json({ message: 'MongoDB Database Seeded Successfully!' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default apiRouter;
