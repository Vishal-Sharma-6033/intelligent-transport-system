import React, { useState, useEffect } from 'react';
import { Network, CheckCircle2, AlertTriangle, Layers, Share2, Activity, ArrowRight, ShieldCheck } from 'lucide-react';
import { api } from '../services/api';

const NetworkGraphTab = () => {
  const [graphData, setGraphData] = useState(null);
  const [connectivity, setConnectivity] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGraph();
  }, []);

  const loadGraph = async () => {
    setLoading(true);
    try {
      const [gRes, cRes] = await Promise.all([
        api.network.getGraph(),
        api.network.getConnectivity()
      ]);
      setGraphData(gRes.data);
      setConnectivity(cRes.data);
      if (gRes.data?.nodes?.length > 0) {
        setSelectedNode(gRes.data.nodes[0]);
      }
    } catch (err) {
      console.error('Failed to load network graph:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center">
        <span className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin inline-block"></span>
        <p className="text-xs text-slate-400 mt-3 font-semibold">Generating transport network graph topology...</p>
      </div>
    );
  }

  // Find connections for selected node
  const connectedLinks = (graphData?.links || []).filter(
    (l) => l.source === selectedNode?.id || l.target === selectedNode?.id
  );

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-cyan-950/40 via-slate-900/40 to-blue-950/40 border border-cyan-500/30 rounded-3xl p-6 shadow-xl backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-1">
              <Network className="w-4 h-4" />
              <span>Level 4 Transport Graph Engine</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Network Graph & Connectivity Analyzer
            </h1>
            <p className="text-sm text-slate-300 mt-1">
              Mathematical representation of stops as nodes and route segments as weighted edges.
            </p>
          </div>

          {connectivity && (
            <div className="flex items-center gap-2 bg-slate-900/80 border border-slate-800 px-4 py-2 rounded-2xl">
              {connectivity.isFullyConnected ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-amber-400" />
              )}
              <div>
                <span className="text-[10px] text-slate-400 uppercase block font-semibold">Topology Status</span>
                <span className="text-xs font-bold text-white">
                  {connectivity.isFullyConnected ? 'Fully Connected (1 Component)' : `${connectivity.totalComponents} Sub-networks`}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 text-center">
          <span className="text-[11px] text-slate-400 uppercase font-semibold block">Total Nodes (Stops)</span>
          <span className="text-2xl font-black text-white">{graphData?.stats?.totalStops}</span>
        </div>
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 text-center">
          <span className="text-[11px] text-slate-400 uppercase font-semibold block">Connected Edges (Segments)</span>
          <span className="text-2xl font-black text-cyan-400">{graphData?.stats?.totalSegments}</span>
        </div>
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 text-center">
          <span className="text-[11px] text-slate-400 uppercase font-semibold block">Network Graph Density</span>
          <span className="text-2xl font-black text-purple-400">{graphData?.stats?.density}</span>
        </div>
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 text-center">
          <span className="text-[11px] text-slate-400 uppercase font-semibold block">Isolated Disconnected Stops</span>
          <span className="text-2xl font-black text-emerald-400">{connectivity?.isolatedStops?.length || 0}</span>
        </div>
      </div>

      {/* Main Grid: Nodes explorer + Node adjacency inspection */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Stop Node Selector */}
        <div className="lg:col-span-6 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-3">
          <h2 className="text-xs font-bold tracking-wider uppercase text-slate-400 flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            <span>Select Graph Node to Inspect Adjacency</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[460px] overflow-y-auto pr-1">
            {(graphData?.nodes || []).map((node) => {
              const isSelected = selectedNode?.id === node.id;
              return (
                <button
                  key={node.id}
                  onClick={() => setSelectedNode(node)}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    isSelected
                      ? 'bg-cyan-600/20 border-cyan-500 shadow text-white'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-200 text-xs truncate max-w-[140px]">{node.name}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                      {node.code}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 block">{node.zone}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Selected Node Connectivity details */}
        <div className="lg:col-span-6 space-y-4">
          {selectedNode ? (
            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div>
                  <h3 className="text-lg font-black text-white">{selectedNode.name}</h3>
                  <p className="text-xs text-slate-400">{selectedNode.zone} • Capacity: {selectedNode.capacity} pax</p>
                </div>
                <span className="px-2.5 py-1 rounded-xl bg-cyan-500/20 text-cyan-300 font-mono text-xs font-bold border border-cyan-500/30">
                  Node ID: {selectedNode.id}
                </span>
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                  Connected Edge Segments ({connectedLinks.length} Connections)
                </p>

                <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
                  {connectedLinks.map((link, idx) => {
                    const isOut = link.source === selectedNode.id;
                    const neighborId = isOut ? link.target : link.source;
                    const neighborNode = graphData.nodes.find((n) => n.id === neighborId);

                    return (
                      <div
                        key={idx}
                        className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center justify-between text-xs"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span
                              className="w-2.5 h-2.5 rounded-full"
                              style={{ backgroundColor: link.routeColor || '#3B82F6' }}
                            ></span>
                            <span className="font-bold text-slate-200">{neighborNode?.name || neighborId}</span>
                            <span className="text-[10px] text-slate-500 font-mono">({neighborNode?.code})</span>
                          </div>
                          <p className="text-[11px] text-slate-400">{link.routeName}</p>
                        </div>

                        <div className="text-right">
                          <span className="font-mono font-bold text-cyan-400 text-xs">
                            {link.travelTimeMinutes} min
                          </span>
                          <span className="text-[10px] text-slate-500 block">{link.distanceKm} km</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center p-8 bg-slate-900/40 border border-slate-800 rounded-3xl text-slate-500 text-xs">
              Select a node on the left to inspect its graph connectivity.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NetworkGraphTab;
