import React, { useState } from 'react';
import {
  GitBranch,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Workflow,
  ChevronDown,
  ChevronUp,
  Info,
  ShieldAlert,
  ArrowRight,
  TrendingUp,
  Cpu
} from 'lucide-react';

const RootCauseAnalysis = ({ bayesianRca, recommendation }) => {
  const [reasoningExpanded, setReasoningExpanded] = useState(false);

  if (!bayesianRca) {
    return (
      <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl text-xs text-slate-400">
        Root Cause Analysis temporarily unavailable for this incident.
      </div>
    );
  }

  const getUrgencyBadge = (urgency) => {
    switch (urgency) {
      case 'CRITICAL':
        return 'bg-rose-950 text-rose-300 border-rose-700';
      case 'HIGH':
        return 'bg-amber-950 text-amber-300 border-amber-700';
      default:
        return 'bg-blue-950 text-blue-300 border-blue-700';
    }
  };

  return (
    <div className="space-y-4">
      {/* ROOT CAUSE ANALYSIS HERO CARD */}
      <div className="p-5 bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 rounded-xl space-y-4 shadow-lg">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <div className="flex items-center space-x-2">
            <span className="p-1.5 bg-rose-950/80 text-rose-400 border border-rose-800/80 rounded-lg">
              <GitBranch className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider">
                BAYESIAN NETWORK ROOT CAUSE ANALYSIS
              </h3>
              <p className="text-[11px] text-slate-400">
                Probabilistic causal diagnostic inference over network fault graph.
              </p>
            </div>
          </div>

          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700">
            Exact Bayes Posterior
          </span>
        </div>

        {/* Most Probable Cause Box */}
        <div className="p-4 bg-rose-950/20 border border-rose-800/60 rounded-xl space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="space-y-0.5">
              <span className="text-[10px] font-black uppercase text-rose-400 tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                <span>MOST PROBABLE CAUSE</span>
              </span>
              <h4 className="text-base font-extrabold text-slate-100">
                {bayesianRca.mostProbableCauseTitle}
              </h4>
            </div>

            <div className="text-right sm:self-center">
              <div className="text-2xl font-black font-mono text-rose-400">
                {bayesianRca.highestProbability}%
              </div>
              <span className="text-[10px] font-mono text-slate-400">
                Posterior Probability P(C | Evidence)
              </span>
            </div>
          </div>

          <p className="text-xs text-slate-300 font-sans leading-relaxed pt-1">
            {bayesianRca.description}
          </p>
        </div>

        {/* Distribution across all candidate causes */}
        <div className="space-y-2.5">
          <span className="text-xs font-bold text-slate-400 block">
            All Evaluated Candidate Causes
          </span>

          <div className="space-y-2">
            {bayesianRca.candidateCauses?.map((cause) => (
              <div
                key={cause.causeKey}
                className={`p-2.5 rounded-xl border text-xs space-y-1.5 transition-all ${
                  cause.isTopCause
                    ? 'bg-slate-900 border-rose-800/80 shadow-sm'
                    : 'bg-slate-950/60 border-slate-800/60 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        cause.isTopCause ? 'bg-rose-500' : 'bg-slate-600'
                      }`}
                    ></span>
                    <span className={`font-bold ${cause.isTopCause ? 'text-slate-100' : 'text-slate-300'}`}>
                      {cause.title}
                    </span>
                    {cause.isTopCause && (
                      <span className="px-1.5 py-0.5 bg-rose-950 text-rose-300 border border-rose-800 rounded text-[9px] font-black uppercase">
                        DIAGNOSED
                      </span>
                    )}
                  </div>

                  <div className="font-mono text-xs">
                    <strong className={cause.isTopCause ? 'text-rose-400 font-black' : 'text-slate-300'}>
                      {cause.probability}%
                    </strong>
                    <span className="text-slate-500 text-[10px] ml-1">
                      (prior: {cause.priorProbability}%)
                    </span>
                  </div>
                </div>

                {/* Probability Horizontal Bar */}
                <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden border border-slate-800/80">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      cause.isTopCause
                        ? 'bg-rose-500'
                        : cause.probability > 10
                        ? 'bg-amber-500/80'
                        : 'bg-slate-600'
                    }`}
                    style={{ width: `${Math.min(100, Math.max(3, cause.probability))}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* View Reasoning / View Analysis Toggle */}
        <div className="pt-2 border-t border-slate-800/80">
          <button
            onClick={() => setReasoningExpanded(!reasoningExpanded)}
            className="flex items-center space-x-2 text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            <Workflow className="w-3.5 h-3.5" />
            <span>{reasoningExpanded ? 'Hide Bayesian Causal Reasoning Trace' : 'View Bayesian Causal Reasoning Trace'}</span>
            {reasoningExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {reasoningExpanded && bayesianRca.reasoningChain && (
            <div className="mt-3 p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl space-y-3">
              <span className="text-[11px] font-black uppercase text-cyan-400 tracking-wider block">
                Bayesian Probabilistic Reasoning Trace
              </span>

              <div className="space-y-2">
                {bayesianRca.reasoningChain.map((step) => (
                  <div
                    key={step.stepNumber}
                    className="flex items-start space-x-3 p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/60 text-xs"
                  >
                    <span className="w-5 h-5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 text-[10px] font-mono font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {step.stepNumber}
                    </span>
                    <div className="space-y-0.5 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-slate-200">{step.title}</span>
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                          {step.tag}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
                        {step.detail}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ACTIONABLE NOC TROUBLESHOOTING RECOMMENDATION */}
      {recommendation && (
        <div className="p-4 bg-slate-900 border border-cyan-800/60 rounded-xl space-y-3 shadow-lg">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center space-x-2">
              <Lightbulb className="w-4 h-4 text-amber-400" />
              <h4 className="text-xs font-black uppercase text-slate-200 tracking-wide">
                RECOMMENDATION: {recommendation.title}
              </h4>
            </div>

            <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase border ${getUrgencyBadge(recommendation.urgency)}`}>
              {recommendation.urgency} URGENCY
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed font-sans">
            {recommendation.actionSummary}
          </p>

          {recommendation.troubleshootingSteps && (
            <div className="space-y-1.5 pt-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Standard NOC Operating Procedures:
              </span>
              <ul className="space-y-1.5">
                {recommendation.troubleshootingSteps.map((step, idx) => (
                  <li
                    key={idx}
                    className="flex items-start space-x-2 text-xs text-slate-300 font-mono text-[11px] bg-slate-950/60 p-2 rounded-lg border border-slate-800/60"
                  >
                    <ArrowRight className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Honest Bayesian Methodology Footer */}
      <div className="p-2.5 bg-slate-950/80 border border-slate-800/60 rounded-xl flex items-center space-x-2 text-[11px] text-slate-400 font-mono">
        <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
        <span>
          <strong>Methodology Transparency:</strong> Bayesian Belief Network Causal Inference. Exact posterior evaluation via Bayes' Theorem based on conditional symptom likelihoods and topological priors.
        </span>
      </div>
    </div>
  );
};

export default RootCauseAnalysis;
