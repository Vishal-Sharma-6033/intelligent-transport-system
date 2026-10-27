import React, { useState } from 'react';
import {
  Navigation,
  ArrowRight,
  Clock,
  MapPin,
  DollarSign,
  Leaf,
  Sliders,
  CheckCircle2,
  Bus,
  RefreshCw,
  Shuffle,
  Info,
  GitBranch,
  Cpu,
  Zap,
  Activity,
  ShieldCheck,
  TrendingUp,
  Sparkles
} from 'lucide-react';
import { api } from '../services/api';

const RoutePlannerTab = ({ stops = [], routes = [] }) => {
  const [sourceStopId, setSourceStopId] = useState('STP-016'); // Delhi Univ
  const [targetStopId, setTargetStopId] = useState('STP-007'); // Airport T3
  const [criteria, setCriteria] = useState('time'); // time, distance, transfers
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [routeResult, setRouteResult] = useState(null);
  const [alternatives, setAlternatives] = useState([]);
  const [selectedAlternativeIndex, setSelectedAlternativeIndex] = useState(0);

  const popularRoutes = [
    { label: 'Campus to Airport', from: 'STP-016', to: 'STP-007' },
    { label: 'Downtown to Cyber City', from: 'STP-001', to: 'STP-013' },
    { label: 'Railway Hub to Noida', from: 'STP-002', to: 'STP-011' },
    { label: 'AIIMS Med to East Suburb', from: 'STP-004', to: 'STP-012' }
  ];

  const handleSearchRoute = async () => {
    if (!sourceStopId || !targetStopId) return;
    if (sourceStopId === targetStopId) {
      setError('Origin and Destination cannot be the same station.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [optRes, altRes] = await Promise.all([
        api.optimize.route({ sourceStopId, targetStopId, criteria }),
        api.optimize.alternatives({ sourceStopId, targetStopId })
      ]);

      setRouteResult(optRes.data);
      if (altRes.data && altRes.data.alternatives) {
        setAlternatives(altRes.data.alternatives);
        setSelectedAlternativeIndex(0);
      }
    } catch (err) {
      setError(err.message || 'Route planning calculation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAlternative = (alt, idx) => {
    setSelectedAlternativeIndex(idx);
    setRouteResult(alt);
  };

  return (
    <div className="space-y-6">
      {/* Search Header Banner */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold mb-2 border border-blue-200/70">
              <Navigation className="w-3.5 h-3.5 text-blue-600" />
              <span>Dijkstra Shortest Path Engine</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Route Planner & Optimizer
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Select origin and destination stations to calculate the optimal path using Dijkstra’s Algorithm.
            </p>
          </div>

          {/* Quick Presets */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-slate-400">Quick Test:</span>
            {popularRoutes.map((pop, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setSourceStopId(pop.from);
                  setTargetStopId(pop.to);
                }}
                className="px-2.5 py-1 rounded-lg bg-slate-100/80 hover:bg-blue-50 hover:text-blue-700 text-xs font-semibold text-slate-600 transition-colors border border-slate-200 cursor-pointer"
              >
                {pop.label}
              </button>
            ))}
          </div>
        </div>

        {/* Origin / Destination Search Form */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center bg-slate-50/80 p-4 rounded-xl border border-slate-200/90">
          {/* Source Stop */}
          <div className="md:col-span-4">
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-blue-600" />
              <span>ORIGIN / DEPARTURE STOP</span>
            </label>
            <select
              value={sourceStopId}
              onChange={(e) => setSourceStopId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs cursor-pointer"
            >
              {stops.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.code}) - {s.zone}
                </option>
              ))}
            </select>
          </div>

          {/* Swap icon */}
          <div className="md:col-span-1 flex justify-center py-1">
            <button
              onClick={() => {
                const tmp = sourceStopId;
                setSourceStopId(targetStopId);
                setTargetStopId(tmp);
              }}
              className="p-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-600 transition-colors shadow-xs cursor-pointer"
              title="Swap Origin & Destination"
            >
              <ArrowRight className="w-4 h-4 md:rotate-0 rotate-90" />
            </button>
          </div>

          {/* Destination Stop */}
          <div className="md:col-span-4">
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>DESTINATION / ARRIVAL STOP</span>
            </label>
            <select
              value={targetStopId}
              onChange={(e) => setTargetStopId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs cursor-pointer"
            >
              {stops.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.code}) - {s.zone}
                </option>
              ))}
            </select>
          </div>

          {/* Submit Action */}
          <div className="md:col-span-3 flex flex-col justify-end">
            <button
              onClick={handleSearchRoute}
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-bold text-sm shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              ) : (
                <>
                  <Navigation className="w-4 h-4" />
                  <span>Find Best Route</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Criteria Pill Selector */}
        <div className="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t border-slate-200/90 text-xs">
          <span className="text-slate-500 font-semibold flex items-center gap-1">
            <Sliders className="w-3.5 h-3.5" />
            Algorithm Priority:
          </span>
          {[
            { id: 'time', label: '⚡ Fastest Route (Min Time)' },
            { id: 'transfers', label: '🔄 Least Transfers' },
            { id: 'distance', label: '📏 Shortest Distance' }
          ].map((crit) => (
            <button
              key={crit.id}
              onClick={() => {
                setCriteria(crit.id);
              }}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                criteria === crit.id
                  ? 'bg-blue-600 text-white font-bold shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200'
              }`}
            >
              {crit.label}
            </button>
          ))}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-3">
          <Info className="w-4 h-4 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Results View (If a route has been searched) */}
      {routeResult ? (
        <div className="space-y-6">
          {/* 1. Metric Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 shadow-xs text-center">
              <div className="flex items-center justify-center text-blue-600 mb-1">
                <Clock className="w-4 h-4" />
              </div>
              <span className="text-2xl font-black text-slate-900">{routeResult.totalTravelTimeMinutes}</span>
              <span className="text-[10px] text-slate-500 block font-bold uppercase mt-0.5">Minutes Total</span>
            </div>

            <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 shadow-xs text-center">
              <div className="flex items-center justify-center text-indigo-600 mb-1">
                <Navigation className="w-4 h-4" />
              </div>
              <span className="text-2xl font-black text-slate-900">{routeResult.totalDistanceKm}</span>
              <span className="text-[10px] text-slate-500 block font-bold uppercase mt-0.5">Km Distance</span>
            </div>

            <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 shadow-xs text-center">
              <div className="flex items-center justify-center text-emerald-600 mb-1">
                <DollarSign className="w-4 h-4" />
              </div>
              <span className="text-2xl font-black text-emerald-600">₹{routeResult.estimatedFare}</span>
              <span className="text-[10px] text-slate-500 block font-bold uppercase mt-0.5">Estimated Fare</span>
            </div>

            <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 shadow-xs text-center">
              <div className="flex items-center justify-center text-amber-600 mb-1">
                <Shuffle className="w-4 h-4" />
              </div>
              <span className="text-2xl font-black text-amber-600">{routeResult.transfers}</span>
              <span className="text-[10px] text-slate-500 block font-bold uppercase mt-0.5">Line Transfers</span>
            </div>

            <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 shadow-xs text-center col-span-2 sm:col-span-1">
              <div className="flex items-center justify-center text-emerald-600 mb-1">
                <Leaf className="w-4 h-4" />
              </div>
              <span className="text-2xl font-black text-slate-900">{routeResult.co2SavingsKg}</span>
              <span className="text-[10px] text-slate-500 block font-bold uppercase mt-0.5">Kg CO₂ Saved</span>
            </div>
          </div>

          {/* 2. Visual Journey Path Progression */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs">
            <h2 className="text-sm font-bold tracking-wider uppercase text-slate-700 mb-4 flex items-center gap-2">
              <Bus className="w-4 h-4 text-blue-600" />
              <span>Transit Route Path (Calculated by Dijkstra Algorithm)</span>
            </h2>

            {/* Visual Station Progression Line */}
            <div className="bg-slate-50 border border-slate-200/90 p-5 rounded-xl mb-6 overflow-x-auto">
              <div className="flex items-center gap-3 min-w-max">
                {routeResult.journeyStages && routeResult.journeyStages.map((stage, idx) => (
                  <React.Fragment key={idx}>
                    {/* Boarding Station Badge */}
                    <div className="flex flex-col items-center">
                      <div className="px-3 py-1.5 rounded-lg bg-white border-2 font-bold text-xs shadow-xs"
                        style={{ borderColor: stage.routeColor || '#2563eb' }}
                      >
                        {stage.boardingStop.name}
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono mt-1 font-semibold">
                        {stage.boardingStop.code}
                      </span>
                    </div>

                    {/* Connecting Route Line with details */}
                    <div className="flex flex-col items-center px-2">
                      <span className="text-[11px] font-bold text-slate-700 mb-1" style={{ color: stage.routeColor }}>
                        {stage.routeName}
                      </span>
                      <div className="relative flex items-center w-36">
                        <div className="w-full h-1.5 rounded-full" style={{ backgroundColor: stage.routeColor || '#2563eb' }}></div>
                        <ArrowRight className="w-4 h-4 absolute right-0" style={{ color: stage.routeColor || '#2563eb' }} />
                      </div>
                      <span className="text-[10px] text-slate-500 font-medium mt-1">
                        {stage.timeMinutes} min ({stage.stopsInBetween} stops)
                      </span>
                    </div>

                    {/* If last stage, show Destination Station Badge */}
                    {idx === routeResult.journeyStages.length - 1 && (
                      <div className="flex flex-col items-center">
                        <div className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-bold text-xs shadow-xs">
                          {stage.alightingStop.name}
                        </div>
                        <span className="text-[10px] text-emerald-700 font-mono mt-1 font-bold">
                          DESTINATION
                        </span>
                      </div>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Step-by-Step Passenger Directions */}
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-3">
              Step-by-Step Directions
            </h3>

            <div className="space-y-3">
              {routeResult.journeyStages && routeResult.journeyStages.map((stage, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-white flex items-start gap-3 shadow-xs">
                  <div
                    className="w-7 h-7 rounded-lg text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5"
                    style={{ backgroundColor: stage.routeColor || '#2563eb' }}
                  >
                    {idx + 1}
                  </div>
                  <div className="flex-1 text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-slate-900 text-sm">{stage.routeName}</span>
                      <span className="text-slate-500 font-semibold">{stage.timeMinutes} mins • {stage.distanceKm} km</span>
                    </div>
                    <div className="space-y-1 text-slate-600">
                      <p>
                        🟢 <strong>Board at:</strong> {stage.boardingStop.name} ({stage.boardingStop.code})
                      </p>
                      <p className="text-slate-400 text-[11px]">
                        Pass through {stage.stopsInBetween} intermediate stations.
                      </p>
                      <p>
                        🔴 <strong>Alight at:</strong> {stage.alightingStop.name} ({stage.alightingStop.code})
                        {idx < routeResult.journeyStages.length - 1 && (
                          <span className="ml-2 font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                            🔄 Transfer to Next Line
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 3. Alternative Route Choices */}
          {alternatives.length > 0 && (
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
                Calculated Alternative Routes (Multi-Criteria)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {alternatives.map((alt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectAlternative(alt, idx)}
                    className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                      selectedAlternativeIndex === idx
                        ? 'border-blue-600 bg-blue-50/50 shadow-xs ring-1 ring-blue-500'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-slate-900 text-xs">{alt.tag}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-700">
                        {alt.badge}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 space-y-0.5">
                      <p>⏱️ Time: <strong>{alt.totalTravelTimeMinutes} mins</strong></p>
                      <p>📏 Distance: {alt.totalDistanceKm} km</p>
                      <p>🔄 Transfers: {alt.transfers}</p>
                      <p className="text-emerald-600 font-bold mt-1">₹{alt.estimatedFare} Fare</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white border border-slate-200/90 rounded-2xl p-10 text-center shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3">
            <Navigation className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-900 mb-1">Select Stations to Calculate Shortest Path</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mb-5">
            Dijkstra's algorithm takes origin and destination stations, accounts for travel time, distance, and transfer penalties, and outputs the optimal passenger itinerary.
          </p>
          <button
            onClick={handleSearchRoute}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            Calculate Sample Route (Campus ➔ Airport)
          </button>
        </div>
      )}

      {/* ======================================================== */}
      {/* 🌟 EXTRA RICH PROJECT COMPONENTS FOR PRESENTATION & VIVA */}
      {/* ======================================================== */}

      {/* Component 1: How The Dijkstra Optimization Engine Works */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Cpu className="w-4 h-4 text-blue-600" />
              <span>How The Dijkstra Optimization Engine Works</span>
            </h2>
            <p className="text-xs text-slate-500">Core algorithmic pipeline for public transport journey planning</p>
          </div>
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
            Algorithmic Core
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl border border-slate-200/90 bg-slate-50/60 flex flex-col justify-between">
            <div>
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs mb-3">
                <GitBranch className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-slate-900 mb-1">1. Graph Network Representation</h3>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                All 16 bus stops and metro stations are represented as graph vertices ($V$). Route segments form directed weighted edges ($E$) with travel times and distances.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-200 text-[10px] font-semibold text-blue-700">
              Graph Model: $G = (V, E)$
            </div>
          </div>

          <div className="p-4 rounded-xl border border-slate-200/90 bg-slate-50/60 flex flex-col justify-between">
            <div>
              <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs mb-3">
                <Zap className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-slate-900 mb-1">2. Multi-Criteria Dijkstra Search</h3>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Computes least-cost paths using Priority Queue min-heap. Incorporates a 6-minute penalty for line transfers to prevent excessive switching.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-200 text-[10px] font-semibold text-indigo-700">
              Transfer Penalty Heuristic: +6 min
            </div>
          </div>

          <div className="p-4 rounded-xl border border-slate-200/90 bg-slate-50/60 flex flex-col justify-between">
            <div>
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs mb-3">
                <Leaf className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-slate-900 mb-1">3. Passenger & Eco-Savings Metrics</h3>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Instantly calculates distance-based ticketing fare (₹), total duration, and environmental $CO_2$ reduction compared to private cars.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-200 text-[10px] font-semibold text-emerald-700">
              Sustainability: 90g $CO_2$ saved / km
            </div>
          </div>
        </div>
      </div>

      {/* Component 2: Active Transit Lines & Network Directory */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Bus className="w-4 h-4 text-blue-600" />
              <span>City Transit Lines & Operational Status</span>
            </h2>
            <p className="text-xs text-slate-500">Live operational corridors connecting the 16 transit terminals</p>
          </div>
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            All Lines Operational
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {routes.map((route) => (
            <div
              key={route.id}
              className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-white hover:border-slate-300 transition-all shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span
                    className="px-2.5 py-0.5 rounded-md text-[10px] font-bold font-mono"
                    style={{
                      backgroundColor: `${route.color || '#2563eb'}18`,
                      color: route.color || '#2563eb'
                    }}
                  >
                    {route.code}
                  </span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Active
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 text-xs mb-1">{route.name}</h3>
                <p className="text-[11px] text-slate-500 font-medium mb-3">
                  {route.type} • {route.stopsCount || route.stops?.length || 5} Stations Connected
                </p>
              </div>

              <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-[11px] text-slate-600">
                <span>Dist: <strong>{route.totalDistanceKm || 15} km</strong></span>
                <span>Time: <strong>{route.estimatedTotalMinutes || 40} min</strong></span>
                <span className="text-emerald-700 font-bold">From ₹{route.fareBase || 15}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Component 3: Live Network Vital Signs Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <span className="text-lg font-black text-slate-900">{stops.length} Stations</span>
            <span className="text-[10px] text-slate-500 block font-medium">Mapped Graph Nodes</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <Bus className="w-5 h-5" />
          </div>
          <div>
            <span className="text-lg font-black text-slate-900">{routes.length} Transit Routes</span>
            <span className="text-[10px] text-slate-500 block font-medium">Direct & Express Lines</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-lg font-black text-emerald-600">94.8% Punctual</span>
            <span className="text-[10px] text-slate-500 block font-medium">On-Time Performance</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <span className="text-lg font-black text-amber-700">~4.5 min Wait</span>
            <span className="text-[10px] text-slate-500 block font-medium">Avg Passenger Wait</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoutePlannerTab;
