import React, { useState } from 'react';
import { Goal, SubGoal, BudgetItem, FundingSource, ContributionLog } from '../types';
import { calculateRequiredMonthlyContribution, formatCurrency, FX_SYMBOLS } from '../utils/calculations';
import { 
  X, 
  Plus, 
  Trash2, 
  Edit3, 
  CheckCircle, 
  Layers, 
  PieChart, 
  Coins, 
  History, 
  Sparkles,
  Calculator,
  TrendingUp,
  AlertCircle,
  FileText,
  Paperclip
} from 'lucide-react';
import confetti from 'canvas-confetti';

import { useNotification } from '../context/NotificationContext';

interface GoalDetailModalProps {
  goal: Goal;
  onUpdateGoal: (updated: Goal) => void;
  onClose: () => void;
  currency: string;
  onDeleteGoal?: (goalId: string) => void;
}

export const GoalDetailModal: React.FC<GoalDetailModalProps> = ({
  goal,
  onUpdateGoal,
  onClose,
  currency,
  onDeleteGoal,
}) => {
  const { showConfirm, showToast } = useNotification();
  const [activeTab, setActiveTab] = useState<'overview' | 'subgoals' | 'budget' | 'funding' | 'contributions' | 'documents'>('overview');
  const [newDocName, setNewDocName] = useState('');

  // Sub-goal state
  const [newSubName, setNewSubName] = useState('');
  const [newSubBudget, setNewSubBudget] = useState(0);

  // Budget item state
  const [newBudgetItemName, setNewBudgetItemName] = useState('');
  const [newBudgetItemCategory, setNewBudgetItemCategory] = useState('General');
  const [newBudgetItemAmount, setNewBudgetItemAmount] = useState(0);

  // Contribution state
  const [newContribAmount, setNewContribAmount] = useState(0);
  const [newContribSource, setNewContribSource] = useState('Salary Savings');
  const [newContribNotes, setNewContribNotes] = useState('');

  const calc = calculateRequiredMonthlyContribution(
    goal.targetAmount,
    goal.currentAmount,
    goal.expectedInflation,
    goal.expectedReturn,
    goal.targetDate
  );

  // Parent goal aggregation of sub-goals
  const subGoalTotalBudget = goal.subGoals.reduce((acc, sg) => acc + sg.budget, 0);
  const subGoalTotalActual = goal.subGoals.reduce((acc, sg) => acc + sg.actualSpending, 0);

  // Parent goal aggregation of budget items
  const budgetItemsTotal = goal.budgetItems.reduce((acc, bi) => acc + bi.amount, 0);
  const budgetItemsActual = goal.budgetItems.reduce((acc, bi) => acc + bi.actualSpent, 0);

  // Add Sub-Goal
  const handleAddSubGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubName.trim()) return;

    const newSub: SubGoal = {
      id: `sg-${Date.now()}`,
      name: newSubName.trim(),
      budget: newSubBudget,
      actualSpending: 0,
      targetDate: goal.targetDate,
      status: 'ON TRACK',
      contribution: 0,
    };

    const updatedSubGoals = [...goal.subGoals, newSub];
    onUpdateGoal({
      ...goal,
      subGoals: updatedSubGoals,
    });

    setNewSubName('');
    setNewSubBudget(0);
  };

  // Add Budget Item
  const handleAddBudgetItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBudgetItemName.trim()) return;

    const newItem: BudgetItem = {
      id: `bi-${Date.now()}`,
      name: newBudgetItemName.trim(),
      category: newBudgetItemCategory,
      amount: newBudgetItemAmount,
      actualSpent: 0,
      currency: goal.currency,
    };

    const updatedBudget = [...goal.budgetItems, newItem];
    onUpdateGoal({
      ...goal,
      budgetItems: updatedBudget,
    });

    setNewBudgetItemName('');
    setNewBudgetItemAmount(0);
  };

  // Delete Budget Item
  const handleDeleteBudgetItem = (id: string) => {
    const updated = goal.budgetItems.filter(b => b.id !== id);
    onUpdateGoal({ ...goal, budgetItems: updated });
  };

  // Log Contribution
  const handleLogContribution = (e: React.FormEvent) => {
    e.preventDefault();
    if (newContribAmount <= 0) return;

    const newLog: ContributionLog = {
      id: `c-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      amount: newContribAmount,
      source: newContribSource,
      notes: newContribNotes,
    };

    const updatedContribs = [...(goal.contributions || []), newLog];
    const updatedCurrentAmount = goal.currentAmount + newContribAmount;
    const isNowCompleted = updatedCurrentAmount >= goal.targetAmount;

    if (isNowCompleted) {
      try {
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      } catch (err) {
        // fallback ignore
      }
    }

    onUpdateGoal({
      ...goal,
      currentAmount: updatedCurrentAmount,
      contributions: updatedContribs,
      status: isNowCompleted ? 'COMPLETED' : goal.status,
    });

    setNewContribAmount(0);
    setNewContribNotes('');
  };

  // Delete Contribution Log
  const handleDeleteContribution = (id: string, amount: number) => {
    showConfirm({
      title: 'Delete Contribution Record',
      message: 'Are you sure you want to delete this contribution record?',
      isDanger: true,
      confirmText: 'Delete Record',
      onConfirm: () => {
        const updatedContribs = (goal.contributions || []).filter(c => c.id !== id);
        const updatedCurrentAmount = Math.max(0, goal.currentAmount - amount);
        onUpdateGoal({
          ...goal,
          currentAmount: updatedCurrentAmount,
          contributions: updatedContribs,
        });
        showToast('Contribution record deleted', 'info');
      }
    });
  };

  // Add Document Attachment
  const handleAddDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocName.trim()) return;
    const docName = newDocName.trim();
    const updatedAttachments = [...(goal.attachments || []), docName];
    onUpdateGoal({ ...goal, attachments: updatedAttachments });
    setNewDocName('');
  };

  // Delete Document Attachment
  const handleDeleteDocument = (docName: string) => {
    showConfirm({
      title: 'Remove Attachment',
      message: `Are you sure you want to remove "${docName}"?`,
      isDanger: true,
      confirmText: 'Remove',
      onConfirm: () => {
        const updated = (goal.attachments || []).filter(d => d !== docName);
        onUpdateGoal({ ...goal, attachments: updated });
        showToast(`Document "${docName}" removed`, 'info');
      }
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" style={{ maxWidth: 960 }} onClick={(e) => e.stopPropagation()}>
        <div className="native-sheet-pill" />
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div className="goal-category-icon" style={{ width: 44, height: 44 }}>
              🎯
            </div>
            <div>
              <h2 className="goal-detail-modal-title">{goal.name}</h2>
              <p className="goal-detail-modal-subtitle">
                {goal.customCategory || goal.category} • Target: {formatCurrency(goal.targetAmount, goal.currency)} ({new Date(goal.targetDate).getFullYear()})
              </p>
            </div>
          </div>
          <button className="icon-btn" onClick={onClose}><X size={18} /></button>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="modal-tabs-bar" style={{ display: 'flex', gap: 4, borderBottom: '1px solid var(--border-color)', padding: '0 12px', backgroundColor: 'var(--bg-main)', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <button className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`} style={{ width: 'auto', flexShrink: 0, whiteSpace: 'nowrap', padding: '8px 12px', borderRadius: '8px 8px 0 0' }} onClick={() => setActiveTab('overview')}>
            <TrendingUp size={15} /> Overview
          </button>
          <button className={`nav-item ${activeTab === 'subgoals' ? 'active' : ''}`} style={{ width: 'auto', flexShrink: 0, whiteSpace: 'nowrap', padding: '8px 12px', borderRadius: '8px 8px 0 0' }} onClick={() => setActiveTab('subgoals')}>
            <Layers size={15} /> Sub-Goals ({goal.subGoals.length})
          </button>
          <button className={`nav-item ${activeTab === 'budget' ? 'active' : ''}`} style={{ width: 'auto', flexShrink: 0, whiteSpace: 'nowrap', padding: '8px 12px', borderRadius: '8px 8px 0 0' }} onClick={() => setActiveTab('budget')}>
            <PieChart size={15} /> Itemized Budget
          </button>
          <button className={`nav-item ${activeTab === 'funding' ? 'active' : ''}`} style={{ width: 'auto', flexShrink: 0, whiteSpace: 'nowrap', padding: '8px 12px', borderRadius: '8px 8px 0 0' }} onClick={() => setActiveTab('funding')}>
            <Coins size={15} /> Funding Sources
          </button>
          <button className={`nav-item ${activeTab === 'contributions' ? 'active' : ''}`} style={{ width: 'auto', flexShrink: 0, whiteSpace: 'nowrap', padding: '8px 12px', borderRadius: '8px 8px 0 0' }} onClick={() => setActiveTab('contributions')}>
            <History size={15} /> Contributions Log
          </button>
          <button className={`nav-item ${activeTab === 'documents' ? 'active' : ''}`} style={{ width: 'auto', flexShrink: 0, whiteSpace: 'nowrap', padding: '8px 12px', borderRadius: '8px 8px 0 0' }} onClick={() => setActiveTab('documents')}>
            <FileText size={15} /> Document Vault ({(goal.attachments || []).length})
          </button>
        </div>

        <div className="modal-body">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <div className="metrics-grid">
                <div className="metric-card">
                  <span className="metric-title">Target Amount</span>
                  <span className="metric-value">{formatCurrency(goal.targetAmount, goal.currency)}</span>
                  <span className="metric-trend">Original Nominal Target</span>
                </div>

                <div className="metric-card">
                  <span className="metric-title">Inflation-Adjusted Target</span>
                  <span className="metric-value" style={{ color: 'var(--accent-primary)' }}>
                    {formatCurrency(calc.inflationAdjustedTarget, goal.currency)}
                  </span>
                  <span className="metric-trend trend-up">
                    Assuming {goal.expectedInflation}% p.a. Inflation
                  </span>
                </div>

                <div className="metric-card">
                  <span className="metric-title">Current Amount Saved</span>
                  <span className="metric-value" style={{ color: '#10b981' }}>
                    {formatCurrency(goal.currentAmount, goal.currency)}
                  </span>
                  <span className="metric-trend trend-up">
                    {Math.round((goal.currentAmount / goal.targetAmount) * 100)}% Completed
                  </span>
                </div>

                <div className="metric-card">
                  <span className="metric-title">Required Monthly Contribution</span>
                  <span className="metric-value" style={{ color: 'var(--accent-primary)' }}>
                    {formatCurrency(calc.requiredMonthly, goal.currency)}/mo
                  </span>
                  <span className="metric-trend">At {goal.expectedReturn}% ROI</span>
                </div>
              </div>

              <div className="metric-card">
                <h4 className="card-section-title">Goal Breakdown & Notes</h4>
                <p className="card-section-desc">{goal.description || 'No description provided.'}</p>
                {goal.notes && (
                  <div className="card-notes-box">
                    <strong>Notes:</strong> {goal.notes}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: SUB-GOALS ENGINE */}
          {activeTab === 'subgoals' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <h3 className="section-title">Sub-Goal Tree Structure</h3>
                  <p className="section-subtitle">
                    Nested sub-goals automatically sum into parent target ({formatCurrency(subGoalTotalBudget, goal.currency)} budgeted)
                  </p>
                </div>
              </div>

              <form onSubmit={handleAddSubGoal} style={{ display: 'flex', gap: 12 }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder='e.g. "Venue & Catering", "Jewellery & Gold", "Photography"'
                  value={newSubName}
                  onChange={(e) => setNewSubName(e.target.value)}
                  style={{ flex: 1 }}
                  required
                />
                <input
                  type="number"
                  className="form-input"
                  placeholder="Budget"
                  value={newSubBudget}
                  onChange={(e) => setNewSubBudget(Number(e.target.value))}
                  style={{ flex: '1 1 120px', minWidth: 110 }}
                  required
                />
                <button type="submit" className="btn-primary">
                  <Plus size={16} /> Add Sub-Goal
                </button>
              </form>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {goal.subGoals.map((sg) => (
                  <div key={sg.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 14, border: '1px solid var(--border-color)', borderRadius: 10, background: 'var(--bg-main)' }}>
                    <div>
                      <div className="subgoal-title">{sg.name}</div>
                      <div className="subgoal-date">
                        Target Date: {sg.targetDate}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 800 }}>{formatCurrency(sg.budget, goal.currency)}</div>
                        <div className="subgoal-actual">Actual: {formatCurrency(sg.actualSpending, goal.currency)}</div>
                      </div>
                      <span className={`status-badge ${sg.status.replace(' ', '.')}`}>{sg.status}</span>
                      <button
                        className="icon-btn"
                        style={{ width: 30, height: 30, color: '#ef4444' }}
                        title="Delete Sub-Goal"
                        onClick={() => {
                          showConfirm({
                            title: 'Delete Sub-Goal',
                            message: `Are you sure you want to delete sub-goal "${sg.name}"?`,
                            isDanger: true,
                            confirmText: 'Delete',
                            onConfirm: () => {
                              const updated = goal.subGoals.filter(s => s.id !== sg.id);
                              onUpdateGoal({ ...goal, subGoals: updated });
                              showToast(`Sub-goal "${sg.name}" deleted`, 'info');
                            }
                          });
                        }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: ITEMIZED BUDGET */}
          {activeTab === 'budget' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <h3 className="section-title">Detailed Line-Item Event Budget</h3>
                  <p className="section-subtitle">
                    Total Budgeted Items: <strong>{formatCurrency(budgetItemsTotal, goal.currency)}</strong>
                  </p>
                </div>
              </div>

              <form onSubmit={handleAddBudgetItem} style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Item Name (e.g. Catering, Venue)"
                  value={newBudgetItemName}
                  onChange={(e) => setNewBudgetItemName(e.target.value)}
                  style={{ flex: 2, minWidth: 200 }}
                  required
                />
                <input
                  type="text"
                  className="form-input"
                  placeholder="Category"
                  value={newBudgetItemCategory}
                  onChange={(e) => setNewBudgetItemCategory(e.target.value)}
                  style={{ flex: 1, minWidth: 140 }}
                />
                <input
                  type="number"
                  className="form-input"
                  placeholder="Amount"
                  value={newBudgetItemAmount}
                  onChange={(e) => setNewBudgetItemAmount(Number(e.target.value))}
                  style={{ flex: '1 1 120px', minWidth: 110 }}
                  required
                />
                <button type="submit" className="btn-primary">
                  <Plus size={16} /> Add Item
                </button>
              </form>

              <table className="budget-table">
                <thead>
                  <tr>
                    <th>Item Name</th>
                    <th>Category</th>
                    <th>Budgeted Amount</th>
                    <th>Actual Spent</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {goal.budgetItems.map((item) => (
                    <tr key={item.id}>
                      <td style={{ fontWeight: 600 }}>{item.name}</td>
                      <td>{item.category}</td>
                      <td style={{ fontWeight: 700 }}>{formatCurrency(item.amount, goal.currency)}</td>
                      <td>{formatCurrency(item.actualSpent, goal.currency)}</td>
                      <td>
                        <button className="icon-btn" style={{ width: 30, height: 30, color: '#ef4444' }} onClick={() => handleDeleteBudgetItem(item.id)}>
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  <tr style={{ backgroundColor: 'var(--bg-main)', fontWeight: 800 }}>
                    <td colSpan={2}>TOTAL BUDGET</td>
                    <td className="total-budget-val">
                      {formatCurrency(budgetItemsTotal, goal.currency)}
                    </td>
                    <td>{formatCurrency(budgetItemsActual, goal.currency)}</td>
                    <td></td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 4: FUNDING SOURCES */}
          {activeTab === 'funding' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <h3 className="section-title">Multi-Source Goal Funding Allocation</h3>
              <p className="section-subtitle">
                Track how this goal is funded across Salary, FD maturity, Investment redemption, Bonus, Gifts, or Loans.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {goal.fundingSources.map((fs) => {
                  const fsPct = Math.min(100, Math.round((fs.actualAmount / (fs.plannedAmount || 1)) * 100));
                  return (
                    <div key={fs.id} style={{ padding: 16, border: '1px solid var(--border-color)', borderRadius: 12, background: 'var(--bg-main)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                        <strong className="funding-title">{fs.name}</strong>
                        <span>
                          <strong>{formatCurrency(fs.actualAmount, goal.currency)}</strong> of {formatCurrency(fs.plannedAmount, goal.currency)}
                        </span>
                      </div>
                      <div className="progress-bar-container">
                        <div className="progress-fill ON.TRACK" style={{ width: `${fsPct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 5: CONTRIBUTIONS LOG */}
          {activeTab === 'contributions' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <h3 className="section-title">Log Goal Contribution</h3>

              <form onSubmit={handleLogContribution} style={{ display: 'flex', gap: 12, flexWrap: 'wrap', backgroundColor: 'var(--bg-main)', padding: 16, borderRadius: 12, border: '1px solid var(--border-color)' }}>
                <div style={{ flex: 1, minWidth: 150 }}>
                  <label className="form-label-compact">Amount ({FX_SYMBOLS[goal.currency]})</label>
                  <input
                    type="number"
                    className="form-input"
                    value={newContribAmount}
                    onChange={(e) => setNewContribAmount(Number(e.target.value))}
                    required
                  />
                </div>
                <div style={{ flex: 1, minWidth: 150 }}>
                  <label className="form-label-compact">Funding Source</label>
                  <select
                    className="form-select"
                    value={newContribSource}
                    onChange={(e) => setNewContribSource(e.target.value)}
                  >
                    <option value="Salary Savings">Salary Savings</option>
                    <option value="FD Maturity">FD Maturity</option>
                    <option value="Bonus">Annual Bonus</option>
                    <option value="Mutual Fund Redemption">Mutual Fund Redemption</option>
                    <option value="Side Income">Side Income</option>
                  </select>
                </div>
                <div style={{ flex: 2, minWidth: 200 }}>
                  <label className="form-label-compact">Notes</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Monthly SIP, bonus transfer..."
                    value={newContribNotes}
                    onChange={(e) => setNewContribNotes(e.target.value)}
                  />
                </div>
                <button type="submit" className="btn-primary" style={{ alignSelf: 'flex-end' }}>
                  <Plus size={16} /> Log Contribution
                </button>
              </form>

              <h4 className="card-section-title" style={{ marginTop: 10 }}>Contribution History</h4>
              <table className="budget-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Source</th>
                    <th>Amount</th>
                    <th>Notes</th>
                    <th style={{ width: 40 }}></th>
                  </tr>
                </thead>
                <tbody>
                  {goal.contributions.map((c) => (
                    <tr key={c.id}>
                      <td>{c.date}</td>
                      <td>{c.source}</td>
                      <td style={{ color: '#10b981', fontWeight: 700 }}>+{formatCurrency(c.amount, goal.currency)}</td>
                      <td>{c.notes || '-'}</td>
                      <td>
                        <button
                          className="btn-icon-danger"
                          title="Delete Contribution Log"
                          onClick={() => handleDeleteContribution(c.id, c.amount)}
                          style={{
                            background: 'rgba(239, 68, 68, 0.12)',
                            border: '1px solid rgba(239, 68, 68, 0.25)',
                            color: '#ef4444',
                            padding: '3px 6px',
                            borderRadius: '4px',
                            cursor: 'pointer',
                          }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 6: DOCUMENT VAULT */}
          {activeTab === 'documents' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 className="section-title">Goal Document Vault 📁</h3>
                  <p className="section-subtitle">Store policy documents, receipts, deeds, tax filings, and insurance certificates for this goal.</p>
                </div>
              </div>

              <form onSubmit={handleAddDocument} style={{ display: 'flex', gap: 12 }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder='e.g. "Property Deed 2026.pdf", "LIC Policy #90812.pdf", "FD Receipt"'
                  value={newDocName}
                  onChange={(e) => setNewDocName(e.target.value)}
                  style={{ flex: 1 }}
                  required
                />
                <button type="submit" className="btn-primary">
                  <Paperclip size={16} /> Attach Document
                </button>
              </form>

              {(!goal.attachments || goal.attachments.length === 0) ? (
                <div className="empty-state-card" style={{ padding: 24 }}>
                  <div className="empty-state-icon">📄</div>
                  <h4 className="empty-state-title" style={{ fontSize: 14 }}>No Documents Attached</h4>
                  <p className="empty-state-text">Attach insurance contracts, real estate registry documents, or tax proofs to keep them organized.</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
                  {goal.attachments.map((doc, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: 12,
                        borderRadius: 10,
                        border: '1px solid var(--border-color)',
                        background: 'var(--bg-main)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                        <FileText size={20} color="#3b82f6" />
                        <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-main)' }}>{doc}</div>
                          <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Verified Vault Attachment</div>
                        </div>
                      </div>
                      <button
                        className="btn-icon-danger"
                        title="Remove Document"
                        onClick={() => handleDeleteDocument(doc)}
                        style={{
                          background: 'rgba(239, 68, 68, 0.12)',
                          border: '1px solid rgba(239, 68, 68, 0.25)',
                          color: '#ef4444',
                          padding: '4px 6px',
                          borderRadius: 4,
                          cursor: 'pointer',
                        }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="modal-footer">
          {onDeleteGoal && (
            <button
              className="btn-secondary"
              style={{ color: '#ef4444', borderColor: '#ef4444' }}
              onClick={() => {
                showConfirm({
                  title: 'Delete Goal',
                  message: `Are you sure you want to permanently delete "${goal.name}"? This action cannot be undone.`,
                  isDanger: true,
                  confirmText: 'Permanently Delete',
                  onConfirm: () => {
                    if (onDeleteGoal) onDeleteGoal(goal.id);
                    showToast(`Goal "${goal.name}" deleted`, 'info');
                    onClose();
                  }
                });
              }}
            >
              <Trash2 size={15} /> Delete Goal
            </button>
          )}
          <button className="btn-secondary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};
