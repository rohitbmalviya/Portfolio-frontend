'use client';

// ============================================================
//  Simple toast system — no external dependency.
//  Import useToast() hook + <ToastContainer /> in the layout.
// ============================================================

import { createContext, useCallback, useContext, useState, useEffect } from 'react';
import { X, CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContextValue {
  addToast: (message: string, type?: ToastType) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue>({
  addToast: () => {},
  success: () => {},
  error: () => {},
  info: () => {},
});

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => removeToast(id), 4000);
  }, [removeToast]);

  const success = useCallback((msg: string) => addToast(msg, 'success'), [addToast]);
  const error = useCallback((msg: string) => addToast(msg, 'error'), [addToast]);
  const info = useCallback((msg: string) => addToast(msg, 'info'), [addToast]);

  return (
    <ToastContext.Provider value={{ addToast, success, error, info }}>
      {children}
      {/* Toast container */}
      <div
        role="region"
        aria-live="polite"
        aria-label="Notifications"
        className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-[360px] w-full pointer-events-none"
      >
        {toasts.map((toast) => (
          <ToastItem
            key={toast.id}
            toast={toast}
            onRemove={removeToast}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({
  toast,
  onRemove,
}: {
  toast: Toast;
  onRemove: (id: string) => void;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Trigger enter animation
    requestAnimationFrame(() => setVisible(true));
  }, []);

  const icons = {
    success: <CheckCircle2 size={16} aria-hidden="true" style={{ color: '#4ade80' }} />,
    error: <AlertCircle size={16} aria-hidden="true" style={{ color: '#f87171' }} />,
    info: <Info size={16} aria-hidden="true" style={{ color: 'var(--accent)' }} />,
  };

  const borderColors = {
    success: 'rgba(74,222,128,0.3)',
    error: 'rgba(248,113,113,0.3)',
    info: 'var(--accent)',
  };

  return (
    <div
      role="alert"
      className={cn(
        'flex items-start gap-3 px-4 py-3 rounded-[10px] border pointer-events-auto',
        'transition-all duration-300',
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2',
      )}
      style={{
        backgroundColor: 'var(--surface)',
        borderColor: borderColors[toast.type],
        boxShadow: 'var(--card-shadow)',
      }}
    >
      <span className="mt-0.5 shrink-0">{icons[toast.type]}</span>
      <p
        className="flex-1 text-[13px]"
        style={{ color: 'var(--text)' }}
      >
        {toast.message}
      </p>
      <button
        type="button"
        onClick={() => onRemove(toast.id)}
        aria-label="Dismiss notification"
        className="shrink-0 transition-colors duration-150"
        style={{ color: 'var(--muted)' }}
      >
        <X size={14} aria-hidden="true" />
      </button>
    </div>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
