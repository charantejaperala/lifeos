import React, { useState, useMemo } from 'react';
import { Goal, Scenario } from '../types';
import { 
  detectCashFlowConflicts, 
  formatCurrency, 
  convertCurrency, 
  calculateRequiredMonthlyContribution 
} from '../utils/calculations';
import { 
  AlertTriangle, 
  Sparkles, 
  CheckCircle2, 
  TrendingUp, 
  Sliders, 
  Calendar, 
  ArrowRight,
  ShieldCheck,
  Scale,
  AlertOctagon
} from 'lucide-react';

interface ConflictEngineViewProps {
  goals: Goal[];
  currency: string;
  monthlySurplusINR: number;
  onUpdateGoal: (updated: Goal) => void;
}

export const ConflictEngineView: React.FC<ConflictEngineViewProps> = ({
  goals,
  currency,
  monthlySurplusINR,
  onUpdateGoal,
}) => {
  const [selectedGoalId, setSelectedGoalId] = useState<string>(goals[0]?.id || '');
  const conflict = detectCashFlowConflicts(goals, monthlySurplusINR);

  const selectedGoalForScenario = useMemo(() => {
    return goals.find(g => g.id === selectedGoalId) || goals[0] || null;
  }, [selectedGoalId, goals]);

  // Generate dynamic scenarios based on the selected goal
  const scenarios: Scenario[] = useMemo(() => {
    if (!selectedGoalForScenario) return [];
    const target = selectedGoalForScenario.targetAmount;
    return [
      {
        id: 'sc-1',
        name: `Scenario A: Conservative (${Math.round(target * 0.7 / 100000)}L)`,
        targetAmount: Math.round(target * 0.7),
        targetDate: selectedGoalForScenario.targetDate,
        monthlySavingsNeeded: Math.round(target * 0.7 / 60),
        netWorthImpact: Math.round(target * 0.3),
        cashFlowImpact: -Math.round(target * 0.7 / 60),
      },
      {
        id: 'sc-2',
        name: `Scenario B: Standard (${Math.round(target / 100000)}L)`,
        targetAmount: target,
        targetDate: selectedGoalForScenario.targetDate,
        monthlySavingsNeeded: Math.round(target / 60),
        netWorthImpact: 0,
        cashFlowImpact: -Math.round(target / 60),
      },
      {
        id: 'sc-3',
        name: `Scenario C: Premium (${Math.round(target * 1.5 / 100000)}L)`,
        targetAmount: Math.round(target * 1.5),
        targetDate: selectedGoalForScenario.targetDate,
        monthlySavingsNeeded: Math.round(target * 1.5 / 60),
        netWorthImpact: -Math.round(target * 0.5),
        cashFlowImpact: -Math.round(target * 1.5 / 60),
      },
    ];
  }, [selectedGoalForScenario]);

  // Dynamic optimization suggestions based on actual goals
  const sortedByContribution = useMemo(() => {
    return [...goals]
      .map(g => ({
        goal: g,
        requiredMonthly: calculateRequiredMonthlyContribution(g.targetAmount, g.currentAmount, g.expectedInflation, g.expectedReturn, g.targetDate).requiredMonthly
      }))
      .sort((a, b) => b.requiredMonthly - a.requiredMonthly);
  }, [goals]);

  const topContributor = sortedByContribution[0]?.goal;
  const secondContributor = sortedByContribution[1]?.goal;

  if (goals.length === 0) {
    return (
      <div className="content-area">
        <div className="page-header">
          <div className="page-title-group">
            <h1>Cash Flow Conflict & Scenario Engine ⚡</h1>
            <p>LIFEOS automatically detects when multiple goals compete for your monthly cash flow surplus.</p>
          </div>
        </div>
        <div className="empty-state-card">
          <div className="empty-state-icon">⚡</div>
          <div style={{ maxWidth: 420 }}>
            <h3 className="empty-state-title">No Goals to Analyze</h3>
            <p className="empty-state-text">
              Add at least two financial goals to enable cash flow conflict detection and scenario planning.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="content-area">
      <div className="page-header">
        <div className="page-title-group">
          <h1>Cash Flow Conflict & Scenario Engine ⚡</h1>
          <p>LIFEOS automatically detects when multiple goals compete for your monthly cash flow surplus.</p>
        </div>
      </div>

      {/* Conflict Status Banner */}
      <div 
        className={`conflict-banner ${conflict.hasConflict ? 'has-conflict' : 'no-conflict'}`}
      >
        <div className="conflict-info">
          <div className="conflict-icon">
            {conflict.hasConflict ? <AlertTriangle size={24} /> : <ShieldCheck size={24} />}
          </div>
          <div className="conflict-text">
            <h4>
              {conflict.hasConflict ? 'Cash Flow Conflict Warning' : 'Healthy Cash Flow Alignment'}
            </h4>
            <p>
              {conflict.hasConflict ? (
                <>
                  Your current planned contributions (<strong>{formatCurrency(convertCurrency(conflict.totalRequiredMonthlyINR, 'INR', currency), currency)}/mo</strong>) exceed your available surplus (<strong>{formatCurrency(convertCurrency(monthlySurplusINR, 'INR', currency), currency)}/mo</strong>) by <strong>{formatCurrency(convertCurrency(conflict.deficitINR, 'INR', currency), currency)}/mo</strong>.
                </>
              ) : (
                <>
                  Your active goal requirements fit safely within your monthly available surplus of {formatCurrency(convertCurrency(monthlySurplusINR, 'INR', currency), currency)}/mo.
                </>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* AI Conflict Optimization Alternatives (dynamic) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <h3 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Sparkles size={20} color="var(--accent-primary)" />
          <span>AI Optimization Alternatives & Recommendations</span>
        </h3>

        <div className="conflict-options-grid">
          {topContributor && (
            <div className="metric-card" style={{ borderLeft: '4px solid #3b82f6' }}>
              <span className="option-badge" style={{ color: '#3b82f6' }}>Option A (Recommended)</span>
              <h4 className="option-title">Postpone "{topContributor.name}" by 12 Months</h4>
              <p className="option-desc">
                Delaying this goal to {new Date(topContributor.targetDate).getFullYear() + 1} frees up monthly cash flow and reduces the contribution demand significantly.
              </p>
              <button className="btn-primary" style={{ marginTop: 12 }} onClick={() => {
                const currentYear = new Date(topContributor.targetDate).getFullYear();
                onUpdateGoal({ ...topContributor, targetDate: `${currentYear + 1}-12-31` });
              }}>
                Apply Option A
              </button>
            </div>
          )}

          {secondContributor && (
            <div className="metric-card" style={{ borderLeft: '4px solid #10b981' }}>
              <span className="option-badge" style={{ color: '#10b981' }}>Option B</span>
              <h4 className="option-title">Reduce "{secondContributor.name}" Budget by 15%</h4>
              <p className="option-desc">
                Adjust target from {formatCurrency(convertCurrency(secondContributor.targetAmount, secondContributor.currency, currency), currency)} to {formatCurrency(convertCurrency(Math.round(secondContributor.targetAmount * 0.85), secondContributor.currency, currency), currency)} to reduce monthly contribution requirement.
              </p>
              <button className="btn-secondary" style={{ marginTop: 12 }} onClick={() => {
                onUpdateGoal({ ...secondContributor, targetAmount: Math.round(secondContributor.targetAmount * 0.85) });
              }}>
                Apply Option B
              </button>
            </div>
          )}

          <div className="metric-card" style={{ borderLeft: '4px solid #7c3aed' }}>
            <span className="option-badge" style={{ color: '#7c3aed' }}>Option C</span>
            <h4 className="option-title">Extend Goal Timelines & Step-up SIPs</h4>
            <p className="option-desc">
              Assume 10% annual salary hike and step-up monthly contributions gradually over the next 24 months.
            </p>
            <button className="btn-secondary" style={{ marginTop: 12 }}>
              Explore Step-Up Strategy
            </button>
          </div>
        </div>
      </div>

      {/* Goal Scenario Planning Tool */}
      {selectedGoalForScenario && (
        <div className="metric-card calc-card" style={{ marginTop: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h3 className="section-title" style={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Scale size={18} color="var(--accent-primary)" />
                <span>Goal Scenario Planning & Comparison</span>
              </h3>
              <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                Duplicate any goal into multiple budget scenarios to analyze cash flow and net worth impact.
              </p>
            </div>

            <select
              className="form-select"
              value={selectedGoalId}
              onChange={(e) => setSelectedGoalId(e.target.value)}
              style={{ minWidth: 180, flex: 1, maxWidth: 280 }}
            >
              {goals.map(g => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
          </div>

          <div className="scenarios-grid">
            {scenarios.map(sc => (
              <div key={sc.id} className="scenario-card-item">
                <h4 className="scenario-card-title">{sc.name}</h4>
                <div className="scenario-card-details">
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Target Amount:</span>
                    <strong>{formatCurrency(sc.targetAmount, selectedGoalForScenario.currency)}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Req. Monthly Savings:</span>
                    <strong style={{ color: 'var(--accent-primary)' }}>{formatCurrency(sc.monthlySavingsNeeded, selectedGoalForScenario.currency)}/mo</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Net Worth Impact:</span>
                    <strong style={{ color: sc.netWorthImpact >= 0 ? '#10b981' : '#ef4444' }}>
                      {sc.netWorthImpact >= 0 ? '+' : ''}{formatCurrency(sc.netWorthImpact, selectedGoalForScenario.currency)}
                    </strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
