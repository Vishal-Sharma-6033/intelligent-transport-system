const multiObjectiveService = require('../services/multiObjectiveService');

const optimizeNetwork = async (req, res, next) => {
  try {
    const { weights } = req.body;
    const report = multiObjectiveService.generateNetworkOptimizationReport(weights);

    res.status(200).json({
      success: true,
      message: 'Network multi-objective optimization computed successfully',
      data: report
    });
  } catch (err) {
    next(err);
  }
};

const getOptimizationReport = async (req, res, next) => {
  try {
    const report = multiObjectiveService.generateNetworkOptimizationReport();
    res.status(200).json({
      success: true,
      data: report
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  optimizeNetwork,
  getOptimizationReport
};
