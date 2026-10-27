const demandAnalysisService = require('../services/demandAnalysisService');
const schedulingService = require('../services/schedulingService');

const getDemandAnalytics = async (req, res, next) => {
  try {
    const routeDemand = demandAnalysisService.getRouteDemandSummary();
    const weekdayVsWeekend = demandAnalysisService.getWeekdayVsWeekendAnalysis();

    res.status(200).json({
      success: true,
      data: {
        routes: routeDemand,
        dayTypeComparison: weekdayVsWeekend
      }
    });
  } catch (err) {
    next(err);
  }
};

const getPeakHoursAnalytics = async (req, res, next) => {
  try {
    const peakAnalysis = demandAnalysisService.getPeakHoursAnalysis();
    res.status(200).json({
      success: true,
      data: peakAnalysis
    });
  } catch (err) {
    next(err);
  }
};

const getStopsDemand = async (req, res, next) => {
  try {
    const stopDemand = demandAnalysisService.getStopDemandDistribution();
    res.status(200).json({
      success: true,
      data: stopDemand
    });
  } catch (err) {
    next(err);
  }
};

const getWaitingTimeAnalytics = async (req, res, next) => {
  try {
    const waitingStats = schedulingService.getWaitingTimeAnalytics();
    res.status(200).json({
      success: true,
      data: waitingStats
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getDemandAnalytics,
  getPeakHoursAnalytics,
  getStopsDemand,
  getWaitingTimeAnalytics
};
