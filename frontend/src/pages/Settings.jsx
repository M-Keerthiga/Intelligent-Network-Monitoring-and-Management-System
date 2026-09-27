import React, { useState, useEffect } from 'react';
import { settingsService, demoService, deviceService } from '../services/api';
import Toast from '../components/Toast';
import { Settings as SettingsIcon, Save, RefreshCw, Cpu, Sliders, Play, RotateCcw, ShieldAlert } from 'lucide-react';

const Settings = () => {
  const [settings, setSettings] = useState(null);
  const [devices, setDevices] = useState([]);

  // Form states
  const [intervalMs, setIntervalMs] = useState(10000);
  const [mlEnabled, setMlEnabled] = useState(true);

  // Thresholds state
  const [thresholds, setThresholds] = useState({
    cpuWarn: 80,
    cpuCrit: 95,
    memWarn: 80,
    memCrit: 95,
    latWarn: 100,
    latCrit: 200,
    lossWarn: 5,
    lossCrit: 10,
  });

  // Demo mode state
  const [demoScenario, setDemoScenario] = useState('NORMAL');
  const [targetDevId, setTargetDevId] = useState('');

  const [toast, setToast] = useState({ message: '', type: 'success' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettingsAndDevices();
  }, []);

  const fetchSettingsAndDevices = async () => {
    try {
      const [setResp, devResp, scenResp] = await Promise.all([
        settingsService.get(),
        deviceService.getAll(),
        demoService.getScenario()
      ]);

      setSettings(setResp.data);
      setIntervalMs(setResp.data.monitoringIntervalMs || 10000);
      setMlEnabled(setResp.data.mlEnabled !== false);
      setDevices(devResp.data);
      setDemoScenario(scenResp.data.activeScenario || 'NORMAL');
      if (scenResp.data.targetDeviceId) {
        setTargetDevId(scenResp.data.targetDeviceId.toString());
      }
    } catch (err) {
      console.error('Failed to fetch settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    try {
      await settingsService.update({
        monitoringIntervalMs: parseInt(intervalMs),
        mlEnabled: mlEnabled,
      });
      setToast({ message: 'Monitoring & threshold settings saved successfully', type: 'success' });
    } catch (err) {
      setToast({ message: 'Failed to update settings', type: 'error' });
    }
  };

  const handleApplyDemoScenario = async (e) => {
    e.preventDefault();
    try {
      const devId = targetDevId ? parseInt(targetDevId) : null;
      await demoService.setScenario(demoScenario, devId);
      setToast({ message: `Demo Fault Scenario [${demoScenario}] activated`, type: 'warning' });
    } catch (err) {
      setToast({ message: 'Failed to activate demo scenario', type: 'error' });
    }
  };

  const handleResetDemoScenario = async () => {
    try {
      await demoService.setScenario('NORMAL', null);
      setDemoScenario('NORMAL');
      setTargetDevId('');
      setToast({ message: 'Network simulation reset to NORMAL state', type: 'success' });
    } catch (err) {
      setToast({ message: 'Failed to reset scenario', type: 'error' });
    }
  };

  if (loading && !settings) {
    return <div className="p-8 text-center text-slate-400">Loading system configuration...</div>;
  }

  return (
    <div className="p-6 space-y-6 max-w-5xl">
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'success' })} />

      {/* Header */}
      <div>
        <h2 className="text-xl font-black text-slate-100 flex items-center gap-2">
          <SettingsIcon className="w-6 h-6 text-cyan-400" />
          <span>INMMS System Settings & NOC Configuration</span>
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Tune telemetry sampling frequency, fault rule thresholds, and live demo simulation controls.
        </p>
      </div>

      {/* SECTION 1: DEMO MODE MANAGER */}
      <div className="noc-card p-6 space-y-4 border-l-4 border-l-cyan-500">
        <h3 className="text-sm font-bold text-slate-200 border-b border-slate-800 pb-2 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Play className="w-4 h-4 text-cyan-400" />
            <span>1. Live Demonstration Scenario Engine</span>
          </span>
          <button
            type="button"
            onClick={handleResetDemoScenario}
            className="flex items-center space-x-1 px-3 py-1 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-800 text-emerald-300 text-xs font-bold rounded-lg transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Normal Network</span>
          </button>
        </h3>

        <form onSubmit={handleApplyDemoScenario} className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-300 uppercase mb-1">Select Scenario *</label>
            <select
              value={demoScenario}
              onChange={(e) => setDemoScenario(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500 font-bold"
            >
              <option value="NORMAL">🟢 NORMAL NETWORK</option>
              <option value="HIGH_CPU">⚡ HIGH CPU (95%)</option>
              <option value="HIGH_MEMORY">💾 HIGH MEMORY (90%)</option>
              <option value="HIGH_LATENCY">📶 HIGH LATENCY (350ms)</option>
              <option value="PACKET_LOSS">⚠️ PACKET LOSS (15%)</option>
              <option value="DEVICE_DOWN">🚫 DEVICE DOWN</option>
              <option value="TRAFFIC_SPIKE">🌊 TRAFFIC SPIKE</option>
              <option value="DEGRADED">🚨 DEGRADED NETWORK</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-300 uppercase mb-1">Target Device (Optional)</label>
            <select
              value={targetDevId}
              onChange={(e) => setTargetDevId(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="">Default Scenario Device</option>
              {devices.map((d) => (
                <option key={d.id} value={d.id.toString()}>{d.name} ({d.ipAddress})</option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              className="w-full py-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold rounded-lg shadow-lg"
            >
              INJECT FAULT SCENARIO
            </button>
          </div>
        </form>
      </div>

      {/* SECTION 2: MONITORING SCHEDULER */}
      <form onSubmit={handleSaveSettings} className="space-y-6">
        <div className="noc-card p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-200 border-b border-slate-800 pb-2 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-cyan-400" />
            <span>2. Telemetry Scheduler & Sampling Frequency</span>
          </h3>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
              Monitoring Polling Interval (Milliseconds)
            </label>
            <div className="flex items-center space-x-3">
              <input
                type="number"
                min="2000"
                max="60000"
                step="1000"
                value={intervalMs}
                onChange={(e) => setIntervalMs(e.target.value)}
                className="w-48 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
              />
              <span className="text-xs text-slate-400 font-mono">= {intervalMs / 1000} Seconds</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Default interval: 10000 ms (10 seconds).</p>
          </div>
        </div>

        {/* SECTION 3: THRESHOLD RULES CONFIGURATION */}
        <div className="noc-card p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-200 border-b border-slate-800 pb-2 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            <span>3. Rule-Based Fault Threshold Rules</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-300 uppercase mb-1">CPU Warning (%)</label>
              <input
                type="number"
                value={thresholds.cpuWarn}
                onChange={(e) => setThresholds({ ...thresholds, cpuWarn: parseInt(e.target.value) })}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 uppercase mb-1">CPU Critical (%)</label>
              <input
                type="number"
                value={thresholds.cpuCrit}
                onChange={(e) => setThresholds({ ...thresholds, cpuCrit: parseInt(e.target.value) })}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 uppercase mb-1">Memory Warning (%)</label>
              <input
                type="number"
                value={thresholds.memWarn}
                onChange={(e) => setThresholds({ ...thresholds, memWarn: parseInt(e.target.value) })}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 uppercase mb-1">Memory Critical (%)</label>
              <input
                type="number"
                value={thresholds.memCrit}
                onChange={(e) => setThresholds({ ...thresholds, memCrit: parseInt(e.target.value) })}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 uppercase mb-1">Latency Warning (ms)</label>
              <input
                type="number"
                value={thresholds.latWarn}
                onChange={(e) => setThresholds({ ...thresholds, latWarn: parseInt(e.target.value) })}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 uppercase mb-1">Latency Critical (ms)</label>
              <input
                type="number"
                value={thresholds.latCrit}
                onChange={(e) => setThresholds({ ...thresholds, latCrit: parseInt(e.target.value) })}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 uppercase mb-1">Packet Loss Warning (%)</label>
              <input
                type="number"
                value={thresholds.lossWarn}
                onChange={(e) => setThresholds({ ...thresholds, lossWarn: parseInt(e.target.value) })}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 uppercase mb-1">Packet Loss Critical (%)</label>
              <input
                type="number"
                value={thresholds.lossCrit}
                onChange={(e) => setThresholds({ ...thresholds, lossCrit: parseInt(e.target.value) })}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 font-mono"
              />
            </div>
          </div>
        </div>

        {/* SECTION 4: OPTIONAL ML ENGINE */}
        <div className="noc-card p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-200 border-b border-slate-800 pb-2 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-purple-400" />
            <span>4. Optional ML Isolation Forest Engine</span>
          </h3>

          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="mlCheck"
              checked={mlEnabled}
              onChange={(e) => setMlEnabled(e.target.checked)}
              className="rounded border-slate-800 bg-slate-900 text-purple-600 focus:ring-0"
            />
            <label htmlFor="mlCheck" className="text-xs text-slate-200 font-semibold cursor-pointer">
              Enable Python IsolationForest Microservice API Integration
            </label>
          </div>

          <div className="text-xs text-slate-400 font-mono bg-slate-900 p-3 rounded-lg border border-slate-800">
            Target Service URL: <span className="text-purple-300">{settings?.mlServiceUrl}</span>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="flex items-center space-x-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold px-6 py-2.5 rounded-xl shadow-lg transition-all"
          >
            <Save className="w-4 h-4" />
            <span>SAVE NOC CONFIGURATION</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default Settings;
