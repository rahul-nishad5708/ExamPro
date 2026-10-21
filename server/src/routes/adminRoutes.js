import express from 'express';
import {
  getAdminResults,
  getAdminDashboard,
} from '../controllers/resultController.js';
import { getStudents, updateStudentStatus } from '../controllers/adminController.js';
import {
  getAdminPracticeAttempts,
  getAdminStudentActivity,
} from '../controllers/adminActivityController.js';
import { authenticate, adminOnly } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate, adminOnly);

router.get('/dashboard', getAdminDashboard);
router.get('/results', getAdminResults);
router.get('/students', getStudents);
router.patch('/students/:id/status', updateStudentStatus);

// Practice test attempts & unified student activity analytics
router.get('/practice-attempts', getAdminPracticeAttempts);
router.get('/student-activity', getAdminStudentActivity);

export default router;
