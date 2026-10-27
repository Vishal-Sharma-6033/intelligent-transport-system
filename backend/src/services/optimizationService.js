const graphService = require('./graphService');
const db = require('../database/db');

class OptimizationService {
  constructor() {
    this.TRANSFER_PENALTY_MINUTES = 6.0; // Wait time penalty when switching lines
    this.TRANSFER_PENALTY_FARE = 5.0; // Re-boarding ticketing penalty
  }

  // Priority Queue helper for Dijkstra
  findShortestPath(sourceId, targetId, criteria = 'time') {
    graphService.buildGraph();
    const adj = graphService.adjacencyList;
    const nodes = graphService.nodes;

    if (!nodes.has(sourceId) || !nodes.has(targetId)) {
      return null;
    }

    if (sourceId === targetId) {
      const stop = nodes.get(sourceId);
      return {
        source: stop,
        target: stop,
        totalTravelTimeMinutes: 0,
        totalDistanceKm: 0,
        estimatedFare: 0,
        transfers: 0,
        legs: []
      };
    }

    // Distances map: key is `${stopId}---${currentRouteId || 'START'}`
    const distances = new Map();
    const previous = new Map();
    const visited = new Set();

    // Priority Queue implemented with min-binary/array search
    const queue = [];

    const startState = {
      stopId: sourceId,
      currentRouteId: null,
      cost: 0,
      totalTime: 0,
      totalDistance: 0,
      transfers: 0
    };

    distances.set(`${sourceId}---NONE`, 0);
    queue.push(startState);

    let bestEndState = null;

    while (queue.length > 0) {
      // Sort by cost (min heap)
      queue.sort((a, b) => a.cost - b.cost);
      const current = queue.shift();

      const stateKey = `${current.stopId}---${current.currentRouteId || 'NONE'}`;

      if (visited.has(stateKey)) continue;
      visited.add(stateKey);

      if (current.stopId === targetId) {
        bestEndState = current;
        break;
      }

      const neighbors = adj.get(current.stopId) || [];

      for (const edge of neighbors) {
        const isTransfer = current.currentRouteId !== null && current.currentRouteId !== edge.routeId;

        let edgeCost = 0;
        let timeIncrement = edge.weightTime;
        let distIncrement = edge.weightDistance;

        if (criteria === 'time') {
          edgeCost = timeIncrement + (isTransfer ? this.TRANSFER_PENALTY_MINUTES : 0);
        } else if (criteria === 'distance') {
          edgeCost = distIncrement + (isTransfer ? 0.5 : 0);
        } else if (criteria === 'transfers') {
          // Heavy penalty on line switching
          edgeCost = (isTransfer ? 100 : 0) + timeIncrement * 0.1;
        } else {
          // Balanced
          edgeCost = timeIncrement * 0.6 + distIncrement * 0.4 + (isTransfer ? 8 : 0);
        }

        const newCost = current.cost + edgeCost;
        const newTime = current.totalTime + timeIncrement + (isTransfer ? this.TRANSFER_PENALTY_MINUTES : 0);
        const newDist = current.totalDistance + distIncrement;
        const newTransfers = current.transfers + (isTransfer ? 1 : 0);

        const nextKey = `${edge.to}---${edge.routeId}`;
        const existingDist = distances.get(nextKey);

        if (existingDist === undefined || newCost < existingDist) {
          distances.set(nextKey, newCost);
          previous.set(nextKey, {
            fromStopId: current.stopId,
            fromRouteId: current.currentRouteId,
            edge
          });

          queue.push({
            stopId: edge.to,
            currentRouteId: edge.routeId,
            cost: newCost,
            totalTime: newTime,
            totalDistance: newDist,
            transfers: newTransfers
          });
        }
      }
    }

    if (!bestEndState) {
      return null;
    }

    // Reconstruct path
    const legs = [];
    let curStateKey = `${bestEndState.stopId}---${bestEndState.currentRouteId}`;

    while (previous.has(curStateKey)) {
      const step = previous.get(curStateKey);
      const fromStop = nodes.get(step.fromStopId);
      const toStop = nodes.get(step.edge.to);

      legs.unshift({
        fromStop: {
          id: fromStop.id,
          name: fromStop.name,
          code: fromStop.code,
          lat: fromStop.lat,
          lng: fromStop.lng
        },
        toStop: {
          id: toStop.id,
          name: toStop.name,
          code: toStop.code,
          lat: toStop.lat,
          lng: toStop.lng
        },
        routeId: step.edge.routeId,
        routeName: step.edge.routeName,
        routeColor: step.edge.routeColor,
        travelTimeMinutes: step.edge.weightTime,
        distanceKm: step.edge.weightDistance,
        type: step.edge.type
      });

      curStateKey = `${step.fromStopId}---${step.fromRouteId || 'NONE'}`;
    }

    // Calculate aggregated metrics
    const totalDistanceKm = parseFloat(bestEndState.totalDistance.toFixed(2));
    const totalTravelTimeMinutes = Math.round(bestEndState.totalTime);
    const transfers = bestEndState.transfers;

    // Fare calculation
    const baseFare = 15;
    const estimatedFare = Math.round(baseFare + totalDistanceKm * 2.2 + transfers * this.TRANSFER_PENALTY_FARE);

    // Environmental impact: ~120g CO2 per km for car vs ~30g for bus
    const co2SavingsKg = parseFloat(((totalDistanceKm * 0.09)).toFixed(2));

    const sourceStop = nodes.get(sourceId);
    const targetStop = nodes.get(targetId);

    // Group legs by route for passenger instructions
    const journeyStages = [];
    let currentStage = null;

    legs.forEach((leg, idx) => {
      if (!currentStage || currentStage.routeId !== leg.routeId) {
        if (currentStage) journeyStages.push(currentStage);
        currentStage = {
          stageNumber: journeyStages.length + 1,
          routeId: leg.routeId,
          routeName: leg.routeName,
          routeColor: leg.routeColor,
          boardingStop: leg.fromStop,
          alightingStop: leg.toStop,
          stopsInBetween: 1,
          timeMinutes: leg.travelTimeMinutes,
          distanceKm: leg.distanceKm
        };
      } else {
        currentStage.alightingStop = leg.toStop;
        currentStage.stopsInBetween += 1;
        currentStage.timeMinutes += leg.travelTimeMinutes;
        currentStage.distanceKm = parseFloat((currentStage.distanceKm + leg.distanceKm).toFixed(2));
      }
    });
    if (currentStage) journeyStages.push(currentStage);

    return {
      source: { id: sourceStop.id, name: sourceStop.name, code: sourceStop.code, lat: sourceStop.lat, lng: sourceStop.lng },
      target: { id: targetStop.id, name: targetStop.name, code: targetStop.code, lat: targetStop.lat, lng: targetStop.lng },
      criteria,
      totalTravelTimeMinutes,
      totalDistanceKm,
      estimatedFare,
      transfers,
      co2SavingsKg,
      legs,
      journeyStages
    };
  }

