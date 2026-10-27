const jwt = require('jsonwebtoken');
const config = require('../config');
const db = require('../database/db');
const { AppError } = require('./errorHandler');

const protect = (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AppError('You are not logged in. Please provide a valid authentication token.', 401));
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    const user = db.collection('users').findById(decoded.id);

    if (!user) {
      return next(new AppError('The user belonging to this token no longer exists.', 401));
    }

    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar
    };

    next();
  } catch (err) {
    return next(new AppError('Invalid or expired token.', 401));
  }
};

const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new AppError('Forbidden: You do not have permission to perform this action.', 403));
    }
    next();
  };
};

module.exports = {
  protect,
  restrictTo
};
