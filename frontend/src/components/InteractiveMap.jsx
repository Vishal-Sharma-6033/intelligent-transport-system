import React, { useState, useMemo } from 'react';
import { Bus, MapPin, ZoomIn, ZoomOut, RotateCcw, Navigation, Layers, Info } from 'lucide-react';

const InteractiveMap = ({
  stops = [],
  routes = [],
  buses = [],
  activePath = null, // Path from Dijkstra
  selectedStop = null,
  onSelectStop,
  onSelectBus,
  height = '500px'
}) => {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hoveredStop, setHoveredStop] = useState(null);
  const [hoveredBus, setHoveredBus] = useState(null);

  // Compute bounding box for projection
  const bounds = useMemo(() => {
    if (!stops || stops.length === 0) {
      return { minLat: 28.45, maxLat: 28.72, minLng: 77.02, maxLng: 77.36 };
    }
    const lats = stops.map((s) => s.latitude);
    const lngs = stops.map((s) => s.longitude);
    return {
      minLat: Math.min(...lats) - 0.02,
      maxLat: Math.max(...lats) + 0.02,
      minLng: Math.min(...lngs) - 0.02,
      maxLng: Math.max(...lngs) + 0.02
    };
  }, [stops]);

  // Project lat/lng to SVG coordinate space [width 900, height 580]
  const project = (lat, lng) => {
    const width = 900;
    const height = 580;
    const padding = 50;

    const x = padding + ((lng - bounds.minLng) / (bounds.maxLng - bounds.minLng || 1)) * (width - 2 * padding);
    // Invert Y because latitude goes north (up) but SVG Y goes down
    const y = height - padding - ((lat - bounds.minLat) / (bounds.maxLat - bounds.minLat || 1)) * (height - 2 * padding);

    return { x, y };
  };

  // Drag handlers
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => setIsDragging(false);

  // Active path stops set for fast lookup
  const activePathStopIds = useMemo(() => {
    if (!activePath || !activePath.legs) return new Set();
    const set = new Set();
    activePath.legs.forEach((leg) => {
      set.add(leg.fromStop.id);
      set.add(leg.toStop.id);
    });
    return set;
  }, [activePath]);

  return (
    <div className="relative w-full overflow-hidden rounded-2xl border border-slate-800 bg-[#070B14] shadow-2xl select-none" style={{ height }}>
      {/* Top Map Controls */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700/60 shadow-lg text-xs">
        <div className="flex items-center gap-1.5 text-blue-400 font-semibold">
          <Navigation className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '6s' }} />
          <span>LIVE TRANSIT RADAR</span>
        </div>
        <span className="text-slate-600">|</span>
        <span className="text-slate-400">{stops.length} Stations</span>
        <span className="text-slate-600">|</span>
        <span className="text-emerald-400 flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          {buses.length} Active Fleet
        </span>
      </div>

      {/* Floating Zoom / Pan Controls */}
      <div className="absolute top-4 right-4 z-20 flex flex-col gap-1.5 bg-slate-900/80 backdrop-blur-md p-1.5 rounded-xl border border-slate-700/60 shadow-lg">
        <button
          onClick={() => setZoom((z) => Math.min(z + 0.25, 2.8))}
          className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => setZoom((z) => Math.max(z - 0.25, 0.75))}
          className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={() => {
            setZoom(1);
            setPan({ x: 0, y: 0 });
          }}
          className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          title="Reset View"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Map Legend */}
      <div className="absolute bottom-4 left-4 z-20 flex flex-wrap gap-2 max-w-xl bg-slate-900/80 backdrop-blur-md p-2 rounded-xl border border-slate-700/60 text-xs">
        {routes.map((r) => (
          <div key={r.id} className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-800/80 border border-slate-700/40">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: r.color || '#3B82F6' }}></span>
            <span className="text-slate-300 font-medium truncate max-w-[130px]">{r.name}</span>
          </div>
        ))}
      </div>

      {/* SVG Canvas */}
      <svg
        viewBox="0 0 900 580"
        className="w-full h-full cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <defs>
          {/* Futuristic Grid Pattern */}
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1E293B" strokeWidth="0.7" opacity="0.4" />
            <circle cx="0" cy="0" r="1.2" fill="#334155" opacity="0.6" />
          </pattern>
          {/* Radial ambient glow */}
          <radialGradient id="mapGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#1E3A8A" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#0B0F19" stopOpacity="0" />
          </radialGradient>
          {/* Path Glow Filter */}
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        <rect width="100%" height="100%" fill="url(#grid)" />
        <rect width="100%" height="100%" fill="url(#mapGlow)" />

        <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`} transform-origin="450 290">
          {/* 1. Base Route Lines */}
          {routes.map((route) => {
            const seq = route.stops || [];
            if (seq.length < 2) return null;

            const pathPoints = seq
              .map((s) => {
                const stopObj = stops.find((st) => st.id === s.stopId);
                return stopObj ? project(stopObj.latitude, stopObj.longitude) : null;
              })
              .filter(Boolean);

            if (pathPoints.length < 2) return null;

            const pathD = pathPoints.reduce((acc, pt, idx) => {
              return idx === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
            }, '');

            return (
              <g key={`route-line-${route.id}`}>
                {/* Background Shadow Line */}
                <path
                  d={pathD}
                  fill="none"
                  stroke={route.color || '#3B82F6'}
                  strokeWidth="5"
                  strokeOpacity="0.25"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {/* Main Core Line */}
                <path
                  d={pathD}
                  fill="none"
                  stroke={route.color || '#3B82F6'}
                  strokeWidth="3"
                  strokeOpacity="0.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </g>
            );
          })}

          {/* 2. Highlighted Active Journey Path (Dijkstra Computed Route) */}
          {activePath && activePath.legs && (
            <g className="animate-pulse">
              {activePath.legs.map((leg, idx) => {
                const p1 = project(leg.fromStop.lat, leg.fromStop.lng);
                const p2 = project(leg.toStop.lat, leg.toStop.lng);
                return (
                  <g key={`active-leg-${idx}`}>
                    <line
                      x1={p1.x}
                      y1={p1.y}
                      x2={p2.x}
                      y2={p2.y}
                      stroke="#38BDF8"
                      strokeWidth="8"
                      strokeOpacity="0.4"
                      strokeLinecap="round"
                      filter="url(#glow)"
                    />
                    <line
                      x1={p1.x}
                      y1={p1.y}
                      x2={p2.x}
                      y2={p2.y}
                      stroke="#FFFFFF"
                      strokeWidth="4"
                      strokeDasharray="6,4"
                      strokeLinecap="round"
                    />
                  </g>
                );
              })}
            </g>
          )}

          {/* 3. Stop Nodes */}
          {stops.map((stop) => {
            const { x, y } = project(stop.latitude, stop.longitude);
            const isSelected = selectedStop && selectedStop.id === stop.id;
            const isInPath = activePathStopIds.has(stop.id);

            return (
              <g
                key={stop.id}
                className="cursor-pointer transition-transform duration-200"
                onClick={() => onSelectStop && onSelectStop(stop)}
                onMouseEnter={() => setHoveredStop(stop)}
                onMouseLeave={() => setHoveredStop(null)}
              >
                {/* Outer Ring for selected / in-path stop */}
                {(isSelected || isInPath) && (
                  <circle
                    cx={x}
                    cy={y}
                    r={isSelected ? 14 : 10}
                    fill="none"
                    stroke={isSelected ? '#38BDF8' : '#60A5FA'}
                    strokeWidth="2.5"
                    strokeDasharray="3,2"
                    className="animate-spin"
                    style={{ animationDuration: '8s' }}
                  />
                )}

                {/* Stop Marker Node */}
                <circle
                  cx={x}
                  cy={y}
                  r={isSelected ? 8 : isInPath ? 6 : 5}
                  fill={isSelected ? '#38BDF8' : isInPath ? '#FFFFFF' : '#1E293B'}
                  stroke={isSelected ? '#FFFFFF' : '#64748B'}
                  strokeWidth="2"
                  className="transition-all hover:scale-125"
                />

                {/* Stop Name Label */}
                <text
                  x={x}
                  y={y - 10}
                  textAnchor="middle"
                  fill={isSelected || isInPath ? '#FFFFFF' : '#94A3B8'}
                  fontSize={isSelected || isInPath ? '10' : '8.5'}
                  fontWeight={isSelected || isInPath ? '700' : '500'}
                  className="pointer-events-none drop-shadow"
                >
                  {stop.name}
                </text>
              </g>
            );
          })}

          {/* 4. Live Moving Buses */}
          {buses.map((bus) => {
            const { x, y } = project(bus.latitude, bus.longitude);
            const isCrowded = bus.occupancyStatus === 'CROWDED';

            return (
              <g
                key={bus.id}
                className="cursor-pointer transition-all duration-300"
                onClick={() => onSelectBus && onSelectBus(bus)}
                onMouseEnter={() => setHoveredBus(bus)}
                onMouseLeave={() => setHoveredBus(null)}
              >
                {/* Ping wave */}
                <circle
                  cx={x}
                  cy={y}
                  r="12"
                  fill={bus.routeColor || '#3B82F6'}
                  opacity="0.25"
                  className="animate-ping"
                />

                {/* Bus marker badge */}
                <rect
                  x={x - 11}
                  y={y - 11}
                  width="22"
                  height="22"
                  rx="6"
                  fill="#0F172A"
                  stroke={bus.routeColor || '#3B82F6'}
                  strokeWidth="2"
                />

                {/* Mini bus glyph */}
                <foreignObject x={x - 8} y={y - 8} width="16" height="16" className="pointer-events-none">
                  <div className="flex items-center justify-center w-full h-full text-white">
                    <Bus className="w-3.5 h-3.5" style={{ color: bus.routeColor || '#3B82F6' }} />
                  </div>
                </foreignObject>

                {/* Speed tag */}
                <text
                  x={x}
                  y={y + 18}
                  textAnchor="middle"
                  fill="#E2E8F0"
                  fontSize="7.5"
                  fontWeight="600"
                  className="pointer-events-none bg-slate-900 px-1"
                >
                  {bus.speedKmH} km/h
                </text>
              </g>
            );
          })}
        </g>
      </svg>

      {/* Hover Card for Stop */}
      {hoveredStop && (
        <div className="absolute top-14 left-4 z-30 max-w-xs bg-slate-900/95 backdrop-blur-md p-3 rounded-xl border border-blue-500/40 shadow-2xl text-xs pointer-events-none">
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="font-bold text-slate-100 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-blue-400" />
              {hoveredStop.name}
            </span>
            <span className="px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono text-[10px]">
              {hoveredStop.code}
            </span>
          </div>
          <p className="text-slate-400 text-[11px] mb-2">{hoveredStop.zone}</p>
          <div className="flex items-center justify-between text-slate-300 pt-1.5 border-t border-slate-800">
            <span>Capacity: {hoveredStop.passengerCapacity} pax</span>
            <span className="text-emerald-400 font-medium">Click for Arrivals</span>
          </div>
        </div>
      )}

      {/* Hover Card for Bus */}
      {hoveredBus && (
        <div className="absolute top-14 right-4 z-30 max-w-xs bg-slate-900/95 backdrop-blur-md p-3 rounded-xl border border-emerald-500/40 shadow-2xl text-xs pointer-events-none">
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="font-bold text-slate-100 flex items-center gap-1">
              <Bus className="w-3.5 h-3.5 text-emerald-400" />
              {hoveredBus.regNumber}
            </span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-500/20 text-emerald-300">
              {hoveredBus.status}
            </span>
          </div>
          <p className="text-slate-300 font-medium mb-1">{hoveredBus.routeName}</p>
          <div className="grid grid-cols-2 gap-1.5 text-[11px] text-slate-400 pt-1.5 border-t border-slate-800">
            <div>Speed: <span className="text-slate-200">{hoveredBus.speedKmH} km/h</span></div>
            <div>Occupancy: <span className="text-slate-200">{hoveredBus.passengerCount}/{hoveredBus.capacity} ({hoveredBus.occupancyStatus})</span></div>
            <div>Next Stop: <span className="text-blue-300">{hoveredBus.nextStopName}</span></div>
            <div>ETA: <span className="text-emerald-300 font-semibold">{hoveredBus.etaMinutesToNextStop} min</span></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InteractiveMap;
