import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import config from './config/index.js';
import errorHandler from './middleware/errorHandler.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import examRoutes from './routes/examRoutes.js';
import questionRoutes from './routes/questionRoutes.js';
import attemptRoutes from './routes/attemptRoutes.js';
import resultRoutes from './routes/resultRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import practiceTestRoutes from './routes/practiceTestRoutes.js';
import practiceAttemptRoutes from './routes/practiceAttemptRoutes.js';
import practiceResultRoutes from './routes/practiceResultRoutes.js';

const app = express();

// Trust reverse proxy (essential for Render / Vercel / Heroku HTTPS detection and secure cookies)
app.set('trust proxy', 1);

// Security headers
app.use(helmet());

// CORS configuration supporting single or comma-delimited origins without wildcard credentials
const allowedOrigins = (config.clientUrl || 'http://localhost:5173')
  .split(',')
  .map((url) => url.trim().replace(/\/+$/, ''))
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, server-to-server, scripts)
      if (!origin) return callback(null, true);

      const normalizedOrigin = origin.replace(/\/+$/, '');
      if (allowedOrigins.includes(normalizedOrigin)) {
        return callback(null, true);
      }

      // In non-production environments, also permit localhost origins automatically
      if (config.nodeEnv !== 'production' && /^https?:\/\/localhost(:\d+)?$/.test(origin)) {
        return callback(null, true);
      }

      return callback(new Error(`Origin ${origin} not allowed by CORS`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // limit each IP to 200 requests per windowMs
  message: { success: false, message: 'Too many requests, please try again later.' },
});
app.use('/api/', limiter);

// Auth rate limiting (stricter)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: 'Too many auth attempts, please try again later.' },
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Logging
if (config.nodeEnv === 'development') {
  app.use(morgan('dev'));
}

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/attempts', attemptRoutes);
app.use('/api/results', resultRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/practice-tests', practiceTestRoutes);
app.use('/api/practice-attempts', practiceAttemptRoutes);
app.use('/api/practice-results', practiceResultRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'ExamPro API is running', timestamp: new Date().toISOString() });
});

// 404 handler
app.use('/api/*', (req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// Global error handler
app.use(errorHandler);

export default app;
