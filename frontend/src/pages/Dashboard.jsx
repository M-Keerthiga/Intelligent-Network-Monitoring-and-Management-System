import React, { useState, useEffect } from 'react';
import { dashboardService, deviceService, alertService, topologyService, metricsService } from '../services/api';
import MetricCard from '../components/MetricCard';
import StatusBadge from '../components/StatusBadge';
import HealthGauge from '../components/HealthGauge';
import ConfirmModal from '../components/ConfirmModal';
import Toast from '../components/Toast';
import { CardSkeleton, TableSkeleton } from '../components/Skeleton';
import IncidentAnalysisModal from '../components/IncidentAnalysisModal';
import {
  Server,
  Wifi,
  AlertTriangle,
  Activity,
  Clock,
  Radio,
  Cpu,
  Database,
  ArrowUpRight,
  ShieldAlert,
  CheckCircle2,
  CheckSquare,
  Network,
  Eye,
  Sliders,
  Sparkles
} from 'lucide-react';
import {
  AreaChart, Area, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, Legend
} from 'recharts';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [summary, setSummary] = useState(null);
  const [devices, setDevices] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [recentMetrics, setRecentMetrics] = useState([]);
  const [topology, setTopology] = useState(null);
  const [loading, setLoading] = useState(true);

  // Toast & Modal States
  const [toast, setToast] = useState({ message: '', type: 'success' });
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, alertId: null, title: '', message: '' });
  const [selectedAnalysisAlertId, setSelectedAnalysisAlertId] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [sumResp, devResp, alrResp, metResp, topResp] = await Promise.all([
        dashboardService.getSummary(),
        deviceService.getAll(),
        alertService.getAll(),
        metricsService.getRecent(60),
        topologyService.getTopology()
      ]);

      setSummary(sumResp.data);
      setDevices(devResp.data);
      setAlerts(alrResp.data.slice(0, 6)); // Top 6 recent alerts
      setRecentMetrics(metResp.data.reverse());
      setTopology(topResp.data);
    } catch (err) {
      console.error('Failed to load NOC dashboard telemetry:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAcknowledge = async (alertId) => {
    try {
      const username = localStorage.getItem('inmms_username') || 'admin';
      await alertService.acknowledge(alertId, { username });
      setToast({ message: `Alert #${alertId} acknowledged by ${username}`, type: 'success' });
      fetchDashboardData();
    } catch (err) {
      setToast({ message: 'Failed to acknowledge alert', type: 'error' });
    }
  };

  const handleResolveAlert = async () => {
    if (!confirmModal.alertId) return;
    try {
      await alertService.resolve(confirmModal.alertId);
      setToast({ message: `Alert #${confirmModal.alertId} marked as RESOLVED`, type: 'success' });
      fetchDashboardData();
    } catch (err) {
      setToast({ message: 'Failed to resolve alert', type: 'error' });
    }
  };

  if (loading && !summary) {
    return (
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
          {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
        <TableSkeleton rows={6} />
      </div>
    );
  }

  // Format historical metrics for Recharts
  const chartData = recentMetrics.map((m) => ({
    time: new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    cpu: m.cpuUsage,
    memory: m.memoryUsage,
    latency: m.latency,
    packetLoss: m.packetLoss,
    traffic: Math.round(((m.networkIn || 0) + (m.networkOut || 0)) * 10.0) / 10.0
  }));

  const pieData = summary ? [
    { name: 'UP', value: summary.onlineDevices, color: '#10b981' },
    { name: 'WARNING', value: summary.warningDevices, color: '#f59e0b' },
    { name: 'CRITICAL', value: summary.criticalDevices, color: '#ef4444' },
    { name: 'DOWN', value: summary.offlineDevices, color: '#6b7280' },
  ].filter(d => d.value > 0) : [];

  // Helper to map device ID to latest metric values for device table
  const getLatestMetricForDevice = (deviceId) => {
    for (let i = recentMetrics.length - 1; i >= 0; i--) {
      if (recentMetrics[i].deviceId === deviceId) {
        return recentMetrics[i];
      }
    }
    return null;
  };

  return (
    <div className="p-6 space-y-6">
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'success' })} />

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText="Confirm Resolve"
        confirmVariant="cyan"
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={handleResolveAlert}
      />

      {/* TOP SECTION: SYSTEM OVERVIEW (Large Metric Cards & Health Score) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <Sliders className="w-4 h-4 text-cyan-400" />
            <span>SYSTEM OVERVIEW TELEMETRY</span>
          </h2>
          <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-800/80 px-2.5 py-0.5 rounded-full">
            Active Scenario: <strong>{summary?.activeScenario || 'NORMAL'}</strong>
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <MetricCard title="Total Devices" value={summary?.totalDevices || 0} icon={Server} color="blue" statusIndicator="bg-blue-400" />
          <MetricCard title="Online (UP)" value={summary?.onlineDevices || 0} icon={Wifi} color="emerald" statusIndicator="bg-emerald-400 animate-pulse" />
          <MetricCard title="Warning" value={summary?.warningDevices || 0} icon={AlertTriangle} color="amber" statusIndicator="bg-amber-400" />
          <MetricCard title="Critical" value={summary?.criticalDevices || 0} icon={ShieldAlert} color="rose" statusIndicator="bg-rose-500 animate-ping" />
          <MetricCard title="Offline (DOWN)" value={summary?.offlineDevices || 0} icon={Radio} color="purple" statusIndicator="bg-slate-500" />
          <MetricCard title="Avg Latency" value={summary?.averageLatency || 0} unit="ms" icon={Clock} color="cyan" statusIndicator="bg-cyan-400" />
        </div>
      </div>

      {/* LIVE NETWORK PERFORMANCE (6 Charts Section) */}
      <div className="space-y-3">
        <h2 className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-2">
          <Activity className="w-4 h-4 text-cyan-400" />
          <span>LIVE NETWORK PERFORMANCE & METRIC TRENDS</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* CPU Trend */}
          <div className="noc-card p-5">
            <h3 className="text-xs font-bold text-slate-200 mb-3 flex items-center justify-between">
              <span>CPU Utilization (%)</span>
              <Cpu className="w-4 h-4 text-cyan-400" />
            </h3>
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                  <XAxis dataKey="time" stroke="#6b7280" tick={{ fontSize: 10 }} />
                  <YAxis domain={[0, 100]} stroke="#6b7280" tick={{ fontSize: 10 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '8px', fontSize: '12px' }} />
                  <Area type="monotone" dataKey="cpu" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.25} name="CPU %" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* RAM Trend */}
          <div className="noc-card p-5">
            <h3 className="text-xs font-bold text-slate-200 mb-3 flex items-center justify-between">
              <span>Memory (RAM) Usage (%)</span>
              <Database className="w-4 h-4 text-purple-400" />
            </h3>
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                  <XAxis dataKey="time" stroke="#6b7280" tick={{ fontSize: 10 }} />
                  <YAxis domain={[0, 100]} stroke="#6b7280" tick={{ fontSize: 10 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '8px', fontSize: '12px' }} />
                  <Area type="monotone" dataKey="memory" stroke="#a855f7" fill="#a855f7" fillOpacity={0.25} name="Memory %" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Network Traffic Trend */}
          <div className="noc-card p-5">
            <h3 className="text-xs font-bold text-slate-200 mb-3 flex items-center justify-between">
              <span>Network Traffic (MB/s)</span>
              <Activity className="w-4 h-4 text-emerald-400" />
            </h3>
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                  <XAxis dataKey="time" stroke="#6b7280" tick={{ fontSize: 10 }} />
                  <YAxis stroke="#6b7280" tick={{ fontSize: 10 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '8px', fontSize: '12px' }} />
                  <Area type="monotone" dataKey="traffic" stroke="#10b981" fill="#10b981" fillOpacity={0.25} name="Traffic MB/s" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Latency History */}
          <div className="noc-card p-5">
            <h3 className="text-xs font-bold text-slate-200 mb-3 flex items-center justify-between">
              <span>Latency (ms)</span>
              <Clock className="w-4 h-4 text-amber-400" />
            </h3>
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                  <XAxis dataKey="time" stroke="#6b7280" tick={{ fontSize: 10 }} />
                  <YAxis stroke="#6b7280" tick={{ fontSize: 10 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '8px', fontSize: '12px' }} />
                  <Line type="monotone" dataKey="latency" stroke="#f59e0b" strokeWidth={2.5} dot={false} name="Latency ms" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Packet Loss Trend */}
          <div className="noc-card p-5">
            <h3 className="text-xs font-bold text-slate-200 mb-3 flex items-center justify-between">
              <span>Packet Loss (%)</span>
              <AlertTriangle className="w-4 h-4 text-rose-400" />
            </h3>
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                  <XAxis dataKey="time" stroke="#6b7280" tick={{ fontSize: 10 }} />
                  <YAxis domain={[0, 100]} stroke="#6b7280" tick={{ fontSize: 10 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '8px', fontSize: '12px' }} />
                  <Line type="monotone" dataKey="packetLoss" stroke="#ef4444" strokeWidth={2.5} dot={false} name="Loss %" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Device Status Distribution Pie */}
          <div className="noc-card p-5 flex flex-col justify-between">
            <h3 className="text-xs font-bold text-slate-200 mb-2">Device Status Breakdown</h3>
            <div className="h-36 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} innerRadius={30} outerRadius={55} paddingAngle={4} dataKey="value">
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '8px', fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center space-x-3 text-[11px] font-mono font-bold">
              <span className="text-emerald-400">UP: {summary?.onlineDevices || 0}</span>
              <span className="text-amber-400">WARN: {summary?.warningDevices || 0}</span>
              <span className="text-rose-400">CRIT: {summary?.criticalDevices || 0}</span>
              <span className="text-slate-400">DOWN: {summary?.offlineDevices || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* DEVICE HEALTH TABLE (Full columns: Device, IP, Type, Status, Health, Latency, CPU, RAM, Last Seen, Actions) */}
      <div className="noc-card p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Server className="w-4 h-4 text-cyan-400" />
              <span>Real-Time Device Health & Performance Matrix</span>
            </h3>
            <p className="text-[11px] text-slate-400">Continuous telemetry snapshot per monitored device node.</p>
          </div>
          <button
            onClick={() => navigate('/devices')}
            className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-semibold"
          >
            <span>Full Inventory</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-900/90 text-slate-400 border-b border-slate-800 uppercase font-mono">
                <th className="p-3">Device</th>
                <th className="p-3">IP Address</th>
                <th className="p-3">Type</th>
                <th className="p-3">Status</th>
                <th className="p-3">Health</th>
                <th className="p-3">Latency</th>
                <th className="p-3">CPU %</th>
                <th className="p-3">RAM %</th>
                <th className="p-3">Last Seen</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {devices.map((d) => {
                const metric = getLatestMetricForDevice(d.id);
                return (
                  <tr
                    key={d.id}
                    onClick={() => navigate(`/devices/${d.id}`)}
                    className="hover:bg-slate-800/50 cursor-pointer transition-colors"
                  >
                    <td className="p-3 font-bold text-slate-100 flex items-center gap-2">
                      <Server className="w-4 h-4 text-cyan-400 shrink-0" />
                      <span>{d.name}</span>
                    </td>
                    <td className="p-3 font-mono text-cyan-300">{d.ipAddress}</td>
                    <td className="p-3 text-slate-400">{d.deviceType}</td>
                    <td className="p-3"><StatusBadge status={d.status} /></td>
                    <td className="p-3 font-bold font-mono text-emerald-400">{d.healthScore}%</td>
                    <td className="p-3 font-mono text-amber-400">{metric?.latency ? `${metric.latency} ms` : 'N/A'}</td>
                    <td className="p-3 font-mono text-cyan-400">{metric?.cpuUsage ? `${metric.cpuUsage}%` : 'N/A'}</td>
                    <td className="p-3 font-mono text-purple-400">{metric?.memoryUsage ? `${metric.memoryUsage}%` : 'N/A'}</td>
                    <td className="p-3 text-slate-400 font-mono text-[11px]">{new Date(d.lastSeen).toLocaleTimeString()}</td>
                    <td className="p-3 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/devices/${d.id}`);
                        }}
                        className="p-1.5 bg-slate-900 text-cyan-400 border border-slate-800 rounded-lg hover:bg-cyan-950 transition-colors"
                        title="View Console"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* TWO COLUMNS: ALERT CENTER & MINI TOPOLOGY PREVIEW */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Alerts Feed */}
        <div className="noc-card p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-500" />
                <span>NOC Alert Center (Recent Faults)</span>
              </h3>
              <p className="text-[11px] text-slate-400">Rule-based fault detection notifications.</p>
            </div>
            <button
              onClick={() => navigate('/alerts')}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1"
            >
              <span>Alert Management</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {alerts.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500 flex flex-col items-center gap-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                <span>No active critical alerts. Network infrastructure operating normally.</span>
              </div>
            ) : (
              alerts.map((a) => (
                <div
                  key={a.id}
                  className={`p-3.5 rounded-xl border text-xs flex flex-col space-y-2 transition-all ${
                    a.severity === 'CRITICAL'
                      ? 'bg-rose-950/30 border-rose-800/80 text-rose-200'
                      : a.severity === 'WARNING'
                      ? 'bg-amber-950/30 border-amber-800/80 text-amber-200'
                      : 'bg-slate-900 border-slate-800 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase font-mono ${
                        a.severity === 'CRITICAL' ? 'bg-rose-900 text-rose-200' : 'bg-amber-900 text-amber-200'
                      }`}>
                        {a.severity}
                      </span>
                      <span className="font-extrabold text-slate-100">{a.alertType}</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400">{new Date(a.createdAt).toLocaleTimeString()}</span>
                  </div>

                  <p className="text-slate-300 leading-relaxed font-sans">{a.message}</p>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-800/60">
                    <span className="text-[11px] font-mono text-slate-400">Status: <strong className="text-cyan-400">{a.status}</strong></span>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setSelectedAnalysisAlertId(a.id)}
                        className="px-2.5 py-1 bg-cyan-950/80 hover:bg-cyan-900/80 border border-cyan-800 text-cyan-300 rounded text-[11px] font-bold flex items-center gap-1 transition-colors"
                        title="Explain & Diagnose (XAI + Bayesian RCA)"
                      >
                        <Sparkles className="w-3 h-3 text-cyan-400" />
                        <span>Diagnose</span>
                      </button>

                      {a.status === 'OPEN' && (
                        <button
                          onClick={() => handleAcknowledge(a.id)}
                          className="px-2.5 py-1 bg-amber-600/30 hover:bg-amber-600/40 border border-amber-700 text-amber-200 rounded text-[11px] font-bold flex items-center gap-1"
                        >
                          <CheckSquare className="w-3 h-3" />
                          <span>Ack</span>
                        </button>
                      )}
                      {a.status !== 'RESOLVED' && (
                        <button
                          onClick={() => setConfirmModal({
                            isOpen: true,
                            alertId: a.id,
                            title: `Resolve Alert #${a.id}`,
                            message: `Are you sure you want to mark this ${a.alertType} alert on device as RESOLVED?`
                          })}
                          className="px-2.5 py-1 bg-emerald-600/30 hover:bg-emerald-600/40 border border-emerald-700 text-emerald-200 rounded text-[11px] font-bold flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Resolve</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Mini Network Topology Preview */}
        <div className="noc-card p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Network className="w-4 h-4 text-cyan-400" />
                <span>Network Topology Live Preview</span>
              </h3>
              <p className="text-[11px] text-slate-400">Node connectivity graph backed by database records.</p>
            </div>
            <button
              onClick={() => navigate('/topology')}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1"
            >
              <span>Full Topology Map</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 min-h-[300px] flex flex-col justify-between">
            {/* Visual Node Hierarchy Preview */}
            <div className="space-y-4 text-xs font-mono">
              <div className="flex justify-center">
                <div className="px-3 py-1.5 bg-slate-800 border border-cyan-800/80 rounded-lg text-cyan-400 font-bold flex items-center gap-1.5 shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                  <span>INTERNET / BACKBONE UPLINK</span>
                </div>
              </div>

              <div className="flex justify-center">
                <div className="h-4 w-0.5 bg-slate-700"></div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-center">
                {devices.slice(0, 4).map((d) => (
                  <div
                    key={d.id}
                    onClick={() => navigate(`/devices/${d.id}`)}
                    className="p-2.5 rounded-lg border bg-slate-950/80 cursor-pointer hover:border-cyan-500 transition-all flex flex-col items-center space-y-1"
                  >
                    <Server className="w-4 h-4 text-cyan-400" />
                    <span className="font-bold text-slate-200 truncate w-full">{d.name}</span>
                    <span className="text-[10px] text-cyan-300">{d.ipAddress}</span>
                    <StatusBadge status={d.status} />
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 font-mono">
              <span>Active Links: <strong className="text-cyan-400">{topology?.connections?.length || 0} Connections</strong></span>
              <span className="text-emerald-400">● Topology Synced</span>
            </div>
          </div>
        </div>
      </div>

      {/* Incident Analysis Deep Diagnostic Modal */}
      <IncidentAnalysisModal
        isOpen={!!selectedAnalysisAlertId}
        alertId={selectedAnalysisAlertId}
        onClose={() => setSelectedAnalysisAlertId(null)}
      />
    </div>
  );
};

export default Dashboard;
