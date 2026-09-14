import React, { useState } from 'react';
import { 
  TrendingUp, 
  Landmark, 
  CreditCard, 
  Wallet, 
  Activity, 
  CheckCircle2, 
  X, 
  Download, 
  Sparkles, 
  ArrowUpRight, 
  ArrowDownRight, 
  ShieldCheck, 
  AlertCircle, 
  Calendar, 
  Clock, 
  PieChart as PieChartIcon, 
  DollarSign, 
  Plus
} from 'lucide-react';
import { formatCurrency, convertCurrency } from '../utils/calculations';
import { Goal } from '../types';
import { useNotification } from '../context/NotificationContext';

export type WidgetDetailType = 
  | 'net-worth' 
  | 'assets' 
  | 'liabilities' 
  | 'income' 
  | 'expenses' 
  | 'transactions' 
  | 'payments' 
  | 'health-score';

interface WidgetDetailModalProps {
  type: WidgetDetailType;
  currency: string;
  goals: Goal[];
  onClose: () => void;
  onOpenAskAI?: (prompt?: string) => void;
}

export const WidgetDetailModal: React.FC<WidgetDetailModalProps> = ({
  type,
  currency,
  goals,
  onClose,
  onOpenAskAI,
}) => {
  const { showToast } = useNotification();
  const [selectedPeriod, setSelectedPeriod] = useState<'1M' | '6M' | '1Y' | 'ALL'>('1Y');

  // Compute live amounts from goals + base financial metrics
  const totalGoalSaved = goals.reduce((acc, g) => acc + convertCurrency(g.currentAmount, g.currency, currency), 0);
  const totalGoalTarget = goals.reduce((acc, g) => acc + convertCurrency(g.targetAmount, g.currency, currency), 0);

  const calcIncome = convertCurrency(130000, 'INR', currency);
  const calcExpenses = convertCurrency(72000, 'INR', currency);
  const calcAssets = convertCurrency(totalGoalSaved + 4500000, 'INR', currency);
  const calcLiabilities = Math.round(calcAssets * 0.29);
  const calcNetWorth = calcAssets - calcLiabilities;

  const renderContent = () => {
    switch (type) {
      case 'net-worth':
        return (
          <div>
            <div className="modal-stat-hero" style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(5,150,105,0.05))', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 14, padding: 18, marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#10b981', letterSpacing: 0.5 }}>Current Net Worth</span>
                  <h2 style={{ fontSize: 28, fontWeight: 900, color: 'var(--text-main)', margin: '4px 0 2px 0' }}>{formatCurrency(calcNetWorth, currency)}</h2>
                  <span style={{ fontSize: 12, color: '#10b981', fontWeight: 600 }}>↑ +12.5% vs previous year (+{formatCurrency(calcNetWorth * 0.125, currency)})</span>
                </div>
                <div style={{ padding: 12, borderRadius: 12, background: 'rgba(16,185,129,0.2)', color: '#10b981' }}>
                  <TrendingUp size={28} />
                </div>
              </div>
            </div>

            <div className="metrics-grid" style={{ gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 20 }}>
              <div className="metric-card" style={{ padding: 14 }}>
                <span className="metric-title">Total Assets</span>
                <span className="metric-value" style={{ color: '#3b82f6', fontSize: 18 }}>{formatCurrency(calcAssets, currency)}</span>
                <span className="metric-trend trend-up">71% Liquid & Invested</span>
              </div>
              <div className="metric-card" style={{ padding: 14 }}>
                <span className="metric-title">Total Liabilities</span>
                <span className="metric-value" style={{ color: '#ef4444', fontSize: 18 }}>{formatCurrency(calcLiabilities, currency)}</span>
                <span className="metric-trend" style={{ color: '#ef4444' }}>29% Debt Ratio</span>
              </div>
              <div className="metric-card" style={{ padding: 14 }}>
                <span className="metric-title">Solvency Ratio</span>
                <span className="metric-value" style={{ color: '#10b981', fontSize: 18 }}>3.45x</span>
                <span className="metric-trend trend-up">Healthy Balance Sheet</span>
              </div>
            </div>

            <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, color: 'var(--text-main)' }}>Historical Net Worth Growth Curve</h4>
            <div style={{ padding: 16, background: 'var(--bg-card-elevated)', borderRadius: 12, border: '1px solid var(--border-color)', marginBottom: 20 }}>
              <svg width="100%" height="120" viewBox="0 0 500 120" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="nwGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <path d="M0 100 Q120 90, 240 55 T500 15 L500 120 L0 120 Z" fill="url(#nwGrad)" />
                <path d="M0 100 Q120 90, 240 55 T500 15" stroke="#10b981" strokeWidth="3" fill="none" />
                <circle cx="500" cy="15" r="5" fill="#10b981" />
              </svg>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-muted)', marginTop: 8 }}>
                <span>Q1 2025</span><span>Q2 2025</span><span>Q3 2025</span><span>Q4 2025</span>
                <span>Q1 2026</span><span>Q2 2026</span><span>Q3 2026 (Now)</span>
              </div>
            </div>

            <div style={{ padding: 14, background: 'rgba(59, 130, 246, 0.08)', borderRadius: 12, border: '1px solid rgba(59, 130, 246, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-main)' }}>AI Net Worth Growth Projection</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>On track to hit {formatCurrency(calcNetWorth * 1.8, currency)} by 2028 with current goal SIPs.</div>
              </div>
              {onOpenAskAI && (
                <button className="btn-primary" style={{ height: 32, fontSize: 11 }} onClick={() => { onClose(); onOpenAskAI('How can I double my net worth in the next 5 years?'); }}>
                  <Sparkles size={13} />
                  <span>Ask AI Strategy</span>
                </button>
              )}
            </div>
          </div>
        );

      case 'assets':
        return (
          <div>
            <div className="modal-stat-hero" style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.15), rgba(37,99,235,0.05))', border: '1px solid rgba(59,130,246,0.3)', borderRadius: 14, padding: 18, marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#3b82f6', letterSpacing: 0.5 }}>Aggregated Total Assets</span>
                  <h2 style={{ fontSize: 28, fontWeight: 900, color: 'var(--text-main)', margin: '4px 0 2px 0' }}>{formatCurrency(calcAssets, currency)}</h2>
                  <span style={{ fontSize: 12, color: '#3b82f6', fontWeight: 600 }}>Across 6 primary asset classes</span>
                </div>
                <div style={{ padding: 12, borderRadius: 12, background: 'rgba(59,130,246,0.2)', color: '#3b82f6' }}>
                  <Landmark size={28} />
                </div>
              </div>
            </div>

            <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, color: 'var(--text-main)' }}>Asset Class Holdings Breakdown</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
              {[
                { name: 'Equity Shares & Direct Stocks', amt: calcAssets * 0.325, weight: '32.5%', color: '#2563eb', desc: 'Nifty 50 Index, Bluechip & Growth Stocks' },
                { name: 'Mutual Funds & Flexi Cap SIPs', amt: calcAssets * 0.214, weight: '21.4%', color: '#3b82f6', desc: 'Systematic Investment Plans linked to Goals' },
                { name: 'Real Estate & Property Equity', amt: calcAssets * 0.187, weight: '18.7%', color: '#10b981', desc: 'Residential land & home equity value' },
                { name: 'Gold & Digital Precious Metals', amt: calcAssets * 0.082, weight: '8.2%', color: '#f59e0b', desc: 'Sovereign Gold Bonds & ETF holdings' },
                { name: 'Fixed Deposits & Govt Debt', amt: calcAssets * 0.124, weight: '12.4%', color: '#a855f7', desc: 'Bank FDs, PPF, & Senior Citizen Savings' },
                { name: 'Liquid Cash & Sweep-in Reserves', amt: calcAssets * 0.068, weight: '6.8%', color: '#06b6d4', desc: 'High-yield liquid savings & emergency fund' },
              ].map((item, idx) => (
                <div key={idx} style={{ padding: 12, borderRadius: 10, background: 'var(--bg-card-elevated)', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ width: 10, height: 10, borderRadius: '50%', background: item.color, display: 'inline-block' }} />
                      <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-main)' }}>{item.name}</span>
                      <span style={{ fontSize: 10, fontWeight: 800, padding: '2px 6px', borderRadius: 4, background: `${item.color}22`, color: item.color }}>{item.weight}</span>
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2, marginLeft: 18 }}>{item.desc}</div>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-main)' }}>
                    {formatCurrency(item.amt, currency)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'liabilities':
        return (
          <div>
            <div className="modal-stat-hero" style={{ background: 'linear-gradient(135deg, rgba(239,68,68,0.15), rgba(220,38,38,0.05))', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 14, padding: 18, marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#ef4444', letterSpacing: 0.5 }}>Active Liabilities & Debt</span>
                  <h2 style={{ fontSize: 28, fontWeight: 900, color: 'var(--text-main)', margin: '4px 0 2px 0' }}>{formatCurrency(calcLiabilities, currency)}</h2>
                  <span style={{ fontSize: 12, color: '#ef4444', fontWeight: 600 }}>Total Monthly EMI Commitment: {formatCurrency(48500, currency)}/mo</span>
                </div>
                <div style={{ padding: 12, borderRadius: 12, background: 'rgba(239,68,68,0.2)', color: '#ef4444' }}>
                  <CreditCard size={28} />
                </div>
              </div>
            </div>

            <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, color: 'var(--text-main)' }}>Active Loans & Debt Schedule</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
              {[
                { name: 'Home Mortgage Loan', principal: calcLiabilities * 0.85, emi: 38500, rate: '8.5% p.a.', tenor: '14 yrs remaining', status: 'ON TIME' },
                { name: 'Vehicle / Car Loan', principal: calcLiabilities * 0.12, emi: 10000, rate: '9.2% p.a.', tenor: '2 yrs remaining', status: 'ON TIME' },
                { name: 'Credit Card Statement Balance', principal: calcLiabilities * 0.03, emi: 0, rate: '0% (Paid in full)', tenor: 'Due in 12 days', status: 'PAID' },
              ].map((loan, idx) => (
                <div key={idx} style={{ padding: 14, borderRadius: 10, background: 'var(--bg-card-elevated)', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-main)' }}>{loan.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>Interest: {loan.rate} • {loan.tenor}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 14, fontWeight: 800, color: '#ef4444' }}>{formatCurrency(loan.principal, currency)}</div>
                    {loan.emi > 0 && <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>EMI: {formatCurrency(loan.emi, currency)}/mo</div>}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ padding: 14, background: 'rgba(16, 185, 129, 0.08)', borderRadius: 12, border: '1px solid rgba(16, 185, 129, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-main)' }}>Debt Payoff & Accelerated EMI Strategy</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Paying +1 extra EMI per year saves 3.2 years of interest on your home loan.</div>
              </div>
              {onOpenAskAI && (
                <button className="btn-primary" style={{ height: 32, fontSize: 11, background: '#10b981', borderColor: '#10b981' }} onClick={() => { onClose(); onOpenAskAI('How can I prepay my home loan faster to save interest?'); }}>
                  <Sparkles size={13} />
                  <span>Prepay Plan</span>
                </button>
              )}
            </div>
          </div>
        );

      case 'income':
        return (
          <div>
            <div className="modal-stat-hero" style={{ background: 'linear-gradient(135deg, rgba(168,85,247,0.15), rgba(147,51,234,0.05))', border: '1px solid rgba(168,85,247,0.3)', borderRadius: 14, padding: 18, marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#a855f7', letterSpacing: 0.5 }}>Monthly Cash Inflow</span>
                  <h2 style={{ fontSize: 28, fontWeight: 900, color: 'var(--text-main)', margin: '4px 0 2px 0' }}>{formatCurrency(calcIncome, currency)}/mo</h2>
                  <span style={{ fontSize: 12, color: '#a855f7', fontWeight: 600 }}>Annualized Income: {formatCurrency(calcIncome * 12, currency)}/yr</span>
                </div>
                <div style={{ padding: 12, borderRadius: 12, background: 'rgba(168,85,247,0.2)', color: '#a855f7' }}>
                  <Wallet size={28} />
                </div>
              </div>
            </div>

            <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, color: 'var(--text-main)' }}>Active Income Sources</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
              {[
                { source: 'Primary Salary (Net Take-home)', amt: calcIncome * 0.82, cat: 'Salary Credit', freq: 'Monthly (1st)' },
                { source: 'Freelance & Technical Consulting', amt: calcIncome * 0.12, cat: 'Professional', freq: 'Bi-weekly' },
                { source: 'Dividend Yields & Interest Income', amt: calcIncome * 0.06, cat: 'Investments', freq: 'Quarterly' },
              ].map((inc, idx) => (
                <div key={idx} style={{ padding: 12, borderRadius: 10, background: 'var(--bg-card-elevated)', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-main)' }}>{inc.source}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{inc.cat} • Frequency: {inc.freq}</div>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: '#10b981' }}>+{formatCurrency(inc.amt, currency)}</div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'expenses':
        return (
          <div>
            <div className="modal-stat-hero" style={{ background: 'linear-gradient(135deg, rgba(236,72,153,0.15), rgba(219,39,119,0.05))', border: '1px solid rgba(236,72,153,0.3)', borderRadius: 14, padding: 18, marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#ec4899', letterSpacing: 0.5 }}>Monthly Cash Outflow & Expenses</span>
                  <h2 style={{ fontSize: 28, fontWeight: 900, color: 'var(--text-main)', margin: '4px 0 2px 0' }}>{formatCurrency(calcExpenses, currency)}/mo</h2>
                  <span style={{ fontSize: 12, color: '#ec4899', fontWeight: 600 }}>55.3% of net monthly income</span>
                </div>
                <div style={{ padding: 12, borderRadius: 12, background: 'rgba(236,72,153,0.2)', color: '#ec4899' }}>
                  <Activity size={28} />
                </div>
              </div>
            </div>

            <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, color: 'var(--text-main)' }}>50/30/20 Budget Categorization</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
              {[
                { cat: 'Essential Needs (Rent, Utilities, Food)', amt: calcExpenses * 0.55, target: '50%', color: '#3b82f6' },
                { cat: 'Goal Investments & SIPs', amt: calcExpenses * 0.28, target: '20%', color: '#10b981' },
                { cat: 'Discretionary Wants & Travel', amt: calcExpenses * 0.17, target: '30%', color: '#f59e0b' },
              ].map((exp, idx) => (
                <div key={idx} style={{ padding: 12, borderRadius: 10, background: 'var(--bg-card-elevated)', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-main)' }}>{exp.cat}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>Target Allocation: {exp.target}</div>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: exp.color }}>{formatCurrency(exp.amt, currency)}</div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'transactions':
        return (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h4 style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>Full Transaction Ledger & Audit Trail</h4>
              <button className="btn-secondary" style={{ height: 30, fontSize: 11 }} onClick={() => showToast('Exporting CSV Ledger...', 'info')}>
                <Download size={13} />
                <span>Export CSV</span>
              </button>
            </div>

            <div style={{ overflowX: 'auto', borderRadius: 12, border: '1px solid var(--border-color)' }}>
              <table className="budget-table">
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
                  {[
                    { date: '14 Sep 2026', desc: 'SIP Deposit - House Goal', cat: 'Investment', amt: formatCurrency(30000, currency), color: '#10b981', type: 'Credit' },
                    { date: '10 Sep 2026', desc: 'Home Loan EMI Debit', cat: 'Loan EMI', amt: formatCurrency(38500, currency), color: '#ef4444', type: 'Debit' },
                    { date: '05 Sep 2026', desc: 'Monthly Salary Credit', cat: 'Salary', amt: formatCurrency(130000, currency), color: '#10b981', type: 'Income' },
                    { date: '01 Sep 2026', desc: 'Emergency Fund Sweep', cat: 'Savings', amt: formatCurrency(15000, currency), color: '#3b82f6', type: 'Deposit' },
                    { date: '28 Aug 2026', desc: 'Gold Sinking Fund Deposit', cat: 'Precious Metals', amt: formatCurrency(12000, currency), color: '#f59e0b', type: 'Deposit' },
                  ].map((tx, idx) => (
                    <tr key={idx}>
                      <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{tx.date}</td>
                      <td style={{ fontWeight: 700, color: 'var(--text-main)' }}>{tx.desc}</td>
                      <td><span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 4, background: 'rgba(255,255,255,0.06)' }}>{tx.cat}</span></td>
                      <td style={{ fontWeight: 800, color: tx.color }}>{tx.amt}</td>
                      <td style={{ fontSize: 11, color: 'var(--text-muted)' }}>{tx.type}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'payments':
        return (
          <div>
            <h4 style={{ fontSize: 15, fontWeight: 800, marginBottom: 14, color: 'var(--text-main)' }}>Upcoming Bills & SIP Payment Schedule</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
              {[
                { title: 'House Goal SIP Contribution', due: 'Due in 3 days (17 Sep)', amt: formatCurrency(30000, currency), cat: 'Investment', status: 'PENDING', color: '#10b981' },
                { title: 'Home Mortgage EMI', due: 'Due in 5 days (19 Sep)', amt: formatCurrency(38500, currency), cat: 'Loan EMI', status: 'AUTO-DEBIT', color: '#ef4444' },
                { title: 'Health Insurance Premium', due: 'Due in 14 days (28 Sep)', amt: formatCurrency(18000, currency), cat: 'Insurance', status: 'PENDING', color: '#3b82f6' },
                { title: 'Car Loan EMI', due: 'Due in 20 days (04 Oct)', amt: formatCurrency(10000, currency), cat: 'Loan EMI', status: 'AUTO-DEBIT', color: '#a855f7' },
              ].map((item, idx) => (
                <div key={idx} style={{ padding: 14, borderRadius: 10, background: 'var(--bg-card-elevated)', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-main)' }}>{item.title}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{item.due} • {item.cat}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 14, fontWeight: 800, color: item.color }}>{item.amt}</div>
                    <span style={{ fontSize: 10, fontWeight: 800, padding: '2px 6px', borderRadius: 4, background: 'rgba(255,255,255,0.06)', color: 'var(--text-muted)' }}>{item.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'health-score':
        return (
          <div>
            <div className="modal-stat-hero" style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(59,130,246,0.05))', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 14, padding: 18, marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#10b981', letterSpacing: 0.5 }}>Financial Health Score</span>
                  <h2 style={{ fontSize: 32, fontWeight: 900, color: '#10b981', margin: '4px 0 2px 0' }}>60 / 100 <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-main)' }}>(GOOD)</span></h2>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Comprehensive risk, liquidity & solvency diagnostic</span>
                </div>
                <div style={{ padding: 14, borderRadius: 50, background: 'rgba(16,185,129,0.2)', color: '#10b981' }}>
                  <ShieldCheck size={32} />
                </div>
              </div>
            </div>

            <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, color: 'var(--text-main)' }}>Diagnostic Metric Breakdown</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
              <div style={{ padding: 14, borderRadius: 10, background: 'var(--bg-card-elevated)', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-main)' }}>Emergency Liquidity Pool</span>
                  <span style={{ fontSize: 12, fontWeight: 800, color: '#f59e0b' }}>10% (1.5 / 6 Months Buffer)</span>
                </div>
                <div style={{ height: 6, background: 'var(--border-color)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ width: '10%', height: '100%', background: '#f59e0b', borderRadius: 3 }} />
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>Recommendation: Boost liquid savings to cover at least 6 months of expenses ({formatCurrency(calcExpenses * 6, currency)}).</div>
              </div>

              <div style={{ padding: 14, borderRadius: 10, background: 'var(--bg-card-elevated)', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-main)' }}>Debt Service Coverage (DTI)</span>
                  <span style={{ fontSize: 12, fontWeight: 800, color: '#ef4444' }}>85% (High Debt Leverage)</span>
                </div>
                <div style={{ height: 6, background: 'var(--border-color)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ width: '85%', height: '100%', background: '#ef4444', borderRadius: 3 }} />
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>Recommendation: Aim to keep total loan EMIs below 40% of net income ({formatCurrency(calcIncome * 0.4, currency)}).</div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const getTitle = () => {
    switch (type) {
      case 'net-worth': return 'Net Worth & Wealth Growth Analytics 📈';
      case 'assets': return 'Asset Portfolio & Investment Holdings 🏦';
      case 'liabilities': return 'Liabilities & Debt Repayment Manager 💳';
      case 'income': return 'Income Streams & Cash Inflow Engine 💵';
      case 'expenses': return 'Monthly Expense Breakdown & Budget Ledger 🛍️';
      case 'transactions': return 'Full Transaction Ledger & Audit Trail 🧾';
      case 'payments': return 'Upcoming Bills & SIP Payment Schedule 📅';
      case 'health-score': return 'Financial Health & Risk Audit Diagnostic 🛡️';
    }
  };

  return (
    <div className="modal-overlay animate-fade-in" onClick={onClose} style={{ zIndex: 1100 }}>
      <div 
        className="modal-card animate-scale-up" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2 style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
            {getTitle()}
          </h2>
          <button 
            className="icon-btn" 
            onClick={onClose}
            title="Close Modal"
          >
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          {renderContent()}
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

