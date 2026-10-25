import Attempt from '../models/Attempt.js';
import Exam from '../models/Exam.js';
import Question from '../models/Question.js';
import User from '../models/User.js';
import { NotFoundError, ForbiddenError } from '../utils/errors.js';
import asyncHandler from '../utils/asyncHandler.js';

// GET /api/results/my — Get current student's results
export const getMyResults = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const filter = {
    status: { $in: ['submitted', 'expired'] },
  };

  if (req.user.sessionId) {
    filter.$or = [
      { sessionId: req.user.sessionId },
      { studentName: req.user.name },
    ];
  } else if (req.user._id) {
    filter.userId = req.user._id;
  } else {
    filter.studentName = req.user.name;
  }

  const [results, total] = await Promise.all([
    Attempt.find(filter)
      .populate('examId', 'title category difficulty durationMinutes totalQuestions passingPercentage showAnswerKey answerKeyReleaseDate')
      .sort({ submittedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    Attempt.countDocuments(filter),
  ]);

  res.json({
    success: true,
    results,
    pagination: {
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
    },
  });
});

// GET /api/results/:id — Get specific result with answer review
export const getResult = asyncHandler(async (req, res) => {
  const attempt = await Attempt.findById(req.params.id)
    .populate('examId')
    .populate('userId', 'name email');

  if (!attempt) throw new NotFoundError('Result not found');

  // Verify ownership
  const isOwner =
    req.user.role === 'admin' ||
    (attempt.sessionId && req.user.sessionId && attempt.sessionId === req.user.sessionId) ||
    (attempt.userId && req.user._id && attempt.userId._id?.toString() === req.user._id.toString()) ||
    (attempt.studentName && req.user.name && attempt.studentName.toLowerCase() === req.user.name.toLowerCase());

  if (!isOwner) {
    throw new ForbiddenError('You can only view your own results.');
  }

  if (attempt.status === 'in_progress') {
    throw new ForbiddenError('This exam has not been submitted yet.');
  }

  const exam = attempt.examId;
  const canShowAnswers =
    exam.showAnswerKey &&
    (!exam.answerKeyReleaseDate || new Date() >= exam.answerKeyReleaseDate);

  const orderMap = new Map();
  if (attempt.questionOrder && attempt.questionOrder.length > 0) {
    attempt.questionOrder.forEach((id, idx) => orderMap.set(id.toString(), idx));
  } else if (attempt.answers && attempt.answers.length > 0) {
    attempt.answers.forEach((a, idx) => orderMap.set(a.questionId.toString(), idx));
  }

  const sortQuestionsByAttemptOrder = (qList) => {
    if (orderMap.size === 0) return qList;
    return [...qList].sort((a, b) => {
      const idxA = orderMap.has(a._id.toString()) ? orderMap.get(a._id.toString()) : a.order || 0;
      const idxB = orderMap.has(b._id.toString()) ? orderMap.get(b._id.toString()) : b.order || 0;
      return idxA - idxB;
    });
  };

  let rawQuestions;
  if (canShowAnswers || req.user.role === 'admin') {
    rawQuestions = await Question.find({ examId: exam._id });
  } else {
    rawQuestions = await Question.find({ examId: exam._id })
      .select('-correctOption -explanation');
  }
  const questions = sortQuestionsByAttemptOrder(rawQuestions);

  res.json({
    success: true,
    attempt,
    questions,
    showAnswerKey: canShowAnswers || req.user.role === 'admin',
  });
});

// GET /api/admin/results — Admin: all results
export const getAdminResults = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, examId } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const filter = { status: { $in: ['submitted', 'expired'] } };
  if (examId) filter.examId = examId;

  const [results, total] = await Promise.all([
    Attempt.find(filter)
      .populate('userId', 'name email')
      .populate('examId', 'title category')
      .sort({ submittedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    Attempt.countDocuments(filter),
  ]);

  res.json({
    success: true,
    results,
    pagination: {
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
    },
  });
});

