const db = require('../database/db');
const graphService = require('../services/graphService');
const { AppError } = require('../middleware/errorHandler');

const getAllStops = async (req, res, next) => {
  try {
    let stops = db.collection('stops').getAll();
    const { search, zone, page = 1, limit = 50 } = req.query;

    if (search) {
      const q = search.toLowerCase();
      stops = stops.filter((s) => s.name.toLowerCase().includes(q) || s.code.toLowerCase().includes(q) || s.zone.toLowerCase().includes(q));
    }

    if (zone) {
      stops = stops.filter((s) => s.zone.toLowerCase() === zone.toLowerCase());
    }

    const total = stops.length;
    const startIndex = (Number(page) - 1) * Number(limit);
    const paginated = stops.slice(startIndex, startIndex + Number(limit));

    res.status(200).json({
      success: true,
      data: {
        total,
        page: Number(page),
        limit: Number(limit),
        stops: paginated
      }
    });
  } catch (err) {
    next(err);
  }
};

const getStopById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const stop = db.collection('stops').findById(id);

    if (!stop) {
      return next(new AppError(`Stop with ID ${id} not found`, 404));
    }

    // Find routes passing through this stop
    const routes = db.collection('routes').getAll();
    const passingRoutes = routes.filter((r) => r.stops && r.stops.some((s) => s.stopId === stop.id));

    res.status(200).json({
      success: true,
      data: {
        ...stop,
        connectedRoutes: passingRoutes.map((r) => ({
          id: r.id,
          name: r.name,
          code: r.code,
          color: r.color
        }))
      }
    });
  } catch (err) {
    next(err);
  }
};

const createStop = async (req, res, next) => {
  try {
    const { name, code, zone, latitude, longitude, passengerCapacity, amenities } = req.body;

    if (!name || !latitude || !longitude) {
      return next(new AppError('Please provide stop name, latitude, and longitude.', 400));
    }

    const newStop = db.collection('stops').create({
      id: `STP-${Date.now()}`,
      code: code ? code.toUpperCase() : `STP-${Math.floor(100 + Math.random() * 900)}`,
      name: name.trim(),
      zone: zone || 'Standard Zone',
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      passengerCapacity: passengerCapacity ? Number(passengerCapacity) : 2000,
      amenities: amenities || ['Shelter', 'Smart Display'],
      isActive: true
    });

    graphService.buildGraph();

    res.status(201).json({
      success: true,
      message: 'Stop created successfully',
      data: newStop
    });
  } catch (err) {
    next(err);
  }
};

const updateStop = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updated = db.collection('stops').findByIdAndUpdate(id, req.body);

    if (!updated) {
      return next(new AppError(`Stop with ID ${id} not found`, 404));
    }

    graphService.buildGraph();

    res.status(200).json({
      success: true,
      message: 'Stop updated successfully',
      data: updated
    });
  } catch (err) {
    next(err);
  }
};

const deleteStop = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = db.collection('stops').findByIdAndDelete(id);

    if (!deleted) {
      return next(new AppError(`Stop with ID ${id} not found`, 404));
    }

    graphService.buildGraph();

    res.status(200).json({
      success: true,
      message: 'Stop deleted successfully'
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllStops,
  getStopById,
  createStop,
  updateStop,
  deleteStop
};
