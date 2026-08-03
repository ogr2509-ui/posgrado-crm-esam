'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, XCircle, AlertCircle, Info, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}

interface ToastContextValue {
  toast: (opts: { type: ToastType; title: string; message?: string }) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    ({ type, title, message }: { type: ToastType; title: string; message?: string }) => {
      const id = `${Date.now()}-${Math.random()}`;
      setToasts((prev) => [...prev.slice(-4), { id, type, title, message }]);
      setTimeout(() => dismiss(id), type === 'error' ? 6000 : 4000);
    },
    [dismiss]
  );

  const toast = addToast;
  const success = (title: string, message?: string) => addToast({ type: 'success', title, message });
  const error = (title: string, message?: string) => addToast({ type: 'error', title, message });
  const warning = (title: string, message?: string) => addToast({ type: 'warning', title, message });
  const info = (title: string, message?: string) => addToast({ type: 'info', title, message });

  const iconMap: Record<ToastType, React.ReactNode> = {
    success: <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />,
    error: <XCircle className="w-4 h-4 text-rose-400 shrink-0" />,
    warning: <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />,
    info: <Info className="w-4 h-4 text-blue-400 shrink-0" />,
  };

  const colorMap: Record<ToastType, string> = {
    success: 'bg-slate-900 border-emerald-500/40 shadow-emerald-500/10',
    error: 'bg-slate-900 border-rose-500/40 shadow-rose-500/10',
    warning: 'bg-slate-900 border-amber-500/40 shadow-amber-500/10',
    info: 'bg-slate-900 border-blue-500/40 shadow-blue-500/10',
  };

  const titleColorMap: Record<ToastType, string> = {
    success: 'text-emerald-300',
    error: 'text-rose-300',
    warning: 'text-amber-300',
    info: 'text-blue-300',
  };

  return (
    <ToastContext.Provider value={{ toast, success, error, warning, info }}>
      {children}
      {/* Toast Container */}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2 pointer-events-none max-w-sm w-full">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl border shadow-xl backdrop-blur-sm animate-in slide-in-from-right-4 fade-in duration-300 ${colorMap[t.type]}`}
          >
            <div className="mt-0.5">{iconMap[t.type]}</div>
            <div className="flex-1 min-w-0">
              <p className={`text-xs font-bold ${titleColorMap[t.type]}`}>{t.title}</p>
              {t.message && (
                <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{t.message}</p>
              )}
            </div>
            <button
              onClick={() => dismiss(t.id)}
              className="text-slate-500 hover:text-slate-300 transition-colors shrink-0 ml-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
