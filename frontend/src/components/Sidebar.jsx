import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { alertService } from '../services/api';
import {
  LayoutDashboard,
  Server,
  Network,
  AlertTriangle,
  BarChart3,
  FileText,
  Settings,
  LogOut,
  Activity
} from 'lucide-react';

const Sidebar = () => {
  const navigate = useNavigate();
  const [openAlertCount, setOpenAlertCount] = useState(0);

  useEffect(() => {
    fetchOpenAlerts();
    const interval = setInterval(fetchOpenAlerts, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchOpenAlerts = async () => {
    try {
      const resp = await alertService.getAll();
      const openCount = resp.data.filter((a) => a.status === 'OPEN' || a.status === 'ACKNOWLEDGED').length;
      setOpenAlertCount(openCount);
    } catch (e) {
      // ignore
    }
  };

  const navItems = [
    { path: '/dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { path: '/devices', name: 'Devices', icon: Server },
    { path: '/topology', name: 'Topology', icon: Network },
    { path: '/alerts', name: 'Alerts', icon: AlertTriangle, badge: openAlertCount },
    { path: '/analytics', name: 'Analytics', icon: BarChart3 },
    { path: '/reports', name: 'Reports', icon: FileText },
    { path: '/settings', name: 'Settings', icon: Settings },
  ];

  const handleLogout = () => {
    localStorage.removeItem('inmms_token');
    localStorage.removeItem('inmms_username');
    navigate('/login');
  };

  return (
    <aside className="w-64 bg-[#090d16] border-r border-slate-800/80 flex flex-col justify-between h-screen sticky top-0 z-30 shrink-0">
      <div>
        {/* INMMS NOC Branding */}
        <div className="h-16 flex items-center px-6 border-b border-slate-800/80 space-x-3">
          <div className="p-2 bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 rounded-xl shadow-lg shadow-cyan-950/50">
            <Activity className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <h1 className="font-black text-lg tracking-wider text-slate-100 flex items-center gap-1.5">
              INMMS <span className="text-[9px] font-mono bg-cyan-950 text-cyan-400 border border-cyan-800 px-1.5 py-0.5 rounded">v1.0</span>
            </h1>
            <p className="text-[10px] text-cyan-400 font-mono tracking-tight font-semibold">NOC MONITORING PLATFORM</p>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="p-4 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-950/80 to-blue-950/80 text-cyan-400 border border-cyan-800/60 shadow-md shadow-cyan-950/40'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                  }`
                }
              >
                <div className="flex items-center space-x-3">
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </div>

                {item.badge !== undefined && item.badge > 0 && (
                  <span className="px-2 py-0.5 text-[10px] font-black rounded-full bg-rose-500 text-white shadow-sm animate-pulse">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* NOC Operator Footer */}
      <div className="p-4 border-t border-slate-800/80">
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/80 border border-slate-800/80">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-600 to-blue-600 border border-cyan-400 flex items-center justify-center font-bold text-xs text-white shadow-sm">
              AD
            </div>
            <div className="text-left">
              <div className="text-xs font-bold text-slate-200">Administrator</div>
              <div className="text-[10px] text-emerald-400 flex items-center gap-1 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                NOC Console
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Logout from NOC Portal"
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
