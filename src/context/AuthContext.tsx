import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { loginApi, signupApi, forgotPasswordApi, resetPasswordApi, getMeApi } from '../api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  signup: (name: string, email: string, pass: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<{ resetToken?: string; message?: string }>;
  resetPassword: (resetToken: string, newPass: string) => Promise<void>;
  logout: () => void;

  showAuthModal: boolean;
  setShowAuthModal: (show: boolean) => void;
  authView: 'login' | 'signup' | 'forgot' | 'reset';
  setAuthView: (view: 'login' | 'signup' | 'forgot' | 'reset') => void;
  requireAuth: (callback: () => void, actionName?: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('lifeos_token'));
  const [loading, setLoading] = useState<boolean>(true);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [authView, setAuthView] = useState<'login' | 'signup' | 'forgot' | 'reset'>('login');

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('lifeos_token');
      if (storedToken) {
        try {
          const data = await getMeApi();
          if (data.user) {
            setUser(data.user);
          } else {
            logout();
          }
        } catch (err) {
          console.warn('Session expired or invalid token:', err);
          logout();
        }
      } else {
        // No token saved: default strictly to Guest User mode
        setUser(null);
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, pass: string) => {
    const res = await loginApi(email, pass);
    if (res.token && res.user) {
      setToken(res.token);
      setUser(res.user);
      localStorage.setItem('lifeos_token', res.token);
      localStorage.setItem('lifeos_demo_user', JSON.stringify(res.user));
      setShowAuthModal(false);
    }
  };

  const signup = async (name: string, email: string, pass: string) => {
    const res = await signupApi(name, email, pass);
    if (res.token && res.user) {
      setToken(res.token);
      setUser(res.user);
      localStorage.setItem('lifeos_token', res.token);
      localStorage.setItem('lifeos_demo_user', JSON.stringify(res.user));
      setShowAuthModal(false);
    }
  };

  const forgotPassword = async (email: string) => {
    const res = await forgotPasswordApi(email);
    return res;
  };

  const resetPassword = async (resetToken: string, newPass: string) => {
    await resetPasswordApi(resetToken, newPass);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('lifeos_token');
    localStorage.removeItem('lifeos_demo_user');
  };



  const requireAuth = (callback: () => void, actionName?: string): boolean => {
    const activeToken = token || localStorage.getItem('lifeos_token');
    if (!activeToken && !user) {
      setAuthView('login');
      setShowAuthModal(true);
      return false;
    }
    callback();
    return true;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        signup,
        forgotPassword,
        resetPassword,
        logout,

        showAuthModal,
        setShowAuthModal,
        authView,
        setAuthView,
        requireAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
