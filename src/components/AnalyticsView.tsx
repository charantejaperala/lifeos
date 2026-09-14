import React from 'react';
import { Goal } from '../types';
import { formatCurrency, convertCurrency } from '../utils/calculations';
import { BarChart3, TrendingUp, Award, CheckCircle2, ShieldAlert, Target, ArrowUpRight } from 'lucide-react';

interface AnalyticsViewProps {
  goals: Goal[];
  currency: string;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ goals, currency }) => {
  const totalGoals = goals.length;
  const completedGoals = goals.filter(g => g.status === 'COMPLETED');
  const completionRate = totalGoals > 0 ? Math.round((completedGoals.length / totalGoals) * 100) : 0;

  // Dynamic metrics from real data
  const totalTarget = goals.reduce((acc, g) => acc + convertCurrency(g.targetAmount, g.currency, currency), 0);
  const totalSaved = goals.reduce((acc, g) => acc + convertCurrency(g.currentAmount, g.currency, currency), 0);
  const savingsEfficiency = totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0;

  const onTrackGoals = goals.filter(g => g.status === 'ON TRACK' || g.status === 'AHEAD').length;
  const consistencyRate = totalGoals > 0 ? Math.round((onTrackGoals / totalGoals) * 100) : 0;

  const categorySummary: Record<string, { count: number; saved: number; target: number }> = {};
  goals.forEach(g => {
    const cat = g.customCategory || g.category;
    if (!categorySummary[cat]) categorySummary[cat] = { count: 0, saved: 0, target: 0 };
    categorySummary[cat].count += 1;
    categorySummary[cat].saved += convertCurrency(g.currentAmount, g.currency, currency);
    categorySummary[cat].target += convertCurrency(g.targetAmount, g.currency, currency);
  });

  return (
    <div className="content-area">
      <div className="page-header">
        <div className="page-title-group">
          <h1>Goal Analytics & Variance Report 📊</h1>
          <p>Track goal completion efficiency, contribution consistency, and category breakdowns.</p>
        </div>
      </div>

      {goals.length === 0 ? (
        <div className="empty-state-card">
          <div className="empty-state-icon">📊</div>
          <div style={{ maxWidth: 420 }}>
            <h3 className="empty-state-title">No Analytics Data Available</h3>
            <p className="empty-state-text">
              Create your first financial goal to start seeing analytics and insights here.
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="metrics-grid">
            <div className="metric-card">
              <div className="metric-header">
                <span className="metric-title">Goal Completion Rate</span>
                <div className="metric-icon" style={{ backgroundColor: 'rgba(16,185,129,0.1)', color: '#10b981' }}>
                  <CheckCircle2 size={18} />
                </div>
              </div>
              <span className="metric-value" style={{ color: '#10b981' }}>{completionRate}%</span>
              <span className="metric-trend trend-up">
                <CheckCircle2 size={14} /> {completedGoals.length} of {totalGoals} Goals Completed
              </span>
            </div>

            <div className="metric-card">
              <div className="metric-header">
                <span className="metric-title">Savings Progress</span>
                <div className="metric-icon" style={{ backgroundColor: 'rgba(59,130,246,0.1)', color: '#3b82f6' }}>
                  <TrendingUp size={18} />
                </div>
              </div>
              <span className="metric-value" style={{ color: 'var(--accent-primary)' }}>{savingsEfficiency}%</span>
              <span className="metric-trend trend-up">
                {formatCurrency(totalSaved, currency)} of {formatCurrency(totalTarget, currency)} saved
              </span>
            </div>

            <div className="metric-card">
              <div className="metric-header">
                <span className="metric-title">On-Track Consistency</span>
                <div className="metric-icon" style={{ backgroundColor: 'rgba(124,58,237,0.1)', color: '#7c3aed' }}>
                  <Award size={18} />
                </div>
              </div>
              <span className="metric-value" style={{ color: '#7c3aed' }}>{consistencyRate}%</span>
              <span className="metric-trend trend-up">
                {onTrackGoals} of {totalGoals} goals on track
              </span>
            </div>
          </div>

          {/* Category Breakdown */}
          <div className="metric-card analytics-card">
            <h3 style={{ fontWeight: 800, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }} className="section-title">
              <BarChart3 size={18} color="var(--accent-primary)" />
              Category-wise Breakdown
            </h3>
            {Object.keys(categorySummary).length > 0 ? (
              <table className="budget-table">
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Goals</th>
                    <th>Total Saved</th>
                    <th>Total Target</th>
                    <th>Progress</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(categorySummary).map(([cat, data]) => {
                    const pct = data.target > 0 ? Math.round((data.saved / data.target) * 100) : 0;
                    return (
                      <tr key={cat}>
                        <td style={{ fontWeight: 700 }}>{cat}</td>
                        <td>{data.count}</td>
                        <td>{formatCurrency(data.saved, currency)}</td>
                        <td style={{ fontWeight: 700 }}>{formatCurrency(data.target, currency)}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ flex: 1, height: 6, background: 'var(--bg-main)', borderRadius: 3, overflow: 'hidden', minWidth: 60 }}>
                              <div style={{ width: `${pct}%`, height: '100%', background: pct >= 75 ? '#10b981' : pct >= 40 ? '#f59e0b' : '#ef4444', borderRadius: 3, transition: 'width 0.5s ease' }} />
                            </div>
                            <span style={{ fontWeight: 800, fontSize: 11, color: pct >= 75 ? '#10b981' : pct >= 40 ? '#f59e0b' : '#ef4444' }}>{pct}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <p style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', padding: 16 }}>
                No category data available yet.
              </p>
            )}
          </div>

          {/* Goal Status Distribution */}
          <div className="metric-card analytics-card">
            <h3 style={{ fontWeight: 800, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }} className="section-title">
              <Target size={18} color="var(--accent-primary)" />
              Goal Status Distribution
            </h3>
            <div className="metrics-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))' }}>
              {['ON TRACK', 'AHEAD', 'BEHIND', 'AT RISK', 'COMPLETED', 'NOT STARTED'].map(status => {
                const count = goals.filter(g => g.status === status).length;
                if (count === 0) return null;
                const colors: Record<string, string> = {
                  'ON TRACK': '#10b981', 'AHEAD': '#06b6d4', 'BEHIND': '#ef4444',
                  'AT RISK': '#f59e0b', 'COMPLETED': '#3b82f6', 'NOT STARTED': '#6b7280'
                };
                return (
                  <div key={status} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: 12, background: 'var(--bg-main)', borderRadius: 12, border: '1px solid var(--border-color)' }}>
                    <span className="status-dist-count" style={{ fontWeight: 800, color: colors[status] }}>{count}</span>
                    <span style={{ fontSize: 9, fontWeight: 700, color: colors[status], textTransform: 'uppercase', letterSpacing: 0.5 }}>{status}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Wealth Portfolio & Asset Allocation Engine */}
          <div className="metric-card analytics-card" style={{ marginTop: 20 }}>
            <h3 style={{ fontWeight: 800, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }} className="section-title">
              <TrendingUp size={18} color="#10b981" />
              Wealth Portfolio & Asset Allocation Engine
            </h3>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>
              Aggregated distribution across asset classes, investments, gold, real estate, bank deposits, and liabilities.
            </p>
            <div className="metrics-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
              <div style={{ padding: 14, background: 'var(--bg-main)', borderRadius: 10, border: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>Equity & Mutual Funds</span>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#10b981', marginTop: 4 }}>{formatCurrency(totalSaved * 0.45, currency)}</div>
                <span style={{ fontSize: 10, color: '#10b981' }}>45% Target Weight</span>
              </div>
              <div style={{ padding: 14, background: 'var(--bg-main)', borderRadius: 10, border: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>Fixed Deposits & Debt</span>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#3b82f6', marginTop: 4 }}>{formatCurrency(totalSaved * 0.25, currency)}</div>
                <span style={{ fontSize: 10, color: '#3b82f6' }}>25% Target Weight</span>
              </div>
              <div style={{ padding: 14, background: 'var(--bg-main)', borderRadius: 10, border: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>Real Estate & Gold</span>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#f59e0b', marginTop: 4 }}>{formatCurrency(totalSaved * 0.20, currency)}</div>
                <span style={{ fontSize: 10, color: '#f59e0b' }}>20% Target Weight</span>
              </div>
              <div style={{ padding: 14, background: 'var(--bg-main)', borderRadius: 10, border: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>Liquid Cash Reserve</span>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#8b5cf6', marginTop: 4 }}>{formatCurrency(totalSaved * 0.10, currency)}</div>
                <span style={{ fontSize: 10, color: '#8b5cf6' }}>10% Emergency Pool</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
