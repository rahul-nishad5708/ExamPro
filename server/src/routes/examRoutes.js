import express from 'express';
import {
  getExams,
  getExam,
  createExam,
  updateExam,
  deleteExam,
  togglePublish,
  getCategories,
} from '../controllers/examController.js';
import {
  getQuestions,
  createQuestion,
  reorderQuestions,
} from '../controllers/questionController.js';
import { startAttempt } from '../controllers/attemptController.js';
import { authenticate, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// Public categories
router.get('/categories', authenticate, getCategories);

// Exam CRUD
router.get('/', authenticate, getExams);
router.get('/:id', authenticate, getExam);
router.post('/', authenticate, adminOnly, createExam);
router.put('/:id', authenticate, adminOnly, updateExam);
router.delete('/:id', authenticate, adminOnly, deleteExam);
router.patch('/:id/publish', authenticate, adminOnly, togglePublish);

// Questions for an exam
router.get('/:examId/questions', authenticate, getQuestions);
router.post('/:examId/questions', authenticate, adminOnly, createQuestion);
router.post('/:examId/questions/reorder', authenticate, adminOnly, reorderQuestions);

// Start attempt
router.post('/:examId/attempts', authenticate, startAttempt);

export default router;
