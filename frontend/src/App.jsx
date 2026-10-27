import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import AuthModal from './components/AuthModal';
import RoutePlannerTab from './components/RoutePlannerTab';
import LiveTrackingTab from './components/LiveTrackingTab';
import BusSchedulingTab from './components/BusSchedulingTab';
import DemandAnalyticsTab from './components/DemandAnalyticsTab';
import AdminPanelTab from './components/AdminPanelTab';
import { api } from './services/api';
import { Bus, Navigation, Clock, ShieldCheck, Database, GitBranch, Cpu, CheckCircle2 } from 'lucide-react';

function App() {
  const [activeTab, setActiveTab] = useState('planner');
  const [user, setUser] = useState(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Core network state
  const [stops, setStops] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Check stored user session on load
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('transit_user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (err) {
      console.warn('Failed to parse stored user:', err);
    }
  }, []);

  // Fetch initial stops, routes, and buses
  const loadInitialData = async () => {
    try {
      const [stopsRes, routesRes, busesRes] = await Promise.all([
        api.stops.getAll(),
        api.routes.getAll(),
        api.buses.getLocations()
      ]);
      setStops(stopsRes.data?.stops || []);
      setRoutes(routesRes.data || []);
      setBuses(busesRes.data?.buses || []);
    } catch (err) {
      console.error('Failed to load initial transit data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  // Live polling for bus telemetry positions every 3.5 seconds
  useEffect(() => {
    const pollInterval = setInterval(async () => {
      try {
        const res = await api.buses.getLocations();
        if (res.data?.buses) {
          setBuses(res.data.buses);
        }
      } catch (err) {
        // Silently continue
      }
    }, 3500);

    return () => clearInterval(pollInterval);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('transit_token');
    localStorage.removeItem('transit_user');
    setUser(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        onOpenAuth={() => setAuthModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {loading ? (
          <div className="min-h-[400px] flex flex-col items-center justify-center">
            <span className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></span>
            <h2 className="text-sm font-bold text-slate-800 mt-4">Connecting to Transit System</h2>
            <p className="text-xs text-slate-500 mt-1">Loading stops, routes, schedules, and live telemetry...</p>
          </div>
        ) : (
          <>
            {activeTab === 'planner' && (
              <RoutePlannerTab stops={stops} routes={routes} />
            )}

            {activeTab === 'tracking' && (
              <LiveTrackingTab
                stops={stops}
                routes={routes}
                buses={buses}
                onRefresh={loadInitialData}
              />
            )}

            {activeTab === 'scheduling' && (
              <BusSchedulingTab
                routes={routes}
                user={user}
                onOpenAuth={() => setAuthModalOpen(true)}
              />
            )}

            {activeTab === 'analytics' && (
              <DemandAnalyticsTab routes={routes} />
            )}

            {activeTab === 'admin' && (
              <AdminPanelTab
                stops={stops}
                routes={routes}
                buses={buses}
                user={user}
                onOpenAuth={() => setAuthModalOpen(true)}
                onDataUpdated={loadInitialData}
              />
            )}
          </>
        )}
      </main>

      {/* ======================================================== */}
      {/* 🌟 RICH ACADEMIC & PROFESSIONAL MULTI-COLUMN FOOTER     */}
      {/* ======================================================== */}
      <footer className="border-t border-slate-200/90 bg-white mt-auto pt-10 pb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Main Footer Columns */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 pb-8 border-b border-slate-100">
            {/* Col 1: Brand & Overview */}
            <div className="space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-xs">
                  <Bus className="w-4 h-4" />
                </div>
                <span className="font-extrabold text-slate-900 tracking-tight text-base">
                  TRANSIT<span className="text-blue-600">.AI</span>
                </span>
                <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  v2.0
                </span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Intelligent Public Transport Optimization System using Dijkstra’s Algorithm, real-time vehicle simulation, and demand-responsive headway scheduling.
              </p>
              <div className="flex items-center gap-2 pt-1">
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  All Engines Nominal
                </span>
              </div>
            </div>

            {/* Col 2: Core Project Modules */}
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">Core Modules</h3>
              <ul className="space-y-2 text-xs text-slate-600">
                <li className="flex items-center gap-2">
                  <Navigation className="w-3.5 h-3.5 text-blue-600" />
                  <span>Dijkstra Shortest Path</span>
                </li>
                <li className="flex items-center gap-2">
                  <Bus className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Live Fleet Telemetry & Radar</span>
                </li>
                <li className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Headway & Frequency Optimizer</span>
                </li>
                <li className="flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                  <span>Station Provisioning (Admin RBAC)</span>
                </li>
              </ul>
            </div>

            {/* Col 3: Algorithms & Architecture */}
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">Algorithms & Architecture</h3>
              <ul className="space-y-2 text-xs text-slate-600">
                <li className="flex items-center gap-2">
                  <GitBranch className="w-3.5 h-3.5 text-purple-600" />
                  <span>Graph Adjacency List & BFS</span>
                </li>
                <li className="flex items-center gap-2">
                  <Cpu className="w-3.5 h-3.5 text-blue-600" />
                  <span>Transfer Penalty Heuristic (+6 min)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Database className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Zero-Database Persistent Store</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
                  <span>JWT & Role-Based Access Control</span>
                </li>
              </ul>
            </div>

            {/* Col 4: Project Information */}
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">System Information</h3>
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/90 text-xs space-y-1.5 text-slate-600">
                <p><strong>Stack:</strong> React 18, Node.js, Express, Tailwind</p>
                <p><strong>Database:</strong> In-Memory + File Persistence</p>
                <p><strong>Demo Roles:</strong> Admin & Passenger (1-Click)</p>
                <p><strong>API Endpoint:</strong> <code>http://localhost:5001/api/v1</code></p>
              </div>
            </div>
          </div>

          {/* Bottom Copyright Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
            <p>© 2026 TRANSIT.AI — Intelligent Public Transport Optimization System. Built with MERN Stack.</p>
            <div className="flex items-center gap-3 font-medium">
              <span className="text-emerald-700 flex items-center gap-1.5 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                Dijkstra Engine Online
              </span>
              <span className="text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                REST API v1.0
              </span>
            </div>
          </div>
        </div>
      </footer>

      {/* Authentication Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onAuthSuccess={(u) => setUser(u)}
      />
    </div>
  );
}

export default App;
