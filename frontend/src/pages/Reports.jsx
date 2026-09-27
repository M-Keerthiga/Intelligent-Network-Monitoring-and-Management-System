import React, { useState, useEffect } from 'react';
import { reportService } from '../services/api';
import MetricCard from '../components/MetricCard';
import { FileText, Download, ShieldAlert, CheckCircle, Server, Activity, Clock, BarChart2, PieChart as PieChartIcon } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell, PieChart, Pie, Legend
} from 'recharts';

const Reports = () => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReport();
  }, []);

  const fetchReport = async () => {
    try {
      const resp = await reportService.getSummary();
      setReport(resp.data);
    } catch (err) {
      console.error('Failed to fetch report summary:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCsv = () => {
    window.open(reportService.getExportCsvUrl(), '_blank');
  };

  if (loading && !report) {
    return (
      <div className="p-8 text-center text-slate-400 font-mono">
        Generating NOC Executive SLA Report...
      </div>
    );
  }

  // Prepare chart data for problem/health ranking
  const healthData = report?.problematicDevices?.map((d) => ({
    name: d.name,
    health: d.healthScore,
    alerts: d.alertCount
  })) || [];

  const alertDistributionData = [
    { name: 'Critical Alerts', value: report?.criticalAlerts || 0, color: '#ef4444' },
    { name: 'Warning Alerts', value: report?.warningAlerts || 0, color: '#f59e0b' },
    { name: 'Resolved Alerts', value: report?.resolvedAlerts || 0, color: '#10b981' },
  ].filter(d => d.value > 0);

  return (
    <div className="p-6 space-y-6">
      {/* Header & CSV Download Action */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-100 flex items-center gap-2">
            <FileText className="w-6 h-6 text-emerald-400" />
            <span>NOC Executive SLA & System Reports</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Aggregated uptime statistics, SLA compliance %, and device performance reports.
          </p>
        </div>

        <button
          onClick={handleExportCsv}
          className="flex items-center space-x-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold px-4 py-2.5 rounded-lg shadow-lg transition-all cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>EXPORT REPORT (CSV)</span>
        </button>
      </div>

      {/* SLA Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Network SLA Availability"
          value={`${report?.availabilityPercentage || 100}%`}
          icon={CheckCircle}
          color="emerald"
          subtext="Target SLA: > 99.5%"
        />
        <MetricCard
          title="Average Network Latency"
          value={report?.averageLatency || 0}
          unit="ms"
          icon={Clock}
          color="cyan"
          subtext="Acceptable: < 100ms"
        />
        <MetricCard
          title="Average Packet Loss"
          value={report?.averagePacketLoss || 0}
          unit="%"
          icon={Activity}
          color="amber"
          subtext="Acceptable: < 1.0%"
        />
        <MetricCard
          title="Total System Alerts"
          value={report?.totalAlerts || 0}
          icon={ShieldAlert}
          color="rose"
          subtext={`Critical: ${report?.criticalAlerts || 0} | Resolved: ${report?.resolvedAlerts || 0}`}
        />
      </div>

      {/* Highlights Box */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="noc-card p-5 space-y-2">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Highest CPU Utilization Device</h3>
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-slate-100">{report?.highestCpuDevice || 'None'}</span>
            <span className="text-xl font-black text-rose-400">{report?.highestCpuValue || 0}%</span>
          </div>
        </div>

        <div className="noc-card p-5 space-y-2">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Highest Latency Device</h3>
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-slate-100">{report?.highestLatencyDevice || 'None'}</span>
            <span className="text-xl font-black text-amber-400">{report?.highestLatencyValue || 0} ms</span>
          </div>
        </div>
      </div>

      {/* SLA Performance & Alert Visual Graphs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Device Health Score Comparison Bar Chart */}
        <div className="noc-card p-5 lg:col-span-2">
          <h3 className="text-sm font-bold text-slate-200 mb-4 flex items-center justify-between">
            <span>Device Health Score Rating (%)</span>
            <BarChart2 className="w-4 h-4 text-cyan-400" />
          </h3>
          <div className="h-60">
            {healthData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-500">
                All infrastructure operating at 100% Health
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={healthData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                  <XAxis dataKey="name" stroke="#6b7280" tick={{ fontSize: 10 }} />
                  <YAxis domain={[0, 100]} stroke="#6b7280" tick={{ fontSize: 10 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '8px' }} />
                  <Bar dataKey="health" name="Health Score %" radius={[4, 4, 0, 0]}>
                    {healthData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.health >= 90 ? '#10b981' : entry.health >= 75 ? '#3b82f6' : entry.health >= 50 ? '#f59e0b' : '#ef4444'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Executive Alert Breakdown Pie Chart */}
        <div className="noc-card p-5">
          <h3 className="text-sm font-bold text-slate-200 mb-4 flex items-center justify-between">
            <span>Alert Severity Distribution</span>
            <PieChartIcon className="w-4 h-4 text-rose-400" />
          </h3>
          <div className="h-60 flex items-center justify-center">
            {alertDistributionData.length === 0 ? (
              <div className="text-xs text-slate-500">Zero System Alerts Recorded</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={alertDistributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {alertDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '8px' }} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Problematic Devices Breakdown Table */}
      <div className="noc-card p-5">
        <h3 className="text-sm font-bold text-slate-200 mb-4 flex items-center justify-between">
          <span>Problematic & High-Risk Devices Ranking</span>
          <Server className="w-4 h-4 text-cyan-400" />
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-slate-400 border-b border-slate-800 uppercase font-mono">
                <th className="pb-2">Device Name</th>
                <th className="pb-2">IP Address</th>
                <th className="pb-2">Type</th>
                <th className="pb-2">Health Score</th>
                <th className="pb-2">Current Status</th>
                <th className="pb-2 text-right">Total Alert Count</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {report?.problematicDevices?.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-6 text-center text-slate-500">
                    No problematic devices detected. All infrastructure operating within optimal bounds.
                  </td>
                </tr>
              ) : (
                report?.problematicDevices?.map((d) => (
                  <tr key={d.deviceId} className="hover:bg-slate-800/40">
                    <td className="py-3 font-bold text-slate-200">{d.name}</td>
                    <td className="py-3 font-mono text-cyan-400">{d.ipAddress}</td>
                    <td className="py-3 text-slate-400">{d.deviceType}</td>
                    <td className="py-3 font-bold text-emerald-400">{d.healthScore}%</td>
                    <td className="py-3 font-bold text-amber-400">{d.status}</td>
                    <td className="py-3 text-right font-black text-rose-400">{d.alertCount}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reports;
