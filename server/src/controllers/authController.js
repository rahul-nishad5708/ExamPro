import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import {
  generateStudentSessionAndSetCookie,
  generateAdminTokenAndSetCookie,
} from '../middleware/auth.js';
import { BadRequestError, UnauthorizedError } from '../utils/errors.js';
import asyncHandler from '../utils/asyncHandler.js';
import config from '../config/index.js';

/**
 * POST /api/auth/enter-exam
 * Student entry with shared exam access password and student name.
 * Creates an authorized short-lived student session (no user account required).
 */
export const enterExam = asyncHandler(async (req, res) => {
  const { accessPassword, studentName } = req.body;

  if (!studentName || typeof studentName !== 'string' || studentName.trim().length < 2) {
    throw new BadRequestError('Please provide your full name (at least 2 characters).');
  }

  if (!accessPassword || typeof accessPassword !== 'string') {
    throw new BadRequestError('Exam access password is required.');
  }

  if (accessPassword !== config.examAccessPassword) {
    throw new UnauthorizedError('Incorrect exam access password. Please verify with your examiner.');
  }

  const cleanName = studentName.trim();
  const sessionId = crypto.randomUUID();

  generateStudentSessionAndSetCookie(res, cleanName, sessionId);

  res.json({
    success: true,
    message: `Access granted. Welcome, ${cleanName}!`,
    session: {
      role: 'student',
      name: cleanName,
      sessionId,
    },
  });
});

/**
 * POST /api/auth/admin/login
 * Dedicated Administrator Login with Email & Password.
 */
export const adminLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new BadRequestError('Email and password are required.');
  }

  const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');
  if (!user) {
    throw new UnauthorizedError('Invalid credentials.');
  }

  if (user.role !== 'admin') {
    throw new UnauthorizedError('Access restricted to administrators.');
  }

  if (!user.isActive) {
    throw new UnauthorizedError('Account is inactive.');
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new UnauthorizedError('Invalid credentials.');
  }

  generateAdminTokenAndSetCookie(res, user._id);

  res.json({
    success: true,
    message: 'Administrator login successful',
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: 'admin',
    },
  });
});

/**
 * POST /api/auth/login
 * Backwards-compatible login endpoint (redirects to admin logic).
 */
export const login = adminLogin;

/**
 * POST /api/auth/logout
 * Clears current session cookie.
 */
export const logout = asyncHandler(async (req, res) => {
  res.cookie(config.jwt.cookieName, '', {
    ...config.jwt.cookieOptions,
    maxAge: 0,
  });

  res.json({ success: true, message: 'Session closed successfully' });
});

/**
 * GET /api/auth/me
 * Safe session inspection. Returns user info if authenticated, or user: null
 * without throwing an error to avoid unnecessary client crash logs on page load.
 */
export const getMe = asyncHandler(async (req, res) => {
  let token = req.cookies[config.jwt.cookieName];
  if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.json({
      success: false,
      user: null,
    });
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret);

    if (decoded.role === 'student') {
      return res.json({
        success: true,
        user: {
          role: 'student',
          name: decoded.studentName,
          sessionId: decoded.sessionId,
        },
      });
    }

    if (decoded.role === 'admin' || decoded.userId) {
      const user = await User.findById(decoded.userId).select('-password');
      if (!user || !user.isActive) {
        return res.json({ success: false, user: null });
      }
      return res.json({
        success: true,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    }

    return res.json({ success: false, user: null });
  } catch {
    return res.json({ success: false, user: null });
  }
});
