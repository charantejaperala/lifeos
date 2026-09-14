import React, { useState } from 'react';
import {
  X,
  Bell,
  CheckCircle2,
  Sparkles,
  TrendingUp,
  ShieldAlert,
  UserPlus,
  AlertTriangle,
  Coins,
  ArrowRight,
  Trash2,
  Filter,
  CheckCheck,
  Zap,
  Info
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  category: 'suggestion' | 'alert' | 'admin' | 'system';
  read: boolean;
  priority: 'high' | 'medium' | 'low';
  actionLabel?: string;
  actionTab?: string;
}

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  onMarkAllRead: () => void;
  onMarkAsRead: (id: string) => void;
  onDismiss: (id: string) => void;
  onNavigateTab: (tab: string) => void;
  onOpenAskAI: (prompt?: string) => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAllRead,
  onMarkAsRead,
  onDismiss,
  onNavigateTab,
  onOpenAskAI,
}) => {
  const { user } = useAuth();
  const [filter, setFilter] = useState<'all' | 'suggestion' | 'alert' | 'admin'>('all');

  if (!isOpen) return null;

  const isAdmin = user?.role === 'superadmin';

  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'suggestion') return n.category === 'suggestion';
    if (filter === 'alert') return n.category === 'alert';
    if (filter === 'admin') return n.category === 'admin' || n.category === 'system';
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getCategoryIcon = (category: string, priority: string) => {
    switch (category) {
      case 'suggestion':
        return <Sparkles size={16} color="#3b82f6" />;
      case 'alert':
        return priority === 'high' ? (
          <AlertTriangle size={16} color="#ef4444" />
        ) : (
          <TrendingUp size={16} color="#f59e0b" />
        );
      case 'admin':
        return <UserPlus size={16} color="#a855f7" />;
      case 'system':
        return <ShieldAlert size={16} color="#10b981" />;
      default:
        return <Info size={16} color="#38bdf8" />;
    }
  };

  return (
    <>
      {/* Backdrop overlay */}
      <div 
        className="notification-backdrop" 
        onClick={onClose}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.55)',
          backdropFilter: 'blur(4px)',
          zIndex: 1000,
          animation: 'fadeIn 0.2s ease-out'
        }}
      />

      {/* Drawer */}
      <div
        className="notification-drawer"
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          width: '100%',
          maxWidth: '440px',
          height: '100vh',
          background: 'var(--bg-card)',
          borderLeft: '1px solid var(--border-color)',
          boxShadow: '-10px 0 30px rgba(0,0,0,0.3)',
          zIndex: 1001,
          display: 'flex',
          flexDirection: 'column',
          animation: 'slideInRight 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--bg-main)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: 'rgba(37, 99, 235, 0.15)',
                color: '#3b82f6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Bell size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: 17, fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                Notifications & Intelligence
              </h3>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                {unreadCount > 0 ? `${unreadCount} unread recommendations` : 'All notifications caught up'}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="icon-btn"
            style={{ borderRadius: 8 }}
            title="Close Drawer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Filter Controls & Mark All Read */}
        <div
          style={{
            padding: '12px 20px',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--bg-card-elevated)',
            gap: 8,
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', gap: 6 }}>
            {(['all', 'suggestion', 'alert', ...(isAdmin ? ['admin'] : [])] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab as any)}
                style={{
                  padding: '4px 10px',
                  borderRadius: 6,
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: 'capitalize',
                  border: '1px solid',
                  borderColor: filter === tab ? 'var(--accent-primary)' : 'var(--border-color)',
                  background: filter === tab ? 'rgba(37, 99, 235, 0.2)' : 'transparent',
                  color: filter === tab ? '#60a5fa' : 'var(--text-muted)',
                  cursor: 'pointer',
                }}
              >
                {tab === 'all' ? 'All' : tab === 'suggestion' ? '💡 Smart Tips' : tab === 'alert' ? '🚨 Alerts' : '⚡ Admin'}
              </button>
            ))}
          </div>

          {unreadCount > 0 && (
            <button
              onClick={onMarkAllRead}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#3b82f6',
                fontSize: 11,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <CheckCheck size={14} />
              Mark all read
            </button>
          )}
        </div>

        {/* Notification List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filteredNotifications.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: 32, marginBottom: 10 }}>🎉</div>
              <h4 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-main)', marginBottom: 4 }}>No notifications found</h4>
              <p style={{ fontSize: 13, margin: 0 }}>You are all caught up with your financial goals & insights.</p>
            </div>
          ) : (
            filteredNotifications.map((item) => (
              <div
                key={item.id}
                onClick={() => onMarkAsRead(item.id)}
                style={{
                  padding: '14px',
                  borderRadius: 12,
                  background: item.read ? 'var(--bg-main)' : 'rgba(37, 99, 235, 0.08)',
                  border: `1px solid ${item.read ? 'var(--border-color)' : 'rgba(59, 130, 246, 0.3)'}`,
                  position: 'relative',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer',
                }}
              >
                {!item.read && (
                  <span
                    style={{
                      position: 'absolute',
                      top: 14,
                      right: 14,
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: '#3b82f6',
                    }}
                  />
                )}

                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      background: item.category === 'suggestion' ? 'rgba(59, 130, 246, 0.15)' : item.category === 'admin' ? 'rgba(168, 85, 247, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {getCategoryIcon(item.category, item.priority)}
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4, flexWrap: 'wrap' }}>
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 800,
                          textTransform: 'uppercase',
                          padding: '2px 6px',
                          borderRadius: 4,
                          background: item.priority === 'high' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(148, 163, 184, 0.15)',
                          color: item.priority === 'high' ? '#ef4444' : 'var(--text-muted)',
                        }}
                      >
                        {item.category}
                      </span>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 'auto' }}>
                        {item.timestamp}
                      </span>
                    </div>

                    <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-main)', margin: '0 0 4px 0', paddingRight: item.read ? 0 : 16 }}>
                      {item.title}
                    </h4>

                    <p style={{ fontSize: 12.5, color: 'var(--text-muted)', margin: 0, lineHeight: 1.45 }}>
                      {item.message}
                    </p>

                    {/* Action buttons */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 10 }}>
                      {item.actionTab && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onNavigateTab(item.actionTab!);
                            onClose();
                          }}
                          className="btn-primary"
                          style={{ padding: '4px 10px', fontSize: 11, height: 26 }}
                        >
                          <span>{item.actionLabel || 'View Detail'}</span>
                          <ArrowRight size={12} />
                        </button>
                      )}

                      {item.category === 'suggestion' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenAskAI(`How can I act on this financial tip: "${item.title}"?`);
                            onClose();
                          }}
                          className="btn-secondary"
                          style={{ padding: '4px 10px', fontSize: 11, height: 26 }}
                        >
                          <Sparkles size={11} color="#60a5fa" />
                          <span>Ask AI</span>
                        </button>
                      )}

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDismiss(item.id);
                        }}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: 'var(--text-muted)',
                          cursor: 'pointer',
                          marginLeft: 'auto',
                          padding: 4,
                        }}
                        title="Dismiss notification"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer info banner */}
        <div
          style={{
            padding: '14px 20px',
            borderTop: '1px solid var(--border-color)',
            background: 'var(--bg-main)',
            fontSize: 12,
            color: 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Zap size={14} color="#f59e0b" />
            <span>AI Cashflow Monitor Active</span>
          </div>
          <button
            className="btn-secondary"
            style={{ padding: '4px 8px', fontSize: 11, height: 26 }}
            onClick={() => {
              onNavigateTab('ca-advisor');
              onClose();
            }}
          >
            CA Zero Tax 💼
          </button>
        </div>
      </div>
    </>
  );
};
