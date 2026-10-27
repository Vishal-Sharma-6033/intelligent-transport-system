const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const config = require('./config');
const logger = require('./middleware/logger');
const { errorHandler } = require('./middleware/errorHandler');
const apiRoutes = require('./routes');
const trackingService = require('./services/trackingService');

const app = express();
const server = http.createServer(app);

// Socket.io for Real-Time Live Bus Fleet Telemetry
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors({ origin: config.corsOrigin }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(logger);

// Root Health check for Level 0
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    system: 'Intelligent Public Transport Optimization System',
    timestamp: new Date().toISOString()
  });
});

// API v1 Master Router
app.use('/api/v1', apiRoutes);

// Broadcast live bus positions to connected WebSocket clients every 3 seconds
io.on('connection', (socket) => {
  console.log(`🔌 Client connected to Live GPS stream: ${socket.id}`);

  // Send immediate initial snapshot
  socket.emit('bus_update', trackingService.getAllBusLocations());

  socket.on('disconnect', () => {
    console.log(`❌ Client disconnected: ${socket.id}`);
  });
});

// Periodic broadcast
setInterval(() => {
  if (io.engine.clientsCount > 0) {
    io.emit('bus_update', trackingService.getAllBusLocations());
  }
}, 3000);

// Global Error Handler
app.use(errorHandler);

// Start Server
const PORT = config.port;
server.listen(PORT, () => {
  console.log(`
  ==============================================================
  🚍 INTELLIGENT PUBLIC TRANSPORT OPTIMIZATION SYSTEM
  🟢 BACKEND READY (MERN STACK ENGINE)
  📡 Server running on http://localhost:${PORT}
  🔗 API Base: http://localhost:${PORT}/api/v1
  📊 Health: http://localhost:${PORT}/health
  🧠 AI & Graph Algorithm Engine Initialized
  🚌 Live Fleet GPS Simulation Active
  ==============================================================
  `);
});

module.exports = { app, server };
