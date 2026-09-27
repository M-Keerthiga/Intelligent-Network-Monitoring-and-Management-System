import React, { useState, useEffect, useCallback } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  applyNodeChanges,
  applyEdgeChanges
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { topologyService } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import Toast from '../components/Toast';
import { Network, Plus, Trash2, Server, Shield, Wifi, Radio, Cpu, RefreshCw, X, Info } from 'lucide-react';

const Topology = () => {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [rawDevices, setRawDevices] = useState([]);
  const [rawConnections, setRawConnections] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState(null);

  const [isAddConnModalOpen, setIsAddConnModalOpen] = useState(false);
  const [sourceDevId, setSourceDevId] = useState('');
  const [targetDevId, setTargetDevId] = useState('');
  const [connType, setConnType] = useState('Ethernet');

  const [toast, setToast] = useState({ message: '', type: 'success' });

  useEffect(() => {
    fetchTopologyData();
    const interval = setInterval(fetchTopologyData, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchTopologyData = async () => {
    try {
      const resp = await topologyService.getTopology();
      const { nodes: devNodes, connections } = resp.data;

      setRawDevices(devNodes);
      setRawConnections(connections);

      // Map device nodes to clean React Flow layout coordinates
      const positions = {
        'Main-Firewall': { x: 400, y: 40 },
        'Main-Gateway': { x: 400, y: 150 },
        'Core-Switch': { x: 400, y: 270 },
        'Application-Server': { x: 120, y: 410 },
        'Database-Server': { x: 360, y: 410 },
        'Access-Point': { x: 600, y: 410 },
        'Local Host': { x: 820, y: 410 },
      };

      const flowNodes = devNodes.map((d, index) => {
        const pos = positions[d.name] || { x: 120 + (index % 4) * 220, y: 410 + Math.floor(index / 4) * 130 };

        let borderColor = '#10b981'; // GREEN UP
        if (d.status === 'WARNING') borderColor = '#f59e0b';
        if (d.status === 'CRITICAL') borderColor = '#ef4444';
        if (d.status === 'DOWN') borderColor = '#6b7280';

        return {
          id: d.id.toString(),
          position: pos,
          data: { label: d.name, device: d },
          style: {
            background: '#111827',
            color: '#f3f4f6',
            border: `2px solid ${borderColor}`,
            borderRadius: '14px',
            padding: '12px 14px',
            width: 180,
            boxShadow: `0 0 16px ${borderColor}35`,
          },
        };
      });

      const flowEdges = connections.map((c) => ({
        id: `e-${c.id}`,
        source: c.sourceDeviceId.toString(),
        target: c.targetDeviceId.toString(),
        animated: true,
        label: c.connectionType,
        style: { stroke: '#38bdf8', strokeWidth: 2.5 },
        labelStyle: { fill: '#9ca3af', fontSize: 10, fontFamily: 'monospace', fontWeight: 600 },
      }));

      setNodes(flowNodes);
      setEdges(flowEdges);
    } catch (err) {
      console.error('Failed to load topology:', err);
    }
  };

  const onNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );
  const onEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  const handleNodeClick = (event, node) => {
    setSelectedDevice(node.data.device);
  };

  const handleAddConnection = async (e) => {
    e.preventDefault();
    if (!sourceDevId || !targetDevId) return;

    try {
      await topologyService.addConnection({
        sourceDeviceId: parseInt(sourceDevId),
        targetDeviceId: parseInt(targetDevId),
        connectionType: connType,
      });
      setToast({ message: 'Topology link connection created successfully', type: 'success' });
      setIsAddConnModalOpen(false);
      fetchTopologyData();
    } catch (err) {
      setToast({ message: 'Failed to create connection link', type: 'error' });
    }
  };

  const handleDeleteConnection = async (connId) => {
    try {
      await topologyService.deleteConnection(connId);
      setToast({ message: 'Link connection deleted', type: 'info' });
      fetchTopologyData();
    } catch (err) {
      setToast({ message: 'Failed to delete connection', type: 'error' });
    }
  };

  return (
    <div className="p-6 space-y-6">
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'success' })} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-100 flex items-center gap-2">
            <Network className="w-6 h-6 text-cyan-400" />
            <span>Interactive Network Topology Map</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Database-backed visual graph representation of active network links and device node health.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsAddConnModalOpen(true)}
            className="flex items-center space-x-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg"
          >
            <Plus className="w-4 h-4" />
            <span>ADD LINK CONNECTION</span>
          </button>
        </div>
      </div>

      {/* Main Flow Canvas & Inspector Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* React Flow Viewport */}
        <div className="lg:col-span-3 noc-card h-[580px] relative overflow-hidden">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeClick={handleNodeClick}
            fitView
          >
            <Background color="#1f2937" gap={16} />
            <Controls className="bg-slate-900 border-slate-800 text-slate-200" />
          </ReactFlow>
        </div>

        {/* Selected Node / Active Links Inspector Panel */}
        <div className="noc-card p-5 space-y-5">
          <h3 className="text-sm font-bold text-slate-200 border-b border-slate-800 pb-2 flex items-center gap-2">
            <Info className="w-4 h-4 text-cyan-400" />
            <span>Topology Inspector</span>
          </h3>

          {selectedDevice ? (
            <div className="space-y-3 text-xs bg-slate-900/90 p-4 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-sm text-cyan-300">{selectedDevice.name}</span>
                <span className="font-bold text-emerald-400 font-mono">{selectedDevice.healthScore}%</span>
              </div>
              <div className="text-slate-400">IP: <strong className="text-slate-200 font-mono">{selectedDevice.ipAddress}</strong></div>
              <div className="text-slate-400">Type: <strong className="text-slate-200">{selectedDevice.deviceType}</strong></div>
              <div className="text-slate-400 flex items-center justify-between">
                <span>Status:</span>
                <StatusBadge status={selectedDevice.status} />
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-500">Click any device node on the graph canvas to inspect real-time telemetry.</p>
          )}

          {/* Active Topology Links Table */}
          <div className="pt-2 border-t border-slate-800 space-y-2">
            <h4 className="text-xs font-bold text-slate-300 uppercase">Active Links ({rawConnections.length})</h4>
            <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
              {rawConnections.map((c) => {
                const src = rawDevices.find((d) => d.id === c.sourceDeviceId)?.name || `Dev#${c.sourceDeviceId}`;
                const tgt = rawDevices.find((d) => d.id === c.targetDeviceId)?.name || `Dev#${c.targetDeviceId}`;
                return (
                  <div key={c.id} className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px] flex items-center justify-between">
                    <div>
                      <div className="text-slate-200 font-bold">{src} ➔ {tgt}</div>
                      <div className="text-[10px] text-cyan-400 font-mono">{c.connectionType}</div>
                    </div>
                    <button
                      onClick={() => handleDeleteConnection(c.id)}
                      title="Delete Link Connection"
                      className="text-rose-400 hover:text-rose-300 p-1.5 hover:bg-rose-950/40 rounded transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Add Connection Modal */}
      {isAddConnModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#111827] border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Network className="w-5 h-5 text-cyan-400" />
              <span>Add Topology Link Connection</span>
            </h3>

            <form onSubmit={handleAddConnection} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Source Device *</label>
                <select
                  value={sourceDevId}
                  onChange={(e) => setSourceDevId(e.target.value)}
                  required
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                >
                  <option value="">Select Source Device...</option>
                  {rawDevices.map((d) => (
                    <option key={d.id} value={d.id}>{d.name} ({d.ipAddress})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Target Device *</label>
                <select
                  value={targetDevId}
                  onChange={(e) => setTargetDevId(e.target.value)}
                  required
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                >
                  <option value="">Select Target Device...</option>
                  {rawDevices.map((d) => (
                    <option key={d.id} value={d.id}>{d.name} ({d.ipAddress})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Connection Type</label>
                <select
                  value={connType}
                  onChange={(e) => setConnType(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                >
                  <option value="Ethernet">Ethernet (Cat6)</option>
                  <option value="Fiber">Fiber Optic (10G)</option>
                  <option value="Wireless">Wireless Wi-Fi 6</option>
                  <option value="Uplink">Trunk Uplink</option>
                </select>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddConnModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold rounded-lg shadow-lg"
                >
                  Create Connection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Topology;
