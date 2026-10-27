const trackingService = require('../services/trackingService');
const { AppError } = require('../middleware/errorHandler');

const getAllBusLocations = async (req, res, next) => {
  try {
    const locations = trackingService.getAllBusLocations();
    res.status(200).json({
      success: true,
      data: {
        activeBusesCount: locations.length,
        timestamp: new Date().toISOString(),
        buses: locations
      }
    });
  } catch (err) {
    next(err);
  }
};

const getBusLocation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const bus = trackingService.getBusLocation(id);

    if (!bus) {
      return next(new AppError(`Bus with ID ${id} not found`, 404));
    }

    res.status(200).json({
      success: true,
      data: bus
    });
  } catch (err) {
    next(err);
  }
};

const updateBusLocation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { latitude, longitude, speedKmH, passengerCount, status } = req.body;

    const updated = trackingService.updateBusLocation(id, {
      latitude,
      longitude,
      speedKmH,
      passengerCount,
      status
    });

    if (!updated) {
      return next(new AppError(`Bus with ID ${id} not found`, 404));
    }

    res.status(200).json({
      success: true,
      message: 'Bus location updated successfully',
      data: updated
    });
  } catch (err) {
    next(err);
  }
};

const getStopArrivals = async (req, res, next) => {
  try {
    const { id } = req.params;
    const arrivals = trackingService.getStopArrivals(id);

    if (!arrivals) {
      return next(new AppError(`Stop with ID ${id} not found`, 404));
    }

    res.status(200).json({
      success: true,
      data: arrivals
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllBusLocations,
  getBusLocation,
  updateBusLocation,
  getStopArrivals
};
