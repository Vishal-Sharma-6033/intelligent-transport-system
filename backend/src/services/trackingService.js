const db = require('../database/db');

class TrackingService {
  constructor() {
    this.busSimulationTimer = null;
    this.startSimulation();
  }

  // Linear interpolation between two coordinates
  lerp(start, end, progress) {
    return start + (end - start) * progress;
  }

  // Haversine distance in km
  haversineDistance(lat1, lon1, lat2, lon2) {
    const toRad = (x) => (x * Math.PI) / 180;
    const R = 6371; // Earth radius in km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  // Real-time GPS movement simulation along routes
  startSimulation() {
    if (this.busSimulationTimer) return;

    // Tick every 3 seconds to move buses smoothly
    this.busSimulationTimer = setInterval(() => {
      this.tick();
    }, 3000);
  }

  tick() {
    const buses = db.collection('buses').getAll();
    const stops = db.collection('stops').getAll();
    const routes = db.collection('routes').getAll();

    buses.forEach((bus) => {
      const route = routes.find((r) => r.id === bus.routeId);
      if (!route || !route.stops || route.stops.length < 2) return;

      const stopSeq = route.stops;
      let currIdx = stopSeq.findIndex((s) => s.stopId === bus.currentStopId);
      let nextIdx = stopSeq.findIndex((s) => s.stopId === bus.nextStopId);

      if (currIdx === -1 || nextIdx === -1) {
        currIdx = 0;
        nextIdx = 1;
        bus.currentStopId = stopSeq[0].stopId;
        bus.nextStopId = stopSeq[1].stopId;
      }

      const currStopObj = stops.find((s) => s.id === bus.currentStopId);
      const nextStopObj = stops.find((s) => s.id === bus.nextStopId);

      if (!currStopObj || !nextStopObj) return;

      // Distance to next stop
      const remainingDist = this.haversineDistance(bus.latitude, bus.longitude, nextStopObj.latitude, nextStopObj.longitude);

      if (remainingDist < 0.25) {
        // Bus has arrived at next stop! Advance to subsequent stop
        bus.currentStopId = bus.nextStopId;
        const nextNextIdx = (nextIdx + 1) % stopSeq.length;
        bus.nextStopId = stopSeq[nextNextIdx].stopId;

        bus.latitude = nextStopObj.latitude;
        bus.longitude = nextStopObj.longitude;

        // Minor passenger board/alight fluctuation
        const paxChange = Math.floor(Math.random() * 9) - 4;
        bus.passengerCount = Math.max(10, Math.min(bus.capacity, bus.passengerCount + paxChange));
        bus.occupancyStatus = bus.passengerCount > bus.capacity * 0.85 ? 'CROWDED' : bus.passengerCount > bus.capacity * 0.5 ? 'MODERATE' : 'LOW';

        bus.etaMinutesToNextStop = 4.0;
      } else {
        // Move towards next stop
        const stepRatio = 0.08; // smooth step
        bus.latitude = this.lerp(bus.latitude, nextStopObj.latitude, stepRatio);
        bus.longitude = this.lerp(bus.longitude, nextStopObj.longitude, stepRatio);

        // Speed fluctuation between 25 and 45 km/h
        bus.speedKmH = Math.round(30 + Math.sin(Date.now() / 8000) * 12);
        const estMinutes = (remainingDist / (bus.speedKmH || 30)) * 60;
        bus.etaMinutesToNextStop = parseFloat(Math.max(0.5, estMinutes).toFixed(1));
      }

      bus.lastUpdated = new Date().toISOString();
    });

    db.persist();
  }

  // Get live bus fleet locations
  getAllBusLocations() {
    const buses = db.collection('buses').getAll();
    const routes = db.collection('routes').getAll();
    const stops = db.collection('stops').getAll();

    return buses.map((bus) => {
      const route = routes.find((r) => r.id === bus.routeId) || {};
      const currStop = stops.find((s) => s.id === bus.currentStopId) || {};
      const nextStop = stops.find((s) => s.id === bus.nextStopId) || {};

      return {
        ...bus,
        routeName: route.name || 'Direct Line',
        routeCode: route.code || 'EXP',
        routeColor: route.color || '#3B82F6',
        currentStopName: currStop.name || 'Station',
        nextStopName: nextStop.name || 'Station'
      };
    });
  }

  // Get specific bus location
  getBusLocation(busId) {
    const buses = this.getAllBusLocations();
    return buses.find((b) => b.id === busId);
  }

  // Update live bus GPS coordinates manually (GPS device intake)
  updateBusLocation(busId, { latitude, longitude, speedKmH, passengerCount, status }) {
    const bus = db.collection('buses').findById(busId);
    if (!bus) return null;

    const updates = {};
    if (latitude !== undefined) updates.latitude = latitude;
    if (longitude !== undefined) updates.longitude = longitude;
    if (speedKmH !== undefined) updates.speedKmH = speedKmH;
    if (passengerCount !== undefined) {
      updates.passengerCount = passengerCount;
      updates.occupancyStatus = passengerCount > bus.capacity * 0.85 ? 'CROWDED' : passengerCount > bus.capacity * 0.5 ? 'MODERATE' : 'LOW';
    }
    if (status !== undefined) updates.status = status;
    updates.lastUpdated = new Date().toISOString();

    return db.collection('buses').findByIdAndUpdate(busId, updates);
  }

  // Live Arrival Board for a bus stop
  getStopArrivals(stopId) {
    const stop = db.collection('stops').findById(stopId);
    if (!stop) return null;

    const allBuses = this.getAllBusLocations();

    // Find buses heading towards this stop or passing through this stop's route
    const incomingBuses = allBuses
      .filter((bus) => {
        return bus.nextStopId === stopId || bus.currentStopId === stopId;
      })
      .map((bus) => {
        const isNext = bus.nextStopId === stopId;
        return {
          busId: bus.id,
          regNumber: bus.regNumber,
          routeId: bus.routeId,
          routeName: bus.routeName,
          routeCode: bus.routeCode,
          routeColor: bus.routeColor,
          currentStatus: isNext ? 'Approaching' : 'At Station / Boarding',
          etaMinutes: isNext ? bus.etaMinutesToNextStop : 0,
          occupancyStatus: bus.occupancyStatus,
          passengerCount: bus.passengerCount,
          capacity: bus.capacity,
          speedKmH: bus.speedKmH,
          driverName: bus.driverName,
          delayMinutes: bus.delayMinutes || 0
        };
      })
      .sort((a, b) => a.etaMinutes - b.etaMinutes);

    return {
      stop: {
        id: stop.id,
        name: stop.name,
        code: stop.code,
        zone: stop.zone,
        latitude: stop.latitude,
        longitude: stop.longitude
      },
      currentTime: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      totalIncomingBuses: incomingBuses.length,
      arrivals: incomingBuses
    };
  }
}

module.exports = new TrackingService();
