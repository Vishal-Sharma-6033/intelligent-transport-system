const db = require('../database/db');
const graphService = require('../services/graphService');
const { AppError } = require('../middleware/errorHandler');

const getAllRoutes = async (req, res, next) => {
  try {
    const routes = db.collection('routes').getAll();
    const stops = db.collection('stops').getAll();

    // Populate stop details inside routes
    const populated = routes.map((r) => {
      const stopsDetailed = (r.stops || []).map((s) => {
        const stopObj = stops.find((item) => item.id === s.stopId) || {};
        return {
          ...s,
          name: stopObj.name || 'Unknown Stop',
          code: stopObj.code || '',
          latitude: stopObj.latitude,
          longitude: stopObj.longitude
        };
      });

      return {
        ...r,
        stopsCount: (r.stops || []).length,
        stopsDetailed
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

const getRouteById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const route = db.collection('routes').findById(id);

    if (!route) {
      return next(new AppError(`Route with ID ${id} not found`, 404));
    }

    const stops = db.collection('stops').getAll();
    const stopsDetailed = (route.stops || []).map((s) => {
      const stopObj = stops.find((item) => item.id === s.stopId) || {};
      return {
        ...s,
        name: stopObj.name || 'Unknown Stop',
        code: stopObj.code || '',
        latitude: stopObj.latitude,
        longitude: stopObj.longitude,
        zone: stopObj.zone
      };
    });

    res.status(200).json({
      success: true,
      data: {
        ...route,
        stopsDetailed
      }
    });
  } catch (err) {
    next(err);
  }
};

const createRoute = async (req, res, next) => {
  try {
    const { name, code, type, color, stops, fareBase, farePerKm } = req.body;

    if (!name || !stops || !Array.isArray(stops) || stops.length < 2) {
      return next(new AppError('A valid route must have a name and at least 2 connected stops.', 400));
    }

    // Validate that all referenced stops exist in database
    const allStops = db.collection('stops').getAll();
    for (const seq of stops) {
      const exists = allStops.some((s) => s.id === seq.stopId);
      if (!exists) {
        return next(new AppError(`Referenced stopId '${seq.stopId}' does not exist in the transport network.`, 400));
      }
    }

    const totalDistanceKm = stops.reduce((acc, s) => acc + (s.distanceToNext || 0), 0);
    const estimatedTotalMinutes = stops.reduce((acc, s) => acc + (s.travelTimeToNext || 0), 0);

    const newRoute = db.collection('routes').create({
      id: `R-${Date.now()}`,
      code: code ? code.toUpperCase() : `R-${Math.floor(100 + Math.random() * 900)}`,
      name: name.trim(),
      type: type || 'City Bus',
      color: color || '#3B82F6',
      stops,
      fareBase: fareBase || 15,
      farePerKm: farePerKm || 2.5,
      totalDistanceKm: parseFloat(totalDistanceKm.toFixed(1)),
      estimatedTotalMinutes,
      isActive: true
    });

    graphService.buildGraph();

    res.status(201).json({
      success: true,
      message: 'Route created successfully',
      data: newRoute
    });
  } catch (err) {
    next(err);
  }
};

const updateRoute = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updated = db.collection('routes').findByIdAndUpdate(id, req.body);

    if (!updated) {
      return next(new AppError(`Route with ID ${id} not found`, 404));
    }

    graphService.buildGraph();

    res.status(200).json({
      success: true,
      message: 'Route updated successfully',
      data: updated
    });
  } catch (err) {
    next(err);
  }
};

const deleteRoute = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = db.collection('routes').findByIdAndDelete(id);

    if (!deleted) {
      return next(new AppError(`Route with ID ${id} not found`, 404));
    }

    graphService.buildGraph();

    res.status(200).json({
      success: true,
      message: 'Route deleted successfully'
    });
  } catch (err) {
    next(err);
  }
};

const getRouteStops = async (req, res, next) => {
  try {
    const { id } = req.params;
    const route = db.collection('routes').findById(id);

    if (!route) {
      return next(new AppError(`Route with ID ${id} not found`, 404));
    }

    const allStops = db.collection('stops').getAll();
    const orderedStops = (route.stops || []).map((s) => {
      const stopObj = allStops.find((item) => item.id === s.stopId) || {};
      return {
        sequence: s.sequence,
        travelTimeToNext: s.travelTimeToNext,
        distanceToNext: s.distanceToNext,
        ...stopObj
      };
    });

    res.status(200).json({
      success: true,
      data: {
        routeId: route.id,
        routeName: route.name,
        routeCode: route.code,
        totalStops: orderedStops.length,
        stops: orderedStops
      }
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllRoutes,
  getRouteById,
  createRoute,
  updateRoute,
  deleteRoute,
  getRouteStops
};
