import React, { useState } from 'react';
import { Goal, GoalCategory, GoalType, GoalPriority } from '../types';
import { calculateRequiredMonthlyContribution, formatCurrency, FX_SYMBOLS } from '../utils/calculations';
import { 
  Sparkles, 
  Calculator, 
  Target, 
  Calendar, 
  TrendingUp, 
  ShieldAlert, 
  User, 
  Users, 
  FileText, 
  DollarSign, 
  X, 
  PieChart, 
  Sliders 
} from 'lucide-react';

interface GoalModalProps {
  categories: GoalCategory[];
  onSave: (goal: Partial<Goal>) => void;
  onClose: () => void;
  initialGoal?: Goal | null;
}

export const GoalModal: React.FC<GoalModalProps> = ({
  categories,
  onSave,
  onClose,
  initialGoal,
}) => {
  const [name, setName] = useState(initialGoal?.name || '');
  const [description, setDescription] = useState(initialGoal?.description || '');
  const [goalType, setGoalType] = useState<GoalType>(initialGoal?.goalType || 'Predefined');
  const [category, setCategory] = useState(initialGoal?.category || 'Family');
  const [customCategory, setCustomCategory] = useState(initialGoal?.customCategory || '');
  const [targetAmount, setTargetAmount] = useState<number>(initialGoal?.targetAmount || 0);
  const [currency, setCurrency] = useState(initialGoal?.currency || 'INR');
  const [targetDate, setTargetDate] = useState(initialGoal?.targetDate || '2030-11-15');
  const [startDate, setStartDate] = useState(initialGoal?.startDate || '2025-01-01');
  const [priority, setPriority] = useState<GoalPriority>(initialGoal?.priority || 'High');
  const [owner, setOwner] = useState(initialGoal?.owner || '');
  const [beneficiaries, setBeneficiaries] = useState<string>(initialGoal?.beneficiaries?.join(', ') || '');
  const [currentAmount, setCurrentAmount] = useState<number>(initialGoal?.currentAmount || 0);
  const [monthlyContribution, setMonthlyContribution] = useState<number>(initialGoal?.monthlyContribution || 0);
  const [oneTimeContribution, setOneTimeContribution] = useState<number>(initialGoal?.oneTimeContribution || 0);
  const [expectedInflation, setExpectedInflation] = useState<number>(initialGoal?.expectedInflation || 6);
  const [expectedReturn, setExpectedReturn] = useState<number>(initialGoal?.expectedReturn || 10);
  const [notes, setNotes] = useState(initialGoal?.notes || '');
  const [tags, setTags] = useState<string>(initialGoal?.tags?.join(', ') || '');

  // Live financial math calculation
  const calc = calculateRequiredMonthlyContribution(
    targetAmount || 0,
    currentAmount || 0,
    expectedInflation || 6,
    expectedReturn || 10,
    targetDate || '2030-01-01'
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const formattedBeneficiaries = beneficiaries.split(',').map((b) => b.trim()).filter(Boolean);
    const formattedTags = tags.split(',').map((t) => t.trim()).filter(Boolean);

    const goalData: Partial<Goal> = {
      name,
      description,
      goalType,
      category,
      customCategory: customCategory.trim() || undefined,
      targetAmount,
      currency,
      targetDate,
      startDate,
      priority,
      owner,
      beneficiaries: formattedBeneficiaries,
      currentAmount,
      monthlyContribution,
      oneTimeContribution,
      expectedInflation,
      expectedReturn,
      notes,
      tags: formattedTags,
      status: currentAmount >= targetAmount ? 'COMPLETED' : 'ON TRACK',
    };

    onSave(goalData);
  };

  return (
    <div className="modal-overlay animate-fade-in" onClick={onClose} style={{ zIndex: 1100 }}>
      <div 
        className="modal-card animate-scale-up" 
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: 820,
          width: '94%',
          maxHeight: '90vh',
          borderRadius: 20,
          border: '1px solid rgba(255, 255, 255, 0.12)',
          boxShadow: '0 30px 70px rgba(0, 0, 0, 0.75)',
          background: 'var(--bg-card)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Header Banner */}
        <div 
          style={{
            padding: '20px 24px',
            background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.18), rgba(168, 85, 247, 0.12))',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'relative'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div 
              style={{
                width: 44,
                height: 44,
                borderRadius: 14,
                background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                boxShadow: '0 6px 18px rgba(37, 99, 235, 0.4)'
              }}
            >
              <Target size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h2 style={{ fontSize: 20, fontWeight: 900, color: 'var(--text-main)', margin: 0 }}>
                  {initialGoal ? 'Edit Goal Configuration' : 'Create Custom Financial Goal'}
                </h2>
                <span 
                  style={{
                    fontSize: 10,
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: 0.6,
                    padding: '2px 8px',
                    borderRadius: 6,
                    background: 'rgba(56, 189, 248, 0.15)',
                    color: '#38bdf8',
                    border: '1px solid rgba(56, 189, 248, 0.3)'
                  }}
                >
                  LIFEOS ENGINE 🎯
                </span>
              </div>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '3px 0 0 0' }}>
                Configure inflation rates, target corpus, timeline & monthly SIP contribution requirements.
              </p>
            </div>
          </div>

          <button 
            className="icon-btn" 
            onClick={onClose}
            style={{
              width: 34,
              height: 34,
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.06)',
              border: 'none',
              color: 'var(--text-main)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
          <div className="modal-body" style={{ padding: 24, overflowY: 'auto', gap: 20 }}>

            {/* Section 1: Goal Identity */}
            <div style={{ background: 'var(--bg-card-elevated)', border: '1px solid var(--border-color)', borderRadius: 14, padding: 18 }}>
              <h4 style={{ fontSize: 13, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.5, color: '#38bdf8', margin: '0 0 14px 0', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Target size={15} /> 1. Goal Identity & Classification
              </h4>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
                <div style={{ gridColumn: 'span 2' }}>
                  <label className="form-label" style={{ fontWeight: 700, fontSize: 12 }}>Goal / Event Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder='e.g. "Marriage", "Parents Gold", "House Construction", "Agricultural Land"'
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    style={{ height: 40, fontSize: 13 }}
                  />
                </div>

                <div>
                  <label className="form-label" style={{ fontWeight: 700, fontSize: 12 }}>Goal Type</label>
                  <select
                    className="form-select"
                    value={goalType}
                    onChange={(e) => setGoalType(e.target.value as GoalType)}
                    style={{ height: 40 }}
                  >
                    <option value="Predefined">Predefined Template</option>
                    <option value="Custom">100% Custom Goal</option>
                  </select>
                </div>

                <div>
                  <label className="form-label" style={{ fontWeight: 700, fontSize: 12 }}>Category</label>
                  <select
                    className="form-select"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    style={{ height: 40 }}
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="form-label" style={{ fontWeight: 700, fontSize: 12 }}>Custom Category (Optional)</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder='e.g. "Family Responsibilities"'
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    style={{ height: 40 }}
                  />
                </div>

                <div>
                  <label className="form-label" style={{ fontWeight: 700, fontSize: 12 }}>Priority Level</label>
                  <select
                    className="form-select"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as GoalPriority)}
                    style={{ height: 40 }}
                  >
                    <option value="Critical">🔴 Critical (Must Achieve)</option>
                    <option value="High">🟠 High Priority</option>
                    <option value="Medium">🟡 Medium Priority</option>
                    <option value="Low">🟢 Low Priority</option>
                  </select>
                </div>

                <div>
                  <label className="form-label" style={{ fontWeight: 700, fontSize: 12 }}>Owner / Primary Lead</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Rajesh Kumar"
                    value={owner}
                    onChange={(e) => setOwner(e.target.value)}
                    style={{ height: 40 }}
                  />
                </div>

                <div>
                  <label className="form-label" style={{ fontWeight: 700, fontSize: 12 }}>Beneficiaries (comma separated)</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Self, Family, Parents"
                    value={beneficiaries}
                    onChange={(e) => setBeneficiaries(e.target.value)}
                    style={{ height: 40 }}
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Financial Targets & Inflation Rate */}
            <div style={{ background: 'var(--bg-card-elevated)', border: '1px solid var(--border-color)', borderRadius: 14, padding: 18 }}>
              <h4 style={{ fontSize: 13, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.5, color: '#10b981', margin: '0 0 14px 0', display: 'flex', alignItems: 'center', gap: 6 }}>
                <TrendingUp size={15} /> 2. Target Corpus & Inflation Parameters
              </h4>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
                <div>
                  <label className="form-label" style={{ fontWeight: 700, fontSize: 12 }}>Target Amount ({FX_SYMBOLS[currency]}) *</label>
                  <input
                    type="number"
                    className="form-control"
                    placeholder="e.g. 1500000"
                    value={targetAmount || ''}
                    onChange={(e) => setTargetAmount(Number(e.target.value))}
                    required
                    style={{ height: 40, fontSize: 14, fontWeight: 800 }}
                  />
                </div>

                <div>
                  <label className="form-label" style={{ fontWeight: 700, fontSize: 12 }}>Currency</label>
                  <select
                    className="form-select"
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    style={{ height: 40 }}
                  >
                    <option value="INR">INR (₹ Indian Rupee)</option>
                    <option value="USD">USD ($ US Dollar)</option>
                    <option value="EUR">EUR (€ Euro)</option>
                    <option value="GBP">GBP (£ British Pound)</option>
                  </select>
                </div>

                <div>
                  <label className="form-label" style={{ fontWeight: 700, fontSize: 12 }}>Target Completion Date *</label>
                  <input
                    type="date"
                    className="form-control"
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    required
                    style={{ height: 40 }}
                  />
                </div>

                <div>
                  <label className="form-label" style={{ fontWeight: 700, fontSize: 12 }}>Start Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    style={{ height: 40 }}
                  />
                </div>

                <div>
                  <label className="form-label" style={{ fontWeight: 700, fontSize: 12 }}>Expected Goal Inflation (% p.a.)</label>
                  <input
                    type="number"
                    step="0.1"
                    className="form-control"
                    value={expectedInflation}
                    onChange={(e) => setExpectedInflation(Number(e.target.value))}
                    style={{ height: 40 }}
                  />
                  <span style={{ fontSize: 10.5, color: 'var(--text-muted)', display: 'block', marginTop: 3 }}>
                    Health 9%, Education 8%, Marriage 7%, General 6%
                  </span>
                </div>

                <div>
                  <label className="form-label" style={{ fontWeight: 700, fontSize: 12 }}>Expected Return Rate (% p.a.)</label>
                  <input
                    type="number"
                    step="0.1"
                    className="form-control"
                    value={expectedReturn}
                    onChange={(e) => setExpectedReturn(Number(e.target.value))}
                    style={{ height: 40 }}
                  />
                  <span style={{ fontSize: 10.5, color: 'var(--text-muted)', display: 'block', marginTop: 3 }}>
                    Equity SIP ~11-12%, Debt Fund ~7%, Gold ~8%
                  </span>
                </div>
              </div>
            </div>

            {/* Section 3: Current Savings & Monthly Contributions */}
            <div style={{ background: 'var(--bg-card-elevated)', border: '1px solid var(--border-color)', borderRadius: 14, padding: 18 }}>
              <h4 style={{ fontSize: 13, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.5, color: '#a855f7', margin: '0 0 14px 0', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Sliders size={15} /> 3. Current Accumulated Savings & Monthly Allocations
              </h4>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
                <div>
                  <label className="form-label" style={{ fontWeight: 700, fontSize: 12 }}>Current Amount Saved ({FX_SYMBOLS[currency]})</label>
                  <input
                    type="number"
                    className="form-control"
                    placeholder="0"
                    value={currentAmount || ''}
                    onChange={(e) => setCurrentAmount(Number(e.target.value))}
                    style={{ height: 40 }}
                  />
                </div>

                <div>
                  <label className="form-label" style={{ fontWeight: 700, fontSize: 12 }}>Planned Monthly SIP ({FX_SYMBOLS[currency]})</label>
                  <input
                    type="number"
                    className="form-control"
                    placeholder="0"
                    value={monthlyContribution || ''}
                    onChange={(e) => setMonthlyContribution(Number(e.target.value))}
                    style={{ height: 40 }}
                  />
                </div>

                <div style={{ gridColumn: 'span 2' }}>
                  <label className="form-label" style={{ fontWeight: 700, fontSize: 12 }}>Description & Notes</label>
                  <textarea
                    className="form-control"
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Specific notes, venue requirements, or investment strategy notes for this goal..."
                    style={{ minHeight: 60 }}
                  />
                </div>
              </div>
            </div>

            {/* Section 4: Automated Financial Calculation Summary Banner */}
            <div 
              style={{
                background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.15), rgba(16, 185, 129, 0.1))',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                borderRadius: 14,
                padding: 16
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 800, fontSize: 13, color: '#38bdf8', marginBottom: 12 }}>
                <Calculator size={18} />
                <span>REAL-TIME LIFEOS GOAL COMPUTATION SUMMARY</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                <div style={{ background: 'var(--bg-card)', padding: 12, borderRadius: 10, border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: 10.5, color: 'var(--text-muted)', fontWeight: 600 }}>Inflation-Adjusted Target</div>
                  <div style={{ fontWeight: 900, fontSize: 16, color: 'var(--text-main)', marginTop: 2 }}>
                    {formatCurrency(calc.inflationAdjustedTarget, currency)}
                  </div>
                </div>

                <div style={{ background: 'var(--bg-card)', padding: 12, borderRadius: 10, border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: 10.5, color: 'var(--text-muted)', fontWeight: 600 }}>Required Monthly SIP</div>
                  <div style={{ fontWeight: 900, fontSize: 16, color: '#38bdf8', marginTop: 2 }}>
                    {formatCurrency(calc.requiredMonthly, currency)}/mo
                  </div>
                </div>

                <div style={{ background: 'var(--bg-card)', padding: 12, borderRadius: 10, border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: 10.5, color: 'var(--text-muted)', fontWeight: 600 }}>Probability & Feasibility</div>
                  <div style={{ fontWeight: 900, fontSize: 16, color: '#10b981', marginTop: 2 }}>
                    {calc.probabilityScore}% ON TRACK
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Modal Footer */}
          <div 
            style={{
              padding: '16px 24px',
              borderTop: '1px solid var(--border-color)',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 12,
              background: 'var(--bg-card-elevated)'
            }}
          >
            <button type="button" className="btn-secondary" onClick={onClose} style={{ minWidth: 100, height: 38 }}>
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn-primary" 
              style={{
                minWidth: 180,
                height: 38,
                background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
                border: 'none',
                boxShadow: '0 4px 14px rgba(37, 99, 235, 0.4)'
              }}
            >
              <Sparkles size={16} />
              <span>{initialGoal ? 'Save Goal Changes' : 'Create Custom Goal'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
