import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Try loading server/.env, then fallback to current working directory .env
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

const config = {
  port: parseInt(process.env.PORT, 10) || 5000,
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/exampro',
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-in-production',
  examAccessPassword: process.env.EXAM_ACCESS_PASSWORD || 'exam2024',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  nodeEnv: process.env.NODE_ENV || 'development',
  jwt: {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    cookieName: 'exampro_token',
    cookieOptions: {
      httpOnly: true,
      secure: process.env.COOKIE_SECURE === 'false' ? false : (process.env.NODE_ENV === 'production' || process.env.COOKIE_SECURE === 'true'),
      sameSite: process.env.COOKIE_SAMESITE || (process.env.NODE_ENV === 'production' ? 'none' : 'lax'),
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    },
  },
  admin: {
    email: process.env.ADMIN_EMAIL || 'admin@exampro.com',
    password: process.env.ADMIN_PASSWORD || 'Admin@123456',
    name: process.env.ADMIN_NAME || 'ExamPro Admin',
  },
};

// Production sanity warnings
if (config.nodeEnv === 'production') {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'dev-secret-change-in-production') {
    console.warn('⚠️ [SECURITY WARNING] Default or missing JWT_SECRET in production. Set a unique JWT_SECRET.');
  }
  if (!process.env.CLIENT_URL || process.env.CLIENT_URL === 'http://localhost:5173') {
    console.warn('⚠️ [CORS WARNING] CLIENT_URL is set to localhost in production. Set your production frontend URL.');
  }
}

export default config;
