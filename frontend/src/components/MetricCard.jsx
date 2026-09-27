import React from 'react';

const MetricCard = ({ title, value, unit, icon: Icon, color = 'blue', subtext, statusIndicator }) => {
  const colorMap = {
    blue: 'text-blue-400 bg-blue-950/40 border-blue-800/40',
    cyan: 'text-cyan-400 bg-cyan-950/40 border-cyan-800/40',
    emerald: 'text-emerald-400 bg-emerald-950/40 border-emerald-800/40',
    amber: 'text-amber-400 bg-amber-950/40 border-amber-800/40',
    rose: 'text-rose-400 bg-rose-950/40 border-rose-800/40',
    purple: 'text-purple-400 bg-purple-950/40 border-purple-800/40',
  };

  const badgeClass = colorMap[color] || colorMap.blue;

  return (
    <div className="noc-card p-4 flex flex-col justify-between hover:border-slate-700 hover:shadow-lg transition-all group">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 group-hover:text-slate-200 transition-colors">
          {title}
        </span>
        {Icon && (
          <div className={`p-2 rounded-xl border ${badgeClass} transition-transform group-hover:scale-105`}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="flex items-baseline space-x-1.5 my-1">
        <span className="text-2xl lg:text-3xl font-black tracking-tight text-slate-100 font-mono">{value}</span>
        {unit && <span className="text-xs font-semibold text-slate-400 font-mono">{unit}</span>}
      </div>

      <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between border-t border-slate-800/60 pt-2">
        <span>{subtext || 'Telemetry Normal'}</span>
        {statusIndicator && (
          <span className="flex items-center gap-1">
            <span className={`w-1.5 h-1.5 rounded-full ${statusIndicator}`}></span>
          </span>
        )}
      </div>
    </div>
  );
};

export default MetricCard;
