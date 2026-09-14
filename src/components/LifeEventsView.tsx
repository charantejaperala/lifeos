import React, { useState, useMemo } from 'react';
import { LifeEvent, RecurrenceType } from '../types';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { formatCurrency, convertCurrency } from '../utils/calculations';
import {
  CalendarHeart, Plus, Calendar, CheckSquare, MapPin, Tag, Trash2,
  TrendingUp, TrendingDown, ArrowUpDown, Filter, DollarSign, Target,
  Building2, CreditCard, BarChart3, Landmark, Clock
} from 'lucide-react';

type TimeHorizon = 'daily' | 'monthly' | 'yearly' | 'lifetime';
type EventTypeFilter = 'All' | 'Expense' | 'Income' | 'Goal' | 'Asset' | 'Liability' | 'Investment' | 'Event';

interface LifeEventsViewProps {
  lifeEvents: LifeEvent[];
  currency: string;
  onAddLifeEvent: (newEvent: LifeEvent) => void;
  onDeleteLifeEvent?: (eventId: string) => void;
}

const EVENT_TYPE_CONFIG: Record<EventTypeFilter, { icon: React.ReactNode; color: string; bg: string }> = {
  All: { icon: <Filter size={14} />, color: '#94a3b8', bg: 'rgba(148,163,184,0.1)' },
  Expense: { icon: <TrendingDown size={14} />, color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
  Income: { icon: <TrendingUp size={14} />, color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
  Goal: { icon: <Target size={14} />, color: '#2563eb', bg: 'rgba(37,99,235,0.1)' },
  Asset: { icon: <Building2 size={14} />, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
  Liability: { icon: <CreditCard size={14} />, color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
  Investment: { icon: <BarChart3 size={14} />, color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)' },
  Event: { icon: <CalendarHeart size={14} />, color: '#ec4899', bg: 'rgba(236,72,153,0.1)' },
};

export const LifeEventsView: React.FC<LifeEventsViewProps> = ({
  lifeEvents,
  currency,
  onAddLifeEvent,
  onDeleteLifeEvent,
}) => {
  const { requireAuth } = useAuth();
  const { showConfirm, showToast } = useNotification();
  const [showModal, setShowModal] = useState(false);
  const [timeHorizon, setTimeHorizon] = useState<TimeHorizon>('lifetime');
  const [typeFilter, setTypeFilter] = useState<EventTypeFilter>('All');
  const [name, setName] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [estimatedCost, setEstimatedCost] = useState(200000);
  const [recurrence, setRecurrence] = useState<RecurrenceType>('One-time');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [eventType, setEventType] = useState<LifeEvent['eventType']>('Expense');

  const now = new Date();

  // Filter events by time horizon
  const filteredByTime = useMemo(() => {
    return lifeEvents.filter((evt) => {
      if (timeHorizon === 'lifetime') return true;
      const evtDate = new Date(evt.date);
      if (timeHorizon === 'daily') {
        return evtDate.toDateString() === now.toDateString();
      }
      if (timeHorizon === 'monthly') {
        return evtDate.getMonth() === now.getMonth() && evtDate.getFullYear() === now.getFullYear();
      }
      if (timeHorizon === 'yearly') {
        return evtDate.getFullYear() === now.getFullYear();
      }
      return true;
    });
  }, [lifeEvents, timeHorizon]);

  // Filter events by type
  const filteredEvents = useMemo(() => {
    if (typeFilter === 'All') return filteredByTime;
    return filteredByTime.filter((evt) => (evt.eventType || 'Event') === typeFilter);
  }, [filteredByTime, typeFilter]);

  // Cash flow summary
  const cashFlowSummary = useMemo(() => {
    const inflow = filteredEvents
      .filter(e => (e.eventType === 'Income' || e.eventType === 'Asset' || e.eventType === 'Investment'))
      .reduce((s, e) => s + convertCurrency(e.estimatedCost, e.currency, currency), 0);
    const outflow = filteredEvents
      .filter(e => (e.eventType === 'Expense' || e.eventType === 'Liability' || !e.eventType || e.eventType === 'Event'))
      .reduce((s, e) => s + convertCurrency(e.estimatedCost, e.currency, currency), 0);
    return { inflow, outflow, net: inflow - outflow };
  }, [filteredEvents, currency]);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newEvt: LifeEvent = {
      id: `le-${Date.now()}`,
      name: name.trim(),
      date,
      estimatedCost,
      currency,
      inflation: 6,
      isRecurring: recurrence !== 'One-time',
      recurrence,
      oneTimeCost: recurrence === 'One-time' ? estimatedCost : 0,
      recurringCost: recurrence !== 'One-time' ? estimatedCost : 0,
      dependencies: [],
      participants: ['Family'],
      location,
      priority: 'High',
      fundingSource: 'Monthly Surplus',
      eventType: eventType || 'Expense',
      notes,
    };

    onAddLifeEvent(newEvt);
    setShowModal(false);
    setName('');
    setNotes('');
    setLocation('');
  };

  const timeHorizons: { key: TimeHorizon; label: string; icon: React.ReactNode }[] = [
    { key: 'daily', label: 'Today', icon: <Clock size={14} /> },
    { key: 'monthly', label: 'This Month', icon: <Calendar size={14} /> },
    { key: 'yearly', label: 'This Year', icon: <CalendarHeart size={14} /> },
    { key: 'lifetime', label: 'All Time', icon: <Landmark size={14} /> },
  ];

  const quickActions: { type: LifeEvent['eventType']; label: string; icon: React.ReactNode; color: string }[] = [
    { type: 'Expense', label: 'Expense', icon: <TrendingDown size={18} />, color: '#ef4444' },
    { type: 'Income', label: 'Income', icon: <TrendingUp size={18} />, color: '#10b981' },
    { type: 'Goal', label: 'Goal', icon: <Target size={18} />, color: '#2563eb' },
    { type: 'Asset', label: 'Asset', icon: <Building2 size={18} />, color: '#f59e0b' },
    { type: 'Liability', label: 'Liability', icon: <CreditCard size={18} />, color: '#ef4444' },
    { type: 'Investment', label: 'Investment', icon: <BarChart3 size={18} />, color: '#8b5cf6' },
  ];

  return (
    <div className="content-area">
      <div className="page-header">
        <div className="page-title-group">
          <h1>Daily Events & Activity Ledger 📊</h1>
          <p>Track expenses, income, goals, assets, liabilities & investments across all time horizons.</p>
        </div>
        <button className="btn-primary" onClick={() => requireAuth(() => setShowModal(true), 'add entry')}>
          <Plus size={18} />
          <span>Add Entry</span>
        </button>
      </div>

      {/* Quick Action Buttons */}
      <div className="metric-card" style={{ padding: 14 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Quick Actions</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 8 }}>
          {quickActions.map((qa) => (
            <button
              key={qa.label}
              className="btn-secondary"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                height: 36, padding: '0 12px', borderRadius: 'var(--radius-sm)', fontSize: 12, fontWeight: 600,
                border: `1px solid ${qa.color}30`, background: `${qa.color}10`, color: qa.color,
              }}
              onClick={() => requireAuth(() => { setEventType(qa.type); setShowModal(true); }, 'add entry')}
            >
              {qa.icon}
              <span>{qa.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Time Horizon Tabs */}
      <div className="nav-tab-bar">
        {timeHorizons.map((th) => (
          <button
            key={th.key}
            className={`nav-tab-btn ${timeHorizon === th.key ? 'active' : ''}`}
            style={{ flex: 1, justifyContent: 'center' }}
            onClick={() => setTimeHorizon(th.key)}
          >
            {th.icon} {th.label}
          </button>
        ))}
      </div>

      {/* Event Type Filter Pills */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {(Object.keys(EVENT_TYPE_CONFIG) as EventTypeFilter[]).map((type) => {
          const cfg = EVENT_TYPE_CONFIG[type];
          const isActive = typeFilter === type;
          const count = type === 'All'
            ? filteredByTime.length
            : filteredByTime.filter(e => (e.eventType || 'Event') === type).length;
          return (
            <button
              key={type}
              className={`nav-tab-btn ${isActive ? 'active' : ''}`}
              style={{
                borderRadius: 'var(--radius-xs)',
                border: isActive ? `1px solid ${cfg.color}` : '1px solid var(--border-color)',
                background: isActive ? cfg.bg : 'transparent',
                color: isActive ? cfg.color : 'var(--text-muted)',
              }}
              onClick={() => setTypeFilter(type)}
            >
              {cfg.icon} {type} ({count})
            </button>
          );
        })}
      </div>

      {/* Cash Flow Summary Cards */}
      <div className="metrics-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
        <div className="metric-card">
          <span className="metric-title">Total Inflow</span>
          <span className="metric-value" style={{ color: '#10b981' }}>
            {formatCurrency(cashFlowSummary.inflow, currency)}
          </span>
          <span className="metric-trend trend-up">Income + Assets + Investments</span>
        </div>
        <div className="metric-card">
          <span className="metric-title">Total Outflow</span>
          <span className="metric-value" style={{ color: '#ef4444' }}>
            {formatCurrency(cashFlowSummary.outflow, currency)}
          </span>
          <span className="metric-trend trend-down">Expenses + Liabilities + Events</span>
        </div>
        <div className="metric-card">
          <span className="metric-title">Net Cash Flow</span>
          <span className="metric-value" style={{ color: cashFlowSummary.net >= 0 ? '#10b981' : '#ef4444' }}>
            {cashFlowSummary.net >= 0 ? '+' : ''}{formatCurrency(cashFlowSummary.net, currency)}
          </span>
          <span className="metric-trend">{filteredEvents.length} entries in this period</span>
        </div>
      </div>

      {/* Activity Ledger */}
      {filteredEvents.length === 0 ? (
        <div className="empty-state-card">
          <div className="empty-state-icon">📊</div>
          <div style={{ maxWidth: 420 }}>
            <h3 className="empty-state-title">No Entries Found</h3>
            <p className="empty-state-text">
              No activities match the current time horizon & type filter. Use the Quick Actions above to add an entry.
            </p>
          </div>
          <button className="btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={18} />
            <span>Add First Entry</span>
          </button>
        </div>
      ) : (
        <div className="goals-grid">
          {filteredEvents.map((evt) => {
            const evtType = evt.eventType || 'Event';
            const cfg = EVENT_TYPE_CONFIG[evtType as EventTypeFilter] || EVENT_TYPE_CONFIG['Event'];
            const isInflow = evtType === 'Income' || evtType === 'Asset' || evtType === 'Investment';

            return (
              <div key={evt.id} className="goal-card" style={{ borderTop: `3px solid ${cfg.color}` }}>
                <div className="goal-card-top">
                  <div className="goal-icon-title">
                    <div
                      className="goal-category-icon"
                      style={{ color: cfg.color, background: cfg.bg }}
                    >
                      {cfg.icon}
                    </div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <h3 className="goal-title">{evt.name}</h3>
                      <span className="goal-category-badge">{evtType} • {evt.recurrence} • {evt.date}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span
                      className="status-badge"
                      style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}33` }}
                    >
                      {evtType}
                    </span>
                    {onDeleteLifeEvent && (
                      <button
                        className="icon-btn"
                        style={{ width: 32, height: 32, color: '#ef4444', flexShrink: 0 }}
                        title="Delete Entry"
                        onClick={(e) => {
                          e.stopPropagation();
                          showConfirm({
                            title: 'Delete Life Event',
                            message: `Are you sure you want to delete "${evt.name}"? This action cannot be undone.`,
                            isDanger: true,
                            confirmText: 'Delete Event',
                            onConfirm: () => {
                              onDeleteLifeEvent(evt.id);
                              showToast(`Event "${evt.name}" deleted`, 'info');
                            }
                          });
                        }}
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                </div>

                <div className="event-cost-display" style={{ color: isInflow ? '#10b981' : cfg.color }}>
                  {isInflow ? '+' : '-'}{formatCurrency(convertCurrency(evt.estimatedCost, evt.currency, currency), currency)}
                </div>

                {evt.location && (
                  <div className="event-location-badge">
                    <MapPin size={14} /> {evt.location}
                  </div>
                )}

                {evt.notes && (
                  <p className="event-notes-text">{evt.notes}</p>
                )}

                {evt.tasks && evt.tasks.length > 0 && (
                  <div className="event-tasks-box">
                    <strong>Tasks ({evt.tasks.filter(t => t.done).length}/{evt.tasks.length}):</strong>
                    {evt.tasks.map(t => (
                      <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                        <CheckSquare size={12} color={t.done ? '#10b981' : 'var(--text-muted)'} />
                        <span style={{ textDecoration: t.done ? 'line-through' : 'none' }}>{t.text}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="goal-footer">
                  <span>{evt.priority} Priority</span>
                  <span style={{ fontWeight: 700, color: cfg.color }}>{evt.fundingSource || 'Unallocated'}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Entry Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-card" style={{ maxWidth: 540 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add Activity Entry</h2>
              <button className="icon-btn" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Entry Type *</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                    {quickActions.map((qa) => (
                      <button
                        key={qa.label}
                        type="button"
                        className={`fx-btn ${eventType === qa.type ? 'active' : ''}`}
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                          padding: '10px 8px', fontSize: 12, fontWeight: 700, borderRadius: 10,
                          border: eventType === qa.type ? `2px solid ${qa.color}` : '1px solid var(--border-color)',
                          background: eventType === qa.type ? `${qa.color}15` : 'transparent',
                          color: eventType === qa.type ? qa.color : 'var(--text-muted)',
                        }}
                        onClick={() => setEventType(qa.type)}
                      >
                        {qa.icon} {qa.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label>Name / Description *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder='e.g. "Monthly Rent", "Salary Credit", "SIP Investment"'
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="form-group">
                    <label>Date</label>
                    <input
                      type="date"
                      className="form-input"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Amount ({currency})</label>
                    <input
                      type="number"
                      className="form-input"
                      value={estimatedCost}
                      onChange={(e) => setEstimatedCost(Number(e.target.value))}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="form-group">
                    <label>Recurrence</label>
                    <select
                      className="form-select"
                      value={recurrence}
                      onChange={(e) => setRecurrence(e.target.value as RecurrenceType)}
                    >
                      <option value="One-time">One-time</option>
                      <option value="Monthly">Monthly</option>
                      <option value="Quarterly">Quarterly</option>
                      <option value="Yearly">Yearly</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Location (Optional)</label>
                    <input
                      type="text"
                      className="form-input"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Notes (Optional)</label>
                  <textarea
                    className="form-textarea"
                    placeholder="Additional details..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={2}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Save Entry</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
