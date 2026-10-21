import express from 'express';
import {
  getMyPracticeHistory,
  getPracticeAttempt,
  evaluatePracticeAnswer,
  submitPracticeAttempt,
} from '../controllers/practiceAttemptController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Student practice history and metrics
router.get('/my-history', authenticate, getMyPracticeHistory);

// Attempt retrieval, live instant answer evaluation, and submission
router.get('/:id', authenticate, getPracticeAttempt);
router.post('/:id/answer', authenticate, evaluatePracticeAnswer);
router.post('/:id/submit', authenticate, submitPracticeAttempt);

export default router;
