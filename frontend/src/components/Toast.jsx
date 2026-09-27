import React from 'react';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

const Toast = ({ message, type = 'success', onClose }) => {
  if (!message) return null;

  const bgMap = {
    success: 'bg-emerald-950/90 border-emerald-700 text-emerald-200',
    warning: 'bg-amber-950/90 border-amber-700 text-amber-200',
    error: 'bg-rose-950/90 border-rose-700 text-rose-200',
    info: 'bg-cyan-950/90 border-cyan-700 text-cyan-200',
  };

  const IconMap = {
    success: CheckCircle2,
    warning: AlertTriangle,
    error: AlertTriangle,
    info: Info,
  };

  const Icon = IconMap[type] || CheckCircle2;

  return (
    <div className={`fixed bottom-5 right-5 z-50 flex items-center space-x-3 px-4 py-3 rounded-xl border shadow-2xl backdrop-blur-md text-xs font-semibold animate-bounce-short ${bgMap[type] || bgMap.success}`}>
      <Icon className="w-4 h-4 shrink-0" />
      <span>{message}</span>
      {onClose && (
        <button onClick={onClose} className="p-1 hover:opacity-80 transition-opacity">
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};

export default Toast;
