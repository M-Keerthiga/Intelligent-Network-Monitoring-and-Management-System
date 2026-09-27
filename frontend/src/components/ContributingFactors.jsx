import React from 'react';
import { BarChart3, TrendingUp, AlertCircle } from 'lucide-react';

const ContributingFactors = ({ factors = [] }) => {
  if (!factors || factors.length === 0) {
    return (
      <div className="text-slate-500 text-xs py-2 text-center">
        No factor deviations detected.
      </div>
    );
  }

  const getLevelBadge = (level) => {
    switch (level) {
      case 'Very High':
        return 'bg-rose-950/80 text-rose-300 border-rose-700';
      case 'High':
        return 'bg-amber-950/80 text-amber-300 border-amber-700';
      case 'Medium':
        return 'bg-blue-950/80 text-blue-300 border-blue-700';
      default:
        return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

  const getBarColor = (level) => {
    switch (level) {
      case 'Very High':
        return 'bg-gradient-to-r from-rose-500 to-rose-400';
      case 'High':
        return 'bg-gradient-to-r from-amber-500 to-amber-400';
      case 'Medium':
        return 'bg-gradient-to-r from-cyan-500 to-blue-400';
      default:
        return 'bg-slate-600';
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs text-slate-400">
        <span className="font-bold flex items-center gap-1.5 text-slate-300">
          <BarChart3 className="w-3.5 h-3.5 text-cyan-400" />
          <span>Metric Contribution / Importance Ranking</span>
        </span>
        <span className="text-[11px] font-mono text-slate-500">
          Normalized Relative Deviation
        </span>
      </div>

      <div className="space-y-2.5">
        {factors.map((f) => (
          <div
            key={f.metricKey}
            className="p-3 bg-slate-900/80 border border-slate-800/80 rounded-xl space-y-2 hover:border-slate-700 transition-colors"
          >
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2">
                <span className="w-5 h-5 rounded-full bg-slate-800 text-cyan-300 font-mono text-[10px] font-black flex items-center justify-center border border-slate-700">
                  #{f.rank}
                </span>
                <span className="font-extrabold text-slate-200">{f.metricName}</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getLevelBadge(f.contributionLevel)}`}>
                  {f.contributionLevel}
                </span>
              </div>

              <div className="text-right font-mono">
                <span className="text-cyan-400 font-bold text-xs">
                  {f.contributionPercent}%
                </span>
                <span className="text-slate-500 text-[10px] ml-1">contribution</span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
              <div
                className={`h-full rounded-full transition-all duration-500 ${getBarColor(f.contributionLevel)}`}
                style={{ width: `${Math.min(100, Math.max(4, f.contributionPercent))}%` }}
              ></div>
            </div>

            {/* Metrics Breakdown row */}
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-1">
              <span>
                Observed: <strong className="text-slate-200">{f.observedValue} {f.unit}</strong>
              </span>
              <span>
                Baseline: <strong className="text-slate-400">{f.baselineValue} {f.unit}</strong>
              </span>
              <span className={`flex items-center gap-0.5 ${f.deviationPercent > 0 ? 'text-amber-400' : 'text-slate-400'}`}>
                {f.deviationPercent > 0 && <TrendingUp className="w-3 h-3" />}
                <span>{f.deviationPercent > 0 ? `+${f.deviationPercent}%` : `${f.deviationPercent}%`}</span>
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ContributingFactors;
