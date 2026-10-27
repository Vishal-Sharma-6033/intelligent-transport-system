const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config');
const db = require('../database/db');
const { AppError } = require('../middleware/errorHandler');

const signToken = (user) => {
  return jwt.sign(
    { id: user.id, role: user.role, email: user.email },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn }
  );
};

const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return next(new AppError('Please provide name, email, and password.', 400));
    }

    const existingUser = db.collection('users').findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return next(new AppError('An account with this email already exists.', 409));
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const assignedRole = role === 'admin' ? 'admin' : 'passenger';

    const newUser = db.collection('users').create({
      id: `USR-${Date.now()}`,
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: assignedRole,
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}`,
      createdAt: new Date().toISOString()
    });

    const token = signToken(newUser);

    const safeUser = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      avatar: newUser.avatar
    };

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: safeUser,
        token
      }
    });
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new AppError('Please provide email and password.', 400));
    }

    const user = db.collection('users').findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return next(new AppError('Invalid email or password.', 401));
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return next(new AppError('Invalid email or password.', 401));
    }

    const token = signToken(user);

    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar
    };

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: safeUser,
        token
      }
    });
  } catch (err) {
    next(err);
  }
};

const getMe = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      data: {
        user: req.user
      }
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  register,
  login,
  getMe
};
