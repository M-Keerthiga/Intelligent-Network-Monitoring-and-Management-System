import React, { useState } from 'react';
import ContributingFactors from './ContributingFactors';
import {
  Sparkles,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  AlertTriangle,
  Info,
  ShieldCheck,
  Activity,
  Cpu,
  Database,
  Radio,
  Clock
} from 'lucide-react';

const ExplainableAI = ({ xai, observedMetrics, baselineMetrics, deviceName }) => {
  const [whyExpanded, setWhyExpanded] = useState(true);

  if (!xai) {
    return (
      <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl text-xs text-slate-400">
        Explanation temporarily unavailable for this incident.
      </div>
    );
  }

  const getScoreColor = (score) => {
    if (score >= 0.8) return 'text-rose-400 bg-rose-950/80 border-rose-700';
    if (score >= 0.5) return 'text-amber-400 bg-amber-950/80 border-amber-700';
    if (score >= 0.25) return 'text-blue-400 bg-blue-950/80 border-blue-700';
    return 'text-emerald-400 bg-emerald-950/80 border-emerald-700';
  };

  return (
    <div className="space-y-4">
      {/* Header Banner: Score & Explanation Strength */}
      <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="p-1.5 bg-cyan-950 text-cyan-400 border border-cyan-800/80 rounded-lg">
              <Sparkles className="w-4 h-4" />
            </span>
            <h3 className="text-sm font-extrabold text-slate-100">
              Explainable AI (XAI) Diagnostic Layer
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
              Deterministic Deviation Engine
            </span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed font-sans">
            {xai.mainExplanation}
          </p>
        </div>

        {/* Score Pill */}
        <div className="flex items-center space-x-3 shrink-0 self-end md:self-auto">
          <div className="text-right">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {xai.scoreLabel || 'Anomaly Score'}
            </div>
            <div className="text-[11px] text-slate-400 font-mono">
              Strength: <strong className="text-slate-200">{xai.explanationStrength}</strong>
            </div>
          </div>

          <div className={`px-3 py-1.5 rounded-xl border text-center font-mono font-black text-base shadow-sm ${getScoreColor(xai.anomalyScore)}`}>
            {Math.round(xai.anomalyScore * 100)}%
          </div>
        </div>
      </div>

      {/* Expandable Section: "Why was this alert generated?" */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-xl overflow-hidden">
        <button
          onClick={() => setWhyExpanded(!whyExpanded)}
          className="w-full px-4 py-3 bg-slate-900/90 hover:bg-slate-850 flex items-center justify-between text-left transition-colors border-b border-slate-800/60"
        >
          <div className="flex items-center space-x-2">
            <HelpCircle className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-black text-slate-200 uppercase tracking-wide">
              Why was this alert generated?
            </span>
          </div>
          <div className="flex items-center space-x-2 text-xs text-slate-400 font-medium">
            <span>{whyExpanded ? 'Hide Details' : 'View Checklist & Evidence'}</span>
            {whyExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </button>

        {whyExpanded && (
          <div className="p-4 space-y-3 text-xs">
            <div className="space-y-2">
              {xai.evidenceBulletPoints?.map((bullet, idx) => (
                <div
                  key={idx}
                  className="flex items-start space-x-2.5 p-2 rounded-lg bg-slate-950/60 border border-slate-800/60 text-slate-300 font-mono text-[11px]"
                >
                  <span className="text-cyan-400 font-bold shrink-0 mt-0.5">•</span>
                  <span>{bullet}</span>
                </div>
              ))}
            </div>

            {xai.conclusion && (
              <div className="p-3 bg-cyan-950/40 border border-cyan-800/60 rounded-xl text-xs text-cyan-200 font-sans leading-relaxed">
                <span className="font-extrabold text-cyan-300 block mb-0.5">XAI SYSTEM CONCLUSION:</span>
                {xai.conclusion}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Telemetry Evidence Grid */}
      {observedMetrics && (
        <div className="space-y-2">
          <div className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            <span>Observed Telemetry Evidence vs Baseline</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
            <div className="p-3 bg-slate-900/90 border border-slate-800 rounded-xl text-center">
              <span className="text-[10px] text-slate-400 uppercase font-mono block">CPU Usage</span>
              <div className="text-base font-black font-mono text-cyan-400 mt-0.5">
                {observedMetrics.cpuUsage !== undefined ? `${observedMetrics.cpuUsage}%` : 'N/A'}
              </div>
              <span className="text-[10px] text-slate-500 font-mono block mt-0.5">Base: 25.0%</span>
            </div>

            <div className="p-3 bg-slate-900/90 border border-slate-800 rounded-xl text-center">
              <span className="text-[10px] text-slate-400 uppercase font-mono block">Memory</span>
              <div className="text-base font-black font-mono text-purple-400 mt-0.5">
                {observedMetrics.memoryUsage !== undefined ? `${observedMetrics.memoryUsage}%` : 'N/A'}
              </div>
              <span className="text-[10px] text-slate-500 font-mono block mt-0.5">Base: 40.0%</span>
            </div>

            <div className="p-3 bg-slate-900/90 border border-slate-800 rounded-xl text-center">
              <span className="text-[10px] text-slate-400 uppercase font-mono block">Latency</span>
              <div className="text-base font-black font-mono text-amber-400 mt-0.5">
                {observedMetrics.latency !== undefined ? `${observedMetrics.latency} ms` : 'N/A'}
              </div>
              <span className="text-[10px] text-slate-500 font-mono block mt-0.5">Base: 20.0 ms</span>
            </div>

            <div className="p-3 bg-slate-900/90 border border-slate-800 rounded-xl text-center">
              <span className="text-[10px] text-slate-400 uppercase font-mono block">Packet Loss</span>
              <div className="text-base font-black font-mono text-rose-400 mt-0.5">
                {observedMetrics.packetLoss !== undefined ? `${observedMetrics.packetLoss}%` : 'N/A'}
              </div>
              <span className="text-[10px] text-slate-500 font-mono block mt-0.5">Base: 0.0%</span>
            </div>

            <div className="p-3 bg-slate-900/90 border border-slate-800 rounded-xl text-center col-span-2 sm:col-span-1">
              <span className="text-[10px] text-slate-400 uppercase font-mono block">Traffic</span>
              <div className="text-base font-black font-mono text-emerald-400 mt-0.5">
                {observedMetrics.networkTraffic !== undefined ? `${observedMetrics.networkTraffic} MB/s` : 'N/A'}
              </div>
              <span className="text-[10px] text-slate-500 font-mono block mt-0.5">Base: 25.0 MB/s</span>
            </div>
          </div>
        </div>
      )}

      {/* Contributing Factors Component */}
      <ContributingFactors factors={xai.contributingFactors} />

      {/* Honest Methodology Notice */}
      <div className="p-2.5 bg-slate-950/80 border border-slate-800/60 rounded-xl flex items-center space-x-2 text-[11px] text-slate-400 font-mono">
        <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
        <span>
          <strong>Methodology Transparency:</strong> Rule-based baseline deviation calculation. Accurately reflects observed metric shifts against normal NOC envelopes without opaque black-box assumptions.
        </span>
      </div>
    </div>
  );
};

export default ExplainableAI;
