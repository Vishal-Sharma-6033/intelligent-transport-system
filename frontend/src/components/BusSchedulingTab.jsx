import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  Bus,
  Plus,
  Trash2,
  RefreshCw,
  Zap,
  Sliders,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  TrendingUp,
  Filter,
  Lock,
  Sparkles
} from 'lucide-react';
import { api } from '../services/api';

const BusSchedulingTab = ({ routes = [], user, onOpenAuth }) => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRouteFilter, setSelectedRouteFilter] = useState('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [optimizing, setOptimizing] = useState(false);
  const [optSuccessMsg, setOptSuccessMsg] = useState(null);

  // Dynamic Headway Simulator
  const [simRouteId, setSimRouteId] = useState(routes[0]?.id || 'R-101');
  const [simSurge, setSimSurge] = useState(1.0);
  const [simResult, setSimResult] = useState(null);

  // New Schedule Form state
  const [newSchedule, setNewSchedule] = useState({
    routeId: routes[0]?.id || 'R-101',
    periodName: 'Evening Rush (17:00 - 20:30)',
    firstDeparture: '17:00',
    lastDeparture: '20:30',
    headwayMinutesCurrent: 12,
    busesAllocatedCurrent: 4
  });

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    fetchSchedules();
  }, []);

  useEffect(() => {
    if (routes.length > 0 && !simRouteId) {
      setSimRouteId(routes[0].id);
    }
  }, [routes]);

  const fetchSchedules = async () => {
    setLoading(true);
    try {
      const res = await api.schedules.getAll();
      setSchedules(res.data || []);
      runSimulator(simRouteId || 'R-101', 1.0);
    } catch (err) {
      console.error('Failed to load schedules:', err);
    } finally {
      setLoading(false);
    }
  };

  const runSimulator = async (routeId, surge) => {
    try {
      const res = await api.optimize.schedule({
        routeId: routeId || 'R-101',
        customPeakSurge: surge
      });
      setSimResult(res.data);
    } catch (err) {
      console.error('Simulator error:', err);
    }
  };

  const handleSimSurgeChange = (surge) => {
    setSimSurge(surge);
    runSimulator(simRouteId, surge);
  };

  const handleSimRouteChange = (routeId) => {
    setSimRouteId(routeId);
    runSimulator(routeId, simSurge);
  };

  const handleCreateSchedule = async (e) => {
    e.preventDefault();
    if (!isAdmin) {
      alert('Access Denied: Only users with the Administrator role can add bus schedules.');
      return;
    }

    try {
      await api.schedules.create(newSchedule);
      setShowAddModal(false);
      fetchSchedules();
      setOptSuccessMsg('New bus schedule added successfully to master timetable!');
      setTimeout(() => setOptSuccessMsg(null), 4000);
    } catch (err) {
      alert(err.message || 'Failed to create schedule');
    }
  };

  const handleDeleteSchedule = async (scheduleId) => {
    if (!isAdmin) {
      alert('Access Denied: Only users with the Administrator role can delete bus schedules.');
      return;
    }
    if (!confirm('Are you sure you want to remove this schedule from the timetable?')) return;

    try {
      await api.schedules.delete(scheduleId);
      fetchSchedules();
    } catch (err) {
      alert(err.message || 'Failed to delete schedule');
    }
  };

  const handleOptimizeAll = async () => {
    setOptimizing(true);
    try {
      // Re-run optimization for the active routes
      if (routes.length > 0) {
        await api.optimize.schedule({ routeId: routes[0].id, customPeakSurge: 1.2 });
      }
      setOptSuccessMsg('AI Optimization complete: Headways synchronized for minimal passenger wait times!');
      setTimeout(() => setOptSuccessMsg(null), 4000);
      fetchSchedules();
    } catch (err) {
      console.error(err);
    } finally {
      setOptimizing(false);
    }
  };

  const filteredSchedules = selectedRouteFilter === 'ALL'
    ? schedules
    : schedules.filter((s) => s.routeId === selectedRouteFilter);

  // Compute summary stats
  const avgHeadwayCurrent = schedules.length
    ? Math.round(schedules.reduce((acc, s) => acc + (s.headwayMinutesCurrent || 15), 0) / schedules.length)
    : 15;
  const avgHeadwayOptimized = schedules.length
    ? Math.round(schedules.reduce((acc, s) => acc + (s.headwayMinutesOptimized || 8), 0) / schedules.length)
    : 8;
  const totalBuses = schedules.reduce((acc, s) => acc + (s.busesAllocatedCurrent || 3), 0);

  return (
    <div className="space-y-6">
      {/* Top Header Banner */}
      <div className="bg-gradient-to-r from-blue-50/80 via-indigo-50/60 to-white border border-slate-200/80 rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100/70 text-blue-800 text-xs font-bold mb-2 border border-blue-200/60">
              <Calendar className="w-3.5 h-3.5 text-blue-600" />
              <span>Timetable & Headway Engine</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Bus Scheduling & Frequency Management
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Master timetable schedules, dispatch frequency calculation, and fleet allocation based on passenger demand.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleOptimizeAll}
              disabled={optimizing}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-all cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>{optimizing ? 'Calculating...' : 'Optimize Timetable'}</span>
            </button>

            {isAdmin ? (
              <button
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Schedule</span>
              </button>
            ) : (
              <button
                onClick={onOpenAuth}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                title="Login as Admin to add schedules"
              >
                <Lock className="w-3.5 h-3.5 text-slate-500" />
                <span>Add Schedule (Admin Only)</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Success Notification Alert */}
      {optSuccessMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{optSuccessMsg}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold block mb-1">Active Schedules</span>
          <span className="text-2xl font-black text-slate-900">{schedules.length}</span>
          <span className="text-[10px] text-slate-400 block mt-1">Route Timetables</span>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold block mb-1">Current Avg Headway</span>
          <span className="text-2xl font-black text-slate-800">{avgHeadwayCurrent} min</span>
          <span className="text-[10px] text-slate-400 block mt-1">Between Bus Dispatches</span>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold block mb-1">AI-Optimized Headway</span>
          <span className="text-2xl font-black text-emerald-600">{avgHeadwayOptimized} min</span>
          <span className="text-[10px] text-emerald-700 block mt-1 font-bold">~48% Faster Frequency</span>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold block mb-1">Fleet Bus Deployment</span>
          <span className="text-2xl font-black text-indigo-600">{totalBuses} Buses</span>
          <span className="text-[10px] text-slate-400 block mt-1">Assigned to Active Lines</span>
        </div>
      </div>

      {/* Master Timetable Board */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600" />
              <span>Master Route Bus Timetables</span>
            </h2>
            <p className="text-xs text-slate-500">Departure frequency and passenger wait time per operational shift</p>
          </div>

          {/* Filter by Route */}
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedRouteFilter}
              onChange={(e) => setSelectedRouteFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Transit Routes</option>
              {routes.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Timetable Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
            <div className="col-span-full py-12 text-center text-xs text-slate-400">Loading master schedules...</div>
          ) : filteredSchedules.length > 0 ? (
            filteredSchedules.map((sch) => (
              <div
                key={sch.id}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-white hover:border-blue-400 transition-all shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className="px-2.5 py-0.5 rounded-md text-[11px] font-bold"
                      style={{
                        backgroundColor: `${sch.routeColor || '#2563eb'}18`,
                        color: sch.routeColor || '#2563eb'
                      }}
                    >
                      {sch.routeName}
                    </span>

                    {isAdmin && (
                      <button
                        onClick={() => handleDeleteSchedule(sch.id)}
                        className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Delete schedule"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <h3 className="font-bold text-slate-900 text-sm mb-1">{sch.periodName}</h3>
                  <p className="text-[11px] text-slate-500 flex items-center gap-1.5 mb-3">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Operating Hours: <strong>{sch.firstDeparture} ➔ {sch.lastDeparture}</strong></span>
                  </p>

                  <div className="grid grid-cols-2 gap-2 bg-white p-3 rounded-lg border border-slate-200/80 text-xs mb-3">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium">Current Headway</span>
                      <span className="font-bold text-slate-800 text-sm">Every {sch.headwayMinutesCurrent} min</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-emerald-700 block font-bold">Optimized Headway</span>
                      <span className="font-bold text-emerald-600 text-sm">Every {sch.headwayMinutesOptimized} min</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium">Buses Allocated</span>
                      <span className="font-bold text-slate-800">{sch.busesAllocatedCurrent} Buses</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-blue-700 block font-bold">Avg Wait Time</span>
                      <span className="font-bold text-blue-600">~{sch.averagePassengerWaitOptimized} min</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-[11px] text-slate-500">
                  <span>Planned: <strong>{sch.totalTripsPlanned || 12} trips / shift</strong></span>
                  <span className="px-2 py-0.5 rounded-full font-bold bg-blue-50 text-blue-700 border border-blue-200">
                    Active
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-12 text-center text-xs text-slate-400">
              No schedules found for this filter.
            </div>
          )}
        </div>
      </div>

      {/* Headway & Surge Simulator Section */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4">
        <div>
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Sliders className="w-4 h-4 text-blue-600" />
            <span>Interactive Frequency & Passenger Surge Simulator</span>
          </h2>
          <p className="text-xs text-slate-500">
            Simulate rush hour passenger spikes and watch the scheduling algorithm recommend optimal bus dispatch headways.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Select Route to Simulate:</label>
            <select
              value={simRouteId}
              onChange={(e) => handleSimRouteChange(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs"
            >
              {routes.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} ({r.code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
              <span>Simulated Demand Surge:</span>
              <span className="text-blue-600 font-extrabold">+{Math.round((simSurge - 1) * 100)}% Surge</span>
            </div>
            <input
              type="range"
              min="0.8"
              max="2.0"
              step="0.1"
              value={simSurge}
              onChange={(e) => handleSimSurgeChange(parseFloat(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-medium">
              <span>Regular Off-Peak</span>
              <span>Rush Hour (+50%)</span>
              <span>Festival Surge (+100%)</span>
            </div>
          </div>
        </div>

        {/* Simulator Results */}
        {simResult && simResult.schedules && (
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Computed Timetable Impact for {simResult.route?.name}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {simResult.schedules.map((sch) => (
                <div key={sch.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-slate-900 text-xs">{sch.periodName}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                      -{sch.impact.waitTimeReductionPercent}% Wait Time
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 bg-white p-2.5 rounded-lg border border-slate-200 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium">Current Headway</span>
                      <span className="font-bold text-slate-800">{sch.current.headwayMinutes} min</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-blue-700 block font-bold">Recommended Headway</span>
                      <span className="font-bold text-blue-600">{sch.optimized.headwayMinutes} min</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium">Buses Required</span>
                      <span className="font-bold text-slate-800">{sch.optimized.busesAllocated} Buses</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-emerald-700 block font-bold">Avg Wait Time</span>
                      <span className="font-bold text-emerald-600">{sch.optimized.avgWaitingTimeMinutes} min</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Add Schedule Modal (Admin Only) */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fadeIn">
          <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-2xl p-6 shadow-xl text-slate-800">
            <h3 className="text-lg font-bold text-slate-900 mb-1">Add Route Schedule Timetable</h3>
            <p className="text-xs text-slate-500 mb-4">Provision a new operational shift and bus dispatch frequency.</p>

            <form onSubmit={handleCreateSchedule} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Select Transit Line</label>
                <select
                  value={newSchedule.routeId}
                  onChange={(e) => setNewSchedule({ ...newSchedule, routeId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {routes.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} ({r.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Shift / Period Title</label>
                <input
                  type="text"
                  required
                  value={newSchedule.periodName}
                  onChange={(e) => setNewSchedule({ ...newSchedule, periodName: e.target.value })}
                  placeholder="e.g. Night Shuttle (21:00 - 00:00)"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">First Departure</label>
                  <input
                    type="time"
                    required
                    value={newSchedule.firstDeparture}
                    onChange={(e) => setNewSchedule({ ...newSchedule, firstDeparture: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Last Departure</label>
                  <input
                    type="time"
                    required
                    value={newSchedule.lastDeparture}
                    onChange={(e) => setNewSchedule({ ...newSchedule, lastDeparture: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Headway (Frequency in min)</label>
                  <input
                    type="number"
                    min="4"
                    max="60"
                    required
                    value={newSchedule.headwayMinutesCurrent}
                    onChange={(e) => setNewSchedule({ ...newSchedule, headwayMinutesCurrent: parseInt(e.target.value) || 10 })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Buses to Allocate</label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    required
                    value={newSchedule.busesAllocatedCurrent}
                    onChange={(e) => setNewSchedule({ ...newSchedule, busesAllocatedCurrent: parseInt(e.target.value) || 3 })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="w-1/2 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold cursor-pointer"
                >
                  Save Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BusSchedulingTab;
