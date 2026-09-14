import React, { useState } from 'react';
import { Goal, GoalCategory } from '../types';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { 
  formatCurrency, 
  convertCurrency, 
  calculateRequiredMonthlyContribution 
} from '../utils/calculations';
import { 
  Plus, 
  Search, 
  Filter, 
  Grid, 
  List, 
  Layers, 
  FolderPlus, 
  MoreVertical, 
  Sparkles,
  ChevronRight,
  TrendingUp,
  AlertTriangle,
  Trash2
} from 'lucide-react';

interface GoalsViewProps {
  goals: Goal[];
  categories: GoalCategory[];
  currency: string;
  onOpenCreateModal: () => void;
  onSelectGoal: (goal: Goal) => void;
  onAddCustomCategory: (name: string, description: string) => void;
  onDeleteGoal?: (goalId: string) => void;
}

export const GoalsView: React.FC<GoalsViewProps> = ({
  goals,
  categories,
  currency,
  onOpenCreateModal,
  onSelectGoal,
  onAddCustomCategory,
  onDeleteGoal,
}) => {
  const { requireAuth } = useAuth();
  const { showConfirm, showToast } = useNotification();
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'category'>('grid');
  const [showCategoryModal, setShowCategoryModal] = useState<boolean>(false);
  const [newCatName, setNewCatName] = useState<string>('');
  const [newCatDesc, setNewCatDesc] = useState<string>('');

  // Filter goals
  const filteredGoals = goals.filter((g) => {
    const matchesCat = selectedCategory === 'ALL' || g.category === selectedCategory || g.customCategory === selectedCategory;
    const matchesStatus = selectedStatus === 'ALL' || g.status === selectedStatus;
    const matchesSearch = g.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          g.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesStatus && matchesSearch;
  });

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    onAddCustomCategory(newCatName.trim(), newCatDesc.trim());
    setNewCatName('');
    setNewCatDesc('');
    setShowCategoryModal(false);
  };

  return (
    <div className="content-area">
      <div className="page-header">
        <div className="page-title-group">
          <h1>Goals & Aspirations 🎯</h1>
          <p>Create and manage any predefined or 100% custom financial goal or life event.</p>
        </div>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <button className="btn-secondary" onClick={() => requireAuth(() => setShowCategoryModal(true), 'add custom category')}>
            <FolderPlus size={16} />
            <span>Category</span>
          </button>
          <button className="btn-primary" onClick={onOpenCreateModal}>
            <Plus size={18} />
            <span>Create Custom Goal</span>
          </button>
        </div>
      </div>

      {/* Filter & View Mode Bar */}
      <div className="metric-card goals-filter-card">
        <div className="goals-filter-bar">
          <div className="search-box goals-search-box">
            <Search size={14} color="var(--text-muted)" />
            <input
              type="text"
              className="search-input"
              placeholder="Search goals, tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="goals-filter-controls">
            <select
              className="form-select goals-filter-select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="ALL">All Categories ({categories.length})</option>
              {categories.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.isCustom ? `⭐ ${c.name}` : c.name}
                </option>
              ))}
            </select>

            <select
              className="form-select goals-filter-select"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="ALL">All Statuses</option>
              <option value="ON TRACK">ON TRACK</option>
              <option value="BEHIND">BEHIND</option>
              <option value="AT RISK">AT RISK</option>
              <option value="COMPLETED">COMPLETED</option>
              <option value="NOT STARTED">NOT STARTED</option>
            </select>

            <div className="nav-tab-bar goals-view-toggle">
              <button
                className={`nav-tab-btn ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
                title="Grid Card View"
              >
                <Grid size={14} />
              </button>
              <button
                className={`nav-tab-btn ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => setViewMode('list')}
                title="List Table View"
              >
                <List size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Empty State */}
      {filteredGoals.length === 0 && (
        <div style={{ padding: 40, textAlign: 'center', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-xl)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'rgba(37, 99, 235, 0.1)', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 800 }}>
            🎯
          </div>
          <div style={{ maxWidth: 420 }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-main)', marginBottom: 6 }}>No Goals Found</h3>
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              No custom goals match your current search/category filter or database is currently empty.
            </p>
          </div>
          <button className="btn-primary" onClick={onOpenCreateModal}>
            <Plus size={18} />
            <span>Create Custom Goal</span>
          </button>
        </div>
      )}

      {/* Grid Mode View */}
      {viewMode === 'grid' && filteredGoals.length > 0 && (
        <div className="goals-grid">
          {filteredGoals.map((goal) => {
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
            const displayInfTarget = convertCurrency(calc.inflationAdjustedTarget, goal.currency, currency);
            const pct = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));

            return (
              <div key={goal.id} className="goal-card" onClick={() => onSelectGoal(goal)}>
                <div className="goal-card-top">
                  <div className="goal-icon-title">
                    <div className="goal-category-icon">
                      {goal.goalType === 'Custom' ? '⚡' : '🎯'}
                    </div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <h3 className="goal-title">{goal.name}</h3>
                      <span className="goal-category-badge">
                        {goal.customCategory || goal.category} • {goal.goalType}
                      </span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span className={`status-badge ${goal.status.replace(' ', '.')}`}>
                      {goal.status}
                    </span>
                    {onDeleteGoal && (
                      <button
                        className="icon-btn"
                        style={{ width: 32, height: 32, color: '#ef4444', flexShrink: 0 }}
                        title="Delete Goal"
                        onClick={(e) => {
                          e.stopPropagation();
                          showConfirm({
                            title: 'Delete Goal',
                            message: `Are you sure you want to delete "${goal.name}"? This action cannot be undone.`,
                            isDanger: true,
                            confirmText: 'Delete',
                            onConfirm: () => {
                              onDeleteGoal(goal.id);
                              showToast(`Goal "${goal.name}" deleted`, 'info');
                            }
                          });
                        }}
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                </div>

                <p className="goal-desc-text">
                  {goal.description}
                </p>

                <div className="goal-amounts">
                  <div>
                    <div className="saved-amount">{formatCurrency(displaySaved, currency)}</div>
                    <div className="target-amount-label">Target: {formatCurrency(displayTarget, currency)}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div className="req-sip-label">
                      {formatCurrency(displayMonthlyReq, currency)}/mo
                    </div>
                    <div className="inf-target-label">Inf. Target: {formatCurrency(displayInfTarget, currency)}</div>
                  </div>
                </div>

                <div className="progress-bar-container">
                  <div className={`progress-fill ${goal.status.replace(' ', '.')}`} style={{ width: `${pct}%` }} />
                </div>

                {goal.subGoals.length > 0 && (
                  <div className="subgoals-agg-badge">
                    <Layers size={14} color="var(--accent-primary)" />
                    <span>{goal.subGoals.length} Sub-goals aggregated ({formatCurrency(displaySaved, currency)})</span>
                  </div>
                )}

                <div className="goal-footer">
                  <span>Target Year: {new Date(goal.targetDate).getFullYear()} ({goal.expectedInflation}% Inf)</span>
                  <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{pct}% Saved</span>
                </div>
              </div>
            );
          })}
        </div>
      )}


      {/* List Mode View */}
      {viewMode === 'list' && (
        <div className="metric-card" style={{ padding: 0, overflow: 'auto' }}>
          <div className="budget-table-container">
            <table className="budget-table">
            <thead>
              <tr>
                <th>Goal Name</th>
                <th>Category</th>
                <th>Priority</th>
                <th>Target Date</th>
                <th>Saved / Target</th>
                <th>Inflation Target</th>
                <th>Req. SIP</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filteredGoals.map((goal) => {
                const calc = calculateRequiredMonthlyContribution(
                  goal.targetAmount,
                  goal.currentAmount,
                  goal.expectedInflation,
                  goal.expectedReturn,
                  goal.targetDate
                );

                return (
                  <tr key={goal.id} style={{ cursor: 'pointer' }} onClick={() => onSelectGoal(goal)}>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{goal.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{goal.goalType}</div>
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>{goal.customCategory || goal.category}</td>
                    <td>
                      <span className="kbd-shortcut" style={{ backgroundColor: goal.priority === 'Critical' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(255, 255, 255, 0.05)', color: goal.priority === 'Critical' ? '#f87171' : 'var(--text-secondary)', fontWeight: 600 }}>
                        {goal.priority}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{goal.targetDate}</td>
                    <td>
                      <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{formatCurrency(convertCurrency(goal.currentAmount, goal.currency, currency), currency)}</span>
                      <span style={{ color: 'var(--text-muted)', fontSize: 11 }}> / {formatCurrency(convertCurrency(goal.targetAmount, goal.currency, currency), currency)}</span>
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>{formatCurrency(convertCurrency(calc.inflationAdjustedTarget, goal.currency, currency), currency)}</td>
                    <td style={{ color: '#60a5fa', fontWeight: 600 }}>
                      {formatCurrency(convertCurrency(calc.requiredMonthly, goal.currency, currency), currency)}/mo
                    </td>
                    <td>
                      <span className={`status-badge ${goal.status.replace(' ', '.')}`}>
                        {goal.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {onDeleteGoal && (
                        <button
                          className="icon-btn"
                          style={{ width: 28, height: 28, color: '#ef4444' }}
                          title="Delete Goal"
                          onClick={(e) => {
                            e.stopPropagation();
                            showConfirm({
                              title: 'Delete Goal',
                              message: `Are you sure you want to delete "${goal.name}"? This action cannot be undone.`,
                              isDanger: true,
                              confirmText: 'Delete',
                              onConfirm: () => {
                                onDeleteGoal(goal.id);
                                showToast(`Goal "${goal.name}" deleted`, 'info');
                              }
                            });
                          }}
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      )}

      {/* Custom Category Creator Modal */}
      {showCategoryModal && (
        <div className="modal-overlay" onClick={() => setShowCategoryModal(false)}>
          <div className="modal-card" style={{ maxWidth: 500 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create Custom Goal Category</h2>
              <button className="icon-btn" onClick={() => setShowCategoryModal(false)}>✕</button>
            </div>
            <form onSubmit={handleCreateCategory}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Category Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder='e.g. "Family Responsibilities", "Startup Capital"'
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Description / Sub-goals Included</label>
                  <textarea
                    className="form-textarea"
                    placeholder="e.g. Parents Gold, Marriage, Healthcare, Sibling Education"
                    value={newCatDesc}
                    onChange={(e) => setNewCatDesc(e.target.value)}
                    rows={3}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowCategoryModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Save Custom Category</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
