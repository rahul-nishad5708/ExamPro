import jwt from 'jsonwebtoken';
import config from '../config/index.js';
import User from '../models/User.js';
import { UnauthorizedError, ForbiddenError } from '../utils/errors.js';
import asyncHandler from '../utils/asyncHandler.js';

/**
 * Authentication middleware — verifies JWT from httpOnly cookie.
 * Supports both Student Exam Sessions and Admin User Accounts.
 */
export const authenticate = asyncHandler(async (req, res, next) => {
  let token = req.cookies[config.jwt.cookieName];
  if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    throw new UnauthorizedError('Authentication required. Please enter exam access password.');
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret);

    // Student Exam Session (no DB user record required)
    if (decoded.role === 'student') {
      if (!decoded.studentName || !decoded.sessionId) {
        throw new UnauthorizedError('Invalid student exam session. Please re-enter.');
      }
      req.user = {
        role: 'student',
        name: decoded.studentName,
        sessionId: decoded.sessionId,
      };
      return next();
    }

    // Admin Account Session (backed by User in MongoDB)
    if (decoded.role === 'admin' || decoded.userId) {
      const user = await User.findById(decoded.userId).select('-password');
      if (!user) {
        throw new UnauthorizedError('Account not found. Please log in again.');
      }
      if (!user.isActive) {
        throw new ForbiddenError('Your account has been deactivated.');
      }
      req.user = user;
      return next();
    }

    throw new UnauthorizedError('Invalid session token.');
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      throw new UnauthorizedError('Session expired. Please enter exam password again.');
    }
    throw error;
  }
});

/**
 * Admin-only middleware
 */
export const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  throw new ForbiddenError('Admin access required.');
};

/**
 * Generate Student Session Token and set HTTP-only cookie
 */
export const generateStudentSessionAndSetCookie = (res, studentName, sessionId) => {
  const token = jwt.sign(
    { role: 'student', studentName, sessionId },
    config.jwtSecret,
    { expiresIn: '24h' }
  );

  res.cookie(config.jwt.cookieName, token, config.jwt.cookieOptions);
  return token;
};

/**
 * Generate Admin JWT Token and set HTTP-only cookie
 */
export const generateAdminTokenAndSetCookie = (res, userId) => {
  const token = jwt.sign(
    { role: 'admin', userId },
    config.jwtSecret,
    { expiresIn: config.jwt.expiresIn }
  );

  res.cookie(config.jwt.cookieName, token, config.jwt.cookieOptions);
  return token;
};

// Backwards-compatible export
export const generateTokenAndSetCookie = generateAdminTokenAndSetCookie;
