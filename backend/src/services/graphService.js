const db = require('../database/db');

class TransportGraphService {
  constructor() {
    this.adjacencyList = new Map();
    this.nodes = new Map();
    this.buildGraph();
  }

  // Rebuilds graph from current database stops and routes
  buildGraph() {
    this.adjacencyList.clear();
    this.nodes.clear();

    const stops = db.collection('stops').find({ isActive: true });
    const routes = db.collection('routes').find({ isActive: true });

    // 1. Add all stops as graph nodes
    stops.forEach((stop) => {
      this.nodes.set(stop.id, {
        id: stop.id,
        code: stop.code,
        name: stop.name,
        lat: stop.latitude,
        lng: stop.longitude,
        zone: stop.zone,
        capacity: stop.passengerCapacity
      });
      this.adjacencyList.set(stop.id, []);
    });

    // 2. Add edges from route stop sequences
    routes.forEach((route) => {
      const stopSeq = route.stops || [];
      for (let i = 0; i < stopSeq.length - 1; i++) {
        const current = stopSeq[i];
        const next = stopSeq[i + 1];

        if (this.nodes.has(current.stopId) && this.nodes.has(next.stopId)) {
          const travelTime = current.travelTimeToNext || 10;
          const distance = current.distanceToNext || 3.0;

          // Forward Edge
          this.adjacencyList.get(current.stopId).push({
            to: next.stopId,
            routeId: route.id,
            routeName: route.name,
            routeColor: route.color || '#3B82F6',
            weightTime: travelTime,
            weightDistance: distance,
            type: route.type,
            fareBase: route.fareBase || 15,
            farePerKm: route.farePerKm || 2.5
          });

          // Bidirectional transit edge (buses run both directions or return trips)
          this.adjacencyList.get(next.stopId).push({
            to: current.stopId,
            routeId: route.id,
            routeName: route.name,
            routeColor: route.color || '#3B82F6',
            weightTime: travelTime,
            weightDistance: distance,
            type: route.type,
            fareBase: route.fareBase || 15,
            farePerKm: route.farePerKm || 2.5
          });
        }
      }
    });

    return {
      nodeCount: this.nodes.size,
      edgeCount: this.getTotalEdges()
    };
  }

  getTotalEdges() {
    let count = 0;
    for (let [, edges] of this.adjacencyList) {
      count += edges.length;
    }
    return count;
  }

  // Returns graph topology in standard node-link format
  getGraphData() {
    this.buildGraph();
    const nodes = Array.from(this.nodes.values());
    const links = [];

    const visitedPairs = new Set();
    for (let [fromId, edges] of this.adjacencyList) {
      edges.forEach((edge) => {
        const pairKey = [fromId, edge.to, edge.routeId].sort().join('---');
        if (!visitedPairs.has(pairKey)) {
          visitedPairs.add(pairKey);
          links.push({
            source: fromId,
            target: edge.to,
            routeId: edge.routeId,
            routeName: edge.routeName,
            routeColor: edge.routeColor,
            travelTimeMinutes: edge.weightTime,
            distanceKm: edge.weightDistance
          });
        }
      });
    }

    return {
      nodes,
      links,
      stats: {
        totalStops: nodes.length,
        totalSegments: links.length,
        density: (links.length / (nodes.length * (nodes.length - 1 || 1))).toFixed(4)
      }
    };
  }

  // Connectivity analysis (detecting disconnected components / isolated stops)
  checkConnectivity() {
    this.buildGraph();
    const visited = new Set();
    const components = [];
    const stopIds = Array.from(this.nodes.keys());

    const bfs = (startId) => {
      const queue = [startId];
      const component = [];
      visited.add(startId);

      while (queue.length > 0) {
        const current = queue.shift();
        component.push(current);

        const neighbors = this.adjacencyList.get(current) || [];
        for (const neighbor of neighbors) {
          if (!visited.has(neighbor.to)) {
            visited.add(neighbor.to);
            queue.push(neighbor.to);
          }
        }
      }
      return component;
    };

    stopIds.forEach((id) => {
      if (!visited.has(id)) {
        components.push(bfs(id));
      }
    });

    const isolatedStops = [];
    for (let [id, edges] of this.adjacencyList) {
      if (edges.length === 0) {
        isolatedStops.push(this.nodes.get(id));
      }
    }

    return {
      isFullyConnected: components.length <= 1,
      totalComponents: components.length,
      largestComponentSize: Math.max(...components.map((c) => c.length), 0),
      isolatedStops,
      components: components.map((comp, idx) => ({
        componentId: idx + 1,
        stopCount: comp.length,
        stops: comp.map((id) => this.nodes.get(id).name)
      }))
    };
  }
}

module.exports = new TransportGraphService();
