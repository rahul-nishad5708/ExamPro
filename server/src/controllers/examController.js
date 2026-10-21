import Exam from '../models/Exam.js';
import Question from '../models/Question.js';
import Attempt from '../models/Attempt.js';
import { NotFoundError, BadRequestError, ForbiddenError } from '../utils/errors.js';
import asyncHandler from '../utils/asyncHandler.js';

// GET /api/exams — List exams (students see published only, admin sees all)
export const getExams = asyncHandler(async (req, res) => {
  const { page = 1, limit = 12, category, difficulty, search, status } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const filter = {};

  // Students only see published exams
  if (req.user.role !== 'admin') {
    filter.status = 'published';
  } else if (status) {
    filter.status = status;
  }

  if (category) filter.category = category;
  if (difficulty) filter.difficulty = difficulty;
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { category: { $regex: search, $options: 'i' } },
    ];
  }

  const [exams, total] = await Promise.all([
    Exam.find(filter)
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    Exam.countDocuments(filter),
  ]);

  res.json({
    success: true,
    exams,
    pagination: {
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      limit: parseInt(limit),
    },
  });
});

// GET /api/exams/:id
export const getExam = asyncHandler(async (req, res) => {
  const exam = await Exam.findById(req.params.id).populate('createdBy', 'name');
  if (!exam) throw new NotFoundError('Exam not found');

  // Students can only see published exams
  if (req.user.role !== 'admin' && exam.status !== 'published') {
    throw new NotFoundError('Exam not found');
  }

  // Get attempt count for this student
  let attemptCount = 0;
  if (req.user.role === 'student') {
    const countFilter = {
      examId: exam._id,
      status: { $in: ['submitted', 'expired'] },
    };
    if (req.user.sessionId) {
      countFilter.$or = [{ sessionId: req.user.sessionId }, { studentName: req.user.name }];
    } else if (req.user._id) {
      countFilter.userId = req.user._id;
    } else {
      countFilter.studentName = req.user.name;
    }
    attemptCount = await Attempt.countDocuments(countFilter);
  }

  res.json({
    success: true,
    exam,
    attemptCount,
  });
});

// POST /api/exams — Create exam (admin only)
export const createExam = asyncHandler(async (req, res) => {
  const examData = { ...req.body, createdBy: req.user._id };

  // Parse dates if provided
  if (examData.startDate) examData.startDate = new Date(examData.startDate);
  if (examData.endDate) examData.endDate = new Date(examData.endDate);
  if (examData.answerKeyReleaseDate) {
    examData.answerKeyReleaseDate = new Date(examData.answerKeyReleaseDate);
  }

  const exam = await Exam.create(examData);

  res.status(201).json({
    success: true,
    message: 'Exam created successfully',
    exam,
  });
});

// PUT /api/exams/:id — Update exam (admin only)
export const updateExam = asyncHandler(async (req, res) => {
  const exam = await Exam.findById(req.params.id);
  if (!exam) throw new NotFoundError('Exam not found');

  // Parse dates if provided
  if (req.body.startDate) req.body.startDate = new Date(req.body.startDate);
  if (req.body.endDate) req.body.endDate = new Date(req.body.endDate);
  if (req.body.answerKeyReleaseDate) {
    req.body.answerKeyReleaseDate = new Date(req.body.answerKeyReleaseDate);
  }

  Object.assign(exam, req.body);
  await exam.save();

  res.json({
    success: true,
    message: 'Exam updated successfully',
    exam,
  });
});

// DELETE /api/exams/:id — Delete exam (admin only)
export const deleteExam = asyncHandler(async (req, res) => {
  const exam = await Exam.findById(req.params.id);
  if (!exam) throw new NotFoundError('Exam not found');

  // Delete associated questions and attempts
  await Promise.all([
    Question.deleteMany({ examId: exam._id }),
    Attempt.deleteMany({ examId: exam._id }),
    exam.deleteOne(),
  ]);

  res.json({
    success: true,
    message: 'Exam and associated data deleted successfully',
  });
});

// PATCH /api/exams/:id/publish — Toggle publish status
export const togglePublish = asyncHandler(async (req, res) => {
  const exam = await Exam.findById(req.params.id);
  if (!exam) throw new NotFoundError('Exam not found');

  if (exam.status === 'draft') {
    // Check that exam has questions before publishing
    const questionCount = await Question.countDocuments({ examId: exam._id });
    if (questionCount === 0) {
      throw new BadRequestError('Cannot publish an exam with no questions.');
    }
    exam.status = 'published';
    exam.totalQuestions = questionCount;
  } else {
    exam.status = 'draft';
  }

  await exam.save();

  res.json({
    success: true,
    message: `Exam ${exam.status === 'published' ? 'published' : 'unpublished'} successfully`,
    exam,
  });
});

// GET /api/exams/categories — Get distinct categories
export const getCategories = asyncHandler(async (req, res) => {
  const categories = await Exam.distinct('category', { status: 'published' });
  res.json({ success: true, categories });
});
