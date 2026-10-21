import Attempt from '../models/Attempt.js';
import PracticeAttempt from '../models/PracticeAttempt.js';
import Exam from '../models/Exam.js';
import PracticeTest from '../models/PracticeTest.js';
import asyncHandler from '../utils/asyncHandler.js';

// GET /api/admin/practice-attempts — Admin view of practice attempts
export const getAdminPracticeAttempts = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 20,
    search,
    practiceTestId,
    subject,
    status,
    startDate,
    endDate,
  } = req.query;

  const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
  const filter = {};

  if (search) {
    filter.studentName = { $regex: search.trim(), $options: 'i' };
  }

  if (practiceTestId) {
    filter.practiceTestId = practiceTestId;
  }

  if (subject && subject !== 'All') {
    filter.subject = new RegExp(`^${subject}$`, 'i');
  }

  if (status && status !== 'All') {
    filter.status = status;
  }

  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = new Date(startDate);
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      filter.createdAt.$lte = end;
    }
  }

  const [attempts, total] = await Promise.all([
    PracticeAttempt.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit, 10)),
    PracticeAttempt.countDocuments(filter),
  ]);

  res.json({
    success: true,
    attempts,
    pagination: {
      total,
      page: parseInt(page, 10),
      pages: Math.ceil(total / parseInt(limit, 10)) || 1,
    },
  });
});

/**
 * GET /api/admin/student-activity
 * Unified Student Activity Dashboard endpoint.
 * Combines both attempts (exams) and practiceattempts (practice tests) in a unified format.
 * Distinguishes unique student sessions from total attempts.
 * Returns comprehensive statistics via MongoDB aggregation.
 */
