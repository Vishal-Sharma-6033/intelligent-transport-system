const db = require('../database/db');

class SchedulingService {
  // Calculates optimal headway based on passenger arrival rate and bus capacity
  calculateOptimalHeadway(hourlyPassengerDemand, busCapacity = 60, targetLoadFactor = 0.8) {
    const effectiveCapacity = busCapacity * targetLoadFactor; // e.g. 48 passengers per bus
    const busesNeededPerHour = Math.max(2, Math.ceil(hourlyPassengerDemand / effectiveCapacity));
    const optimalHeadwayMinutes = Math.max(4, Math.round(60 / busesNeededPerHour));
    return {
      busesNeededPerHour,
      optimalHeadwayMinutes
    };
  }

  // Estimates average passenger waiting time: E[W] = Headway / 2 + delay buffer
  estimateWaitingTime(headwayMinutes, crowdingFactor = 1.0) {
    const baseWait = headwayMinutes / 2.0;
    const congestionWaitPenalty = crowdingFactor > 1.2 ? (crowdingFactor - 1.2) * 3 : 0;
    return parseFloat((baseWait + congestionWaitPenalty).toFixed(1));
  }

  // Optimize a specific schedule or all schedules
  optimizeRouteSchedule(routeId, customPeakSurge = 1.0) {
    const route = db.collection('routes').findById(routeId);
    if (!route) return null;

    const schedules = db.collection('schedules').find({ routeId });
    const roundTripMinutes = (route.estimatedTotalMinutes || 40) * 2;

    const optimizedSchedules = schedules.map((sch) => {
      const isPeak = sch.periodName.toLowerCase().includes('peak');
      const demandMultiplier = isPeak ? 2.5 * customPeakSurge : 1.2;
      const hourlyDemand = Math.round(90 * demandMultiplier);

      const { busesNeededPerHour, optimalHeadwayMinutes } = this.calculateOptimalHeadway(hourlyDemand, 60, 0.75);

      const requiredBuses = Math.max(3, Math.ceil(roundTripMinutes / optimalHeadwayMinutes));
      const currentWait = this.estimateWaitingTime(sch.headwayMinutesCurrent, 1.3);
      const optimizedWait = this.estimateWaitingTime(optimalHeadwayMinutes, 1.0);

      const waitTimeReductionMinutes = parseFloat((currentWait - optimizedWait).toFixed(1));
      const waitTimeReductionPercent = parseFloat((((currentWait - optimizedWait) / currentWait) * 100).toFixed(1));

      return {
        id: sch.id,
        routeId: sch.routeId,
        routeName: route.name,
        routeCode: route.code,
        periodName: sch.periodName,
        current: {
          headwayMinutes: sch.headwayMinutesCurrent,
          busesAllocated: sch.busesAllocatedCurrent,
          avgWaitingTimeMinutes: currentWait
        },
        optimized: {
          headwayMinutes: optimalHeadwayMinutes,
          busesAllocated: requiredBuses,
          avgWaitingTimeMinutes: optimizedWait
        },
        impact: {
          waitTimeReductionMinutes,
          waitTimeReductionPercent,
          additionalBusesNeeded: Math.max(0, requiredBuses - sch.busesAllocatedCurrent),
          fleetEfficiencyScore: 92
        },
        firstDeparture: sch.firstDeparture,
        lastDeparture: sch.lastDeparture
      };
    });

    return {
      route: {
        id: route.id,
        name: route.name,
        code: route.code,
        roundTripMinutes
      },
      schedules: optimizedSchedules,
      summary: {
        totalCurrentBuses: optimizedSchedules.reduce((acc, s) => acc + s.current.busesAllocated, 0),
        totalOptimizedBuses: optimizedSchedules.reduce((acc, s) => acc + s.optimized.busesAllocated, 0),
        overallAvgWaitTimeReductionPercent: (
          optimizedSchedules.reduce((acc, s) => acc + s.impact.waitTimeReductionPercent, 0) / optimizedSchedules.length
        ).toFixed(1)
      }
    };
  }

  // Get waiting time analytics across all routes
  getWaitingTimeAnalytics() {
    const schedules = db.collection('schedules').getAll();
    const routes = db.collection('routes').getAll();

    return schedules.map((sch) => {
      const route = routes.find((r) => r.id === sch.routeId) || { name: 'Unknown Route' };
      const currentWait = this.estimateWaitingTime(sch.headwayMinutesCurrent, 1.2);
      const optimizedWait = this.estimateWaitingTime(sch.headwayMinutesOptimized, 1.0);

      return {
        scheduleId: sch.id,
        routeId: sch.routeId,
        routeName: route.name,
        periodName: sch.periodName,
        currentWaitMinutes: currentWait,
        optimizedWaitMinutes: optimizedWait,
        savingsMinutes: parseFloat((currentWait - optimizedWait).toFixed(1)),
        currentHeadway: sch.headwayMinutesCurrent,
        optimizedHeadway: sch.headwayMinutesOptimized
      };
    });
  }
}

module.exports = new SchedulingService();