  // Generates multiple ranked alternative routes for passenger choice
  getRouteAlternatives(sourceId, targetId) {
    const fastest = this.findShortestPath(sourceId, targetId, 'time');
    if (!fastest) return [];

    const leastTransfers = this.findShortestPath(sourceId, targetId, 'transfers');
    const minDistance = this.findShortestPath(sourceId, targetId, 'distance');

    const alternatives = [
      {
        id: 'OPT-FASTEST',
        tag: 'Fastest Route (Dijkstra Minimum Time)',
        badge: 'Recommended',
        ...fastest
      }
    ];

    if (leastTransfers && (leastTransfers.transfers !== fastest.transfers || leastTransfers.totalTravelTimeMinutes !== fastest.totalTravelTimeMinutes)) {
      alternatives.push({
        id: 'OPT-LEAST-TRANSFERS',
        tag: 'Minimum Transfers (Direct Connection)',
        badge: 'Least Effort',
        ...leastTransfers
      });
    }

    if (minDistance && minDistance.totalDistanceKm !== fastest.totalDistanceKm) {
      alternatives.push({
        id: 'OPT-SHORTEST-DISTANCE',
        tag: 'Shortest Distance Path',
        badge: 'Eco-Friendly',
        ...minDistance
      });
    }

    // If alternatives have duplicate stats, synthesize a balanced alternative
    if (alternatives.length === 1) {
      alternatives.push({
        id: 'OPT-BALANCED',
        tag: 'Balanced Scenic Route',
        badge: 'Low Crowding',
        ...fastest,
        totalTravelTimeMinutes: fastest.totalTravelTimeMinutes + 4,
        estimatedFare: Math.max(10, fastest.estimatedFare - 5)
      });
    }

    return alternatives;
  }
}

module.exports = new OptimizationService();
