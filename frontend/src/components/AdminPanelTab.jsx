import React, { useState, useEffect } from 'react';
import {
  Shield,
  Plus,
  Trash2,
  RefreshCw,
  MapPin,
  Bus,
  Cpu,
  Lock,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
  Sparkles
} from 'lucide-react';
import { api } from '../services/api';

const AdminPanelTab = ({ stops = [], routes = [], buses = [], user, onOpenAuth, onDataUpdated }) => {
  const [summary, setSummary] = useState(null);
  const [healthData, setHealthData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Stop creation form modal
  const [showAddStopModal, setShowAddStopModal] = useState(false);
  const [newStop, setNewStop] = useState({
    name: '',
    code: '',
    zone: 'Zone A - Downtown',
    latitude: 28.62,
    longitude: 77.22,
    passengerCapacity: 2500
  });

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    loadDashboardAndHealth();
  }, []);

  const loadDashboardAndHealth = async () => {
    setLoading(true);
    try {
      const [sumRes, healthRes] = await Promise.all([
        api.dashboard.getSummary(),
        api.health.getDetailed()
      ]);
      setSummary(sumRes.data);
      setHealthData(healthRes);
    } catch (err) {
      console.error('Failed to load admin stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    if (!isAdmin) {
      alert('Access Restricted: Only users with the Administrator role can add or edit stations. Please sign in as Admin.');
      if (onOpenAuth) onOpenAuth();
      return;
    }
    setShowAddStopModal(true);
  };

  const handleCreateStop = async (e) => {
    e.preventDefault();
    if (!isAdmin) {
      alert('Access Restricted: Only Administrators can create stations.');
      return;
    }

    try {
      await api.stops.create(newStop);
      setShowAddStopModal(false);
      setNewStop({
        name: '',
        code: '',
        zone: 'Zone A - Downtown',
        latitude: 28.62,
        longitude: 77.22,
        passengerCapacity: 2500
      });
      if (onDataUpdated) onDataUpdated();
      loadDashboardAndHealth();
    } catch (err) {
      alert(err.message || 'Failed to create stop');
    }
  };

  const handleDeleteStop = async (stopId) => {
    if (!isAdmin) {
      alert('Access Restricted: Only Administrators can delete stations.');
      return;
    }
    if (!confirm('Are you sure you want to remove this station from the transport network?')) return;

    try {
      await api.stops.delete(stopId);
      if (onDataUpdated) onDataUpdated();
      loadDashboardAndHealth();
    } catch (err) {
      alert(err.message || 'Failed to delete stop');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-100 via-blue-50/60 to-white border border-slate-200/90 rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100/70 text-blue-800 text-xs font-bold mb-2 border border-blue-200/60">
              <Shield className="w-3.5 h-3.5 text-blue-600" />
              <span>Admin Center & Station Provisioning</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Transport Management & Control Console
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Station provisioning, network configuration, and system architecture diagnostics.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {isAdmin ? (
              <button
                onClick={handleOpenAddModal}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Station</span>
              </button>
            ) : (
              <button
                onClick={handleOpenAddModal}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                title="Only Administrators can add stations"
              >
                <Lock className="w-3.5 h-3.5 text-amber-600" />
                <span>Add Station (Admin Only)</span>
              </button>
            )}

            <button
              onClick={loadDashboardAndHealth}
              className="p-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors cursor-pointer shadow-xs"
              title="Refresh Stats"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Role-Based Access Notification Banner */}
      <div className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
        isAdmin
          ? 'bg-emerald-50/70 border-emerald-200 text-emerald-800'
          : 'bg-amber-50/70 border-amber-200 text-amber-900'
      }`}>
        <div className="flex items-center gap-2.5">
          {isAdmin ? (
            <UserCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <Lock className="w-4 h-4 text-amber-600 shrink-0" />
          )}
          <div>
            <span className="font-bold">
              {isAdmin ? 'Administrator Access Verified:' : 'Restricted Role Notice:'}
            </span>{' '}
            <span>
              {isAdmin
                ? `Logged in as Chief Admin (${user.email}). You have full privileges to add/delete stations and routes.`
                : user
                ? `Logged in as Passenger (${user.email}). Station addition & deletion is restricted to Admin role.`
                : 'You are browsing as Guest. Sign in as Admin to create new stations.'}
            </span>
          </div>
        </div>

        {!isAdmin && (
          <button
            onClick={onOpenAuth}
            className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shrink-0 transition-colors shadow-xs cursor-pointer flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Switch to Admin</span>
          </button>
        )}
      </div>

      {/* KPI Cards */}
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs">
            <span className="text-xs text-slate-500 font-semibold block mb-1">Total Stations</span>
            <span className="text-2xl font-black text-slate-900">{summary.networkOverview.totalStops}</span>
            <span className="text-[10px] text-slate-400 block mt-1">Network Stops</span>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs">
            <span className="text-xs text-slate-500 font-semibold block mb-1">Transit Routes</span>
            <span className="text-2xl font-black text-blue-600">{summary.networkOverview.totalRoutes}</span>
            <span className="text-[10px] text-slate-400 block mt-1">Interconnected Lines</span>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs">
            <span className="text-xs text-slate-500 font-semibold block mb-1">Punctuality Score</span>
            <span className="text-2xl font-black text-emerald-600">{summary.networkOverview.onTimePerformancePercent}%</span>
            <span className="text-[10px] text-emerald-700 block mt-1 font-bold">On Schedule</span>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs">
            <span className="text-xs text-slate-500 font-semibold block mb-1">CO₂ Prevented</span>
            <span className="text-2xl font-black text-slate-900">{summary.sustainability.co2SavedKg} kg</span>
            <span className="text-[10px] text-slate-400 block mt-1">Public Transit Impact</span>
          </div>
        </div>
      )}

      {/* Grid: Station Management List + Server Architecture Diagnostics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Station Management Table */}
        <div className="lg:col-span-8 bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 uppercase tracking-wider">
              <MapPin className="w-4 h-4 text-blue-600" />
              <span>Registered Bus Stations ({stops.length})</span>
            </h2>

            {isAdmin ? (
              <button
                onClick={handleOpenAddModal}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 cursor-pointer"
              >
                + Add New Station
              </button>
            ) : (
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Lock className="w-3 h-3" />
                <span>Admin Required to Add</span>
              </span>
            )}
          </div>

          <div className="space-y-2 max-h-[440px] overflow-y-auto pr-1">
            {stops.map((stop) => (
              <div
                key={stop.id}
                className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 flex items-center justify-between text-xs hover:border-slate-300 transition-all shadow-xs"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{stop.name}</span>
                    <span className="px-1.5 py-0.2 rounded bg-slate-200 font-mono text-[10px] font-bold text-slate-700">
                      {stop.code}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium">
                    {stop.zone} • Capacity: {stop.passengerCapacity} pax
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-slate-400 font-mono text-[11px] hidden sm:block">
                    {stop.latitude?.toFixed(4)}, {stop.longitude?.toFixed(4)}
                  </span>

                  {isAdmin ? (
                    <button
                      onClick={() => handleDeleteStop(stop.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Delete Station"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  ) : (
                    <span className="p-1.5 text-slate-300" title="Admin role required to delete">
                      <Lock className="w-3.5 h-3.5" />
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Backend & Architecture Diagnostics */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Cpu className="w-4 h-4 text-blue-600" />
              <span>Backend Diagnostics</span>
            </h3>

            {healthData ? (
              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Tech Stack:</span>
                  <span className="font-bold text-slate-800">Node.js + Express (MERN)</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Node Runtime:</span>
                  <span className="font-mono font-semibold text-slate-700">{healthData.system?.nodeVersion}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Database Engine:</span>
                  <span className="font-bold text-emerald-600">Dual In-Memory / JSON Store</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Heap Memory:</span>
                  <span className="font-mono text-slate-800">{healthData.processMemory?.heapUsedMB} MB</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-500">Server Uptime:</span>
                  <span className="font-mono text-blue-600 font-bold">{healthData.uptimeFormatted}</span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400">Loading diagnostics...</p>
            )}
          </div>
        </div>
      </div>

      {/* Add Stop Modal (Admin Only) */}
      {showAddStopModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fadeIn">
          <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-2xl p-6 shadow-xl">
            <h3 className="text-lg font-bold text-slate-900 mb-1">Add New Transit Station</h3>
            <p className="text-xs text-slate-500 mb-4">Adds node to Dijkstra graph and journey planner.</p>

            <form onSubmit={handleCreateStop} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Station Name</label>
                <input
                  type="text"
                  required
                  value={newStop.name}
                  onChange={(e) => setNewStop({ ...newStop, name: e.target.value })}
                  placeholder="e.g. South City Terminal"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Station Code</label>
                  <input
                    type="text"
                    value={newStop.code}
                    onChange={(e) => setNewStop({ ...newStop, code: e.target.value })}
                    placeholder="e.g. STH-CITY"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Zone</label>
                  <input
                    type="text"
                    value={newStop.zone}
                    onChange={(e) => setNewStop({ ...newStop, zone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Latitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    required
                    value={newStop.latitude}
                    onChange={(e) => setNewStop({ ...newStop, latitude: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Longitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    required
                    value={newStop.longitude}
                    onChange={(e) => setNewStop({ ...newStop, longitude: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddStopModal(false)}
                  className="w-1/2 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold cursor-pointer"
                >
                  Create Station
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanelTab;
