import express from 'express';
import {
  getMyResults,
  getResult,
  getAdminResults,
  getAdminDashboard,
  getStudentDashboard,
} from '../controllers/resultController.js';
import { getStudents, updateStudentStatus } from '../controllers/adminController.js';
import { authenticate, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// Student results
router.get('/my', authenticate, getMyResults);
router.get('/:id', authenticate, getResult);

export default router;
