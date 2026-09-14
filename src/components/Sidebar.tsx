import React, { useMemo } from 'react';
import { Goal } from '../types';
import { convertCurrency } from '../utils/calculations';
import {
  LayoutDashboard,
  Target,
  Milestone,
  AlertTriangle,
  PieChart,
  Coins,
  CalendarHeart,
  FileText,
  Sparkles,
  BarChart3,
  Calculator,
  Settings,
  UserCheck,
  BrainCircuit,
  Shield,
  ShieldAlert,
  Building2,
  Briefcase,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useRealtimeContext } from '../utils/realtimeContext';
import { LifeOSLogo } from './LifeOSLogo';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  openAskAI: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
  goals?: Goal[];
  currency?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  openAskAI,
  isMobileOpen = false,
  onCloseMobile,
  goals = [],
  currency = 'INR',
}) => {
  const { user, token, setShowAuthModal, setAuthView } = useAuth();
  const { city, countryCode, timeStr, weatherIcon, tempStr } = useRealtimeContext();

  // Dynamic Financial Health Score computation
  const healthMetrics = useMemo(() => {
    const totalGoals = goals.length;
    if (totalGoals === 0) return { score: 0, savingsRate: 0, emergencyFund: 0, debtToIncome: 0, status: 'N/A' };

    const totalTarget = goals.reduce((acc, g) => acc + convertCurrency(g.targetAmount, g.currency, currency), 0);
    const totalSaved = goals.reduce((acc, g) => acc + convertCurrency(g.currentAmount, g.currency, currency), 0);
    const savingsRate = totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0;

    const onTrack = goals.filter(g => g.status === 'ON TRACK' || g.status === 'AHEAD' || g.status === 'COMPLETED').length;
    const consistencyRate = totalGoals > 0 ? Math.round((onTrack / totalGoals) * 100) : 0;

    const behindGoals = goals.filter(g => g.status === 'BEHIND' || g.status === 'AT RISK').length;
    const riskPenalty = totalGoals > 0 ? Math.round((behindGoals / totalGoals) * 30) : 0;

    const emergencyFund = Math.min(savingsRate + 10, 100);
    const debtToIncome = Math.max(100 - savingsRate - 15, 5);

    const score = Math.min(Math.max(Math.round(savingsRate * 0.4 + consistencyRate * 0.4 + 20 - riskPenalty), 0), 100);
    const status = score >= 75 ? 'Great' : score >= 50 ? 'Good' : score >= 25 ? 'Fair' : 'Low';

    return { score, savingsRate: Math.min(savingsRate, 100), emergencyFund, debtToIncome, status };
  }, [goals, currency]);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'goals', label: 'My Goals', icon: Target },
    { id: 'timeline', label: 'Timeline Roadmap', icon: Milestone },
    { id: 'conflicts', label: 'Conflict Engine', icon: AlertTriangle },
    { id: 'ca-advisor', label: 'CA Tax Advisor 💼', icon: Briefcase },
    { id: 'bank-sync', label: 'Bank & App Sync 🏦', icon: Building2 },
    { id: 'calculators', label: 'Financial Calculators', icon: Calculator },
    { id: 'budget', label: 'Budget & Breakdown', icon: PieChart },
    { id: 'funding', label: 'Funding & Sources', icon: Coins },
    { id: 'events', label: 'Life Events', icon: CalendarHeart },
    { id: 'templates', label: 'Goal Templates', icon: FileText },
    { id: 'analytics', label: 'Goal Analytics', icon: BarChart3 },
    { id: 'quiz', label: 'Financial IQ Quiz', icon: BrainCircuit },
    ...(user?.role === 'superadmin' ? [{ id: 'superadmin', label: '⚡ Super Admin Panel', icon: ShieldAlert }] : []),
  ];

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  const handleSelectNav = (id: string) => {
    setActiveTab(id);
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <>
      {/* Mobile Drawer Overlay Backdrop */}
      {isMobileOpen && (
        <div
          className="sidebar-mobile-backdrop"
          onClick={onCloseMobile}
        />
      )}

      <aside className={`sidebar ${isMobileOpen ? 'mobile-open' : ''}`}>
        <div
          className="sidebar-header"
          onClick={() => {
            setActiveTab('dashboard');
            if (onCloseMobile) onCloseMobile();
          }}
          style={{ cursor: 'pointer' }}
          title="Navigate to Dashboard"
        >
          <LifeOSLogo size={30} showSubtitle={false} />
          {onCloseMobile && (
            <button
              className="mobile-close-btn"
              onClick={(e) => {
                e.stopPropagation();
                onCloseMobile();
              }}
              title="Close Menu"
            >
              <X size={18} />
            </button>
          )}
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                className={`nav-item ${isActive ? 'active' : ''}`}
                onClick={() => handleSelectNav(item.id)}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </button>
            );
          })}

          <div style={{ margin: '16px 0 8px 12px', fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.5px' }}>
            AI Intelligence
          </div>

          <button
            className="nav-item"
            style={{ background: 'linear-gradient(135deg, rgba(37,99,235,0.2), rgba(124,58,237,0.2))', border: '1px solid rgba(59,130,246,0.3)' }}
            onClick={() => {
              openAskAI();
              if (onCloseMobile) onCloseMobile();
            }}
          >
            <Sparkles size={18} color="#60a5fa" />
            <span style={{ color: '#93c5fd', fontWeight: 600 }}>Ask LIFEOS AI</span>
          </button>
        </nav>

        {/* Pinned Bottom Section: Financial Health Score + Guest User Footer */}
        <div className="sidebar-bottom-container">
          {/* Financial Health Score Widget */}
          <div
            className="sidebar-health-card"
            onClick={() => handleSelectNav('analytics')}
            title="Click to view full Financial Health & Analytics"
          >
            <div className="health-card-header">
              <span className="health-card-label">Financial Health Score</span>
              <span className="health-card-status">{healthMetrics.status.toUpperCase()}</span>
            </div>

            <div className="health-card-body">
              {/* Circular Gauge */}
              <div className="health-gauge-wrapper">
                <svg width="52" height="52" viewBox="0 0 56 56">
                  <circle cx="28" cy="28" r="23" stroke="var(--border-color)" strokeWidth="5" fill="none" />
                  <circle cx="28" cy="28" r="23" stroke={healthMetrics.score >= 60 ? '#10b981' : healthMetrics.score >= 35 ? '#f59e0b' : '#ef4444'} strokeWidth="5" fill="none" strokeDasharray="144" strokeDashoffset={144 - (144 * healthMetrics.score / 100)} strokeLinecap="round" transform="rotate(-90 28 28)" />
                </svg>
                <div className="health-gauge-text">
                  <span className="health-score-value">{healthMetrics.score}</span>
                  <span className="health-score-max">/100</span>
                </div>
              </div>

              {/* Metric Breakdown Progress Rows */}
              <div className="health-metrics-list">
                <div className="health-metric-item">
                  <div className="health-metric-row">
                    <span className="metric-label">Emergency Fund</span>
                    <span className="metric-val" style={{ color: healthMetrics.emergencyFund >= 60 ? '#10b981' : '#f59e0b' }}>{healthMetrics.emergencyFund}%</span>
                  </div>
                  <div className="metric-bar-bg">
                    <div className="metric-bar-fill" style={{ width: `${healthMetrics.emergencyFund}%`, background: healthMetrics.emergencyFund >= 60 ? '#10b981' : '#f59e0b' }}></div>
                  </div>
                </div>

                <div className="health-metric-item">
                  <div className="health-metric-row">
                    <span className="metric-label">Savings Rate</span>
                    <span className="metric-val" style={{ color: healthMetrics.savingsRate >= 50 ? '#10b981' : '#f59e0b' }}>{healthMetrics.savingsRate}%</span>
                  </div>
                  <div className="metric-bar-bg">
                    <div className="metric-bar-fill" style={{ width: `${healthMetrics.savingsRate}%`, background: healthMetrics.savingsRate >= 50 ? '#10b981' : '#f59e0b' }}></div>
                  </div>
                </div>

                <div className="health-metric-item">
                  <div className="health-metric-row">
                    <span className="metric-label">Debt to Income</span>
                    <span className="metric-val" style={{ color: healthMetrics.debtToIncome <= 40 ? '#3b82f6' : '#ef4444' }}>{healthMetrics.debtToIncome}%</span>
                  </div>
                  <div className="metric-bar-bg">
                    <div className="metric-bar-fill" style={{ width: `${healthMetrics.debtToIncome}%`, background: healthMetrics.debtToIncome <= 40 ? '#3b82f6' : '#ef4444' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* User Profile Footer */}
          <div className="sidebar-footer">
            <div
              className="user-profile"
              onClick={() => {
                setAuthView('login');
                setShowAuthModal(true);
                if (onCloseMobile) onCloseMobile();
              }}
              title="Click to view Account / Auth Settings"
            >
              <div className="avatar">
                {user ? getInitials(user.name) : 'GU'}
              </div>
              <div className="user-details">
                <span className="user-name">
                  {user ? user.name : 'Guest User'}
                  {token && <UserCheck size={12} className="text-emerald-400" title="JWT Authenticated" />}
                </span>
                <span className="user-plan">
                  {user ? (user.role === 'superadmin' ? '⚡ Super Admin' : '🧑‍💼 Standard User') : '👤 Guest Account'}
                </span>
              </div>
            </div>

            {/* Read-only Role Badge */}
            <div
              style={{
                padding: '4px 8px',
                borderRadius: 6,
                background: user?.role === 'superadmin'
                  ? 'rgba(239, 68, 68, 0.1)'
                  : user
                    ? 'rgba(16, 185, 129, 0.1)'
                    : 'rgba(245, 158, 11, 0.1)',
                border: `1px solid ${user?.role === 'superadmin' ? 'rgba(239, 68, 68, 0.25)' : user ? 'rgba(16, 185, 129, 0.25)' : 'rgba(245, 158, 11, 0.25)'}`,
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                width: '100%',
                cursor: !user ? 'pointer' : 'default',
              }}
              onClick={() => {
                if (!user) {
                  setAuthView('login');
                  setShowAuthModal(true);
                  if (onCloseMobile) onCloseMobile();
                }
              }}
              title={!user ? 'Log in for full access' : `Your role: ${user.role}`}
            >
              <Shield size={11} color={user?.role === 'superadmin' ? '#ef4444' : user ? '#10b981' : '#f59e0b'} />
              <span style={{
                fontSize: 10,
                fontWeight: 700,
                color: user?.role === 'superadmin' ? '#ef4444' : user ? '#10b981' : '#f59e0b',
                letterSpacing: '0.4px',
                textTransform: 'uppercase',
              }}>
                {user?.role === 'superadmin' ? '⚡ Super Admin' : user ? '✓ Authenticated' : '🔒 Guest Mode'}
              </span>
              {!user && (
                <span style={{ marginLeft: 'auto', fontSize: 9.5, color: '#60a5fa', fontWeight: 600 }}>
                  Log In →
                </span>
              )}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};


