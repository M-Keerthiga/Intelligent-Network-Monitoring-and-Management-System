import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { deviceService } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import HealthGauge from '../components/HealthGauge';
import {
  ArrowLeft,
  Server,
  Clock,
  Activity,
  Cpu,
  Database,
  AlertTriangle,
  Lightbulb,
  ShieldAlert,
  Wifi,
  Radio
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area, CartesianGrid
} from 'recharts';

const DeviceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [device, setDevice] = useState(null);
  const [metrics, setMetrics] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [range, setRange] = useState('24h');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDeviceDetail();
    const interval = setInterval(fetchDeviceDetail, 10000);
    return () => clearInterval(interval);
  }, [id, range]);

  const fetchDeviceDetail = async () => {
    try {
      const [devResp, metResp, alrResp] = await Promise.all([
        deviceService.getById(id),
        deviceService.getMetrics(id, range),
        deviceService.getAlerts(id)
      ]);
      setDevice(devResp.data);
      setMetrics(metResp.data);
      setAlerts(alrResp.data);
    } catch (err) {
      console.error('Failed to fetch device detail:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !device) {
    return (
      <div className="p-8 text-center text-slate-400">
        Loading device telemetry...
      </div>
    );
  }

  if (!device) {
    return (
      <div className="p-8 text-center text-slate-400">
        Device not found.
      </div>
    );
  }

  const latestMetric = metrics.length > 0 ? metrics[metrics.length - 1] : null;

  const chartData = metrics.map((m) => ({
    time: new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    cpu: m.cpuUsage,
    memory: m.memoryUsage,
    latency: m.latency,
    packetLoss: m.packetLoss,
    trafficIn: m.networkIn,
    trafficOut: m.networkOut,
  }));

  // Intelligent Recommendation logic based on current telemetry
  let recommendation = null;
  if (device.status === 'DOWN') {
    recommendation = {
      title: 'CRITICAL: Device Unreachable',
      text: 'Verify physical power supply, network patch cables, default gateway routing, and interface status.',
      severity: 'CRITICAL'
    };
  } else if (latestMetric) {
    if (latestMetric.cpuUsage > 80) {
      recommendation = {
        title: `HIGH CPU UTILIZATION (${latestMetric.cpuUsage}%)`,
        text: 'Inspect active application processes, thread pool bottlenecks, or unusual workload surges.',
        severity: latestMetric.cpuUsage > 95 ? 'CRITICAL' : 'WARNING'
      };
    } else if (latestMetric.memoryUsage > 80) {
      recommendation = {
        title: `HIGH MEMORY UTILIZATION (${latestMetric.memoryUsage}%)`,
        text: 'Check memory leak traces, application heap memory consumption, or restart service instance.',
        severity: latestMetric.memoryUsage > 95 ? 'CRITICAL' : 'WARNING'
      };
    } else if (latestMetric.latency > 100) {
      recommendation = {
        title: `HIGH NETWORK LATENCY (${latestMetric.latency} ms)`,
        text: 'Inspect network link saturation, switch interface queue drops, or intermediate hop congestion.',
        severity: latestMetric.latency > 200 ? 'CRITICAL' : 'WARNING'
      };
    } else if (latestMetric.packetLoss > 5) {
      recommendation = {
        title: `PACKET LOSS DETECTED (${latestMetric.packetLoss}%)`,
        text: 'Inspect physical network cabling, switch interface duplex mismatch, or signal attenuation.',
        severity: latestMetric.packetLoss > 10 ? 'CRITICAL' : 'WARNING'
      };
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Back Button & Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/devices')}
          className="flex items-center space-x-2 text-xs font-semibold text-slate-400 hover:text-cyan-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Device Inventory</span>
        </button>

        <div className="flex items-center space-x-2 text-xs">
          <span className="text-slate-400 font-semibold">Time Window:</span>
          <div className="flex bg-slate-900 border border-slate-800 rounded-lg p-0.5">
            {['1h', '6h', '24h', '7d'].map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                  range === r ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {r.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Device Overview Banner */}
      <div className="noc-card p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center space-x-4">
          <div className="p-4 bg-cyan-950/60 border border-cyan-800/60 rounded-2xl">
            <Server className="w-8 h-8 text-cyan-400" />
          </div>
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl font-black text-slate-100">{device.name}</h1>
              <StatusBadge status={device.status} />
            </div>
            <div className="flex items-center space-x-4 text-xs font-mono text-slate-400 mt-1">
              <span>IP: <strong className="text-cyan-300">{device.ipAddress}</strong></span>
              <span>TYPE: <strong>{device.deviceType}</strong></span>
              <span>LOCATION: <strong>{device.location || 'N/A'}</strong></span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-6">
          <HealthGauge score={device.healthScore} size={70} strokeWidth={8} />
          <div className="text-left text-xs space-y-1">
            <div className="text-slate-400">Monitoring: <span className="text-emerald-400 font-bold">{device.monitoringEnabled ? 'ACTIVE' : 'DISABLED'}</span></div>
            <div className="text-slate-400">Last Telemetry Check:</div>
            <div className="font-mono text-slate-200">{new Date(device.lastSeen).toLocaleTimeString()}</div>
          </div>
        </div>
      </div>

      {/* Intelligent Recommendation Alert Box */}
      {recommendation && (
        <div
          className={`p-4 rounded-xl border text-xs flex items-start space-x-3 shadow-lg ${
            recommendation.severity === 'CRITICAL'
              ? 'bg-rose-950/40 border-rose-800 text-rose-200'
              : 'bg-amber-950/40 border-amber-800 text-amber-200'
          }`}
        >
          <Lightbulb className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-extrabold uppercase tracking-wide flex items-center gap-2">
              <span>INTELLIGENT NOC RECOMMENDATION:</span>
              <span className="font-mono text-[10px] bg-black/40 px-2 py-0.5 rounded">{recommendation.title}</span>
            </div>
            <p className="leading-relaxed">{recommendation.text}</p>
          </div>
        </div>
      )}

      {/* Telemetry Dials Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="noc-card p-3.5 text-center">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Current CPU</span>
          <div className="text-2xl font-black text-cyan-400 mt-1">{latestMetric?.cpuUsage || 0}%</div>
        </div>
        <div className="noc-card p-3.5 text-center">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Current Memory</span>
          <div className="text-2xl font-black text-purple-400 mt-1">{latestMetric?.memoryUsage || 0}%</div>
        </div>
        <div className="noc-card p-3.5 text-center">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Current Latency</span>
          <div className="text-2xl font-black text-amber-400 mt-1">{latestMetric?.latency || 0} ms</div>
        </div>
        <div className="noc-card p-3.5 text-center">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Packet Loss</span>
          <div className="text-2xl font-black text-rose-400 mt-1">{latestMetric?.packetLoss || 0}%</div>
        </div>
        <div className="noc-card p-3.5 text-center col-span-2 md:col-span-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Network Traffic</span>
          <div className="text-2xl font-black text-emerald-400 mt-1">
            {Math.round(((latestMetric?.networkIn || 0) + (latestMetric?.networkOut || 0)) * 10.0) / 10.0} <span className="text-xs">MB/s</span>
          </div>
        </div>
      </div>

      {/* Historical Telemetry Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CPU & Memory History */}
        <div className="noc-card p-5">
          <h3 className="text-sm font-bold text-slate-200 mb-3 flex items-center justify-between">
            <span>CPU & Memory Utilization History (%)</span>
            <Cpu className="w-4 h-4 text-cyan-400" />
          </h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis dataKey="time" stroke="#6b7280" tick={{ fontSize: 10 }} />
                <YAxis domain={[0, 100]} stroke="#6b7280" tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#374151' }} />
                <Area type="monotone" dataKey="cpu" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.2} name="CPU %" />
                <Area type="monotone" dataKey="memory" stroke="#a855f7" fill="#a855f7" fillOpacity={0.1} name="Memory %" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Latency & Packet Loss History */}
        <div className="noc-card p-5">
          <h3 className="text-sm font-bold text-slate-200 mb-3 flex items-center justify-between">
            <span>Latency (ms) & Packet Loss (%)</span>
            <Activity className="w-4 h-4 text-amber-400" />
          </h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis dataKey="time" stroke="#6b7280" tick={{ fontSize: 10 }} />
                <YAxis stroke="#6b7280" tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#374151' }} />
                <Line type="monotone" dataKey="latency" stroke="#f59e0b" strokeWidth={2} dot={false} name="Latency (ms)" />
                <Line type="monotone" dataKey="packetLoss" stroke="#ef4444" strokeWidth={2} dot={false} name="Packet Loss (%)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Device Alert Log */}
      <div className="noc-card p-5">
        <h3 className="text-sm font-bold text-slate-200 mb-4 flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-rose-400" />
          <span>Device Fault Alert History</span>
        </h3>

        {alerts.length === 0 ? (
          <p className="text-xs text-slate-500 py-4 text-center">No alerts recorded for this device.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-slate-400 border-b border-slate-800 uppercase font-mono">
                  <th className="pb-2">Timestamp</th>
                  <th className="pb-2">Alert Type</th>
                  <th className="pb-2">Severity</th>
                  <th className="pb-2">Message</th>
                  <th className="pb-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {alerts.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-800/40">
                    <td className="py-2.5 font-mono text-slate-400">{new Date(a.createdAt).toLocaleString()}</td>
                    <td className="py-2.5 font-bold text-slate-200">{a.alertType}</td>
                    <td className="py-2.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${a.severity === 'CRITICAL' ? 'bg-rose-950 text-rose-400' : 'bg-amber-950 text-amber-400'}`}>
                        {a.severity}
                      </span>
                    </td>
                    <td className="py-2.5 text-slate-300">{a.message}</td>
                    <td className="py-2.5 font-bold text-cyan-400">{a.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeviceDetail;
