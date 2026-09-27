import React, { useState, useEffect } from 'react';
import { demoService, dashboardService } from '../services/api';
import { Play, RefreshCw, Activity, Radio, ShieldCheck } from 'lucide-react';

const Navbar = ({ onRefreshData, onNotify }) => {
  const [activeScenario, setActiveScenario] = useState('NORMAL');
  const [healthScore, setHealthScore] = useState(100);
  const [countdown, setCountdown] = useState(10);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchScenarioAndSummary();
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          triggerRefresh();
          return 10;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const fetchScenarioAndSummary = async () => {
    try {
      const [scenResp, sumResp] = await Promise.all([
        demoService.getScenario(),
        dashboardService.getSummary()
      ]);
      setActiveScenario(scenResp.data.activeScenario || 'NORMAL');
      setHealthScore(sumResp.data.networkHealthScore || 100);
    } catch (e) {
      console.error('Navbar status fetch error:', e);
    }
  };

  const triggerRefresh = async () => {
    setIsRefreshing(true);
    await fetchScenarioAndSummary();
    if (onRefreshData) onRefreshData();
    setTimeout(() => setIsRefreshing(false), 400);
  };

  const handleScenarioChange = async (e) => {
    const newScenario = e.target.value;
    try {
      await demoService.setScenario(newScenario);
      setActiveScenario(newScenario);
      triggerRefresh();
      if (onNotify) onNotify(`Demo Scenario switched to: ${newScenario}`, 'warning');
    } catch (err) {
      console.error('Failed to change scenario:', err);
      if (onNotify) onNotify('Failed to update demo scenario', 'error');
    }
  };

  return (
    <header className="h-16 bg-[#0d1322]/90 backdrop-blur-md border-b border-slate-800/80 px-6 flex items-center justify-between sticky top-0 z-20">
      {/* Left: Visually Obvious Live Monitoring Indicator */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2 text-xs font-mono bg-emerald-950/60 border border-emerald-800/80 px-3 py-1.5 rounded-full shadow-sm">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
          <span className="text-emerald-400 font-black tracking-wider">● LIVE MONITORING</span>
          <span className="text-slate-400 text-[11px]">({countdown}s)</span>
        </div>

        <div className="hidden md:flex items-center space-x-2 text-xs bg-slate-900/80 border border-slate-800 px-3 py-1.5 rounded-full">
          <ShieldCheck className="w-4 h-4 text-cyan-400" />
          <span className="text-slate-400">System Health:</span>
          <span className={`font-black font-mono ${healthScore >= 90 ? 'text-emerald-400' : healthScore >= 75 ? 'text-blue-400' : healthScore >= 50 ? 'text-amber-400' : 'text-rose-400'}`}>
            {healthScore}%
          </span>
        </div>
      </div>

      {/* Right: Demo Scenario Selector & Manual Trigger */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2 bg-slate-900 border border-cyan-800/60 rounded-xl px-3 py-1.5 text-xs shadow-sm">
          <Play className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-slate-400 font-bold hidden sm:inline">DEMO MODE:</span>
          <select
            value={activeScenario}
            onChange={handleScenarioChange}
            className="bg-transparent text-cyan-300 font-black focus:outline-none cursor-pointer tracking-wide"
          >
            <option value="NORMAL" className="bg-slate-900 text-slate-200">🟢 NORMAL NETWORK</option>
            <option value="HIGH_CPU" className="bg-slate-900 text-amber-400">⚡ HIGH CPU (95%)</option>
            <option value="HIGH_MEMORY" className="bg-slate-900 text-amber-400">💾 HIGH MEMORY (90%)</option>
            <option value="HIGH_LATENCY" className="bg-slate-900 text-amber-400">📶 HIGH LATENCY (350ms)</option>
            <option value="PACKET_LOSS" className="bg-slate-900 text-rose-400">⚠️ PACKET LOSS (15%)</option>
            <option value="DEVICE_DOWN" className="bg-slate-900 text-rose-500">🚫 DEVICE DOWN</option>
            <option value="TRAFFIC_SPIKE" className="bg-slate-900 text-cyan-400">🌊 TRAFFIC SPIKE</option>
            <option value="DEGRADED" className="bg-slate-900 text-amber-400">🚨 DEGRADED NETWORK</option>
          </select>
        </div>

        <button
          onClick={triggerRefresh}
          title="Manual Telemetry Refresh"
          className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline font-mono">Poll</span>
        </button>
      </div>
    </header>
  );
};

export default Navbar;
