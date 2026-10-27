require('dotenv').config();

module.exports = {
  port: process.env.PORT || 5001,
  env: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'super_secret_transport_jwt_key_2026_xyz987',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  corsOrigin: process.env.CORS_ORIGIN || '*',
  mongoUri: process.env.MONGODB_URI || null,
  speedKmh: 35, // Average commercial bus speed in km/h
  dwellTimeMinutes: 1.5, // Average dwell time per stop
  defaultWeights: {
    travelTime: 0.35,
    waitingTime: 0.25,
    transfers: 0.20,
    cost: 0.20
  }
};
