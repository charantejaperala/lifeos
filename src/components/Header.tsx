import React, { useState } from 'react';
import { Search, Bell, Sun, Moon, Sparkles, User as UserIcon, LogIn, Menu, Download, Shield, FileText } from 'lucide-react';
import { FX_SYMBOLS } from '../utils/calculations';
import { useAuth } from '../context/AuthContext';
import { useRealtimeContext } from '../utils/realtimeContext';
import { LifeOSLogo } from './LifeOSLogo';

export interface HeaderProps {
  currentCurrency: string;
  setCurrency: (curr: string) => void;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  openAskAI: () => void;
  toggleMobileMenu?: () => void;
  onExportReport?: (type: 'pdf' | 'csv' | 'json') => void;
  onNavigateTab?: (tab: string) => void;
  onOpenNotifications?: () => void;
  unreadCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentCurrency,
  setCurrency,
  theme,
  toggleTheme,
  openAskAI,
  toggleMobileMenu,
  onExportReport,
  onNavigateTab,
  onOpenNotifications,
  unreadCount = 0,
}) => {
  const currencies = ['INR', 'USD', 'EUR', 'GBP'];
  const { user, token, setShowAuthModal, setAuthView } = useAuth();
  const { dateStr, timeStr, city, countryCode, country, tempStr, weatherIcon } = useRealtimeContext();
  const [showExportMenu, setShowExportMenu] = useState(false);

  return (
    <header className="top-header">
      <div className="header-left">
        {toggleMobileMenu && (
          <button
            className="mobile-hamburger-btn"
            onClick={toggleMobileMenu}
            title="Toggle Menu"
            aria-label="Toggle Navigation Menu"
          >
            <Menu size={16} />
          </button>
        )}

        <div 
          className="mobile-brand-logo"
          onClick={() => onNavigateTab?.('dashboard')}
          style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
          title="Go to Dashboard"
        >
          <LifeOSLogo size={24} showText={true} showSubtitle={false} />
        </div>

        <div className="search-box" onClick={openAskAI}>
          <Search size={15} color="#38bdf8" />
          <input
            type="text"
            className="search-input"
            placeholder='Ask AI or search goals, calculations & reports...'
            readOnly
            onClick={openAskAI}
          />
          <span className="kbd-shortcut">⌘ K</span>
        </div>
      </div>

      <div className="header-right">
        <button
          className="btn-secondary header-ai-btn desktop-only"
          onClick={openAskAI}
        >
          <Sparkles size={14} color="#2563eb" />
          <span>Ask AI Assistant</span>
        </button>

        {/* Desktop FX Selector */}
        <div className="fx-selector desktop-only">
          <span style={{ color: 'var(--text-muted)', fontSize: 11, fontWeight: 700 }}>FX:</span>
          {currencies.map((curr) => (
            <button
              key={curr}
              className={`fx-btn ${currentCurrency === curr ? 'active' : ''}`}
              onClick={() => setCurrency(curr)}
            >
              {FX_SYMBOLS[curr]} {curr}
            </button>
          ))}
        </div>

        {/* Mobile Single Cycle FX Selector */}
        <button
          className="fx-btn active mobile-only-fx"
          onClick={() => {
            const nextIdx = (currencies.indexOf(currentCurrency) + 1) % currencies.length;
            setCurrency(currencies[nextIdx]);
          }}
          title="Tap to change currency"
        >
          {FX_SYMBOLS[currentCurrency]} {currentCurrency}
        </button>

        <div className="header-weather-widget" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', height: 32, padding: '0 var(--space-3)', borderRadius: 'var(--radius-md)', background: 'var(--bg-card-elevated)', border: '1px solid var(--border-color)', fontSize: '11px', color: 'var(--text-muted)', flexShrink: 0 }}>
          <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>📍 {city}, {countryCode || country}</span>
          <span style={{ opacity: 0.4 }}>•</span>
          <span style={{ color: '#60a5fa', fontWeight: 600 }}>{timeStr}</span>
          <span style={{ opacity: 0.4 }}>•</span>
          <span>{weatherIcon} {tempStr}</span>
        </div>

        {/* Role Badge (read-only) */}
        <div
          className={`header-role-badge ${user?.role === 'superadmin' ? 'role-admin' : user ? 'role-user' : 'role-guest'}`}
          onClick={() => {
            if (!user) {
              setAuthView('login');
              setShowAuthModal(true);
            }
          }}
          title={!user ? 'Click to Log In for full access' : `Role: ${user.role}`}
        >
          <Shield size={12} className="role-icon" color={user?.role === 'superadmin' ? '#ef4444' : user ? '#10b981' : '#f59e0b'} />
          <span>{user?.role === 'superadmin' ? 'Admin' : user ? 'User' : 'Guest'}</span>
        </div>

        {/* Report Export Button */}
        {onExportReport && (
          <div className="header-export-btn" style={{ position: 'relative' }}>
            <button
              className="icon-btn"
              onClick={() => setShowExportMenu(!showExportMenu)}
              title="Export Financial Reports & Data Backups"
            >
              <Download size={16} />
            </button>
            {showExportMenu && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: 6,
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 8,
                  boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                  padding: 6,
                  width: 170,
                  zIndex: 100,
                }}
              >
                <button
                  className="dropdown-item-btn"
                  onClick={() => {
                    onExportReport('pdf');
                    setShowExportMenu(false);
                  }}
                  style={{ width: '100%', textAlign: 'left', padding: '8px 10px', fontSize: '12px', background: 'transparent', border: 'none', color: 'var(--text-main)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
                >
                  <FileText size={14} color="#3b82f6" /> Print / Save PDF
                </button>
                <button
                  className="dropdown-item-btn"
                  onClick={() => {
                    onExportReport('csv');
                    setShowExportMenu(false);
                  }}
                  style={{ width: '100%', textAlign: 'left', padding: '8px 10px', fontSize: '12px', background: 'transparent', border: 'none', color: 'var(--text-main)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
                >
                  <Download size={14} color="#10b981" /> Export CSV Data
                </button>
                <button
                  className="dropdown-item-btn"
                  onClick={() => {
                    onExportReport('json');
                    setShowExportMenu(false);
                  }}
                  style={{ width: '100%', textAlign: 'left', padding: '8px 10px', fontSize: '12px', background: 'transparent', border: 'none', color: 'var(--text-main)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
                >
                  <Download size={14} color="#8b5cf6" /> Backup JSON State
                </button>
              </div>
            )}
          </div>
        )}

        <button className="icon-btn header-theme-btn" onClick={toggleTheme} title="Toggle Dark/Light Mode">
          {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
        </button>

        <button 
          className="icon-btn header-bell-btn" 
          onClick={onOpenNotifications} 
          title="Notifications & Financial Tips"
          style={{ position: 'relative' }}
        >
          <Bell size={16} />
          {unreadCount > 0 && (
            <span 
              className="badge-dot" 
              style={{
                background: '#ef4444',
                color: '#fff',
                fontSize: '9px',
                fontWeight: 800,
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'absolute',
                top: '-2px',
                right: '-2px',
                border: '2px solid var(--bg-card)'
              }}
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {/* User Account / Auth Button */}
        <button
          onClick={() => {
            setAuthView('login');
            setShowAuthModal(true);
          }}
          className={`auth-header-btn ${user ? 'is-user' : 'is-guest'}`}
          title={token ? `Logged in as ${user?.name}` : "Click to log in or manage account"}
        >
          {user ? (
            <>
              <div className="user-avatar-badge">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <span className="user-name-label">{user.name.split(' ')[0]}</span>
              {token && <span className="active-token-ping" title="Authenticated via JWT"></span>}
            </>
          ) : (
            <>
              <LogIn size={14} style={{ color: '#60a5fa' }} />
              <span className="user-name-label">Log In</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
};


