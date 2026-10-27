import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Clock,
  Users,
  Activity,
  Calendar,
  ArrowDownRight,
  Sliders,
  CheckCircle2,
  TrendingUp
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { api } from '../services/api';

const DemandAnalyticsTab = ({ routes = [] }) => {
  const [demandData, setDemandData] = useState(null);
  const [peakHoursData, setPeakHoursData] = useState(null);
  const [stopsDemand, setStopsDemand] = useState([]);
  const [loading, setLoading] = useState(true);

  // Frequency optimizer simulator state
  const [selectedRouteId, setSelectedRouteId] = useState('R-101');
  const [surgeMultiplier, setSurgeMultiplier] = useState(1.0);
  const [optimizedScheduleResult, setOptimizedScheduleResult] = useState(null);
  const [optimizing, setOptimizing] = useState(false);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const [demandRes, peakRes, stopsRes] = await Promise.all([
        api.analytics.getDemand(),
        api.analytics.getPeakHours(),
        api.analytics.getStops()
      ]);

      setDemandData(demandRes.data);
      setPeakHoursData(peakRes.data);
      setStopsDemand(stopsRes.data || []);

      runScheduleOptimization('R-101', 1.0);
    } catch (err) {
      console.error('Failed to load demand analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const runScheduleOptimization = async (routeId, surge) => {
    setOptimizing(true);
    try {
      const res = await api.optimize.schedule({
        routeId,
        customPeakSurge: surge
      });
      setOptimizedScheduleResult(res.data);
    } catch (err) {
      console.error('Optimization failed:', err);
    } finally {
      setOptimizing(false);
    }
  };

  const handleRouteOrSurgeChange = (routeId, surge) => {
    setSelectedRouteId(routeId);
    setSurgeMultiplier(surge);
    runScheduleOptimization(routeId, surge);
  };

  if (loading) {
    return (
      <div className="py-20 text-center">
        <span className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin inline-block"></span>
        <p className="text-xs text-slate-500 mt-3 font-semibold">Loading transit demand models...</p>
      </div>
    );
  }

  const hourlyChartData = peakHoursData?.hourlyDistribution || [];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold mb-2">
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Passenger Demand Analysis & Dispatch Frequency</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Passenger Demand & Schedule Optimizer
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Identifies peak rush hours and calculates optimal bus headway to minimize passenger waiting time.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-3.5 py-2 rounded-xl bg-blue-50 border border-blue-200 text-right">
              <span className="text-[10px] text-blue-700 font-bold uppercase block">Morning Rush</span>
              <span className="text-sm font-black text-blue-900">{peakHoursData?.morningPeakHour || '09:00'}</span>
            </div>
            <div className="px-3.5 py-2 rounded-xl bg-indigo-50 border border-indigo-200 text-right">
              <span className="text-[10px] text-indigo-700 font-bold uppercase block">Evening Rush</span>
              <span className="text-sm font-black text-indigo-900">{peakHoursData?.eveningPeakHour || '18:00'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 24-Hour Passenger Traffic Curve */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 uppercase tracking-wider">
              <Activity className="w-4 h-4 text-blue-600" />
              <span>24-Hour System Passenger Volume (Rush Hour Analysis)</span>
            </h2>
            <p className="text-xs text-slate-500">Hourly passenger traffic across the public transit network</p>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold">
            <span className="flex items-center gap-1.5 text-blue-600">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
              Total Passengers
            </span>
            <span className="flex items-center gap-1.5 text-emerald-600">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
              Boardings
            </span>
          </div>
        </div>

        <div className="h-[260px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={hourlyChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorPaxLight" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis dataKey="hourFormatted" stroke="#94A3B8" fontSize={11} tickLine={false} />
              <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  borderColor: '#E2E8F0',
                  borderRadius: '0.75rem',
                  fontSize: '12px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                }}
              />
              <Area type="monotone" dataKey="totalPassengers" stroke="#2563eb" strokeWidth={2.5} fillOpacity={1} fill="url(#colorPaxLight)" name="Total Passengers" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Grid: Bus Frequency Optimizer + Top Busiest Stations */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Frequency & Waiting Time Optimizer */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 uppercase tracking-wider">
              <Clock className="w-4 h-4 text-emerald-600" />
              <span>Bus Frequency & Headway Optimizer</span>
            </h2>
            <p className="text-xs text-slate-500">
              Calculates optimal bus intervals based on passenger surge to reduce waiting time.
            </p>
          </div>

          {/* Controls: Route Selector & Surge Slider */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Select Route to Optimize:</label>
              <select
                value={selectedRouteId}
                onChange={(e) => handleRouteOrSurgeChange(e.target.value, surgeMultiplier)}
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
                <span>Simulate Demand Surge:</span>
                <span className="text-blue-600">+{Math.round((surgeMultiplier - 1) * 100)}% Surge</span>
              </div>
              <input
                type="range"
                min="0.8"
                max="2.0"
                step="0.1"
                value={surgeMultiplier}
                onChange={(e) => handleRouteOrSurgeChange(selectedRouteId, parseFloat(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>Normal Traffic</span>
                <span>Peak Rush (+50%)</span>
                <span>Festival (+100%)</span>
              </div>
            </div>
          </div>

          {/* Impact Comparison Cards */}
          {optimizedScheduleResult && (
            <div className="space-y-3">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Current Timetable vs AI Optimized Dispatches
              </p>

              <div className="space-y-3">
                {optimizedScheduleResult.schedules.map((sch) => (
                  <div
                    key={sch.id}
                    className="p-4 rounded-xl bg-slate-50 border border-slate-200"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-slate-900 text-xs">{sch.periodName}</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                        <ArrowDownRight className="w-3 h-3" />
                        <span>-{sch.impact.waitTimeReductionPercent}% Wait Time</span>
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                      <div className="bg-white p-2 rounded-lg border border-slate-200">
                        <span className="text-[10px] text-slate-500 block">Current Headway</span>
                        <span className="font-bold text-slate-800">{sch.current.headwayMinutes} min</span>
                      </div>
                      <div className="bg-blue-50 border border-blue-200 p-2 rounded-lg">
                        <span className="text-[10px] text-blue-700 block font-bold">Optimized Headway</span>
                        <span className="font-bold text-blue-900">{sch.optimized.headwayMinutes} min</span>
                      </div>
                      <div className="bg-white p-2 rounded-lg border border-slate-200">
                        <span className="text-[10px] text-slate-500 block">Current Wait</span>
                        <span className="font-bold text-slate-800">{sch.current.avgWaitingTimeMinutes} min</span>
                      </div>
                      <div className="bg-emerald-50 border border-emerald-200 p-2 rounded-lg">
                        <span className="text-[10px] text-emerald-700 block font-bold">Optimized Wait</span>
                        <span className="font-bold text-emerald-900">{sch.optimized.avgWaitingTimeMinutes} min</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Top Busiest Transit Hubs */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" />
              <span>Busiest Stations by Daily Footfall</span>
            </h3>
            <p className="text-xs text-slate-500">Stations with highest passenger traffic</p>
          </div>

          <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
            {stopsDemand.slice(0, 7).map((stop) => (
              <div
                key={stop.stopId}
                className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{stop.stopName}</span>
                    {stop.riskOfOvercrowding && (
                      <span className="px-1.5 py-0.2 rounded text-[9px] bg-rose-100 text-rose-700 font-bold border border-rose-200">
                        High Load
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-500 font-mono">
                    {stop.zone} • {stop.connectedRoutesCount} Routes Connected
                  </span>
                </div>

                <div className="text-right">
                  <span className="font-mono font-bold text-blue-600 text-xs">
                    {stop.estimatedDailyFootfall.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-slate-400 block">pax / day</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DemandAnalyticsTab;
