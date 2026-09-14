import React, { useState, useEffect } from 'react';
import { Goal } from '../types';
import { useAuth } from '../context/AuthContext';
import { useRealtimeContext } from '../utils/realtimeContext';
import { fetchDashboardFeedApi } from '../api';
import { WidgetDetailModal, WidgetDetailType } from './WidgetDetailModal';
import { useNotification } from '../context/NotificationContext';
import { 
  formatCurrency, 
  convertCurrency, 
  detectCashFlowConflicts,
  calculateRequiredMonthlyContribution 
} from '../utils/calculations';
import { 
  TrendingUp, 
  Target, 
  Landmark, 
  Wallet, 
  ArrowUpRight, 
  AlertOctagon, 
  Plus, 
  Calendar,
  CheckCircle2,
  Clock,
  Sparkles,
  ChevronRight,
  PieChart as PieChartIcon,
  Bot,
  Activity,
  ArrowDownRight,
  ShieldCheck,
  CreditCard,
  X,
  Trash2
} from 'lucide-react';

interface DashboardViewProps {
  goals: Goal[];
  currency: string;
  onOpenCreateModal: () => void;
  onSelectGoal: (goal: Goal) => void;
  onNavigateTab: (tab: string) => void;
  onOpenAskAI: (initialPrompt?: string) => void;
  monthlySurplusINR: number;
  onDeleteGoal?: (goalId: string) => void;
}

interface QuickActionModalProps {
  type: 'expense' | 'income' | 'asset' | 'liability' | 'investment';
  currency: string;
  onClose: () => void;
  onSuccess: (message: string) => void;
}

