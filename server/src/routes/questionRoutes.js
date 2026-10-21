import express from 'express';
import { updateQuestion, deleteQuestion, duplicateQuestion } from '../controllers/questionController.js';
import { authenticate, adminOnly } from '../middleware/auth.js';

const router = express.Router();

router.put('/:id', authenticate, adminOnly, updateQuestion);
router.delete('/:id', authenticate, adminOnly, deleteQuestion);
router.post('/:id/duplicate', authenticate, adminOnly, duplicateQuestion);

export default router;
