import express from 'express';
import {
  enterExam,
  adminLogin,
  login,
  logout,
  getMe,
} from '../controllers/authController.js';

const router = express.Router();

// Student shared password entry
router.post('/enter-exam', enterExam);

// Administrator login
router.post('/admin/login', adminLogin);
router.post('/login', login);

// Session inspection & logout
router.get('/me', getMe);
router.post('/logout', logout);

export default router;
