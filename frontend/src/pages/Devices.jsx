import React, { useState, useEffect } from 'react';
import { deviceService } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import { Plus, Search, Edit3, Trash2, Eye, Shield, ToggleLeft, ToggleRight, Server } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Devices = () => {
  const [devices, setDevices] = useState([]);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editDevice, setEditDevice] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    ipAddress: '',
    deviceType: 'Server',
    location: '',
    description: '',
    monitoringEnabled: true,
  });

  const [formError, setFormError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchDevices();
  }, []);

  const fetchDevices = async () => {
    try {
      const resp = await deviceService.getAll();
      setDevices(resp.data);
    } catch (err) {
      console.error('Failed to fetch devices:', err);
    }
  };

  const handleOpenAddModal = () => {
    setEditDevice(null);
    setFormData({
      name: '',
      ipAddress: '',
      deviceType: 'Server',
      location: '',
      description: '',
      monitoringEnabled: true,
    });
    setFormError('');
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (device) => {
    setEditDevice(device);
    setFormData({
      name: device.name,
      ipAddress: device.ipAddress,
      deviceType: device.deviceType,
      location: device.location || '',
      description: device.description || '',
      monitoringEnabled: device.monitoringEnabled !== false,
    });
    setFormError('');
    setIsAddModalOpen(true);
  };

  const validateIp = (ip) => {
    if (ip === '127.0.0.1' || ip === 'localhost') return true;
    const pattern = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    return pattern.test(ip);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.name.trim()) {
      setFormError('Device name is required');
      return;
    }
    if (!formData.ipAddress.trim() || !validateIp(formData.ipAddress.trim())) {
      setFormError('Please enter a valid IPv4 address (e.g., 192.168.1.1)');
      return;
    }

    try {
      if (editDevice) {
        await deviceService.update(editDevice.id, formData);
      } else {
        await deviceService.create(formData);
      }
      setIsAddModalOpen(false);
      fetchDevices();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to save device');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this network device?')) {
      try {
        await deviceService.delete(id);
        fetchDevices();
      } catch (err) {
        console.error('Failed to delete device:', err);
      }
    }
  };

  const handleToggleMonitoring = async (device) => {
    try {
      await deviceService.update(device.id, { monitoringEnabled: !device.monitoringEnabled });
      fetchDevices();
    } catch (err) {
      console.error('Failed to toggle monitoring:', err);
    }
  };

  // Filtered devices
  const filteredDevices = devices.filter((d) => {
    const matchesSearch =
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.ipAddress.toLowerCase().includes(search.toLowerCase()) ||
      (d.location && d.location.toLowerCase().includes(search.toLowerCase()));

    const matchesType = typeFilter === 'ALL' || d.deviceType === typeFilter;
    const matchesStatus = statusFilter === 'ALL' || d.status === statusFilter;

    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header & Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-100 flex items-center gap-2">
            <Server className="w-6 h-6 text-cyan-400" />
            <span>Device Inventory & Management</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure, monitor, and manage network infrastructure devices.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="flex items-center space-x-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold px-4 py-2.5 rounded-lg shadow-lg transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>ADD NEW DEVICE</span>
        </button>
      </div>

      {/* Search & Filter Controls */}
      <div className="noc-card p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by Device Name, IP, or Location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center space-x-2 text-xs">
            <span className="text-slate-400 font-semibold">Type:</span>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-slate-900 border border-slate-800 text-slate-200 rounded-lg px-3 py-2 focus:outline-none"
            >
              <option value="ALL">ALL TYPES</option>
              <option value="Router">Router</option>
              <option value="Switch">Switch</option>
              <option value="Server">Server</option>
              <option value="Firewall">Firewall</option>
              <option value="Workstation">Workstation</option>
              <option value="Access Point">Access Point</option>
            </select>
          </div>

          <div className="flex items-center space-x-2 text-xs">
            <span className="text-slate-400 font-semibold">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-900 border border-slate-800 text-slate-200 rounded-lg px-3 py-2 focus:outline-none"
            >
              <option value="ALL">ALL STATUSES</option>
              <option value="UP">UP</option>
              <option value="WARNING">WARNING</option>
              <option value="CRITICAL">CRITICAL</option>
              <option value="DOWN">DOWN</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Devices Table */}
      <div className="noc-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-900/80 text-slate-400 border-b border-slate-800 uppercase font-mono">
                <th className="p-3.5">Device Name</th>
                <th className="p-3.5">IP Address</th>
                <th className="p-3.5">Type</th>
                <th className="p-3.5">Location</th>
                <th className="p-3.5">Health</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Monitoring</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredDevices.length === 0 ? (
                <tr>
                  <td colSpan="8" className="p-8 text-center text-slate-500">
                    No matching devices found in inventory.
                  </td>
                </tr>
              ) : (
                filteredDevices.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3.5 font-bold text-slate-200 flex items-center gap-2">
                      <Server className="w-4 h-4 text-cyan-400" />
                      <span>{d.name}</span>
                    </td>
                    <td className="p-3.5 font-mono text-cyan-300">{d.ipAddress}</td>
                    <td className="p-3.5 text-slate-300">{d.deviceType}</td>
                    <td className="p-3.5 text-slate-400">{d.location || 'N/A'}</td>
                    <td className="p-3.5 font-bold text-emerald-400">{d.healthScore}%</td>
                    <td className="p-3.5"><StatusBadge status={d.status} /></td>
                    <td className="p-3.5">
                      <button
                        onClick={() => handleToggleMonitoring(d)}
                        className={`flex items-center space-x-1 px-2.5 py-1 rounded-full border text-[11px] font-semibold transition-all ${
                          d.monitoringEnabled
                            ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800'
                            : 'bg-slate-900 text-slate-500 border-slate-800'
                        }`}
                      >
                        {d.monitoringEnabled ? (
                          <>
                            <ToggleRight className="w-4 h-4 text-emerald-400" />
                            <span>ENABLED</span>
                          </>
                        ) : (
                          <>
                            <ToggleLeft className="w-4 h-4 text-slate-500" />
                            <span>DISABLED</span>
                          </>
                        )}
                      </button>
                    </td>
                    <td className="p-3.5 text-right space-x-2">
                      <button
                        onClick={() => navigate(`/devices/${d.id}`)}
                        title="View Device Telemetry"
                        className="p-1.5 bg-slate-900 text-cyan-400 border border-slate-800 rounded hover:bg-cyan-950 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleOpenEditModal(d)}
                        title="Edit Device"
                        className="p-1.5 bg-slate-900 text-amber-400 border border-slate-800 rounded hover:bg-amber-950 transition-colors"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(d.id)}
                        title="Delete Device"
                        className="p-1.5 bg-slate-900 text-rose-400 border border-slate-800 rounded hover:bg-rose-950 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Device Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#111827] border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <Server className="w-5 h-5 text-cyan-400" />
              <span>{editDevice ? 'Edit Device Configuration' : 'Add New Network Device'}</span>
            </h3>

            {formError && (
              <div className="bg-rose-950/60 border border-rose-800 text-rose-300 text-xs p-3 rounded-lg">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Device Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Switch-Floor2"
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">IP Address *</label>
                  <input
                    type="text"
                    required
                    value={formData.ipAddress}
                    onChange={(e) => setFormData({ ...formData, ipAddress: e.target.value })}
                    placeholder="e.g. 192.168.1.50"
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Device Type *</label>
                  <select
                    value={formData.deviceType}
                    onChange={(e) => setFormData({ ...formData, deviceType: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="Router">Router</option>
                    <option value="Switch">Switch</option>
                    <option value="Server">Server</option>
                    <option value="Firewall">Firewall</option>
                    <option value="Workstation">Workstation</option>
                    <option value="Access Point">Access Point</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g. Rack 02 Floor 3"
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Description</label>
                <textarea
                  rows="2"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Optional technical notes..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="monitoringEnabled"
                  checked={formData.monitoringEnabled}
                  onChange={(e) => setFormData({ ...formData, monitoringEnabled: e.target.checked })}
                  className="rounded border-slate-800 bg-slate-900 text-cyan-600 focus:ring-0"
                />
                <label htmlFor="monitoringEnabled" className="text-xs text-slate-300 font-semibold cursor-pointer">
                  Enable Continuous Telemetry Monitoring
                </label>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold rounded-lg shadow-lg"
                >
                  {editDevice ? 'Save Changes' : 'Create Device'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Devices;
