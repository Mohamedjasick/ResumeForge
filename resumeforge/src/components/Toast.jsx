import { useState, useEffect, createContext, useContext, useCallback } from 'react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const removeToast = (id) => setToasts((prev) => prev.filter((t) => t.id !== id));

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      {/* ✅ Centered at top instead of top-right */}
      <div style={{
        position: 'fixed',
        top: '1.25rem',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        width: '100%',
        maxWidth: '420px',
        pointerEvents: 'none',
        padding: '0 1rem',
      }}>
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, onRemove }) {
  const icons = {
    success: (
      <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#34d399" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    error: (
      <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#f87171" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    info: (
      <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#818cf8" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  };

  const borderColors = {
    success: '#34d39940',
    error:   '#f8717140',
    info:    '#818cf840',
  };

  return (
    <div
      className="animate-toast-in"
      style={{
        pointerEvents: 'auto',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.75rem',
        background: 'var(--card-bg)',
        border: `1px solid ${borderColors[toast.type]}`,
        borderRadius: '1rem',
        padding: '1rem',
        boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
      }}
    >
      <span style={{ flexShrink: 0, marginTop: '1px' }}>{icons[toast.type]}</span>
      <p style={{
        flex: 1,
        fontSize: '0.875rem',
        color: 'var(--input-text)',
        lineHeight: 1.6,
        fontFamily: 'Inter, system-ui, sans-serif',
      }}>
        {toast.message}
      </p>
      <button
        onClick={() => onRemove(toast.id)}
        style={{
          pointerEvents: 'auto',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: 'var(--input-placeholder)',
          flexShrink: 0,
          marginTop: '1px',
          padding: 0,
        }}
      >
        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be inside ToastProvider');
  return ctx;
}