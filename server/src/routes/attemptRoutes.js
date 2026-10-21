import express from 'express';
import {
  getAttempt,
  saveAnswers,
  toggleReview,
  submitAttempt,
} from '../controllers/attemptController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/:id', authenticate, getAttempt);
router.patch('/:id/answers', authenticate, saveAnswers);
router.patch('/:id/review', authenticate, toggleReview);
router.post('/:id/submit', authenticate, submitAttempt);

export default router;
