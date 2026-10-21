import express from 'express';
import { getStudentDashboard } from '../controllers/resultController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/student', authenticate, getStudentDashboard);

export default router;
