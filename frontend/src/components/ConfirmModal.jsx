import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

const ConfirmModal = ({ isOpen, title, message, confirmText = 'Confirm', confirmVariant = 'rose', onClose, onConfirm }) => {
  if (!isOpen) return null;

  const btnBg = confirmVariant === 'rose'
    ? 'bg-rose-600 hover:bg-rose-500 text-white'
    : confirmVariant === 'amber'
    ? 'bg-amber-600 hover:bg-amber-500 text-white'
    : 'bg-cyan-600 hover:bg-cyan-500 text-white';

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-[#111827] border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4 animate-scale-in">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-rose-950/80 border border-rose-800/60 rounded-xl text-rose-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-100">{title}</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200">
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed font-sans">{message}</p>

        <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800/80">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`px-4 py-2 ${btnBg} text-xs font-bold rounded-lg shadow-lg transition-all`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
