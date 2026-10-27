import React, { useState, useEffect } from 'react';
import {
  Bus,
  MapPin,
  Clock,
  Gauge,
  Users,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { api } from '../services/api';

const LiveTrackingTab = ({ stops = [], routes = [], buses = [], onRefresh }) => {
  const [selectedStopId, setSelectedStopId] = useState(stops[0]?.id || 'STP-001');
  const [stopArrivals, setStopArrivals] = useState(null);
  const [loadingArrivals, setLoadingArrivals] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');

  // Fetch arrival board for selected stop
  const fetchArrivals = async (stopId) => {
    if (!stopId) return;
    setLoadingArrivals(true);
    try {
      const res = await api.buses.getStopArrivals(stopId);
      setStopArrivals(res.data);
    } catch (err) {
      console.error('Failed to fetch stop arrivals:', err);
    } finally {
      setLoadingArrivals(false);
    }
  };

  useEffect(() => {
    if (selectedStopId) {
      fetchArrivals(selectedStopId);
    }
  }, [selectedStopId]);

  // Periodic poll for arrivals
  useEffect(() => {
    const interval = setInterval(() => {
      if (selectedStopId) {
        fetchArrivals(selectedStopId);
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [selectedStopId]);

  const filteredBuses = buses.filter((b) => {
    const q = searchFilter.toLowerCase();
    return (
      b.regNumber?.toLowerCase().includes(q) ||
      b.routeName?.toLowerCase().includes(q) ||
      b.id?.toLowerCase().includes(q) ||
      b.driverName?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold mb-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Live Fleet Tracking & Telemetry</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Live Bus Fleet & Station Display
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Real-time monitoring of all active buses, calculated station ETAs, and digital passenger arrival boards.
            </p>
          </div>

          <button
            onClick={onRefresh}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-2 transition-colors border border-slate-200 cursor-pointer self-start sm:self-auto"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh Telemetry</span>
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold block mb-1">Active Fleet Size</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{buses.length}</span>
            <span className="text-xs text-slate-400">Buses Running</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold block mb-1">On-Time Performance</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-600">94.8%</span>
            <span className="text-xs text-slate-400">Punctuality</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold block mb-1">Avg Fleet Speed</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-blue-600">34 km/h</span>
            <span className="text-xs text-slate-400">Urban Transit</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold block mb-1">Stations Monitored</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-purple-600">{stops.length}</span>
            <span className="text-xs text-slate-400">Terminals</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Station Arrival Display + Fleet List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Station Arrival Digital Display Board (Like a Station LED Screen) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between gap-2 mb-4">
              <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
                <Clock className="w-4 h-4 text-blue-600" />
                <span>Station Arrival Display Board</span>
              </div>
              <span className="text-xs font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                {stopArrivals?.currentTime || 'LIVE'}
              </span>
            </div>

            {/* Station Selector */}
            <div className="mb-4">
              <label className="block text-xs font-bold text-slate-600 mb-1">Select Station to View Arrivals:</label>
              <select
                value={selectedStopId}
                onChange={(e) => setSelectedStopId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs"
              >
                {stops.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.code}) - {s.zone}
                  </option>
                ))}
              </select>
            </div>

            {/* Arrival List */}
            <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
              {loadingArrivals ? (
                <div className="py-8 text-center text-xs text-slate-400">Loading arrival times...</div>
              ) : stopArrivals && stopArrivals.arrivals && stopArrivals.arrivals.length > 0 ? (
                stopArrivals.arrivals.map((arr, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between text-xs hover:border-slate-300 transition-all shadow-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: arr.routeColor || '#2563eb' }}
                        ></span>
                        <span className="font-bold text-slate-900">{arr.routeName}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-mono">
                        Bus: <strong>{arr.regNumber}</strong> • Driver: {arr.driverName}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="font-mono font-black text-emerald-600 text-base">
                        {arr.etaMinutes === 0 ? 'ARRIVED' : `${arr.etaMinutes} min`}
                      </span>
                      <span className="text-[10px] text-slate-400 block font-medium">
                        {arr.occupancyStatus} ({arr.passengerCount}/{arr.capacity} pax)
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  No incoming buses scheduled in the next 15 minutes for this station.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Active Fleet Table List */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2">
                <Bus className="w-4 h-4 text-blue-600" />
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Active Bus Fleet Directory ({buses.length})
                </h2>
              </div>

              {/* Filter */}
              <div className="relative w-full sm:w-60">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  placeholder="Filter bus or route..."
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Buses List */}
            <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
              {filteredBuses.map((bus) => (
                <div
                  key={bus.id}
                  className="p-4 rounded-xl border border-slate-200 bg-white hover:border-blue-400 transition-all shadow-xs"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2 pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-xs shadow-xs"
                        style={{ backgroundColor: bus.routeColor || '#2563eb' }}
                      >
                        <Bus className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-slate-900 text-xs">{bus.regNumber}</h3>
                          <span className="text-[10px] font-mono text-slate-400">({bus.id})</span>
                        </div>
                        <p className="text-[11px] text-slate-500 font-medium">{bus.routeName}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          bus.status === 'IN_TRANSIT'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        {bus.status === 'IN_TRANSIT' ? 'On Schedule' : bus.status}
                      </span>
                    </div>
                  </div>

                  {/* Details row */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs pt-1">
                    <div>
                      <span className="text-slate-400 text-[10px] block">Current Speed</span>
                      <span className="font-bold text-slate-800">{bus.speedKmH} km/h</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block">Next Station</span>
                      <span className="font-bold text-blue-600 truncate block">{bus.nextStopName}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block">ETA to Next</span>
                      <span className="font-bold text-emerald-600">{bus.etaMinutesToNextStop} min</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block">Passenger Load</span>
                      <span className="font-bold text-slate-800">{bus.passengerCount}/{bus.capacity} pax</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveTrackingTab;
