const optimizationService = require('../services/optimizationService');
const { AppError } = require('../middleware/errorHandler');

const optimizeRoute = async (req, res, next) => {
  try {
    const { sourceStopId, targetStopId, criteria = 'time' } = req.body;

    if (!sourceStopId || !targetStopId) {
      return next(new AppError('Please provide sourceStopId and targetStopId.', 400));
    }

    const result = optimizationService.findShortestPath(sourceStopId, targetStopId, criteria);

    if (!result) {
      return next(new AppError('No connected transit route path found between the selected stops.', 404));
    }

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (err) {
    next(err);
  }
};

const getRouteAlternatives = async (req, res, next) => {
  try {
    const { sourceStopId, targetStopId } = req.body;

    if (!sourceStopId || !targetStopId) {
      return next(new AppError('Please provide sourceStopId and targetStopId.', 400));
    }

    const alternatives = optimizationService.getRouteAlternatives(sourceStopId, targetStopId);

    if (!alternatives || alternatives.length === 0) {
      return next(new AppError('No transit route options found between the selected stops.', 404));
    }

    res.status(200).json({
      success: true,
      data: {
        totalOptions: alternatives.length,
        alternatives
      }
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  optimizeRoute,
  getRouteAlternatives
};
