import React from 'react';
import { Goal, LifeEvent } from '../types';
import { formatCurrency, convertCurrency } from '../utils/calculations';
import { Milestone, Calendar, ChevronRight, CheckCircle, Clock, MoveRight, Trash2 } from 'lucide-react';
import { useNotification } from '../context/NotificationContext';

interface TimelineViewProps {
  goals: Goal[];
  lifeEvents: LifeEvent[];
  currency: string;
  onSelectGoal: (goal: Goal) => void;
  onUpdateGoal: (updated: Goal) => void;
  onDeleteGoal?: (goalId: string) => void;
  onDeleteLifeEvent?: (eventId: string) => void;
}

export const TimelineView: React.FC<TimelineViewProps> = ({
  goals,
  lifeEvents,
  currency,
  onSelectGoal,
  onUpdateGoal,
  onDeleteGoal,
  onDeleteLifeEvent,
}) => {
  const { showConfirm, showToast } = useNotification();
  // Group goals & events by target year
  const yearMap: Record<number, { goals: Goal[]; events: LifeEvent[] }> = {};

  goals.forEach((g) => {
    const year = new Date(g.targetDate).getFullYear();
    if (!yearMap[year]) yearMap[year] = { goals: [], events: [] };
    yearMap[year].goals.push(g);
  });

  lifeEvents.forEach((e) => {
    const year = new Date(e.date).getFullYear();
    if (!yearMap[year]) yearMap[year] = { goals: [], events: [] };
    yearMap[year].events.push(e);
  });

  const sortedYears = Object.keys(yearMap).map(Number).sort((a, b) => a - b);

  const handlePostponeGoal = (goal: Goal) => {
    const currentYear = new Date(goal.targetDate).getFullYear();
    const newDate = `${currentYear + 1}-12-31`;
    onUpdateGoal({
      ...goal,
      targetDate: newDate,
    });
  };

  return (
    <div className="content-area">
      <div className="page-header">
        <div className="page-title-group">
          <h1>Timeline Roadmap 🗺️</h1>
          <p>Chronological roadmap of all custom goals, aspirations, purchases and major life events.</p>
        </div>
      </div>

      {sortedYears.length === 0 ? (
        <div className="empty-state-card">
          <div className="empty-state-icon">🗺️</div>
          <div style={{ maxWidth: 420 }}>
            <h3 className="empty-state-title">No Timeline Data Available</h3>
            <p className="empty-state-text">
              Create goals or add life events to see your chronological financial roadmap here.
            </p>
          </div>
        </div>
      ) : (
        <div className="timeline-container">
          {sortedYears.map((year) => {
            const items = yearMap[year];
            return (
              <div key={year} className="timeline-year-group">
                <div className="timeline-year-badge">
                  <Calendar size={15} color="var(--accent-primary)" />
                  <span>{year} Target Roadmap</span>
                  <span className="timeline-count-tag">{items.goals.length + items.events.length} Items</span>
                </div>

                <div className="timeline-cards">
                  {items.goals.map((g) => {
                    const pct = Math.min(100, Math.round((g.currentAmount / g.targetAmount) * 100));
                    // Clean title from prompt noise if any
                    const cleanName = g.name.replace(/\s+(in|a)\s+goal$/i, '').replace(/\s*goal$/i, '');
                    const targetAmtFormatted = formatCurrency(convertCurrency(g.targetAmount, g.currency, currency), currency);
                    const currentAmtFormatted = formatCurrency(convertCurrency(g.currentAmount, g.currency, currency), currency);

                    return (
                      <div
                        key={g.id}
                        className="timeline-card-item"
                        onClick={() => onSelectGoal(g)}
                      >
                        <div className="timeline-card-header">
                          <div className="timeline-card-title-group">
                            <div className="goal-category-icon">🎯</div>
                            <div style={{ minWidth: 0, flex: 1 }}>
                              <h3 className="timeline-goal-name">{cleanName}</h3>
                              <div className="timeline-tags-row">
                                <span className="goal-category-badge">{g.category}</span>
                                <span className="priority-pill">{g.priority || 'Medium'}</span>
                              </div>
                            </div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span className={`status-badge ${g.status.replace(' ', '.')}`}>{g.status}</span>
                            {onDeleteGoal && (
                              <button
                                className="btn-icon-danger"
                                title="Delete Goal"
                                onClick={(ev) => {
                                  ev.stopPropagation();
                                  showConfirm({
                                    title: 'Delete Goal',
                                    message: `Are you sure you want to delete "${g.name}"? This action cannot be undone.`,
                                    isDanger: true,
                                    confirmText: 'Delete',
                                    onConfirm: () => {
                                      onDeleteGoal(g.id);
                                      showToast(`Goal "${g.name}" deleted`, 'info');
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
                                }}
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
                          </div>
                        </div>

                        <div className="timeline-card-metrics">
                          <div className="timeline-metric-col">
                            <span className="metric-lbl">Target Amount</span>
                            <span className="metric-val">{targetAmtFormatted}</span>
                          </div>
                          <div className="timeline-metric-col">
                            <span className="metric-lbl">Current Saved</span>
                            <span className="metric-val-sub">{currentAmtFormatted} ({pct}%)</span>
                          </div>
                          {g.monthlyContribution > 0 && (
                            <div className="timeline-metric-col">
                              <span className="metric-lbl">Monthly SIP</span>
                              <span className="metric-val-sub">{formatCurrency(convertCurrency(g.monthlyContribution, g.currency, currency), currency)}/mo</span>
                            </div>
                          )}
                        </div>

                        <div className="progress-bar-container" style={{ height: 6, borderRadius: 3, marginTop: 8 }}>
                          <div className={`progress-fill ${g.status.replace(' ', '.')}`} style={{ width: `${pct}%` }} />
                        </div>

                        <div className="timeline-card-footer">
                          <div className="timeline-date-info">
                            <Clock size={13} color="var(--text-muted)" />
                            <span>Target: {new Date(g.targetDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                          </div>
                          <button
                            className="btn-secondary timeline-postpone-btn"
                            onClick={(ev) => {
                              ev.stopPropagation();
                              handlePostponeGoal(g);
                            }}
                          >
                            <MoveRight size={13} /> Postpone +1 Yr
                          </button>
                        </div>
                      </div>
                    );
                  })}

                  {items.events.map((e) => (
                    <div
                      key={e.id}
                      className="timeline-card-item event-type"
                    >
                      <div className="timeline-card-header">
                        <div className="timeline-card-title-group">
                          <div className="goal-category-icon" style={{ color: 'var(--accent-purple)', background: 'rgba(139, 92, 246, 0.15)' }}>🎉</div>
                          <div style={{ minWidth: 0, flex: 1 }}>
                            <h3 className="timeline-goal-name">{e.name}</h3>
                            <span className="goal-category-badge" style={{ background: 'rgba(139, 92, 246, 0.15)', color: 'var(--accent-purple)' }}>Life Event • {e.recurrence}</span>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span className="status-badge ON.TRACK">Event</span>
                          {onDeleteLifeEvent && (
                            <button
                              className="btn-icon-danger"
                              title="Delete Event"
                              onClick={(ev) => {
                                ev.stopPropagation();
                                showConfirm({
                                  title: 'Delete Life Event',
                                  message: `Are you sure you want to delete event "${e.name}"? This action cannot be undone.`,
                                  isDanger: true,
                                  confirmText: 'Delete Event',
                                  onConfirm: () => {
                                    onDeleteLifeEvent(e.id);
                                    showToast(`Event "${e.name}" deleted`, 'info');
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
                              }}
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="timeline-card-metrics">
                        <div className="timeline-metric-col">
                          <span className="metric-lbl">Estimated Cost</span>
                          <span className="metric-val">{formatCurrency(convertCurrency(e.estimatedCost, e.currency, currency), currency)}</span>
                        </div>
                        <div className="timeline-metric-col">
                          <span className="metric-lbl">Location</span>
                          <span className="metric-val-sub">{e.location || 'N/A'}</span>
                        </div>
                      </div>

                      <div className="timeline-card-footer">
                        <div className="timeline-date-info">
                          <Calendar size={13} color="var(--text-muted)" />
                          <span>Event Date: {new Date(e.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
