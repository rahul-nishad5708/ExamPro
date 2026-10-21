import express from 'express';
import {
  getPracticeTests,
  getPracticeSubjects,
  getPracticeTest,
  createPracticeTest,
  updatePracticeTest,
  deletePracticeTest,
} from '../controllers/practiceTestController.js';
import { startPracticeAttempt } from '../controllers/practiceAttemptController.js';
import { authenticate, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// Public subjects & categories for student filtering
router.get('/subjects', authenticate, getPracticeSubjects);

// Practice test catalog & details
router.get('/', authenticate, getPracticeTests);
router.get('/:id', authenticate, getPracticeTest);

// Student start attempt
router.post('/:id/attempts', authenticate, startPracticeAttempt);

// Administrator CRUD
router.post('/', authenticate, adminOnly, createPracticeTest);
router.put('/:id', authenticate, adminOnly, updatePracticeTest);
router.delete('/:id', authenticate, adminOnly, deletePracticeTest);

export default router;
