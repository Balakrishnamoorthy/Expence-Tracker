import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, XCircle, X } from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success', options = {}) => {
    const id = Date.now();
    const duration = options.duration || 4000;
    const toast = { id, message, type, ...options };
    setToasts(prev => [...prev, toast]);
    
    // Auto-remove after duration (unless it has actions)
    if (!options.action && !options.countdown) {
      setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const toast = {
    success: (msg) => addToast(msg, 'success'),
    error: (msg) => addToast(msg, 'error'),
    info: (msg, options) => addToast(msg, 'info', options),
    custom: (config) => addToast(config.message, config.type || 'info', config),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast toast-${t.type}`} style={{ position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
              {t.type === 'success' && <CheckCircle size={16} />}
              {t.type === 'error' && <XCircle size={16} />}
              {t.type === 'info' && <CheckCircle size={16} style={{ color: '#3b82f6' }} />}
              <span style={{ flex: 1 }}>{t.message}</span>
            </div>

            {/* Action Button */}
            {t.action && (
              <button
                onClick={() => {
                  if (t.action.onClick) t.action.onClick();
                  removeToast(t.id);
                }}
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  color: 'inherit',
                  padding: '4px 12px',
                  borderRadius: 4,
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: 12,
                  marginRight: 12,
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={e => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.3)';
                }}
                onMouseLeave={e => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.2)';
                }}
              >
                {t.action.label}
              </button>
            )}

            {/* Close Button */}
            <button
              onClick={() => removeToast(t.id)}
              style={{
                background: 'none',
                border: 'none',
                color: 'inherit',
                padding: 0,
                display: 'flex',
                cursor: 'pointer',
                opacity: 0.7,
                transition: 'opacity 0.2s',
              }}
              onMouseEnter={e => (e.target.style.opacity = 1)}
              onMouseLeave={e => (e.target.style.opacity = 0.7)}
            >
              <X size={14} />
            </button>

            {/* Countdown Progress Bar */}
            {t.countdown && (
              <div
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  height: 3,
                  background: 'rgba(255, 255, 255, 0.4)',
                  width: '100%',
                  borderRadius: '0 0 8px 8px',
                  animation: `countdown ${t.countdown}s linear forwards`,
                }}
              />
            )}

            <style>{`
              @keyframes countdown {
                from { width: 100%; }
                to { width: 0%; }
              }
            `}</style>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
};
