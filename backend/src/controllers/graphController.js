const graphService = require('../services/graphService');

const getNetworkGraph = async (req, res, next) => {
  try {
    const graphData = graphService.getGraphData();
    res.status(200).json({
      success: true,
      data: graphData
    });
  } catch (err) {
    next(err);
  }
};

const getConnectivity = async (req, res, next) => {
  try {
    const connectivity = graphService.checkConnectivity();
    res.status(200).json({
      success: true,
      data: connectivity
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getNetworkGraph,
  getConnectivity
};