export const getAdminStudentActivity = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 15,
    search = '',
    type = 'all', // 'all' | 'exam' | 'practice'
    status = 'all', // 'all' | 'in_progress' | 'completed' | 'expired'
    startDate,
    endDate,
  } = req.query;

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.max(1, parseInt(limit, 10) || 15);
  const skip = (pageNum - 1) * limitNum;

  // 1. Compute global dashboard statistics via MongoDB Aggregation
  const [examAggStats, practiceAggStats] = await Promise.all([
    Attempt.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $in: ['$status', ['submitted', 'expired']] }, 1, 0] },
          },
          inProgress: {
            $sum: { $cond: [{ $eq: ['$status', 'in_progress'] }, 1, 0] },
          },
          avgPercentage: {
            $avg: {
              $cond: [
                { $and: [{ $in: ['$status', ['submitted', 'expired']] }, { $ne: ['$percentage', null] }] },
                '$percentage',
                null,
              ],
            },
          },
          totalQuestionsAnswered: {
            $sum: {
              $cond: [
                { $isArray: '$answers' },
                {
                  $size: {
                    $filter: {
                      input: '$answers',
                      as: 'a',
                      cond: { $ne: ['$$a.selectedOption', null] },
                    },
                  },
                },
                0,
              ],
            },
          },
          sessions: { $addToSet: '$sessionId' },
          names: { $addToSet: '$studentName' },
        },
      },
    ]),
    PracticeAttempt.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] },
          },
          inProgress: {
            $sum: { $cond: [{ $eq: ['$status', 'in_progress'] }, 1, 0] },
          },
          avgAccuracy: {
            $avg: {
              $cond: [
                { $and: [{ $eq: ['$status', 'completed'] }, { $ne: ['$accuracyPercentage', null] }] },
                '$accuracyPercentage',
                null,
              ],
            },
          },
          totalQuestionsAttempted: { $sum: { $ifNull: ['$attemptedQuestions', 0] } },
          sessions: { $addToSet: '$studentSessionId' },
          names: { $addToSet: '$studentName' },
        },
      },
    ]),
  ]);

  const eStats = examAggStats[0] || {
    total: 0,
    completed: 0,
    inProgress: 0,
    avgPercentage: 0,
    totalQuestionsAnswered: 0,
    sessions: [],
    names: [],
  };

  const pStats = practiceAggStats[0] || {
    total: 0,
    completed: 0,
    inProgress: 0,
    avgAccuracy: 0,
    totalQuestionsAttempted: 0,
    sessions: [],
    names: [],
  };

  const allDistinctSessions = new Set([
    ...eStats.sessions.filter(Boolean),
    ...pStats.sessions.filter(Boolean),
  ]);

  const allDistinctNames = new Set([
    ...eStats.names.filter(Boolean),
    ...pStats.names.filter(Boolean),
  ]);

  const stats = {
    totalAttempts: eStats.total + pStats.total,
    uniqueStudentSessions: allDistinctSessions.size,
    uniqueStudentNames: allDistinctNames.size,
    totalExamAttempts: eStats.total,
    totalPracticeAttempts: pStats.total,
    completedAttempts: eStats.completed + pStats.completed,
    inProgressAttempts: eStats.inProgress + pStats.inProgress,
    avgExamPercentage: Math.round((eStats.avgPercentage || 0) * 100) / 100,
    avgPracticeAccuracy: Math.round((pStats.avgAccuracy || 0) * 100) / 100,
    totalQuestionsAnswered: (eStats.totalQuestionsAnswered || 0) + (pStats.totalQuestionsAttempted || 0),
  };

  // 2. Build filters for attempts querying
  const examFilter = {};
  const practiceFilter = {};

  if (search.trim()) {
    const searchRegex = { $regex: search.trim(), $options: 'i' };
    examFilter.studentName = searchRegex;
    practiceFilter.studentName = searchRegex;
  }

  if (status && status !== 'all') {
    if (status === 'in_progress') {
      examFilter.status = 'in_progress';
      practiceFilter.status = 'in_progress';
    } else if (status === 'completed') {
      examFilter.status = { $in: ['submitted', 'expired'] };
      practiceFilter.status = 'completed';
    } else if (status === 'expired') {
      examFilter.status = 'expired';
      // Practice tests don't have expired, so return none for practice if status === 'expired'
      practiceFilter.status = '__none__';
    }
  }

  if (startDate || endDate) {
    const dateQuery = {};
    if (startDate) dateQuery.$gte = new Date(startDate);
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      dateQuery.$lte = end;
    }
    examFilter.startedAt = dateQuery;
    practiceFilter.startedAt = dateQuery;
  }

  // 3. Query appropriate collections based on type filter
  let normalizedAttempts = [];

  const shouldFetchExams = type === 'all' || type === 'exam';
  const shouldFetchPractice = type === 'all' || type === 'practice';

  const [examDocs, practiceDocs] = await Promise.all([
    shouldFetchExams
      ? Attempt.find(examFilter)
          .populate('examId', 'title category totalQuestions marksPerQuestion')
          .lean()
      : Promise.resolve([]),
    shouldFetchPractice
      ? PracticeAttempt.find(practiceFilter).lean()
      : Promise.resolve([]),
  ]);

  // Transform exam attempts to unified row representation
  if (shouldFetchExams && examDocs.length > 0) {
    for (const a of examDocs) {
      const totalQ = a.examId?.totalQuestions || a.answers?.length || 0;
      const answeredList = Array.isArray(a.answers)
        ? a.answers.filter((ans) => ans.selectedOption !== null && ans.selectedOption !== undefined)
        : [];
      const attemptedCount = a.status === 'in_progress'
        ? answeredList.length
        : ((a.correctCount || 0) + (a.incorrectCount || 0));
      const skippedCount = a.status === 'in_progress'
        ? Math.max(0, totalQ - attemptedCount)
        : (a.unansweredCount ?? Math.max(0, totalQ - attemptedCount));

      normalizedAttempts.push({
        _id: a._id.toString(),
        type: 'Exam',
        studentName: a.studentName || 'Candidate',
        sessionId: a.sessionId || 'N/A',
        testId: a.examId?._id ? a.examId._id.toString() : null,
        testTitle: a.examId?.title || 'Exam',
        subject: a.examId?.category || 'General',
        startedAt: a.startedAt || a.createdAt,
        submittedAt: a.submittedAt || null,
        status: a.status, // 'in_progress' | 'submitted' | 'expired'
        isCompleted: ['submitted', 'expired'].includes(a.status),
        totalQuestions: totalQ,
        attemptedQuestions: attemptedCount,
        correctAnswers: a.correctCount !== undefined && a.correctCount !== null ? a.correctCount : null,
        wrongAnswers: a.incorrectCount !== undefined && a.incorrectCount !== null ? a.incorrectCount : null,
        skippedQuestions: skippedCount,
        score: a.score !== undefined && a.score !== null ? a.score : null,
        maximumMarks: a.maximumMarks !== undefined && a.maximumMarks !== null ? a.maximumMarks : null,
        percentage: a.percentage !== undefined && a.percentage !== null ? a.percentage : null,
        timeTakenSeconds: a.timeTakenSeconds !== undefined && a.timeTakenSeconds !== null ? a.timeTakenSeconds : null,
        passed: a.passed !== undefined && a.passed !== null ? a.passed : null,
      });
    }
  }

  // Transform practice attempts to unified row representation
  if (shouldFetchPractice && practiceDocs.length > 0) {
    for (const p of practiceDocs) {
      normalizedAttempts.push({
        _id: p._id.toString(),
        type: 'Practice Test',
        studentName: p.studentName || 'Candidate',
        sessionId: p.studentSessionId || 'N/A',
        testId: p.practiceTestId ? p.practiceTestId.toString() : null,
        testTitle: p.practiceTestTitle || 'Practice Test',
        subject: p.subject || 'Practice',
        startedAt: p.startedAt || p.createdAt,
        submittedAt: p.submittedAt || null,
        status: p.status, // 'in_progress' | 'completed'
        isCompleted: p.status === 'completed',
        totalQuestions: p.totalQuestions || 0,
        attemptedQuestions: p.attemptedQuestions !== undefined ? p.attemptedQuestions : (p.answers?.length || 0),
        correctAnswers: p.correctAnswers !== undefined ? p.correctAnswers : null,
        wrongAnswers: p.incorrectAnswers !== undefined ? p.incorrectAnswers : null,
        skippedQuestions: p.skippedQuestions !== undefined ? p.skippedQuestions : 0,
        score: p.totalScore !== undefined ? p.totalScore : null,
        maximumMarks: p.maximumMarks !== undefined ? p.maximumMarks : null,
        percentage: p.accuracyPercentage !== undefined ? p.accuracyPercentage : null,
        timeTakenSeconds: p.timeTakenSeconds !== undefined ? p.timeTakenSeconds : null,
        passed: null, // Practice tests do not have formal pass/fail
      });
    }
  }

  // Sort unified attempts by startedAt descending (most recent first)
  normalizedAttempts.sort((a, b) => {
    const timeA = a.startedAt ? new Date(a.startedAt).getTime() : 0;
    const timeB = b.startedAt ? new Date(b.startedAt).getTime() : 0;
    return timeB - timeA;
  });

  const totalFilteredAttempts = normalizedAttempts.length;
  const paginatedAttempts = normalizedAttempts.slice(skip, skip + limitNum);

  // Compute filtered sessions count
  const filteredSessions = new Set(normalizedAttempts.map((a) => a.sessionId).filter((s) => s && s !== 'N/A'));

  res.json({
    success: true,
    stats,
    attempts: paginatedAttempts,
    pagination: {
      total: totalFilteredAttempts,
      page: pageNum,
      limit: limitNum,
      pages: Math.ceil(totalFilteredAttempts / limitNum) || 1,
      filteredSessionsCount: filteredSessions.size,
    },
  });
});
