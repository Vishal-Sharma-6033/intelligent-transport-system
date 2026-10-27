import React, { useState, useEffect } from 'react';
import {
  Brain,
  Sparkles,
  CloudRain,
  Sun,
  Flame,
  Calendar,
  Zap,
  TrendingUp,
  Sliders,
  CheckCircle2,
  Award,
  Layers,
  BarChart2
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { api } from '../services/api';

const AiForecasterTab = ({ routes = [] }) => {
  const [selectedRouteId, setSelectedRouteId] = useState('R-101');
  const [dayOfWeek, setDayOfWeek] = useState(2); // Tuesday
  const [weather, setWeather] = useState('Clear');
  const [specialEvent, setSpecialEvent] = useState(false);
  const [surgePercent, setSurgePercent] = useState(0);

  const [forecastResult, setForecastResult] = useState(null);
  const [modelMetrics, setModelMetrics] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchMetrics();
    runPrediction();
  }, [selectedRouteId, dayOfWeek, weather, specialEvent, surgePercent]);

  const fetchMetrics = async () => {
    try {
      const res = await api.ai.getModelMetrics();
      setModelMetrics(res.data);
    } catch (err) {
      console.error('Failed to fetch model metrics:', err);
    }
  };

  const runPrediction = async () => {
    setLoading(true);
    try {
      const res = await api.ai.predictDemand({
        routeId: selectedRouteId,
        dayOfWeek,
        weather,
        specialEvent,
        surgePercent
      });
      setForecastResult(res.data);
    } catch (err) {
      console.error('AI Prediction error:', err);
    } finally {
      setLoading(false);
    }
  };

  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-purple-950/40 via-indigo-950/40 to-slate-900/40 border border-purple-500/30 rounded-3xl p-6 shadow-xl backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-purple-400 text-xs font-bold uppercase tracking-wider mb-1">
              <Brain className="w-4 h-4" />
              <span>Level 8 Machine Learning Demand Forecaster</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              AI Passenger Demand Prediction
            </h1>
            <p className="text-sm text-slate-300 mt-1">
              Predict future passenger crowding across routes and hours using non-linear Gaussian peak regression.
            </p>
          </div>

          {modelMetrics && (
            <div className="flex items-center gap-2 bg-purple-950/60 border border-purple-500/30 px-3.5 py-2 rounded-2xl">
              <Award className="w-5 h-5 text-purple-400" />
              <div>
                <span className="text-[10px] text-purple-300 font-semibold uppercase block">Model Accuracy</span>
                <span className="text-sm font-black text-white">R² = {modelMetrics.metrics.r2Score} ({modelMetrics.metrics.accuracyGrade})</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Interactive Scenario Tuning Controls */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <h2 className="text-xs font-bold tracking-wider uppercase text-slate-400 flex items-center gap-2">
          <Sliders className="w-4 h-4 text-purple-400" />
          <span>Tune Forecast Parameters & Environmental Features</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Route selector */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">Target Route</label>
            <select
              value={selectedRouteId}
              onChange={(e) => setSelectedRouteId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs font-semibold text-white focus:outline-none focus:border-purple-500"
            >
              {routes.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>

          {/* Day of Week */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">Day of Week</label>
            <select
              value={dayOfWeek}
              onChange={(e) => setDayOfWeek(Number(e.target.value))}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs font-semibold text-white focus:outline-none focus:border-purple-500"
            >
              {days.map((day, idx) => (
                <option key={idx} value={idx}>
                  {day}
                </option>
              ))}
            </select>
          </div>

          {/* Weather Condition */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">Weather Factor</label>
            <div className="grid grid-cols-3 gap-1">
              {[
                { id: 'Clear', label: 'Clear', icon: Sun },
                { id: 'Rain', label: 'Rain (+25%)', icon: CloudRain },
                { id: 'Extreme Heat', label: 'Heat (-8%)', icon: Flame }
              ].map((w) => (
                <button
                  key={w.id}
                  onClick={() => setWeather(w.id)}
                  className={`py-2 px-1 text-[11px] font-bold rounded-xl border flex flex-col items-center gap-1 transition-all ${
                    weather === w.id
                      ? 'bg-purple-600/30 border-purple-500 text-purple-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <w.icon className="w-3.5 h-3.5" />
                  <span>{w.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Event Surge Toggle & Slider */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">Special Event / Festival Surge</label>
            <button
              onClick={() => setSpecialEvent(!specialEvent)}
              className={`w-full py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-between ${
                specialEvent
                  ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <span>{specialEvent ? 'Event Surge Active (+45%)' : 'No Major Events'}</span>
              <span className={`w-2.5 h-2.5 rounded-full ${specialEvent ? 'bg-amber-400 animate-ping' : 'bg-slate-600'}`}></span>
            </button>
          </div>
        </div>
      </div>

      {/* Forecast Chart */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-purple-400" />
              <span>Next 24-Hour Demand Forecast Curve (95% Confidence Band)</span>
            </h2>
            <p className="text-xs text-slate-400">
              Projected passengers per hour with confidence intervals and automatic fleet recommendation
            </p>
          </div>

          {forecastResult && (
            <div className="flex items-center gap-3 text-xs">
              <span className="text-slate-400">
                Total Daily Est: <strong className="text-white">{forecastResult.totalDailyEstimatedPassengers?.toLocaleString()} pax</strong>
              </span>
              <span className="text-slate-400">
                Peak Hour: <strong className="text-purple-400">{forecastResult.peakHour}</strong> ({forecastResult.peakPassengers} pax)
              </span>
            </div>
          )}
        </div>

        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={forecastResult?.hourlyForecast || []}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#A855F7" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#A855F7" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
              <XAxis dataKey="hourFormatted" stroke="#64748B" fontSize={11} tickLine={false} />
              <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0F172A',
                  borderColor: '#334155',
                  borderRadius: '0.75rem',
                  fontSize: '12px'
                }}
              />
              <Area
                type="monotone"
                dataKey="predictedPassengers"
                stroke="#A855F7"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorForecast)"
                name="Predicted Passengers"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Model Performance Cards */}
      {modelMetrics && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 shadow-xl">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-purple-400" />
              <span>Model Evaluation Metrics</span>
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-400">R² Coefficient:</span>
                <span className="font-mono font-bold text-emerald-400">{modelMetrics.metrics.r2Score}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-400">Mean Absolute Error (MAE):</span>
                <span className="font-mono font-bold text-white">{modelMetrics.metrics.mae} passengers</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-400">Root Mean Square Error:</span>
                <span className="font-mono font-bold text-white">{modelMetrics.metrics.rmse}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-400">Training Samples:</span>
                <span className="font-mono font-bold text-cyan-400">{modelMetrics.datasetRowsTrained?.toLocaleString()} rows</span>
              </div>
            </div>
          </div>

          <div className="md:col-span-2 bg-slate-900/80 border border-slate-800 rounded-3xl p-5 shadow-xl">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
              <BarChart2 className="w-3.5 h-3.5 text-blue-400" />
              <span>Feature Importance Breakdown</span>
            </h3>
            <div className="space-y-3">
              {(modelMetrics.featureImportance || []).map((feat, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300 font-medium">{feat.feature}</span>
                    <span className="font-mono font-bold text-purple-400">{Math.round(feat.importance * 100)}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-purple-500 to-indigo-500"
                      style={{ width: `${feat.importance * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AiForecasterTab;