const QuickActionModal: React.FC<QuickActionModalProps> = ({ type, currency, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    category: '',
    date: new Date().toISOString().split('T')[0],
    rate: '',
    emi: '',
    notes: '',
  });

  const getModalMeta = () => {
    switch (type) {
      case 'expense':
        return {
          title: 'Add Expense Record',
          icon: <Plus size={18} color="#3b82f6" />,
          color: '#3b82f6',
          categories: ['Food & Dining', 'Bills & Utilities', 'Shopping', 'Transport', 'Healthcare', 'Entertainment', 'Subscriptions', 'Other'],
          defaultCat: 'Food & Dining',
          placeholderTitle: 'e.g. Weekly Grocery Run',
          successText: 'Expense logged successfully!',
        };
      case 'income':
        return {
          title: 'Log Income Source',
          icon: <Plus size={18} color="#10b981" />,
          color: '#10b981',
          categories: ['Salary', 'Freelance / Consulting', 'Dividends / Returns', 'Rental Income', 'Business Revenue', 'Bonus', 'Other'],
          defaultCat: 'Salary',
          placeholderTitle: 'e.g. Monthly Salary Credit',
          successText: 'Income record added successfully!',
        };
      case 'asset':
        return {
          title: 'Add Portfolio Asset',
          icon: <Landmark size={18} color="#06b6d4" />,
          color: '#06b6d4',
          categories: ['Real Estate', 'Precious Metals / Gold', 'Fixed Deposits', 'Vehicles', 'Equity Shares', 'Crypto', 'Other Asset'],
          defaultCat: 'Real Estate',
          placeholderTitle: 'e.g. 2BHK Apartment Property',
          successText: 'Asset added to portfolio!',
        };
      case 'liability':
        return {
          title: 'Add Liability / Debt',
          icon: <CreditCard size={18} color="#ef4444" />,
          color: '#ef4444',
          categories: ['Home Loan', 'Car Loan', 'Personal Loan', 'Credit Card Balance', 'Education Loan', 'Other Debt'],
          defaultCat: 'Home Loan',
          placeholderTitle: 'e.g. HDFC Home Loan',
          successText: 'Liability record added!',
        };
      case 'investment':
        return {
          title: 'Add Investment Entry',
          icon: <TrendingUp size={18} color="#f59e0b" />,
          color: '#f59e0b',
          categories: ['Index Funds / SIP', 'Direct Equity Stocks', 'Government Bonds / PPF', 'REITs / Infrastructure', 'Crypto Portfolio', 'Other'],
          defaultCat: 'Index Funds / SIP',
          placeholderTitle: 'e.g. Nifty 50 Index Fund SIP',
          successText: 'Investment logged successfully!',
        };
    }
  };

  const meta = getModalMeta();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.amount) return;

    const key = `lifeos_${type}s`;
    const existingStr = localStorage.getItem(key);
    const existing = existingStr ? JSON.parse(existingStr) : [];
    const newEntry = {
      id: `qa_${Date.now()}`,
      ...formData,
      category: formData.category || meta.defaultCat,
      amount: parseFloat(formData.amount) || 0,
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem(key, JSON.stringify([newEntry, ...existing]));

    onSuccess(meta.successText);
    onClose();
  };

  return (
    <div className="quick-action-form-overlay" onClick={onClose}>
      <div className="quick-action-form-card" onClick={e => e.stopPropagation()}>
        <div className="quick-action-form-header">
          <h3>
            <div className="quick-action-icon-wrap" style={{ background: `${meta.color}1e` }}>
              {meta.icon}
            </div>
            {meta.title}
          </h3>
          <button 
            type="button"
            onClick={onClose} 
            style={{ 
              background: 'transparent', 
              border: 'none', 
              color: 'var(--text-muted)', 
              cursor: 'pointer', 
              padding: 4, 
              borderRadius: 6, 
              display: 'flex', 
              alignItems: 'center' 
            }}
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="quick-action-form-body">
            <div className="quick-action-form-group">
              <label>Name / Title</label>
              <input
                type="text"
                required
                placeholder={meta.placeholderTitle}
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                autoFocus
              />
            </div>

            <div className="quick-action-form-row">
              <div className="quick-action-form-group">
                <label>Amount ({currency})</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="any"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={e => setFormData({ ...formData, amount: e.target.value })}
                />
              </div>

              <div className="quick-action-form-group">
                <label>Category</label>
                <select
                  value={formData.category || meta.defaultCat}
                  onChange={e => setFormData({ ...formData, category: e.target.value })}
                >
                  {meta.categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            {(type === 'asset' || type === 'investment' || type === 'liability') && (
              <div className="quick-action-form-row">
                {type === 'liability' ? (
                  <>
                    <div className="quick-action-form-group">
                      <label>Interest Rate (% p.a.)</label>
                      <input
                        type="number"
                        step="0.1"
                        placeholder="e.g. 8.5"
                        value={formData.rate}
                        onChange={e => setFormData({ ...formData, rate: e.target.value })}
                      />
                    </div>
                    <div className="quick-action-form-group">
                      <label>Monthly EMI ({currency})</label>
                      <input
                        type="number"
                        step="any"
                        placeholder="e.g. 25000"
                        value={formData.emi}
                        onChange={e => setFormData({ ...formData, emi: e.target.value })}
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="quick-action-form-group">
                      <label>Expected Return (% p.a.)</label>
                      <input
                        type="number"
                        step="0.1"
                        placeholder="e.g. 12.0"
                        value={formData.rate}
                        onChange={e => setFormData({ ...formData, rate: e.target.value })}
                      />
                    </div>
                    <div className="quick-action-form-group">
                      <label>Date Logged</label>
                      <input
                        type="date"
                        value={formData.date}
                        onChange={e => setFormData({ ...formData, date: e.target.value })}
                      />
                    </div>
                  </>
                )}
              </div>
            )}

            {(type === 'expense' || type === 'income') && (
              <div className="quick-action-form-group">
                <label>Date</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={e => setFormData({ ...formData, date: e.target.value })}
                />
              </div>
            )}

            <div className="quick-action-form-group">
              <label>Additional Notes (Optional)</label>
              <input
                type="text"
                placeholder="Add tags, account info, or reference notes..."
                value={formData.notes}
                onChange={e => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>
          </div>

          <div className="quick-action-form-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" style={{ backgroundColor: meta.color }}>
              Save Entry
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const DashboardView: React.FC<DashboardViewProps> = ({
  goals,
  currency,
  onOpenCreateModal,
  onSelectGoal,
  onNavigateTab,
  onOpenAskAI,
  monthlySurplusINR,
  onDeleteGoal,
}) => {
  const { user, requireAuth } = useAuth();
  const { showConfirm, showToast } = useNotification();
  const { greeting: liveGreeting, city, countryCode, dateStr, timeStr, weatherIcon, tempStr } = useRealtimeContext();
  const conflict = detectCashFlowConflicts(goals, monthlySurplusINR);

  const [timeRange, setTimeRange] = useState<'1M' | '3M' | '6M' | '1Y' | '3Y' | '5Y' | 'MAX'>('1Y');
  const [activeQuickAction, setActiveQuickAction] = useState<'expense' | 'income' | 'asset' | 'liability' | 'investment' | null>(null);
  const [selectedWidgetModal, setSelectedWidgetModal] = useState<WidgetDetailType | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [dashboardFeed, setDashboardFeed] = useState<any>(null);

  useEffect(() => {
    fetchDashboardFeedApi(currency).then((feed) => {
      setDashboardFeed(feed);
    });
  }, [currency]);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const dashboardGoals = goals;

  const totalTargetBase = goals.reduce((acc, g) => acc + convertCurrency(g.targetAmount, g.currency, currency), 0);
  const totalSavedBase = goals.reduce((acc, g) => acc + convertCurrency(g.currentAmount, g.currency, currency), 0);
  const totalRequiredMonthlyBase = convertCurrency(conflict.totalRequiredMonthlyINR, 'INR', currency);

  const onTrackCount = goals.filter(g => g.status === 'ON TRACK' || g.status === 'AHEAD').length;
  const behindCount = goals.filter(g => g.status === 'BEHIND' || g.status === 'AT RISK').length;
  const completedCount = goals.filter(g => g.status === 'COMPLETED').length;

  // Dynamic financial metrics loaded from API feed
  const feedMetrics = dashboardFeed?.metrics || {
    totalIncomeINR: 130000,
    totalExpensesINR: 72000,
    monthlySurplusINR: 60000,
    baseAssetsINR: 5120000,
    baseLiabilitiesINR: 1484800,
    netWorthINR: 3635200,
  };

  const calcSaved = totalSavedBase;
  const calcTarget = totalTargetBase;
  const calcSurplus = convertCurrency(monthlySurplusINR || feedMetrics.monthlySurplusINR, 'INR', currency);

  const calcIncome = convertCurrency(feedMetrics.totalIncomeINR, 'INR', currency);
  const calcExpenses = convertCurrency(feedMetrics.totalExpensesINR, 'INR', currency);

  const calcAssets = convertCurrency(calcSaved + feedMetrics.baseAssetsINR, 'INR', currency);
  const calcLiabilities = Math.round(calcAssets * 0.29);
  const calcNetWorth = calcAssets - calcLiabilities;

  const displayName = user?.name ? user.name.split(' ')[0] : 'Guest User';

  const apiBills = dashboardFeed?.upcomingBills || [];
  const upcomingBills = goals.length > 0
    ? goals.slice(0, 5).map((g, idx) => {
        const calc = calculateRequiredMonthlyContribution(
          g.targetAmount,
          g.currentAmount,
          g.expectedInflation,
          g.expectedReturn,
          g.targetDate
        );
        const reqMonthly = convertCurrency(calc.requiredMonthly, g.currency, currency);
        const dueDays = (idx + 1) * 3 + 2;
        return {
          title: `${g.name} SIP`,
          amount: formatCurrency(reqMonthly, currency),
          due: `Due in ${dueDays} days`,
          type: g.customCategory || g.category || 'Goal',
          color: '#10b981'
        };
      })
    : apiBills.map((b: any) => ({
        title: b.title,
        amount: formatCurrency(convertCurrency(b.amountINR, 'INR', currency), currency),
        due: b.due,
        type: b.type,
        color: b.color || '#10b981'
      }));

  const apiTxns = dashboardFeed?.recentTransactions || [];
  const recentTransactions = goals.length > 0
    ? goals.slice(0, 4).map((g, idx) => {
        const amt = Math.round(convertCurrency(g.currentAmount * 0.15 || 5000, g.currency, currency));
        return {
          date: `${26 - idx * 2} Sep 2026`,
          desc: `${g.name} Deposit`,
          cat: g.customCategory || g.category || 'Investment',
          amount: `- ${formatCurrency(amt, currency)}`,
          color: '#ef4444',
          type: 'Investment'
        };
      })
    : apiTxns.map((t: any) => ({
        date: t.date,
        desc: t.desc,
        cat: t.cat,
        amount: t.amountINR > 0
          ? `+ ${formatCurrency(convertCurrency(t.amountINR, 'INR', currency), currency)}`
          : `- ${formatCurrency(convertCurrency(Math.abs(t.amountINR), 'INR', currency), currency)}`,
        color: t.color || '#10b981',
        type: t.type
      }));

  return (
    <div className="content-area">
      <div className="page-header">
        <div className="page-title-group">
          <h1>{liveGreeting}, {displayName}! 👋</h1>
          <p style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span>Here's your financial snapshot & custom goals progress for today.</span>
            <span className="desktop-only" style={{ fontSize: 11, color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              📍 {city}, {countryCode} · {dateStr} · {timeStr} · {weatherIcon} {tempStr}
            </span>
            <span className="mobile-only-location" style={{ fontSize: 11, color: 'var(--text-muted)', display: 'none', alignItems: 'center', gap: 4 }}>
              📍 {city} · {weatherIcon} {tempStr}
            </span>
          </p>
        </div>
        <div className="header-actions">
          <button className="btn-secondary" onClick={() => onNavigateTab('conflicts')}>
            <AlertOctagon size={16} color={conflict.hasConflict ? "#ef4444" : "#10b981"} />
            <span>Conflict Analysis</span>
          </button>
          <button className="btn-primary" onClick={onOpenCreateModal}>
            <Plus size={18} />
            <span>Create Custom Goal</span>
          </button>
        </div>
      </div>

      {conflict.hasConflict && (
        <div className="conflict-banner">
          <div className="conflict-info">
            <div className="conflict-icon">
              <AlertOctagon size={24} />
            </div>
            <div className="conflict-text">
              <h4>Monthly Cash Flow Conflict Detected!</h4>
              <p>
                Your planned monthly contributions ({formatCurrency(totalRequiredMonthlyBase, currency)}/mo) exceed your available surplus by <strong>{formatCurrency(convertCurrency(conflict.deficitINR, 'INR', currency), currency)}/mo</strong>.
              </p>
            </div>
          </div>
          <button 
            className="btn-primary" 
            style={{ background: '#991b1b', color: 'white', border: 'none' }}
            onClick={() => onNavigateTab('conflicts')}
          >
            <Sparkles size={16} />
            <span>Run AI Scenario Optimizer</span>
          </button>
        </div>
      )}

      <div className="metrics-grid">
        <div className="metric-card" style={{ cursor: 'pointer' }} onClick={() => setSelectedWidgetModal('net-worth')}>
          <div className="metric-header">
            <span className="metric-title">Net Worth</span>
            <div className="metric-icon" style={{ backgroundColor: 'rgba(16,185,129,0.1)', color: '#10b981' }}>
              <TrendingUp size={18} />
            </div>
          </div>
          <span className="metric-value">{formatCurrency(calcNetWorth, currency)}</span>
          <div className="metric-bottom">
            <span className="metric-trend trend-up">
              <ArrowUpRight size={14} /> +12.5% vs last month
            </span>
            <svg className="sparkline-svg" width="60" height="20" viewBox="0 0 60 20" fill="none">
              <path d="M2 15 L16 12 L30 14 L44 6 L58 2" stroke="#10b981" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        <div className="metric-card" style={{ cursor: 'pointer' }} onClick={() => setSelectedWidgetModal('assets')}>
          <div className="metric-header">
            <span className="metric-title">Total Assets</span>
            <div className="metric-icon" style={{ backgroundColor: 'rgba(37,99,235,0.1)', color: '#3b82f6' }}>
              <Landmark size={18} />
            </div>
          </div>
          <span className="metric-value">{formatCurrency(calcAssets, currency)}</span>
          <div className="metric-bottom">
            <span className="metric-trend trend-up">
              <ArrowUpRight size={14} /> +14.2% vs last month
            </span>
            <svg className="sparkline-svg" width="60" height="20" viewBox="0 0 60 20" fill="none">
              <path d="M2 18 L16 14 L30 10 L44 8 L58 4" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        <div className="metric-card" style={{ cursor: 'pointer' }} onClick={() => setSelectedWidgetModal('liabilities')}>
          <div className="metric-header">
            <span className="metric-title">Total Liabilities</span>
            <div className="metric-icon" style={{ backgroundColor: 'rgba(239,68,68,0.1)', color: '#ef4444' }}>
              <CreditCard size={18} />
            </div>
          </div>
          <span className="metric-value">{formatCurrency(calcLiabilities, currency)}</span>
          <div className="metric-bottom">
            <span className="metric-trend" style={{ color: '#ef4444' }}>
              <ArrowUpRight size={14} /> +2.1% vs last month
            </span>
            <svg className="sparkline-svg" width="60" height="20" viewBox="0 0 60 20" fill="none">
              <path d="M2 5 L18 8 L32 6 L46 14 L58 18" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        <div className="metric-card" style={{ cursor: 'pointer' }} onClick={() => setSelectedWidgetModal('income')}>
          <div className="metric-header">
            <span className="metric-title">Monthly Income</span>
            <div className="metric-icon" style={{ backgroundColor: 'rgba(168,85,247,0.1)', color: '#a855f7' }}>
              <Wallet size={18} />
            </div>
          </div>
          <span className="metric-value">{formatCurrency(calcIncome, currency)}</span>
          <div className="metric-bottom">
            <span className="metric-trend trend-up">
              <ArrowUpRight size={14} /> +5.7% vs last month
            </span>
            <svg className="sparkline-svg" width="60" height="20" viewBox="0 0 60 20" fill="none">
              <path d="M2 15 L16 14 L30 8 L44 10 L58 3" stroke="#a855f7" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        <div className="metric-card" style={{ cursor: 'pointer' }} onClick={() => setSelectedWidgetModal('expenses')}>
          <div className="metric-header">
            <span className="metric-title">Monthly Expenses</span>
            <div className="metric-icon" style={{ backgroundColor: 'rgba(236,72,153,0.1)', color: '#ec4899' }}>
              <Activity size={18} />
            </div>
          </div>
          <span className="metric-value">{formatCurrency(calcExpenses, currency)}</span>
          <div className="metric-bottom">
            <span className="metric-trend trend-up">
              <ArrowUpRight size={14} /> 3.8% vs last month
            </span>
            <svg className="sparkline-svg" width="60" height="20" viewBox="0 0 60 20" fill="none">
              <path d="M2 6 L16 12 L30 10 L44 16 L58 14" stroke="#ec4899" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
        </div>
      </div>

      <div className="dashboard-charts-row">
        <div className="metric-card chart-card net-worth-chart" style={{ cursor: 'pointer' }} onClick={() => setSelectedWidgetModal('net-worth')}>
          <div className="chart-header">
            <div>
              <span className="metric-title">Net Worth Trend</span>
              <div className="chart-value-row">
                {formatCurrency(calcNetWorth, currency)} <span className="chart-trend-label">↑ 12.5% vs last year</span>
              </div>
            </div>
            <div className="time-range-selector" onClick={(e) => e.stopPropagation()}>
              {(['1M', '3M', '6M', '1Y', '3Y', '5Y', 'MAX'] as const).map((r) => (
                <button
                  key={r}
                  className={`fx-btn ${timeRange === r ? 'active' : ''}`}
                  onClick={() => setTimeRange(r)}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div className="chart-area">
            <svg width="100%" height="100%" viewBox="0 0 500 150" preserveAspectRatio="none">
              <defs>
                <linearGradient id="networthGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <path d="M0 130 Q120 120, 240 80 T500 20 L500 150 L0 150 Z" fill="url(#networthGradient)" />
              <path d="M0 130 Q120 120, 240 80 T500 20" stroke="#10b981" strokeWidth="3" fill="none" />
              <circle cx="500" cy="20" r="5" fill="#10b981" />
            </svg>
            <div className="chart-tooltip-marker">{formatCurrency(calcNetWorth, currency)}</div>
          </div>

          <div className="chart-x-labels">
            <span>May</span><span>Jun</span><span>Jul</span><span>Aug</span>
            <span>Sep</span><span>Oct</span><span>Nov</span><span>Dec</span>
            <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span>
          </div>
        </div>

        <div className="metric-card chart-card asset-allocation-chart" style={{ cursor: 'pointer' }} onClick={() => setSelectedWidgetModal('assets')}>
          <div className="chart-header">
            <span className="metric-title">Asset Allocation</span>
          </div>

          <div className="donut-wrapper">
            <svg width="140" height="140" viewBox="0 0 140 140">
              <circle cx="70" cy="70" r="52" stroke="#2563eb" strokeWidth="18" fill="none" strokeDasharray="327" strokeDashoffset="100" />
              <circle cx="70" cy="70" r="52" stroke="#3b82f6" strokeWidth="18" fill="none" strokeDasharray="327" strokeDashoffset="170" />
              <circle cx="70" cy="70" r="52" stroke="#10b981" strokeWidth="18" fill="none" strokeDasharray="327" strokeDashoffset="240" />
              <circle cx="70" cy="70" r="52" stroke="#f59e0b" strokeWidth="18" fill="none" strokeDasharray="327" strokeDashoffset="280" />
              <circle cx="70" cy="70" r="52" stroke="#a855f7" strokeWidth="18" fill="none" strokeDasharray="327" strokeDashoffset="310" />
            </svg>
            <div className="donut-center">
              <span className="donut-amount">{formatCurrency(calcAssets, currency)}</span>
              <span className="donut-sub">Total Assets</span>
            </div>
          </div>

          <div className="legend-grid">
            <div className="legend-item"><span className="legend-dot" style={{ backgroundColor: '#2563eb' }} />Equity 32.5%</div>
            <div className="legend-item"><span className="legend-dot" style={{ backgroundColor: '#3b82f6' }} />Mutual Funds 21.4%</div>
            <div className="legend-item"><span className="legend-dot" style={{ backgroundColor: '#10b981' }} />Real Estate 18.7%</div>
            <div className="legend-item"><span className="legend-dot" style={{ backgroundColor: '#f59e0b' }} />Gold 8.2%</div>
            <div className="legend-item"><span className="legend-dot" style={{ backgroundColor: '#06b6d4' }} />Cash 6.8%</div>
            <div className="legend-item"><span className="legend-dot" style={{ backgroundColor: '#a855f7' }} />Others 12.4%</div>
          </div>
        </div>

        <div className="metric-card chart-card ai-assistant-card">
          <div className="ai-card-header" style={{ cursor: 'pointer' }} onClick={() => onOpenAskAI()}>
            <div className="ai-card-title">
              <Bot size={18} color="#3b82f6" />
              <span>AI Financial Assistant</span>
              <span className="beta-badge">Beta</span>
            </div>
          </div>

          <div className="ai-prompt-list">
            <button className="ai-prompt-chip" onClick={() => onOpenAskAI('Can I afford an ₹80L house in 2028?')}>
              <span>💬 Can I afford an ₹80L house?</span>
            </button>
            <button className="ai-prompt-chip" onClick={() => onOpenAskAI('Show my investment performance and allocation summary')}>
              <span>💬 Show my investment performance</span>
            </button>
            <button className="ai-prompt-chip" onClick={() => onOpenAskAI('How much tax will I pay under new regime vs old regime?')}>
              <span>💬 How much tax will I pay?</span>
            </button>
            <button className="ai-prompt-chip" onClick={() => onOpenAskAI('Create a complete inflation-adjusted retirement plan for age 60')}>
              <span>💬 Create a retirement plan</span>
            </button>
          </div>

          <button className="btn-primary ask-ai-btn" onClick={() => onOpenAskAI()}>
            <Sparkles size={16} />
            <span>Ask LIFEOS AI...</span>
          </button>
        </div>
      </div>

      <div className="dashboard-bottom-row">
        <div className="goals-section">
          <div className="goals-section-header">
            <span className="metric-title" style={{ cursor: 'pointer' }} onClick={() => onNavigateTab('goals')}>Your Goals</span>
            <button className="view-all-btn" onClick={() => onNavigateTab('goals')}>
              <span>View All</span>
              <ChevronRight size={16} />
            </button>
          </div>

          <div className="goals-grid">
            {dashboardGoals.map((goal) => {
              const calc = calculateRequiredMonthlyContribution(
                goal.targetAmount,
                goal.currentAmount,
                goal.expectedInflation,
                goal.expectedReturn,
                goal.targetDate
              );

              const displayTarget = convertCurrency(goal.targetAmount, goal.currency, currency);
              const displaySaved = convertCurrency(goal.currentAmount, goal.currency, currency);
              const displayMonthlyReq = convertCurrency(calc.requiredMonthly, goal.currency, currency);
              const pct = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));

              return (
                <div key={goal.id} className="goal-card" onClick={() => onSelectGoal(goal)}>
                  <div className="goal-card-top">
                    <div className="goal-icon-title">
                      <div className="goal-category-icon">
                        {goal.category === 'Marriage' ? '💍' : 
                         goal.category === 'Housing' ? '🏠' : 
                         goal.category === 'Parents' ? '✨' : 
                         goal.category === 'Retirement' ? '🏖️' : 
                         goal.category === 'Education' ? '🎓' : '🎯'}
                      </div>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <h3 className="goal-title">{goal.name}</h3>
                        <span className="goal-category-badge">{goal.customCategory || goal.category} • {new Date(goal.targetDate).getFullYear()}</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span className={`status-badge ${goal.status.replace(' ', '.')}`}>
                        {goal.status}
                      </span>
                      {onDeleteGoal && (
                        <button
                          className="btn-icon-danger"
                          title="Delete Goal"
                          onClick={(e) => {
                            e.stopPropagation();
                            showConfirm({
                              title: 'Delete Goal',
                              message: `Are you sure you want to delete "${goal.name}"? This action cannot be undone.`,
                              isDanger: true,
                              confirmText: 'Delete Goal',
                              onConfirm: () => {
                                onDeleteGoal(goal.id);
                                showToast(`Goal "${goal.name}" deleted`, 'info');
                              }
                            });
                          }}
                          style={{
                            background: 'rgba(239, 68, 68, 0.12)',
                            border: '1px solid rgba(239, 68, 68, 0.25)',
                            color: '#ef4444',
                            padding: '4px 7px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s ease',
                          }}
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="goal-amounts">
                    <div>
                      <div className="saved-amount">{formatCurrency(displaySaved, currency)}</div>
                      <div className="target-amount-label">Saved of {formatCurrency(displayTarget, currency)}</div>
                    </div>
                    <div className="goal-monthly-req">
                      <div className="monthly-req-value">
                        {formatCurrency(displayMonthlyReq, currency)}/mo
                      </div>
                      <div className="monthly-req-label">Req. Contribution</div>
                    </div>
                  </div>

                  <div className="progress-bar-container">
                    <div 
                      className={`progress-fill ${goal.status.replace(' ', '.')}`} 
                      style={{ width: `${pct}%` }} 
                    />
                  </div>

                  <div className="goal-footer">
                    <span>Inflation: {goal.expectedInflation}% p.a.</span>
                    <span>{pct}% Achieved</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="metric-card" style={{ padding: 20, marginTop: 20 }}>
            <div className="bills-header" style={{ marginBottom: 14 }}>
              <span className="metric-title" style={{ cursor: 'pointer' }} onClick={() => setSelectedWidgetModal('transactions')}>Recent Transactions</span>
              <button className="view-all-btn" onClick={() => setSelectedWidgetModal('transactions')}>
                <span>View All</span>
                <ChevronRight size={14} />
              </button>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table className="transactions-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Description</th>
                    <th>Category</th>
                    <th>Amount</th>
                    <th>Type</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTransactions.map((tx, idx) => (
                    <tr key={idx} style={{ cursor: 'pointer' }} onClick={() => setSelectedWidgetModal('transactions')}>
                      <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{tx.date}</td>
                      <td style={{ fontWeight: 600, color: 'var(--text-main)' }}>{tx.desc}</td>
                      <td>
                        <span style={{ fontSize: 11, padding: '2px 7px', borderRadius: 4, background: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                          {tx.cat}
                        </span>
                      </td>
                      <td style={{ fontWeight: 700, color: tx.color }}>{tx.amount}</td>
                      <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{tx.type}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="sidebar-column">
          <div className="metric-card bills-card" style={{ cursor: 'pointer' }} onClick={() => setSelectedWidgetModal('payments')}>
            <div className="bills-header">
              <span className="metric-title">Upcoming & Recent Payments</span>
              <button className="view-all-btn" onClick={(e) => { e.stopPropagation(); setSelectedWidgetModal('payments'); }}>
                <span>View All</span>
                <ChevronRight size={14} />
              </button>
            </div>
            <div className="bills-list">
              {upcomingBills.map((b, i) => (
                <div key={i} className="bill-item">
                  <div>
                    <div className="bill-title">{b.title}</div>
                    <div className="bill-due">{b.due}</div>
                  </div>
                  <div className="bill-right">
                    <div className="bill-amount" style={{ color: b.color }}>{b.amount}</div>
                    <span className="bill-type">{b.type}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="sidebar-column">
          <div className="metric-card hero-banner-card" style={{
            background: 'linear-gradient(135deg, rgba(37,99,235,0.4), rgba(15,23,42,0.9)), url("https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            padding: 24,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            minHeight: 180,
            borderRadius: 16,
            border: '1px solid rgba(59,130,246,0.3)',
            cursor: 'pointer',
          }} onClick={() => onNavigateTab('goals')}>
            <div>
              <h3 className="hero-banner-title">Build the life you</h3>
              <p className="hero-banner-sub">Track. Plan. Grow. Achieve.</p>
            </div>
            <button className="btn-primary" onClick={(e) => { e.stopPropagation(); onOpenCreateModal(); }} style={{ width: 'fit-content', marginTop: 16 }}>
              <Plus size={16} />
              <span>Create New Goal</span>
            </button>
          </div>

          <div className="metric-card" style={{ padding: 20 }}>
            <span className="metric-title" style={{ marginBottom: 14, display: 'block' }}>Quick Actions</span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
              <button className="quick-action-tile" onClick={() => requireAuth(() => setActiveQuickAction('expense'), 'log expense')}>
                <div className="quick-action-icon-wrap" style={{ background: 'rgba(59, 130, 246, 0.12)' }}>
                  <Plus size={16} color="#3b82f6" />
                </div>
                <span>Add Expense</span>
              </button>
              <button className="quick-action-tile" onClick={() => requireAuth(() => setActiveQuickAction('income'), 'log income')}>
                <div className="quick-action-icon-wrap" style={{ background: 'rgba(16, 185, 129, 0.12)' }}>
                  <Plus size={16} color="#10b981" />
                </div>
                <span>Add Income</span>
              </button>
              <button className="quick-action-tile" onClick={onOpenCreateModal}>
                <div className="quick-action-icon-wrap" style={{ background: 'rgba(168, 85, 247, 0.12)' }}>
                  <Target size={16} color="#a855f7" />
                </div>
                <span>Add Goal</span>
              </button>
              <button className="quick-action-tile" onClick={() => requireAuth(() => setActiveQuickAction('asset'), 'add asset')}>
                <div className="quick-action-icon-wrap" style={{ background: 'rgba(6, 182, 212, 0.12)' }}>
                  <Landmark size={16} color="#06b6d4" />
                </div>
                <span>Add Asset</span>
              </button>
              <button className="quick-action-tile" onClick={() => requireAuth(() => setActiveQuickAction('liability'), 'add liability')}>
                <div className="quick-action-icon-wrap" style={{ background: 'rgba(239, 68, 68, 0.12)' }}>
                  <CreditCard size={16} color="#ef4444" />
                </div>
                <span>Add Liability</span>
              </button>
              <button className="quick-action-tile" onClick={() => requireAuth(() => setActiveQuickAction('investment'), 'add investment')}>
                <div className="quick-action-icon-wrap" style={{ background: 'rgba(245, 158, 11, 0.12)' }}>
                  <TrendingUp size={16} color="#f59e0b" />
                </div>
                <span>Add Investment</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {selectedWidgetModal && (
        <WidgetDetailModal
          type={selectedWidgetModal}
          currency={currency}
          goals={goals}
          onClose={() => setSelectedWidgetModal(null)}
          onOpenAskAI={onOpenAskAI}
        />
      )}

      {activeQuickAction && (
        <QuickActionModal
          type={activeQuickAction}
          currency={currency}
          onClose={() => setActiveQuickAction(null)}
          onSuccess={(msg) => triggerToast(msg)}
        />
      )}

      {toastMessage && (
        <div className="quick-action-success-toast">
          <CheckCircle2 size={18} />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
