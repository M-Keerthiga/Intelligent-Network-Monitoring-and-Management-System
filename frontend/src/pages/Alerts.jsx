import React, { useState, useEffect } from 'react';
import { alertService, deviceService, analysisService } from '../services/api';
import ConfirmModal from '../components/ConfirmModal';
import Toast from '../components/Toast';
import ExplainableAI from '../components/ExplainableAI';
import RootCauseAnalysis from '../components/RootCauseAnalysis';
import IncidentAnalysisModal from '../components/IncidentAnalysisModal';
import { ShieldAlert, CheckCircle, CheckSquare, RefreshCw, Lightbulb, Search, Filter, Sparkles, GitBranch, ChevronDown, ChevronUp } from 'lucide-react';

const Alerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [devices, setDevices] = useState([]);
  const [statusTab, setStatusTab] = useState('ALL'); // ALL, OPEN, ACKNOWLEDGED, RESOLVED
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [deviceFilter, setDeviceFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Toast & Confirm Modal states
  const [toast, setToast] = useState({ message: '', type: 'success' });
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, alertId: null, title: '', message: '' });

  const [ackModalAlert, setAckModalAlert] = useState(null);
  const [ackNote, setAckNote] = useState('');

  // XAI & Bayesian Root Cause States
  const [analysisMap, setAnalysisMap] = useState({});
  const [expandedAlertId, setExpandedAlertId] = useState(null);
  const [modalAlertId, setModalAlertId] = useState(null);
  const [loadingAnalysisId, setLoadingAnalysisId] = useState(null);

  const toggleAlertAnalysis = async (alertId) => {
    if (expandedAlertId === alertId) {
      setExpandedAlertId(null);
      return;
    }
    setExpandedAlertId(alertId);
    if (!analysisMap[alertId]) {
      setLoadingAnalysisId(alertId);
      try {
        const resp = await analysisService.getForAlert(alertId);
        setAnalysisMap((prev) => ({ ...prev, [alertId]: resp.data }));
      } catch (err) {
        console.error('Failed to load analysis for alert:', err);
      } finally {
        setLoadingAnalysisId(null);
      }
    }
  };

  useEffect(() => {
    fetchAlertsAndDevices();
    const interval = setInterval(fetchAlertsAndDevices, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchAlertsAndDevices = async () => {
    try {
      const [alrResp, devResp] = await Promise.all([
        alertService.getAll(),
        deviceService.getAll()
      ]);
      setAlerts(alrResp.data);
      setDevices(devResp.data);
    } catch (err) {
      console.error('Failed to fetch alerts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAcknowledge = async () => {
    if (!ackModalAlert) return;
    try {
      const username = localStorage.getItem('inmms_username') || 'admin';
      await alertService.acknowledge(ackModalAlert.id, { username, note: ackNote });
      setToast({ message: `Alert #${ackModalAlert.id} acknowledged`, type: 'success' });
      setAckModalAlert(null);
      setAckNote('');
      fetchAlertsAndDevices();
    } catch (err) {
      setToast({ message: 'Failed to acknowledge alert', type: 'error' });
    }
  };

  const handleConfirmResolve = async () => {
    if (!confirmModal.alertId) return;
    try {
      await alertService.resolve(confirmModal.alertId);
      setToast({ message: `Alert #${confirmModal.alertId} marked as RESOLVED`, type: 'success' });
      fetchAlertsAndDevices();
    } catch (err) {
      setToast({ message: 'Failed to resolve alert', type: 'error' });
    }
  };

  const getDeviceName = (deviceId) => {
    const d = devices.find((dev) => dev.id === deviceId);
    return d ? `${d.name} (${d.ipAddress})` : `Device #${deviceId}`;
  };

  const filteredAlerts = alerts.filter((a) => {
    const matchesStatus = statusTab === 'ALL' || a.status === statusTab;
    const matchesSeverity = severityFilter === 'ALL' || a.severity === severityFilter;
    const matchesDevice = deviceFilter === 'ALL' || a.deviceId.toString() === deviceFilter;
    const matchesSearch = !search || a.message.toLowerCase().includes(search.toLowerCase()) || a.alertType.toLowerCase().includes(search.toLowerCase());

    return matchesStatus && matchesSeverity && matchesDevice && matchesSearch;
  });

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
        onConfirm={handleConfirmResolve}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-100 flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-rose-500" />
            <span>NOC Fault Alert Lifecycle Center</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time rule-based & statistical fault notifications with lifecycle controls.
          </p>
        </div>

        <button
          onClick={fetchAlertsAndDevices}
          className="flex items-center space-x-1.5 bg-slate-900 border border-slate-800 text-slate-300 hover:text-white px-3 py-2 rounded-xl text-xs font-semibold transition-all shadow-sm"
        >
          <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
          <span>Refresh Alerts</span>
        </button>
      </div>

      {/* Tabs & Filters Bar */}
      <div className="noc-card p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Status Tabs */}
        <div className="flex bg-slate-900 border border-slate-800 rounded-xl p-1 w-full md:w-auto">
          {['ALL', 'OPEN', 'ACKNOWLEDGED', 'RESOLVED'].map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusTab(tab)}
              className={`flex-1 md:flex-none px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                statusTab === tab
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-48">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search alert message..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="flex items-center space-x-2 text-xs">
            <span className="text-slate-400 font-semibold">Severity:</span>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="bg-slate-900 border border-slate-800 text-slate-200 rounded-lg px-3 py-1.5 focus:outline-none"
            >
              <option value="ALL">ALL SEVERITIES</option>
              <option value="CRITICAL">CRITICAL</option>
              <option value="WARNING">WARNING</option>
              <option value="INFO">INFO</option>
            </select>
          </div>

          <div className="flex items-center space-x-2 text-xs">
            <span className="text-slate-400 font-semibold">Device:</span>
            <select
              value={deviceFilter}
              onChange={(e) => setDeviceFilter(e.target.value)}
              className="bg-slate-900 border border-slate-800 text-slate-200 rounded-lg px-3 py-1.5 focus:outline-none"
            >
              <option value="ALL">ALL DEVICES</option>
              {devices.map((d) => (
                <option key={d.id} value={d.id.toString()}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Alert Cards List */}
      <div className="space-y-4">
        {filteredAlerts.length === 0 ? (
          <div className="noc-card p-12 text-center text-slate-500 text-xs">
            No active alerts matching the selected criteria.
          </div>
        ) : (
          filteredAlerts.map((a) => (
            <div
              key={a.id}
              className={`noc-card p-5 border-l-4 transition-all hover:border-slate-700 ${
                a.severity === 'CRITICAL'
                  ? 'border-l-rose-500 bg-rose-950/20'
                  : a.severity === 'WARNING'
                  ? 'border-l-amber-500 bg-amber-950/20'
                  : 'border-l-blue-500 bg-slate-900/60'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-2">
                <div className="flex items-center space-x-3">
                  <span
                    className={`px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                      a.severity === 'CRITICAL'
                        ? 'bg-rose-900 text-rose-200 border border-rose-700'
                        : 'bg-amber-900 text-amber-200 border border-amber-700'
                    }`}
                  >
                    {a.severity}
                  </span>
                  <span className="font-extrabold text-sm text-slate-100">{a.alertType}</span>
                  <span className="text-xs text-cyan-400 font-mono">@{getDeviceName(a.deviceId)}</span>
                </div>

                <div className="flex items-center space-x-4 text-xs font-mono text-slate-400">
                  <span>Metric: <strong className="text-slate-200">{a.metricValue !== null ? a.metricValue : 'N/A'}</strong> (Thresh: {a.threshold})</span>
                  <span>Logged: {new Date(a.createdAt).toLocaleString()}</span>
                  <span
                    className={`font-bold px-2.5 py-0.5 rounded ${
                      a.status === 'OPEN'
                        ? 'bg-rose-950 text-rose-400 border border-rose-800'
                        : a.status === 'ACKNOWLEDGED'
                        ? 'bg-amber-950 text-amber-400 border border-amber-800'
                        : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                    }`}
                  >
                    {a.status}
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-200 mb-3 leading-relaxed font-sans">{a.message}</p>

              {/* Troubleshooting Recommendation Box */}
              {a.recommendedAction && (
                <div className="p-3 bg-slate-900/90 border border-slate-800 rounded-xl text-xs text-cyan-300 font-mono flex items-start space-x-2.5 mb-3">
                  <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-amber-400 block mb-0.5">RECOMMENDED NOC TROUBLESHOOTING ACTION:</span>
                    <span>{a.recommendedAction}</span>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/60">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => toggleAlertAnalysis(a.id)}
                    className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                      expandedAlertId === a.id
                        ? 'bg-cyan-600 text-white border-cyan-500 shadow-sm'
                        : 'bg-cyan-950/60 hover:bg-cyan-900/60 text-cyan-300 border-cyan-800/80'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Explain & Root Cause (XAI + Bayesian)</span>
                    {expandedAlertId === a.id ? (
                      <ChevronUp className="w-3.5 h-3.5 ml-1" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5 ml-1" />
                    )}
                  </button>

                  <button
                    onClick={() => setModalAlertId(a.id)}
                    title="Open Detailed Diagnostic Modal"
                    className="p-1.5 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-cyan-300 border border-slate-800 rounded-lg text-xs transition-colors"
                  >
                    <GitBranch className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center space-x-3">
                  {a.status === 'OPEN' && (
                    <button
                      onClick={() => setAckModalAlert(a)}
                      className="flex items-center space-x-1.5 bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-800 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                    >
                      <CheckSquare className="w-3.5 h-3.5" />
                      <span>Acknowledge</span>
                    </button>
                  )}

                  {a.status !== 'RESOLVED' && (
                    <button
                      onClick={() => setConfirmModal({
                        isOpen: true,
                        alertId: a.id,
                        title: `Resolve Alert #${a.id}`,
                        message: `Are you sure you want to mark this ${a.alertType} alert as RESOLVED?`
                      })}
                      className="flex items-center space-x-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-800 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Mark Resolved</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Expandable Inline XAI & Bayesian Root Cause Analysis Panel */}
              {expandedAlertId === a.id && (
                <div className="mt-4 pt-4 border-t border-slate-800/90 space-y-4">
                  {loadingAnalysisId === a.id && (
                    <div className="p-8 text-center text-xs text-slate-400 flex items-center justify-center space-x-2">
                      <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
                      <span>Calculating metric deviations and Bayesian posterior probabilities...</span>
                    </div>
                  )}

                  {analysisMap[a.id] && (
                    <div className="space-y-6">
                      <ExplainableAI
                        xai={analysisMap[a.id].xai}
                        observedMetrics={analysisMap[a.id].observedMetrics}
                        baselineMetrics={analysisMap[a.id].baselineMetrics}
                        deviceName={analysisMap[a.id].deviceName}
                      />
                      <RootCauseAnalysis
                        bayesianRca={analysisMap[a.id].bayesianRca}
                        recommendation={analysisMap[a.id].recommendation}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Acknowledge Modal */}
      {ackModalAlert && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#111827] border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-amber-400" />
              <span>Acknowledge Fault Alert #{ackModalAlert.id}</span>
            </h3>

            <p className="text-xs text-slate-300 bg-slate-900 p-3 rounded-xl border border-slate-800">
              {ackModalAlert.message}
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                Acknowledgement Operator Note
              </label>
              <textarea
                rows="3"
                value={ackNote}
                onChange={(e) => setAckNote(e.target.value)}
                placeholder="Optional resolution progress notes..."
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2 border-t border-slate-800">
              <button
                onClick={() => setAckModalAlert(null)}
                className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-semibold rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleAcknowledge}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs rounded-lg shadow-lg"
              >
                Confirm Acknowledgement
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Incident Analysis Deep Diagnostic Modal */}
      <IncidentAnalysisModal
        isOpen={!!modalAlertId}
        alertId={modalAlertId}
        onClose={() => setModalAlertId(null)}
      />
    </div>
  );
};

export default Alerts;
