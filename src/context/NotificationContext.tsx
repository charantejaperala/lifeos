import React, { createContext, useContext, useState, ReactNode } from 'react';
import { AlertTriangle, CheckCircle2, Info, AlertCircle, X, Trash2 } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDanger?: boolean;
  onConfirm: () => void;
}

interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

interface NotificationContextType {
  showToast: (message: string, type?: ToastType) => void;
  showConfirm: (options: ConfirmOptions) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [confirmConfig, setConfirmConfig] = useState<ConfirmOptions | null>(null);

  const showToast = (message: string, type: ToastType = 'success') => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const showConfirm = (options: ConfirmOptions) => {
    setConfirmConfig(options);
  };

  const handleConfirmAction = () => {
    if (confirmConfig) {
      confirmConfig.onConfirm();
      setConfirmConfig(null);
    }
  };

  const handleCancelAction = () => {
    setConfirmConfig(null);
  };

  return (
    <NotificationContext.Provider value={{ showToast, showConfirm }}>
      {children}

      {/* Global Custom Confirmation Modal */}
      {confirmConfig && (
        <div className="custom-confirm-overlay" onClick={handleCancelAction}>
          <div className="custom-confirm-card" onClick={(e) => e.stopPropagation()}>
            <div className="custom-confirm-header">
              <div className={`custom-confirm-icon ${confirmConfig.isDanger ? 'danger' : 'info'}`}>
                {confirmConfig.isDanger ? <Trash2 size={22} /> : <AlertTriangle size={22} />}
              </div>
              <div style={{ flex: 1 }}>
                <h3>{confirmConfig.title}</h3>
                <p>{confirmConfig.message}</p>
              </div>
              <button className="confirm-close-btn" onClick={handleCancelAction}>
                <X size={16} />
              </button>
            </div>

            <div className="custom-confirm-actions">
              <button className="btn-secondary" onClick={handleCancelAction}>
                {confirmConfig.cancelText || 'Cancel'}
              </button>
              <button
                className={confirmConfig.isDanger ? 'btn-danger' : 'btn-primary'}
                onClick={handleConfirmAction}
                autoFocus
              >
                {confirmConfig.confirmText || (confirmConfig.isDanger ? 'Delete' : 'Confirm')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global Custom Toast Stack */}
      <div className="custom-toast-container">
        {toasts.map((toast) => (
          <div key={toast.id} className={`custom-toast-item toast-${toast.type}`}>
            <div className="toast-icon">
              {toast.type === 'success' && <CheckCircle2 size={18} />}
              {toast.type === 'error' && <AlertCircle size={18} />}
              {toast.type === 'warning' && <AlertTriangle size={18} />}
              {toast.type === 'info' && <Info size={18} />}
            </div>
            <span className="toast-message">{toast.message}</span>
            <button className="toast-dismiss" onClick={() => removeToast(toast.id)}>
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};
