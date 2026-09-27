import React, { useState, useEffect } from 'react';
import { analysisService } from '../services/api';
import ExplainableAI from './ExplainableAI';
import RootCauseAnalysis from './RootCauseAnalysis';
import {
  X,
  Sparkles,
  GitBranch,
  Activity,
  Server,
  RefreshCw,
  ShieldAlert,
  Sliders,
  CheckCircle2
} from 'lucide-react';

const IncidentAnalysisModal = ({ isOpen, onClose, alertId = null, deviceId = null, initialData = null }) => {
  const [analysis, setAnalysis] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('ALL'); // ALL, XAI, BAYESIAN
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setAnalysis(initialData);
      } else if (alertId) {
        fetchAlertAnalysis(alertId);
      } else if (deviceId) {
        fetchDeviceAnalysis(deviceId);
      }
    }
  }, [isOpen, alertId, deviceId, initialData]);

  const fetchAlertAnalysis = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const resp = await analysisService.getForAlert(id);
      setAnalysis(resp.data);
    } catch (err) {
      console.error('Failed to fetch incident analysis:', err);
      setError('Failed to load incident explanation. The monitoring service may still be initializing.');
    } finally {
      setLoading(false);
    }
  };

  const fetchDeviceAnalysis = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const resp = await analysisService.getForDevice(id);
      setAnalysis(resp.data);
    } catch (err) {
      console.error('Failed to fetch device analysis:', err);
      setError('Failed to load device telemetry analysis.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="w-full max-w-4xl bg-[#0f172a] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-slate-900 border-b border-slate-800 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-cyan-950/80 border border-cyan-800/80 text-cyan-400 rounded-xl">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-black text-slate-100">
                  Incident Intelligence & Root Cause Analysis
                </h2>
                {analysis?.severity && (
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                      analysis.severity === 'CRITICAL'
                        ? 'bg-rose-950 text-rose-300 border border-rose-800'
                        : 'bg-amber-950 text-amber-300 border border-amber-800'
                    }`}
                  >
                    {analysis.severity}
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-3 text-xs text-slate-400 font-mono mt-0.5">
                <span>Device: <strong className="text-cyan-300">{analysis?.deviceName || 'N/A'}</strong></span>
                <span>•</span>
                <span>Type: <strong>{analysis?.deviceType || 'Network Node'}</strong></span>
                <span>•</span>
                <span>IP: <strong>{analysis?.deviceIp || '192.168.1.x'}</strong></span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                if (alertId) fetchAlertAnalysis(alertId);
                else if (deviceId) fetchDeviceAnalysis(deviceId);
              }}
              title="Refresh Telemetry Analysis"
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 bg-slate-800 hover:bg-rose-900/60 text-slate-400 hover:text-rose-200 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Controls Bar */}
        <div className="px-5 py-2.5 bg-slate-900/60 border-b border-slate-800/60 flex items-center justify-between gap-4 shrink-0">
          <div className="flex bg-slate-950 border border-slate-800 rounded-xl p-1 text-xs">
            <button
              onClick={() => setActiveTab('ALL')}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                activeTab === 'ALL'
                  ? 'bg-cyan-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Unified Intelligence
            </button>
            <button
              onClick={() => setActiveTab('XAI')}
              className={`px-3 py-1 rounded-lg font-bold flex items-center gap-1.5 transition-all ${
                activeTab === 'XAI'
                  ? 'bg-cyan-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-3 h-3" />
              <span>Explainable AI (Why?)</span>
            </button>
            <button
              onClick={() => setActiveTab('BAYESIAN')}
              className={`px-3 py-1 rounded-lg font-bold flex items-center gap-1.5 transition-all ${
                activeTab === 'BAYESIAN'
                  ? 'bg-cyan-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <GitBranch className="w-3 h-3" />
              <span>Bayesian Root Cause</span>
            </button>
          </div>

          <div className="hidden sm:flex items-center space-x-2 text-[11px] font-mono text-slate-400">
            <span className="text-cyan-400">Detect</span>
            <span>→</span>
            <span className="text-cyan-400">Explain</span>
            <span>→</span>
            <span className="text-cyan-400">Diagnose</span>
            <span>→</span>
            <span className="text-cyan-400">Recommend</span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {loading && (
            <div className="p-12 text-center text-slate-400 text-xs flex flex-col items-center gap-3">
              <RefreshCw className="w-6 h-6 animate-spin text-cyan-400" />
              <span>Computing Bayesian posterior probabilities and factor deviations...</span>
            </div>
          )}

          {error && (
            <div className="p-4 bg-rose-950/40 border border-rose-800 rounded-xl text-xs text-rose-300 flex items-center space-x-3">
              <ShieldAlert className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {!loading && analysis && (
            <>
              {(activeTab === 'ALL' || activeTab === 'XAI') && (
                <div className="space-y-4">
                  <ExplainableAI
                    xai={analysis.xai}
                    observedMetrics={analysis.observedMetrics}
                    baselineMetrics={analysis.baselineMetrics}
                    deviceName={analysis.deviceName}
                  />
                </div>
              )}

              {(activeTab === 'ALL' || activeTab === 'BAYESIAN') && (
                <div className="space-y-4 pt-2">
                  <RootCauseAnalysis
                    bayesianRca={analysis.bayesianRca}
                    recommendation={analysis.recommendation}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default IncidentAnalysisModal;
