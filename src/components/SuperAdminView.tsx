import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import {
  ShieldAlert,
  Cpu,
  Users,
  Database,
  Activity,
  CheckCircle2,
  Zap,
  RefreshCw,
  Sliders,
  Sparkles,
  UserCheck,
  Server,
  LogIn,
  Shield,
  Briefcase
} from 'lucide-react';
import { CATaxAdvisorView } from './CATaxAdvisorView';
import {
  fetchAdminStatsApi,
  fetchAdminUsersApi,
  updateUserRoleApi,
  fetchAIModelConfig,
  updateAIModelConfig,
  askOllamaAIChat,
  resetAndSeedDatabaseApi
} from '../api';

export const SuperAdminView: React.FC = () => {
  const { user, setShowAuthModal, setAuthView, login } = useAuth();
  const { showConfirm, showToast } = useNotification();
  const [activeAdminTab, setActiveAdminTab] = useState<'telemetry' | 'ca-advisor'>('telemetry');

  const [stats, setStats] = useState<any>(null);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('llama3');
  const [availableModels, setAvailableModels] = useState<string[]>(['llama3', 'mistral', 'gemma', 'codellama', 'phi3']);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [aiTestLatency, setAiTestLatency] = useState<number | null>(null);
  const [aiTestResponse, setAiTestResponse] = useState<string>('');
  const [isTestingAI, setIsTestingAI] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('');

  const isSuperAdmin = user?.role === 'superadmin' || user?.email?.includes('admin');

  const loadAdminData = async () => {
    setIsLoading(true);
    try {
      const [st, usr, aiCfg] = await Promise.all([
        fetchAdminStatsApi(),
        fetchAdminUsersApi(),
        fetchAIModelConfig(),
      ]);
      setStats(st);
      setUsersList(usr);
      if (aiCfg.currentModel) setSelectedModel(aiCfg.currentModel);
      if (aiCfg.availableModels && aiCfg.availableModels.length > 0) {
        setAvailableModels(aiCfg.availableModels);
      }
    } catch (err) {
      console.warn('Failed to load admin data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isSuperAdmin) {
      loadAdminData();
    }
  }, [isSuperAdmin]);

  const handleModelChange = async (newModel: string) => {
    setSelectedModel(newModel);
    const res = await updateAIModelConfig(newModel);
    setStatusMessage(res.message || `Active AI Model set to ${newModel}`);
    setTimeout(() => setStatusMessage(''), 4000);
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    const res = await updateUserRoleApi(userId, newRole);
    setStatusMessage(res.message || `User role updated to ${newRole}`);
    setUsersList((prev) =>
      prev.map((u) => (u._id === userId || u.id === userId ? { ...u, role: newRole } : u))
    );
    setTimeout(() => setStatusMessage(''), 4000);
  };

  const handleTestAILatency = async () => {
    setIsTestingAI(true);
    setAiTestResponse('');
    const start = Date.now();
    try {
      const res = await askOllamaAIChat('Test super admin ping response', [], selectedModel);
      const elapsed = Date.now() - start;
      setAiTestLatency(elapsed);
      setAiTestResponse(res.response);
    } catch (err: any) {
      setAiTestResponse('Error reaching AI model: ' + err.message);
    } finally {
      setIsTestingAI(false);
    }
  };

  if (!isSuperAdmin) {
    return (
      <div className="content-area" style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div 
          className="metric-card" 
          style={{ 
            maxWidth: 520, 
            width: '100%', 
            padding: '36px 28px', 
            textAlign: 'center', 
            borderRadius: 24, 
            background: 'var(--bg-card)', 
            border: '1px solid var(--border-color)', 
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 18
          }}
        >
          <div 
            style={{ 
              width: 64, 
              height: 64, 
              borderRadius: 20, 
              background: 'rgba(239, 68, 68, 0.15)', 
              border: '1px solid rgba(239, 68, 68, 0.3)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}
          >
            <ShieldAlert size={32} color="#ef4444" />
          </div>

          <div>
            <span style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#ef4444', background: 'rgba(239, 68, 68, 0.12)', padding: '3px 10px', borderRadius: 6 }}>
              Super Admin Access Restricted
            </span>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-main)', margin: '10px 0 6px 0' }}>
              Admin Permission Required ⚡
            </h2>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>
              You are currently in <strong>{user ? 'Standard User' : 'Guest'} Mode</strong>. The Super Admin Executive Control Center is restricted to system administrators for telemetry, LLM model configuration, and database user management.
            </p>
          </div>

          <div style={{ width: '100%', padding: '14px', borderRadius: 12, background: 'var(--bg-card-elevated)', border: '1px solid var(--border-color)', textAlign: 'left', fontSize: 12, color: 'var(--text-muted)' }}>
            <div style={{ fontWeight: 700, color: 'var(--text-main)', marginBottom: 4 }}>🔑 Official Demo Credentials:</div>
            <div>Super Admin: <code>charanteja_admin.lifeos.io</code></div>
            <div>Pro User: <code>charanteja_user.lifeos.io</code></div>
          </div>

          <div style={{ display: 'flex', gap: 10, width: '100%', marginTop: 6, flexWrap: 'wrap' }}>
            <button
              className="btn-primary"
              style={{ flex: 1, minWidth: 160, background: '#ef4444', borderColor: '#ef4444', height: 38 }}
              onClick={async () => {
                try {
                  await login('charanteja_admin.lifeos.io', 'admin123');
                  loadAdminData();
                } catch (e) {
                  setAuthView('login');
                  setShowAuthModal(true);
                }
              }}
            >
              <LogIn size={16} />
              <span>Log In as Super Admin</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="content-area">
      {/* Header */}
      <div className="page-header">
        <div className="page-title-group">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', padding: '4px 10px', borderRadius: 8, fontSize: 12, fontWeight: 800 }}>
              SUPER ADMIN MODE
            </span>
            <h1>Admin Control Center ⚡</h1>
          </div>
          <p>System telemetry, Ollama LLM model management, database health & CA Zero-Tax Executive Suite.</p>
        </div>

        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <button 
            className="btn-secondary"
            style={{ borderColor: 'rgba(239, 68, 68, 0.3)', color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)' }}
            onClick={async () => {
              const confirmed = await showConfirm(
                'Purge & Re-seed Database?',
                'Are you sure you want to clear out old data and re-seed clean defaults for charanteja_admin.lifeos.io & charanteja_user.lifeos.io?'
              );
              if (confirmed) {
                const res = await resetAndSeedDatabaseApi();
                showToast(res.message, 'success');
                setTimeout(() => window.location.reload(), 1000);
              }
            }}
          >
            <RefreshCw size={14} />
            <span>Purge DB & Re-seed</span>
          </button>

          <div style={{ display: 'flex', gap: 6, background: 'var(--bg-card)', padding: 4, borderRadius: 10, border: '1px solid var(--border-color)' }}>
            <button
              onClick={() => setActiveAdminTab('telemetry')}
              style={{
                padding: '6px 14px',
                borderRadius: 7,
                fontSize: 12,
                fontWeight: 700,
                border: 'none',
                background: activeAdminTab === 'telemetry' ? 'var(--accent-primary)' : 'transparent',
                color: activeAdminTab === 'telemetry' ? '#fff' : 'var(--text-muted)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}
            >
              <Cpu size={14} />
              <span>Telemetry & LLM</span>
            </button>
            <button
              onClick={() => setActiveAdminTab('ca-advisor')}
              style={{
                padding: '6px 14px',
                borderRadius: 7,
                fontSize: 12,
                fontWeight: 700,
                border: 'none',
                background: activeAdminTab === 'ca-advisor' ? 'var(--accent-primary)' : 'transparent',
                color: activeAdminTab === 'ca-advisor' ? '#fff' : 'var(--text-muted)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}
            >
              <Briefcase size={14} />
              <span>CA AI & Zero-Tax Suite 💼</span>
            </button>
          </div>

          <button className="btn-secondary" onClick={loadAdminData} disabled={isLoading}>
            <RefreshCw size={16} className={isLoading ? 'spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {activeAdminTab === 'ca-advisor' ? (
        <CATaxAdvisorView />
      ) : (
        <>

      {statusMessage && (
        <div style={{ padding: '12px 16px', borderRadius: 12, background: 'rgba(16, 185, 129, 0.15)', border: '1px solid #10b981', color: '#10b981', fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
          <CheckCircle2 size={16} />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Metrics Row */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">Registered Users</span>
            <div className="metric-icon" style={{ background: 'rgba(37, 99, 235, 0.15)', color: '#3b82f6' }}>
              <Users size={18} />
            </div>
          </div>
          <span className="metric-value">{usersList.length || stats?.users || 1} Users</span>
          <div className="metric-bottom">
            <span className="metric-trend trend-up">MongoDB Atlas Sync</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">Total Goals in DB</span>
            <div className="metric-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
              <Database size={18} />
            </div>
          </div>
          <span className="metric-value">{stats?.goals || 0} Goals</span>
          <div className="metric-bottom">
            <span className="metric-trend trend-up">+ Live Life Events</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">Database Status</span>
            <div className="metric-icon" style={{ background: 'rgba(168, 85, 247, 0.15)', color: '#a855f7' }}>
              <Server size={18} />
            </div>
          </div>
          <span className="metric-value" style={{ color: '#10b981', fontSize: 20 }}>
            {stats?.dbStatus || 'Connected'}
          </span>
          <div className="metric-bottom">
            <span className="metric-trend trend-up">Port 5001 • MongoDB Atlas</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">Active AI Model</span>
            <div className="metric-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>
              <Cpu size={18} />
            </div>
          </div>
          <span className="metric-value" style={{ color: '#60a5fa', fontSize: 20 }}>
            {selectedModel}
          </span>
          <div className="metric-bottom">
            <span className="metric-trend trend-up">Ollama LLM Engine</span>
          </div>
        </div>
      </div>

      {/* AI Management & Controls */}
      <div className="calculators-grid">
        <div className="metric-card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Cpu size={18} color="#3b82f6" />
              Ollama AI Model Management
            </h3>
            <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 8, background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
              SUPER ADMIN EXCLUSIVE
            </span>
          </div>

          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            Switch the default local LLM engine powering goal generation, tax calculations, and AI financial recommendations.
          </p>

          <div className="form-group">
            <label className="form-label">Active Ollama Model:</label>
            <select
              className="form-control"
              value={selectedModel}
              onChange={(e) => handleModelChange(e.target.value)}
              style={{ background: 'var(--bg-main)', color: 'var(--text-main)', fontWeight: 800 }}
            >
              {availableModels.map((m) => (
                <option key={m} value={m}>
                  {m} (Ollama Local Model)
                </option>
              ))}
            </select>
          </div>

          <div style={{ padding: 14, borderRadius: 12, background: 'var(--bg-main)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)' }}>System Host Endpoint</div>
            <div style={{ fontSize: 14, fontWeight: 800, color: '#38bdf8' }}>http://localhost:11434</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Fallback: Heuristic Financial Engine enabled when offline.</div>
          </div>

          <button className="btn-primary" onClick={handleTestAILatency} disabled={isTestingAI}>
            <Sparkles size={16} />
            <span>{isTestingAI ? 'Testing LLM Latency...' : `Test ${selectedModel} Ping & Latency`}</span>
          </button>

          {aiTestLatency !== null && (
            <div style={{ padding: 12, borderRadius: 10, background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)', fontSize: 12 }}>
              <div style={{ fontWeight: 800, color: '#60a5fa' }}>Latency: {aiTestLatency} ms</div>
              <div style={{ color: 'var(--text-main)', marginTop: 4 }}>{aiTestResponse}</div>
            </div>
          )}
        </div>

        {/* User Management Panel */}
        <div className="metric-card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <UserCheck size={18} color="#10b981" />
            User Roles & Permissions
          </h3>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            Manage permissions and promote authenticated users to Super Admin status.
          </p>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '8px 4px' }}>User</th>
                  <th style={{ padding: '8px 4px' }}>Role</th>
                  <th style={{ padding: '8px 4px' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {usersList.length > 0 ? (
                  usersList.map((u) => (
                    <tr key={u._id || u.id || u.email} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '10px 4px' }}>
                        <div style={{ fontWeight: 800, color: 'var(--text-main)' }}>{u.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{u.email}</div>
                      </td>
                      <td style={{ padding: '10px 4px' }}>
                        <span style={{
                          padding: '2px 8px',
                          borderRadius: 12,
                          fontSize: 10,
                          fontWeight: 800,
                          background: u.role === 'superadmin' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(37, 99, 235, 0.2)',
                          color: u.role === 'superadmin' ? '#ef4444' : '#3b82f6',
                        }}>
                          {u.role || 'Goal Manager'}
                        </span>
                      </td>
                      <td style={{ padding: '10px 4px' }}>
                        <button
                          className="btn-secondary"
                          style={{ padding: '4px 8px', fontSize: 11 }}
                          onClick={() => handleRoleChange(u._id || u.id, u.role === 'superadmin' ? 'Goal Manager' : 'superadmin')}
                        >
                          {u.role === 'superadmin' ? 'Demote' : 'Make Super Admin'}
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} style={{ padding: 16, textAlign: 'center', color: 'var(--text-muted)' }}>
                      Logged in user active. No extra registered users in database yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
        </>
      )}
    </div>
  );
};
