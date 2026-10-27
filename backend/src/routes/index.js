const express = require('express');
const router = express.Router();

const { protect, restrictTo } = require('../middleware/auth');

// Controllers
const healthController = require('../controllers/healthController');
const authController = require('../controllers/authController');
const stopController = require('../controllers/stopController');
const routeController = require('../controllers/routeController');
const graphController = require('../controllers/graphController');
const optimizationController = require('../controllers/optimizationController');
const analyticsController = require('../controllers/analyticsController');
const schedulingController = require('../controllers/schedulingController');
const aiController = require('../controllers/aiController');
const multiObjectiveController = require('../controllers/multiObjectiveController');
const trackingController = require('../controllers/trackingController');
const dashboardController = require('../controllers/dashboardController');

// ==================== LEVEL 0 & 1: HEALTH & METRICS ====================
router.get('/health', healthController.getBasicHealth);
router.get('/health/detailed', healthController.getDetailedHealth);
router.get('/metrics', healthController.getMetrics);

// ==================== LEVEL 11: AUTHENTICATION ====================
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);
router.get('/auth/me', protect, authController.getMe);

// ==================== LEVEL 2 & 3: STOPS MANAGEMENT ====================
router.get('/stops', stopController.getAllStops);
router.get('/stops/:id', stopController.getStopById);
router.post('/stops', stopController.createStop);
router.patch('/stops/:id', stopController.updateStop);
router.delete('/stops/:id', stopController.deleteStop);

// ==================== LEVEL 2 & 3: ROUTES MANAGEMENT ====================
router.get('/routes', routeController.getAllRoutes);
router.get('/routes/:id', routeController.getRouteById);
router.post('/routes', routeController.createRoute);
router.patch('/routes/:id', routeController.updateRoute);
router.delete('/routes/:id', routeController.deleteRoute);
router.get('/routes/:id/stops', routeController.getRouteStops);

// ==================== LEVEL 4: GRAPH ENGINE ====================
router.get('/network/graph', graphController.getNetworkGraph);
router.get('/network/connectivity', graphController.getConnectivity);

// ==================== LEVEL 5: SHORTEST PATH & OPTIMIZATION ====================
router.post('/optimize/route', optimizationController.optimizeRoute);
router.post('/optimize/alternatives', optimizationController.getRouteAlternatives);

// ==================== LEVEL 6: PASSENGER DEMAND ANALYTICS ====================
router.get('/analytics/demand', analyticsController.getDemandAnalytics);
router.get('/analytics/peak-hours', analyticsController.getPeakHoursAnalytics);
router.get('/analytics/stops', analyticsController.getStopsDemand);
router.get('/analytics/waiting-time', analyticsController.getWaitingTimeAnalytics);

// ==================== LEVEL 7: BUS SCHEDULING & FREQUENCY ====================
router.get('/schedules', schedulingController.getSchedules);
router.post('/schedules', schedulingController.createSchedule);
router.delete('/schedules/:id', schedulingController.deleteSchedule);
router.post('/optimize/schedule', schedulingController.optimizeSchedule);

// ==================== LEVEL 8: AI/ML DEMAND PREDICTION ====================
router.post('/ai/predict-demand', aiController.predictDemand);
router.get('/ai/model-metrics', aiController.getModelMetrics);

// ==================== LEVEL 9: MULTI-OBJECTIVE OPTIMIZATION ====================
router.post('/optimize/network', multiObjectiveController.optimizeNetwork);
router.get('/optimize/report', multiObjectiveController.getOptimizationReport);

// ==================== LEVEL 10: LIVE TRACKING ====================
router.get('/buses/locations', trackingController.getAllBusLocations);
router.get('/buses/:id/location', trackingController.getBusLocation);
router.post('/buses/:id/location', trackingController.updateBusLocation);
router.get('/stops/:id/arrivals', trackingController.getStopArrivals);

// ==================== LEVEL 12: ADMIN DASHBOARD ====================
router.get('/dashboard/summary', dashboardController.getSummary);
router.get('/dashboard/routes', dashboardController.getDashboardRoutes);
router.get('/dashboard/performance', dashboardController.getDashboardPerformance);

module.exports = router;
