const mlDemandService = require('../services/mlDemandService');

const predictDemand = async (req, res, next) => {
  try {
    const { hour, dayOfWeek, routeId, weather, specialEvent, surgePercent } = req.body;

    // If no specific hour is given, generate 24h forecast
    if (hour === undefined) {
      const forecast = mlDemandService.get24HourForecast(routeId, {
        dayOfWeek,
        weather,
        specialEvent,
        surgePercent
      });
      return res.status(200).json({
        success: true,
        data: forecast
      });
    }

    const prediction = mlDemandService.predictHourlyDemand({
      hour: Number(hour),
      dayOfWeek: dayOfWeek !== undefined ? Number(dayOfWeek) : 1,
      routeId: routeId || 'R-101',
      weather: weather || 'Clear',
      specialEvent: !!specialEvent,
      surgePercent: surgePercent ? Number(surgePercent) : 0
    });

    res.status(200).json({
      success: true,
      data: prediction
    });
  } catch (err) {
    next(err);
  }
};

const getModelMetrics = async (req, res, next) => {
  try {
    const metrics = mlDemandService.getModelMetrics();
    res.status(200).json({
      success: true,
      data: metrics
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  predictDemand,
  getModelMetrics
};
