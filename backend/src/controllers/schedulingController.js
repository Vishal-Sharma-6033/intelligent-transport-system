const schedulingService = require('../services/schedulingService');
const db = require('../database/db');
const { AppError } = require('../middleware/errorHandler');

const getSchedules = async (req, res, next) => {
  try {
    const schedules = db.collection('schedules').getAll();
    const routes = db.collection('routes').getAll();

    const populated = schedules.map((s) => {
      const route = routes.find((r) => r.id === s.routeId) || {};
      return {
        ...s,
        routeName: route.name || 'Direct Transit Line',
        routeCode: route.code || 'EXP',
        routeColor: route.color || '#3B82F6'
      };
    });

    res.status(200).json({
      success: true,
      data: populated
    });
  } catch (err) {
    next(err);
  }
};

const createSchedule = async (req, res, next) => {
  try {
    const { routeId, periodName, firstDeparture, lastDeparture, headwayMinutesCurrent, busesAllocatedCurrent } = req.body;

    if (!routeId || !periodName || !headwayMinutesCurrent) {
      return next(new AppError('Please provide routeId, periodName, and headwayMinutesCurrent.', 400));
    }

    const route = db.collection('routes').findById(routeId);
    if (!route) {
      return next(new AppError(`Route with ID ${routeId} not found`, 404));
    }

    const headway = Number(headwayMinutesCurrent);
    const optimizedHeadway = Math.max(4, Math.round(headway * 0.65));
    const busesCurrent = busesAllocatedCurrent ? Number(busesAllocatedCurrent) : 3;
    const busesOptimized = Math.max(busesCurrent, Math.ceil(busesCurrent * 1.3));

    const newSchedule = db.collection('schedules').create({
      id: `SCH-${Date.now()}`,
      routeId,
      periodName: periodName.trim(),
      headwayMinutesCurrent: headway,
      headwayMinutesOptimized: optimizedHeadway,
      busesAllocatedCurrent: busesCurrent,
      busesAllocatedOptimized: busesOptimized,
      averagePassengerWaitCurrent: parseFloat((headway / 2).toFixed(1)),
      averagePassengerWaitOptimized: parseFloat((optimizedHeadway / 2).toFixed(1)),
      status: 'ACTIVE_TIMETABLE',
      firstDeparture: firstDeparture || '07:00',
      lastDeparture: lastDeparture || '22:00',
      totalTripsPlanned: Math.max(6, Math.round(180 / headway))
    });

    res.status(201).json({
      success: true,
      message: 'Bus schedule timetable created successfully',
      data: newSchedule
    });
  } catch (err) {
    next(err);
  }
};

const deleteSchedule = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = db.collection('schedules').findByIdAndDelete(id);

    if (!deleted) {
      return next(new AppError(`Schedule with ID ${id} not found`, 404));
    }

    res.status(200).json({
      success: true,
      message: 'Schedule deleted successfully'
    });
  } catch (err) {
    next(err);
  }
};

const optimizeSchedule = async (req, res, next) => {
  try {
    const { routeId, customPeakSurge } = req.body;

    if (!routeId) {
      return next(new AppError('Please specify routeId for schedule optimization.', 400));
    }

    const result = schedulingService.optimizeRouteSchedule(routeId, customPeakSurge ? parseFloat(customPeakSurge) : 1.0);

    if (!result) {
      return next(new AppError(`No active schedules found for route ID ${routeId}`, 404));
    }

    res.status(200).json({
      success: true,
      message: 'Schedule optimization computed successfully',
      data: result
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getSchedules,
  createSchedule,
  deleteSchedule,
  optimizeSchedule
};
