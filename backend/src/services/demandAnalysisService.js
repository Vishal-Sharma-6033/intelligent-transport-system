const db = require('../database/db');

class DemandAnalysisService {
  // Peak hour identification across the 24-hour cycle
  getPeakHoursAnalysis() {
    const demand = db.collection('demand').getAll();
    const hourlyMap = new Map();

    demand.forEach((record) => {
      const h = record.hour;
      if (!hourlyMap.has(h)) {
        hourlyMap.set(h, {
          hour: h,
          hourFormatted: record.hourFormatted,
          totalPassengers: 0,
          totalBoardings: 0,
          totalAlightings: 0,
          recordCount: 0
        });
      }
      const entry = hourlyMap.get(h);
      entry.totalPassengers += record.passengerCount;
      entry.totalBoardings += record.boardings;
      entry.totalAlightings += record.alightings;
      entry.recordCount += 1;
    });

    const hourlyStats = Array.from(hourlyMap.values())
      .map((item) => ({
        ...item,
        avgPassengersPerHour: Math.round(item.totalPassengers / (item.recordCount || 1)),
        isPeak: (item.hour >= 8 && item.hour <= 10) || (item.hour >= 17 && item.hour <= 20)
      }))
      .sort((a, b) => a.hour - b.hour);

    const sortedByVolume = [...hourlyStats].sort((a, b) => b.totalPassengers - a.totalPassengers);
    const morningPeak = hourlyStats.filter((h) => h.hour >= 7 && h.hour <= 11).sort((a, b) => b.totalPassengers - a.totalPassengers)[0];
    const eveningPeak = hourlyStats.filter((h) => h.hour >= 16 && h.hour <= 21).sort((a, b) => b.totalPassengers - a.totalPassengers)[0];

    return {
      hourlyDistribution: hourlyStats,
      top3PeakHours: sortedByVolume.slice(0, 3).map((h) => h.hourFormatted),
      morningPeakHour: morningPeak ? morningPeak.hourFormatted : '09:00',
      eveningPeakHour: eveningPeak ? eveningPeak.hourFormatted : '18:00',
      systemPeakSurgeRatio: (sortedByVolume[0].avgPassengersPerHour / (sortedByVolume[sortedByVolume.length - 1].avgPassengersPerHour || 1)).toFixed(2)
    };
  }

  // Route-wise demand aggregation
  getRouteDemandSummary() {
    const demand = db.collection('demand').getAll();
    const routes = db.collection('routes').getAll();
    const routeMap = new Map();

    routes.forEach((r) => {
      routeMap.set(r.id, {
        routeId: r.id,
        routeName: r.name,
        routeCode: r.code,
        color: r.color,
        type: r.type,
        totalPassengers: 0,
        peakPassengers: 0,
        offPeakPassengers: 0,
        avgLoadFactor: 0,
        tripsCount: 0
      });
    });

    demand.forEach((d) => {
      if (routeMap.has(d.routeId)) {
        const item = routeMap.get(d.routeId);
        item.totalPassengers += d.passengerCount;
        if (d.isPeakHour) {
          item.peakPassengers += d.passengerCount;
        } else {
          item.offPeakPassengers += d.passengerCount;
        }
        item.avgLoadFactor += d.loadFactorPercent || 50;
        item.tripsCount += 1;
      }
    });

    const routeSummaries = Array.from(routeMap.values()).map((r) => ({
      ...r,
      avgLoadFactor: Math.round(r.avgLoadFactor / (r.tripsCount || 1)),
      crowdingStatus: r.avgLoadFactor > 75 ? 'HIGH_CONGESTION' : r.avgLoadFactor > 50 ? 'OPTIMAL' : 'UNDER_UTILIZED'
    }));

    return routeSummaries.sort((a, b) => b.totalPassengers - a.totalPassengers);
  }

  // Stop-wise demand distribution (based on connected routes and terminal capacities)
  getStopDemandDistribution() {
    const stops = db.collection('stops').getAll();
    const routes = db.collection('routes').getAll();

    // Map stop appearances
    const stopTraffic = stops.map((stop) => {
      let routeCount = 0;
      routes.forEach((r) => {
        if (r.stops && r.stops.some((s) => s.stopId === stop.id)) {
          routeCount += 1;
        }
      });

      // Estimated daily footfall from stop capacity and connected routes
      const estimatedDailyFootfall = Math.round(stop.passengerCapacity * 2.8 + routeCount * 1250);
      const peakHourFootfall = Math.round(estimatedDailyFootfall * 0.16);

      return {
        stopId: stop.id,
        stopCode: stop.code,
        stopName: stop.name,
        zone: stop.zone,
        connectedRoutesCount: routeCount,
        estimatedDailyFootfall,
        peakHourFootfall,
        capacityUtilizationPercent: Math.min(100, Math.round((peakHourFootfall / stop.passengerCapacity) * 100)),
        riskOfOvercrowding: peakHourFootfall > stop.passengerCapacity * 0.85
      };
    });

    return stopTraffic.sort((a, b) => b.estimatedDailyFootfall - a.estimatedDailyFootfall);
  }

  // Weekday vs Weekend Comparison
  getWeekdayVsWeekendAnalysis() {
    const demand = db.collection('demand').getAll();
    let weekdayTotal = 0;
    let weekendTotal = 0;
    let weekdayCount = 0;
    let weekendCount = 0;

    demand.forEach((d) => {
      if (d.dayType === 'Weekend') {
        weekendTotal += d.passengerCount;
        weekendCount += 1;
      } else {
        weekdayTotal += d.passengerCount;
        weekdayCount += 1;
      }
    });

    const avgWeekday = Math.round(weekdayTotal / (weekdayCount || 1));
    const avgWeekend = Math.round(weekendTotal / (weekendCount || 1));

    return {
      weekdayAverage: avgWeekday,
      weekendAverage: avgWeekend,
      differencePercent: (((avgWeekday - avgWeekend) / (avgWeekend || 1)) * 100).toFixed(1),
      insight: 'Weekday demand is concentrated in office rush hours (8-10 AM, 5-8 PM). Weekend travel is more evenly spread across retail & recreational hubs.'
    };
  }
}

module.exports = new DemandAnalysisService();
