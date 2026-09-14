import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Lock, Mail, User as UserIcon, Key, ArrowRight, CheckCircle, AlertCircle, Eye, EyeOff, ShieldCheck } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const {
    showAuthModal,
    setShowAuthModal,
    authView,
    setAuthView,
    login,
    signup,
    forgotPassword,
    resetPassword,
    user,
    logout,
  } = useAuth();

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Status & Messaging
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [generatedToken, setGeneratedToken] = useState<string | null>(null);

  if (!showAuthModal) return null;

  const resetFormState = () => {
    setError(null);
    setSuccess(null);
    setGeneratedToken(null);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    resetFormState();
    setLoading(true);
    try {
      await login(email, password);
      setSuccess('Logged in successfully!');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    resetFormState();

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await signup(name, email, password);
      setSuccess('Account created and logged in successfully!');
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    resetFormState();
    setLoading(true);
    try {
      const res = await forgotPassword(email);
      setSuccess(res.message || 'Reset token generated!');
      if (res.resetToken) {
        setGeneratedToken(res.resetToken);
        setResetToken(res.resetToken);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to request password reset.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    resetFormState();
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      await resetPassword(resetToken, password);
      setSuccess('Password reset successfully! You can now log in.');
      setTimeout(() => {
        setAuthView('login');
        resetFormState();
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Password reset failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-modal-overlay" onClick={() => setShowAuthModal(false)}>
      <div className="auth-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="native-sheet-pill" />
        {/* Header Banner */}
        <div className="auth-header-banner">
          <button
            onClick={() => setShowAuthModal(false)}
            className="auth-close-btn"
            title="Close"
          >
            <X size={18} />
          </button>
          <div className="auth-badge-row">
            <ShieldCheck size={18} className="auth-badge-icon" />
            <span className="auth-badge-text">
              LIFEOS Auth Engine
            </span>
          </div>
          <h2 className="auth-modal-title">
            {user
              ? `Logged In as ${user.name.split(' ')[0]}`
              : authView === 'login'
              ? 'Welcome Back'
              : authView === 'signup'
              ? 'Create Your Account'
              : authView === 'forgot'
              ? 'Reset Password'
              : 'Set New Password'}
          </h2>
          <p className="auth-modal-subtitle">
            {user
              ? 'Your account is active. Goals, life events, and AI recommendations are synchronized.'
              : authView === 'login'
              ? 'Log in to sync your custom financial goals and life events across devices.'
              : authView === 'signup'
              ? 'Join LIFEOS to unlock multi-currency goal tracking & conflict engine.'
              : authView === 'forgot'
              ? 'Enter your registered email address to receive reset instructions.'
              : 'Provide your reset token and enter a new password.'}
          </p>
        </div>

        {/* Form Container */}
        <div className="auth-modal-body">
          {user ? (
            /* Dedicated Logged In Profile View */
            <div className="auth-profile-card">
              <div className="auth-profile-header">
                <div className="auth-profile-avatar">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="auth-profile-details">
                  <div className="auth-profile-name-row">
                    <h3 className="auth-profile-name">{user.name}</h3>
                    <span className={`auth-role-badge ${user.role === 'superadmin' ? 'admin' : 'user'}`}>
                      {user.role === 'superadmin' ? '⚡ Super Admin' : 'Goal Manager'}
                    </span>
                  </div>
                  <p className="auth-profile-email">{user.email}</p>
                </div>
              </div>

              <div className="auth-session-meta">
                <div className="auth-meta-item">
                  <span className="auth-meta-label">Session Status</span>
                  <span className="auth-meta-value active">● Active (JWT Token Verified)</span>
                </div>
                <div className="auth-meta-item">
                  <span className="auth-meta-label">Storage Engine</span>
                  <span className="auth-meta-value">MongoDB Atlas + Local Cache</span>
                </div>
              </div>

              <div className="auth-profile-actions">
                <button
                  onClick={() => {
                    logout();
                    setSuccess('Logged out successfully.');
                  }}
                  className="auth-logout-btn-primary"
                >
                  Log Out of LIFEOS
                </button>
                <button
                  onClick={() => setShowAuthModal(false)}
                  className="btn-secondary"
                  style={{ flex: 1 }}
                >
                  Continue to App
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Navigation Tabs */}
              {authView !== 'reset' && (
                <div className="auth-nav-tabs">
                  <button
                    type="button"
                    onClick={() => {
                      setAuthView('login');
                      resetFormState();
                    }}
                    className={`auth-tab-item ${authView === 'login' ? 'active' : ''}`}
                  >
                    Log In
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthView('signup');
                      resetFormState();
                    }}
                    className={`auth-tab-item ${authView === 'signup' ? 'active' : ''}`}
                  >
                    Sign Up
                  </button>
                </div>
              )}

              {/* Feedback Messages */}
              {error && (
                <div className="auth-banner-error">
                  <AlertCircle size={18} className="shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div className="auth-banner-success">
                  <CheckCircle size={18} className="shrink-0" />
                  <div>
                    <span>{success}</span>
                    {generatedToken && (
                      <div className="auth-token-box">
                        Reset Token: <strong>{generatedToken}</strong>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* LOGIN VIEW */}
              {authView === 'login' && (
                <form onSubmit={handleLoginSubmit} className="auth-form">
                  {/* Quick Demo Login Bar */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 14, padding: 12, borderRadius: 12, background: 'var(--bg-main)', border: '1px solid var(--border-color)' }}>
                    <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      ⚡ 1-Click Demo Logins
                    </span>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        className="btn-secondary"
                        style={{ fontSize: 11, padding: '8px 10px', flex: 1, justifyContent: 'center', fontWeight: 700 }}
                        onClick={() => {
                          const demoEmail = 'charanteja_user.lifeos.io';
                          setEmail(demoEmail);
                          setPassword('user123');
                          login(demoEmail, 'user123');
                        }}
                      >
                        👤 Goal Manager
                      </button>
                      <button
                        type="button"
                        className="btn-secondary"
                        style={{ fontSize: 11, padding: '8px 10px', flex: 1, justifyContent: 'center', fontWeight: 700, borderColor: 'rgba(239, 68, 68, 0.4)', color: '#ef4444' }}
                        onClick={() => {
                          const demoEmail = 'charanteja_admin.lifeos.io';
                          setEmail(demoEmail);
                          setPassword('admin123');
                          login(demoEmail, 'admin123');
                        }}
                      >
                        ⚡ Super Admin
                      </button>
                    </div>
                  </div>

                  <div className="auth-form-group">
                    <label>Email Address or Username</label>
                    <div className="auth-input-wrapper">
                      <Mail size={18} className="auth-input-icon" />
                      <input
                        type="text"
                        inputMode="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="charanteja_admin.lifeos.io or user@lifeos.io"
                        className="auth-input-field"
                      />
                    </div>
                  </div>

              <div className="auth-form-group">
                <div className="auth-label-row">
                  <label>Password</label>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthView('forgot');
                      resetFormState();
                    }}
                    className="auth-link-btn"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="auth-input-wrapper">
                  <Lock size={18} className="auth-input-icon" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="auth-input-field"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="auth-toggle-pwd"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="auth-submit-btn"
              >
                {loading ? (
                  <span>Authenticating...</span>
                ) : (
                  <>
                    <span>Log In to LIFEOS</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>

              <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', marginBottom: 8 }}>
                  ⚡ Quick Demo Login Accounts:
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <button
                    type="button"
                    onClick={() => {
                      const demoEmail = 'charanteja_admin.lifeos.io';
                      setEmail(demoEmail);
                      setPassword('admin123');
                      login(demoEmail, 'admin123');
                    }}
                    style={{
                      padding: '8px 12px',
                      borderRadius: 8,
                      background: 'rgba(37, 99, 235, 0.12)',
                      border: '1px solid rgba(59, 130, 246, 0.3)',
                      color: '#60a5fa',
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <span>⚡ charanteja_admin.lifeos.io</span>
                    <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: 'rgba(37, 99, 235, 0.25)' }}>Super Admin</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const demoEmail = 'charanteja_user.lifeos.io';
                      setEmail(demoEmail);
                      setPassword('user123');
                      login(demoEmail, 'user123');
                    }}
                    style={{
                      padding: '8px 12px',
                      borderRadius: 8,
                      background: 'rgba(16, 185, 129, 0.12)',
                      border: '1px solid rgba(16, 185, 129, 0.3)',
                      color: '#34d399',
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <span>👤 charanteja_user.lifeos.io</span>
                    <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: 'rgba(16, 185, 129, 0.25)' }}>Pro User</span>
                  </button>
                </div>
              </div>
            </form>
          )}


          {/* SIGNUP VIEW */}
          {authView === 'signup' && (
            <form onSubmit={handleSignupSubmit} className="auth-form">
              <div className="auth-form-group">
                <label>Full Name</label>
                <div className="auth-input-wrapper">
                  <UserIcon size={18} className="auth-input-icon" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Priya Sharma"
                    className="auth-input-field"
                  />
                </div>
              </div>

              <div className="auth-form-group">
                <label>Email Address</label>
                <div className="auth-input-wrapper">
                  <Mail size={18} className="auth-input-icon" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="priya.sharma@lifeos.io"
                    className="auth-input-field"
                  />
                </div>
              </div>

              <div className="auth-form-group">
                <label>Password</label>
                <div className="auth-input-wrapper">
                  <Lock size={18} className="auth-input-icon" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="auth-input-field"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="auth-toggle-pwd"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="auth-form-group">
                <label>Confirm Password</label>
                <div className="auth-input-wrapper">
                  <Lock size={18} className="auth-input-icon" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat password"
                    className="auth-input-field"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="auth-submit-btn"
              >
                {loading ? (
                  <span>Registering...</span>
                ) : (
                  <>
                    <span>Create Free Account</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>
          )}

          {/* FORGOT PASSWORD VIEW */}
          {authView === 'forgot' && (
            <form onSubmit={handleForgotSubmit} className="auth-form">
              <div className="auth-form-group">
                <label>Registered Email Address</label>
                <div className="auth-input-wrapper">
                  <Mail size={18} className="auth-input-icon" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="rajesh.kumar@lifeos.io"
                    className="auth-input-field"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="auth-submit-btn teal"
              >
                {loading ? <span>Generating Token...</span> : <span>Generate Password Reset Token</span>}
              </button>

              {generatedToken && (
                <button
                  type="button"
                  onClick={() => {
                    setAuthView('reset');
                    setError(null);
                  }}
                  className="auth-submit-btn indigo"
                >
                  Proceed to Reset Password Form →
                </button>
              )}

              <div className="auth-center-link">
                <button
                  type="button"
                  onClick={() => {
                    setAuthView('login');
                    resetFormState();
                  }}
                  className="auth-link-btn"
                >
                  ← Back to Login
                </button>
              </div>
            </form>
          )}

          {/* RESET PASSWORD VIEW */}
          {authView === 'reset' && (
            <form onSubmit={handleResetSubmit} className="auth-form">
              <div className="auth-form-group">
                <label>Reset Token</label>
                <div className="auth-input-wrapper">
                  <Key size={16} className="auth-input-icon" />
                  <input
                    type="text"
                    required
                    value={resetToken}
                    onChange={(e) => setResetToken(e.target.value)}
                    placeholder="Paste reset token here"
                    className="auth-input-field font-mono"
                  />
                </div>
              </div>

              <div className="auth-form-group">
                <label>New Password</label>
                <div className="auth-input-wrapper">
                  <Lock size={16} className="auth-input-icon" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="auth-input-field"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="auth-toggle-pwd"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="auth-form-group">
                <label>Confirm New Password</label>
                <div className="auth-input-wrapper">
                  <Lock size={16} className="auth-input-icon" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat new password"
                    className="auth-input-field"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="auth-submit-btn indigo"
              >
                {loading ? <span>Updating Password...</span> : <span>Update Password & Log In</span>}
              </button>

              <div className="auth-center-link">
                <button
                  type="button"
                  onClick={() => {
                    setAuthView('login');
                    resetFormState();
                  }}
                  className="auth-link-btn"
                >
                  ← Return to Login
                </button>
              </div>
            </form>
          )}

            </>
          )}
        </div>
      </div>
    </div>
  );
};
