import React from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Radio } from 'lucide-react';

const StatusBadge = ({ status }) => {
  const norm = (status || 'UP').toUpperCase();
  
  let bg = 'bg-slate-800 text-slate-300 border-slate-700';
  let Icon = Radio;

  if (norm === 'UP') {
    bg = 'bg-emerald-950/80 text-emerald-400 border-emerald-800/80';
    Icon = CheckCircle2;
  } else if (norm === 'WARNING') {
    bg = 'bg-amber-950/80 text-amber-400 border-amber-800/80';
    Icon = AlertTriangle;
  } else if (norm === 'CRITICAL') {
    bg = 'bg-rose-950/80 text-rose-400 border-rose-800/80';
    Icon = AlertCircle;
  } else if (norm === 'DOWN') {
    bg = 'bg-slate-900 text-slate-400 border-slate-700';
    Icon = Radio;
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-black tracking-wider rounded-full border shadow-sm uppercase ${bg}`}>
      <Icon className="w-3.5 h-3.5 shrink-0" />
      <span>{norm}</span>
    </span>
  );
};

export default StatusBadge;
