import React, { useState, useEffect } from 'react';
import { metricsService, deviceService } from '../services/api';
import MetricCard from '../components/MetricCard';
import { BarChart3, Clock, Cpu, Database, Activity, AlertTriangle } from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area, CartesianGrid, Legend
} from 'recharts';

const Analytics = () => {
  const [metrics, setMetrics] = useState([]);
  const [devices, setDevices] = useState([]);
  const [range, setRange] = useState('24h');
  const [selectedDevice, setSelectedDevice] = useState('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalyticsData();
  }, [range, selectedDevice]);

  const fetchAnalyticsData = async () => {
    try {
      const [metResp, devResp] = await Promise.all([
        metricsService.getRecent(300),
        deviceService.getAll()
      ]);
      setMetrics(metResp.data.reverse());
      setDevices(devResp.data);
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredMetrics = selectedDevice === 'ALL'
    ? metrics
    : metrics.filter((m) => m.deviceId.toString() === selectedDevice);

  const chartData = filteredMetrics.map((m) => ({
    time: new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    cpu: m.cpuUsage,
    memory: m.memoryUsage,
    latency: m.latency,
    packetLoss: m.packetLoss,
    trafficIn: m.networkIn,
    trafficOut: m.networkOut,
  }));

  // Calculate summary stats
  const peakCpu = filteredMetrics.reduce((max, m) => Math.max(max, m.cpuUsage || 0), 0);
  const peakMem = filteredMetrics.reduce((max, m) => Math.max(max, m.memoryUsage || 0), 0);
  const avgLat = filteredMetrics.length > 0
    ? Math.round((filteredMetrics.reduce((sum, m) => sum + (m.latency || 0), 0) / filteredMetrics.length) * 10.0) / 10.0
    : 0;
  const maxLoss = filteredMetrics.reduce((max, m) => Math.max(max, m.packetLoss || 0), 0);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-100 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-purple-400" />
            <span>Historical Telemetry & Performance Analytics Workspace</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Deep historical trend analysis powered by persistent database telemetry logs.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-2 text-xs">
            <span className="text-slate-400 font-semibold">Device:</span>
            <select
              value={selectedDevice}
              onChange={(e) => setSelectedDevice(e.target.value)}
              className="bg-slate-900 border border-slate-800 text-slate-200 rounded-lg px-3 py-1.5 focus:outline-none"
            >
              <option value="ALL">ALL DEVICES OVERLAY</option>
              {devices.map((d) => (
                <option key={d.id} value={d.id.toString()}>{d.name}</option>
              ))}
            </select>
          </div>

          <div className="flex bg-slate-900 border border-slate-800 rounded-xl p-1 text-xs">
            {['1h', '6h', '24h', '7d'].map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`px-3 py-1 rounded-lg font-bold transition-all ${
                  range === r ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {r.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Analytics Summary Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Peak CPU Recorded" value={`${peakCpu.toFixed(1)}%`} icon={Cpu} color="cyan" subtext="Historical Max" />
        <MetricCard title="Peak Memory Recorded" value={`${peakMem.toFixed(1)}%`} icon={Database} color="purple" subtext="Historical Max" />
        <MetricCard title="Average Latency" value={avgLat} unit="ms" icon={Clock} color="amber" subtext="Historical Mean" />
        <MetricCard title="Max Packet Loss" value={`${maxLoss.toFixed(1)}%`} icon={AlertTriangle} color="rose" subtext="Historical Max" />
      </div>

      {/* Large Multi-Metric Graphs */}
      <div className="grid grid-cols-1 gap-6">
        {/* CPU & Memory Overlay */}
        <div className="noc-card p-5">
          <h3 className="text-sm font-bold text-slate-200 mb-4 flex items-center justify-between">
            <span>Historical CPU & Memory Utilization Overlay (%)</span>
            <Cpu className="w-4 h-4 text-cyan-400" />
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis dataKey="time" stroke="#6b7280" tick={{ fontSize: 10 }} />
                <YAxis domain={[0, 100]} stroke="#6b7280" tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '8px', fontSize: '12px' }} />
                <Legend />
                <Area type="monotone" dataKey="cpu" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.25} name="CPU Usage (%)" />
                <Area type="monotone" dataKey="memory" stroke="#a855f7" fill="#a855f7" fillOpacity={0.2} name="Memory Usage (%)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Latency & Packet Loss History */}
        <div className="noc-card p-5">
          <h3 className="text-sm font-bold text-slate-200 mb-4 flex items-center justify-between">
            <span>Network Latency (ms) vs Packet Loss (%)</span>
            <Activity className="w-4 h-4 text-amber-400" />
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis dataKey="time" stroke="#6b7280" tick={{ fontSize: 10 }} />
                <YAxis stroke="#6b7280" tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '8px', fontSize: '12px' }} />
                <Legend />
                <Line type="monotone" dataKey="latency" stroke="#f59e0b" strokeWidth={2.5} dot={false} name="Latency (ms)" />
                <Line type="monotone" dataKey="packetLoss" stroke="#ef4444" strokeWidth={2.5} dot={false} name="Packet Loss (%)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Traffic In vs Out */}
        <div className="noc-card p-5">
          <h3 className="text-sm font-bold text-slate-200 mb-4 flex items-center justify-between">
            <span>Network Interface Throughput (MB/s)</span>
            <Activity className="w-4 h-4 text-emerald-400" />
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis dataKey="time" stroke="#6b7280" tick={{ fontSize: 10 }} />
                <YAxis stroke="#6b7280" tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '8px', fontSize: '12px' }} />
                <Legend />
                <Area type="monotone" dataKey="trafficIn" stroke="#10b981" fill="#10b981" fillOpacity={0.25} name="Traffic In (MB/s)" />
                <Area type="monotone" dataKey="trafficOut" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} name="Traffic Out (MB/s)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
