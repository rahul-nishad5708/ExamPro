import express from 'express';
import { getPracticeResult } from '../controllers/practiceAttemptController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/:id', authenticate, getPracticeResult);

export default router;
