import React, { useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { useApp } from '../context/AppContext';

const CONFIG = {
  success: {
    wrapper: 'bg-green-50 border-green-400 text-green-900',
    icon:    <CheckCircle size={18} className="text-green-600 shrink-0" />,
    bar:     'bg-green-500',
  },
  error: {
    wrapper: 'bg-red-50 border-red-400 text-red-900',
    icon:    <AlertCircle size={18} className="text-red-600 shrink-0" />,
    bar:     'bg-red-500',
  },
  warning: {
    wrapper: 'bg-amber-50 border-amber-400 text-amber-900',
    icon:    <AlertTriangle size={18} className="text-amber-600 shrink-0" />,
    bar:     'bg-amber-500',
  },
  info: {
    wrapper: 'bg-blue-50 border-blue-400 text-blue-900',
    icon:    <Info size={18} className="text-blue-600 shrink-0" />,
    bar:     'bg-blue-500',
  },
};

export default function Notification() {
  const { notification, showNotification } = useApp();

  useEffect(() => {
    if (!notification) return;
    const t = setTimeout(() => showNotification(null), 5000);
    return () => clearTimeout(t);
  }, [notification, showNotification]);

  if (!notification) return null;

  const { message, type = 'info' } = notification;
  const cfg = CONFIG[type] || CONFIG.info;

  return (
    <div
      className={`fixed top-20 right-4 z-[90] max-w-sm w-full border-l-4 rounded-xl shadow-lg ${cfg.wrapper} animate-slide-in overflow-hidden`}
      role="alert"
      aria-live="assertive"
    >
      {/* Progress bar */}
      <div className={`h-0.5 ${cfg.bar} animate-[shrink_5s_linear_forwards]`}
           style={{ animation: 'none' }} />

      <div className="flex items-start gap-3 px-4 py-3.5">
        {cfg.icon}
        <p className="flex-1 text-sm font-medium leading-snug">{message}</p>
        <button
          onClick={() => showNotification(null)}
          className="shrink-0 text-current opacity-50 hover:opacity-100 transition-opacity mt-0.5"
          aria-label="Dismiss notification"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
