import Question from '../models/Question.js';
import Exam from '../models/Exam.js';
import { NotFoundError, BadRequestError } from '../utils/errors.js';
import asyncHandler from '../utils/asyncHandler.js';

// GET /api/exams/:examId/questions
export const getQuestions = asyncHandler(async (req, res) => {
  const { examId } = req.params;
  const exam = await Exam.findById(examId);
  if (!exam) throw new NotFoundError('Exam not found');

  const questions = await Question.find({ examId }).sort({ order: 1 });

  // If student is viewing, strip correct answers (unless reviewing a submitted attempt)
  if (req.user.role !== 'admin') {
    const sanitized = questions.map((q) => {
      const obj = q.toObject();
      delete obj.correctOption;
      delete obj.explanation;
      return obj;
    });
    return res.json({ success: true, questions: sanitized });
  }

  res.json({ success: true, questions });
});

// POST /api/exams/:examId/questions
export const createQuestion = asyncHandler(async (req, res) => {
  const { examId } = req.params;
  const exam = await Exam.findById(examId);
  if (!exam) throw new NotFoundError('Exam not found');

  // Validate correct option is within range
  if (req.body.correctOption >= req.body.options.length) {
    throw new BadRequestError('Correct option index is out of range.');
  }

  // Get next order
  const lastQuestion = await Question.findOne({ examId }).sort({ order: -1 });
  const order = lastQuestion ? lastQuestion.order + 1 : 0;

  const question = await Question.create({
    ...req.body,
    examId,
    order,
  });

  // Update exam question count
  const count = await Question.countDocuments({ examId });
  await Exam.findByIdAndUpdate(examId, { totalQuestions: count });

  res.status(201).json({
    success: true,
    message: 'Question added successfully',
    question,
  });
});

// PUT /api/questions/:id
export const updateQuestion = asyncHandler(async (req, res) => {
  const question = await Question.findById(req.params.id);
  if (!question) throw new NotFoundError('Question not found');

  if (req.body.correctOption !== undefined && req.body.options) {
    if (req.body.correctOption >= req.body.options.length) {
      throw new BadRequestError('Correct option index is out of range.');
    }
  }

  Object.assign(question, req.body);
  await question.save();

  res.json({
    success: true,
    message: 'Question updated successfully',
    question,
  });
});

// DELETE /api/questions/:id
export const deleteQuestion = asyncHandler(async (req, res) => {
  const question = await Question.findById(req.params.id);
  if (!question) throw new NotFoundError('Question not found');

  const examId = question.examId;
  await question.deleteOne();

  // Update exam question count
  const count = await Question.countDocuments({ examId });
  await Exam.findByIdAndUpdate(examId, { totalQuestions: count });

  res.json({
    success: true,
    message: 'Question deleted successfully',
  });
});

// POST /api/exams/:examId/questions/reorder
export const reorderQuestions = asyncHandler(async (req, res) => {
  const { questionIds } = req.body;

  const updates = questionIds.map((id, index) =>
    Question.findByIdAndUpdate(id, { order: index })
  );
  await Promise.all(updates);

  res.json({
    success: true,
    message: 'Questions reordered successfully',
  });
});

// POST /api/questions/:id/duplicate
export const duplicateQuestion = asyncHandler(async (req, res) => {
  const original = await Question.findById(req.params.id);
  if (!original) throw new NotFoundError('Question not found');

  const lastQuestion = await Question.findOne({ examId: original.examId }).sort({ order: -1 });
  const order = lastQuestion ? lastQuestion.order + 1 : 0;

  const duplicate = await Question.create({
    ...original.toObject(),
    _id: undefined,
    order,
    createdAt: undefined,
    updatedAt: undefined,
  });

  // Update exam question count
  const count = await Question.countDocuments({ examId: original.examId });
  await Exam.findByIdAndUpdate(original.examId, { totalQuestions: count });

  res.status(201).json({
    success: true,
    message: 'Question duplicated successfully',
    question: duplicate,
  });
});
