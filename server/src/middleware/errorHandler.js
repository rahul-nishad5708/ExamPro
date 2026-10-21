import { AppError } from '../utils/errors.js';
import config from '../config/index.js';

const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // CORS error
  if (err.message && err.message.includes('not allowed by CORS')) {
    statusCode = 403;
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    const messages = Object.values(err.errors).map((e) => e.message);
    message = messages.join('. ');
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyPattern)[0];
    message = `A record with this ${field} already exists.`;
  }

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token.';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired.';
  }

  // Only log unexpected internal errors (500+) in development
  if (config.nodeEnv === 'development' && statusCode >= 500) {
    console.error('Unexpected Server Error:', err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(config.nodeEnv === 'development' && { stack: err.stack }),
  });
};

export default errorHandler;