// GET /api/admin/dashboard — Admin dashboard stats
export const getAdminDashboard = asyncHandler(async (req, res) => {
  const [
    totalExams,
    publishedExams,
    totalStudents,
    totalAttempts,
    recentAttempts,
    avgScoreResult,
    categoryStats,
  ] = await Promise.all([
    Exam.countDocuments(),
    Exam.countDocuments({ status: 'published' }),
    Attempt.distinct('studentName').then((names) => names.length),
    Attempt.countDocuments({ status: { $in: ['submitted', 'expired'] } }),
    Attempt.find({ status: { $in: ['submitted', 'expired'] } })
      .populate('userId', 'name email')
      .populate('examId', 'title category')
      .sort({ submittedAt: -1 })
      .limit(10),
    Attempt.aggregate([
      { $match: { status: { $in: ['submitted', 'expired'] }, percentage: { $ne: null } } },
      { $group: { _id: null, avgScore: { $avg: '$percentage' } } },
    ]),
    Attempt.aggregate([
      { $match: { status: { $in: ['submitted', 'expired'] } } },
      {
        $lookup: {
          from: 'exams',
          localField: 'examId',
          foreignField: '_id',
          as: 'exam',
        },
      },
      { $unwind: '$exam' },
      {
        $group: {
          _id: '$exam.category',
          attempts: { $sum: 1 },
          avgScore: { $avg: '$percentage' },
          passCount: {
            $sum: { $cond: [{ $eq: ['$passed', true] }, 1, 0] },
          },
        },
      },
      { $sort: { attempts: -1 } },
      { $limit: 10 },
    ]),
  ]);

  res.json({
    success: true,
    stats: {
      totalExams,
      publishedExams,
      draftExams: totalExams - publishedExams,
      totalStudents,
      totalAttempts,
      averageScore: avgScoreResult[0]?.avgScore
        ? Math.round(avgScoreResult[0].avgScore * 100) / 100
        : 0,
    },
    recentAttempts,
    categoryStats,
  });
});

// GET /api/dashboard/student — Student dashboard stats
export const getStudentDashboard = asyncHandler(async (req, res) => {
  const filter = {
    status: { $in: ['submitted', 'expired'] },
  };

  if (req.user.sessionId) {
    filter.$or = [
      { sessionId: req.user.sessionId },
      { studentName: req.user.name },
    ];
  } else {
    filter.studentName = req.user.name;
  }

  const [
    availableExams,
    totalAttempted,
    myAttempts,
    recentResults,
  ] = await Promise.all([
    Exam.find({ status: 'published' }).sort({ createdAt: -1 }).limit(6),
    Attempt.countDocuments(filter),
    Attempt.find({
      ...filter,
      percentage: { $ne: null },
    }).select('percentage passed score maximumMarks examId submittedAt'),
    Attempt.find(filter)
      .populate('examId', 'title category difficulty')
      .sort({ submittedAt: -1 })
      .limit(5),
  ]);

  const avgScore =
    myAttempts.length > 0
      ? Math.round(
          (myAttempts.reduce((sum, a) => sum + (a.percentage || 0), 0) / myAttempts.length) * 100
        ) / 100
      : 0;

  const highestScore =
    myAttempts.length > 0
      ? Math.max(...myAttempts.map((a) => a.percentage || 0))
      : 0;

  const passRate =
    myAttempts.length > 0
      ? Math.round((myAttempts.filter((a) => a.passed).length / myAttempts.length) * 100)
      : 0;

  // Check for active attempt
  const activeAttempt = await Attempt.findOne({
    examId: { $exists: true },
    status: 'in_progress',
    expiresAt: { $gt: new Date() },
    $or: [{ sessionId: req.user.sessionId || 'none' }, { studentName: req.user.name }],
  }).populate('examId', 'title');

  res.json({
    success: true,
    stats: {
      totalAttempted,
      averageScore: avgScore,
      highestScore,
      passRate,
      totalAvailableExams: availableExams.length,
    },
    availableExams,
    recentResults,
    activeAttempt,
  });
});
