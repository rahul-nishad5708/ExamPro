import PracticeTest from '../models/PracticeTest.js';
import { NotFoundError, BadRequestError } from '../utils/errors.js';
import asyncHandler from '../utils/asyncHandler.js';

/**
 * Sanitizes questions for students so correctOption and explanation are NEVER sent to the browser
 * before answering.
 */
export const sanitizePracticeQuestions = (questions) => {
  return questions.map((q) => {
    const obj = q.toObject ? q.toObject() : { ...q };
    delete obj.correctOption;
    delete obj.explanation;
    return obj;
  });
};

// GET /api/practice-tests — List practice tests
export const getPracticeTests = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, subject, difficulty, search } = req.query;
  const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);

  const filter = {};
  if (req.user?.role !== 'admin') {
    filter.status = 'published';
  }

  if (subject && subject !== 'All') {
    filter.subject = new RegExp(`^${subject}$`, 'i');
  }

  if (difficulty && difficulty !== 'All') {
    filter.difficulty = difficulty;
  }

  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { subject: { $regex: search, $options: 'i' } },
      { topics: { $regex: search, $options: 'i' } },
    ];
  }

  const [tests, total] = await Promise.all([
    PracticeTest.find(filter)
      .select(req.user?.role === 'admin' ? '' : '-questions.correctOption -questions.explanation')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit, 10)),
    PracticeTest.countDocuments(filter),
  ]);

  res.json({
    success: true,
    tests,
    pagination: {
      total,
      page: parseInt(page, 10),
      pages: Math.ceil(total / parseInt(limit, 10)) || 1,
    },
  });
});

// GET /api/practice-tests/subjects — Distinct subjects and topics
export const getPracticeSubjects = asyncHandler(async (req, res) => {
  const [subjects, topics] = await Promise.all([
    PracticeTest.distinct('subject', { status: 'published' }),
    PracticeTest.distinct('topics', { status: 'published' }),
  ]);

  res.json({
    success: true,
    subjects: subjects.filter(Boolean).sort(),
    topics: topics.filter(Boolean).sort(),
  });
});

// GET /api/practice-tests/:id — Practice test instructions and details
export const getPracticeTest = asyncHandler(async (req, res) => {
  const test = await PracticeTest.findById(req.params.id);
  if (!test) throw new NotFoundError('Practice test not found');

  if (req.user?.role !== 'admin' && test.status !== 'published') {
    throw new BadRequestError('This practice test is currently unavailable.');
  }

  const result = test.toObject();
  if (req.user?.role !== 'admin') {
    result.questions = sanitizePracticeQuestions(result.questions);
  }

  res.json({
    success: true,
    practiceTest: result,
  });
});

// POST /api/practice-tests — Admin: Create new practice test
export const createPracticeTest = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    subject,
    difficulty = 'Medium',
    topics = [],
    allowChangeAnswer = false,
    marksPerQuestion = 1,
    negativeMarks = 0,
    timeLimitMinutes = 0,
    status = 'published',
    questions = [],
  } = req.body;

  if (!title || !subject) {
    throw new BadRequestError('Title and Subject are required.');
  }

  if (!Array.isArray(questions) || questions.length === 0) {
    throw new BadRequestError('A practice test must include at least 1 question.');
  }

  // Validate each question
  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    if (!q.questionText || !q.options || q.options.length < 2) {
      throw new BadRequestError(`Question ${i + 1} must have question text and at least 2 options.`);
    }
    if (q.correctOption === undefined || q.correctOption === null || q.correctOption < 0 || q.correctOption >= q.options.length) {
      throw new BadRequestError(`Question ${i + 1} has an invalid correct option index.`);
    }
  }

  const practiceTest = await PracticeTest.create({
    title,
    description,
    subject,
    difficulty,
    topics,
    allowChangeAnswer: !!allowChangeAnswer,
    marksPerQuestion: Number(marksPerQuestion) || 1,
    negativeMarks: Number(negativeMarks) || 0,
    timeLimitMinutes: Number(timeLimitMinutes) || 0,
    status,
    questions,
    totalQuestions: questions.length,
    createdBy: req.user?._id || null,
  });

  res.status(201).json({
    success: true,
    message: 'Practice test created successfully',
    practiceTest,
  });
});

// PUT /api/practice-tests/:id — Admin: Update practice test
export const updatePracticeTest = asyncHandler(async (req, res) => {
  const practiceTest = await PracticeTest.findById(req.params.id);
  if (!practiceTest) throw new NotFoundError('Practice test not found');

  const {
    title,
    description,
    subject,
    difficulty,
    topics,
    allowChangeAnswer,
    marksPerQuestion,
    negativeMarks,
    timeLimitMinutes,
    status,
    questions,
  } = req.body;

  if (title !== undefined) practiceTest.title = title;
  if (description !== undefined) practiceTest.description = description;
  if (subject !== undefined) practiceTest.subject = subject;
  if (difficulty !== undefined) practiceTest.difficulty = difficulty;
  if (topics !== undefined) practiceTest.topics = topics;
  if (allowChangeAnswer !== undefined) practiceTest.allowChangeAnswer = allowChangeAnswer;
  if (marksPerQuestion !== undefined) practiceTest.marksPerQuestion = marksPerQuestion;
  if (negativeMarks !== undefined) practiceTest.negativeMarks = negativeMarks;
  if (timeLimitMinutes !== undefined) practiceTest.timeLimitMinutes = timeLimitMinutes;
  if (status !== undefined) practiceTest.status = status;

  if (questions && Array.isArray(questions)) {
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.questionText || !q.options || q.options.length < 2) {
        throw new BadRequestError(`Question ${i + 1} must have question text and at least 2 options.`);
      }
      if (q.correctOption === undefined || q.correctOption < 0 || q.correctOption >= q.options.length) {
        throw new BadRequestError(`Question ${i + 1} has an invalid correct option index.`);
      }
    }
    practiceTest.questions = questions;
    practiceTest.totalQuestions = questions.length;
  }

  await practiceTest.save();

  res.json({
    success: true,
    message: 'Practice test updated successfully',
    practiceTest,
  });
});

// DELETE /api/practice-tests/:id — Admin: Delete practice test
export const deletePracticeTest = asyncHandler(async (req, res) => {
  const practiceTest = await PracticeTest.findById(req.params.id);
  if (!practiceTest) throw new NotFoundError('Practice test not found');

  await PracticeTest.findByIdAndDelete(req.params.id);

  res.json({
    success: true,
    message: 'Practice test deleted successfully',
  });
});
