import Attempt from '../models/Attempt.js';
import Exam from '../models/Exam.js';
import Question from '../models/Question.js';
import { NotFoundError, BadRequestError, ConflictError, ForbiddenError } from '../utils/errors.js';
import asyncHandler from '../utils/asyncHandler.js';

/**
 * Check if the current authenticated user owns this attempt
 */
const verifyAttemptOwnership = (attempt, user) => {
  if (!attempt || !user) return false;
  if (user.role === 'admin') return true;

  if (attempt.sessionId && user.sessionId && attempt.sessionId === user.sessionId) {
    return true;
  }
  if (attempt.userId && user._id && attempt.userId.toString() === user._id.toString()) {
    return true;
  }
  if (attempt.studentName && user.name && attempt.studentName.toLowerCase() === user.name.toLowerCase()) {
    return true;
  }
  return false;
};

// POST /api/exams/:examId/attempts — Start a new exam attempt
export const startAttempt = asyncHandler(async (req, res) => {
  const { examId } = req.params;
  const studentName = req.user.name || 'Candidate';
  const sessionId = req.user.sessionId || '';
  const userId = req.user._id || null;

  const exam = await Exam.findById(examId);
  if (!exam) throw new NotFoundError('Exam not found');
  if (exam.status !== 'published') throw new BadRequestError('This exam is not available.');

  // Check availability dates
  const now = new Date();
  if (exam.startDate && now < exam.startDate) {
    throw new BadRequestError('This exam has not started yet.');
  }
  if (exam.endDate && now > exam.endDate) {
    throw new BadRequestError('This exam has ended.');
  }

  // Check for existing in-progress attempt for this session
  const activeFilter = {
    examId,
    status: 'in_progress',
  };
  if (sessionId) {
    activeFilter.$or = [{ sessionId }, { studentName }];
  } else if (userId) {
    activeFilter.userId = userId;
  } else {
    activeFilter.studentName = studentName;
  }

  const existingAttempt = await Attempt.findOne(activeFilter);

  if (existingAttempt) {
    // Check if expired
    if (now > existingAttempt.expiresAt) {
      existingAttempt.status = 'expired';
      existingAttempt.submittedAt = existingAttempt.expiresAt;
      await gradeAttempt(existingAttempt, exam);
      await existingAttempt.save();
    } else {
      // Resume existing attempt — return questions without answers
      const questions = await Question.find({ examId })
        .sort({ order: 1 })
        .select('-correctOption -explanation');

      return res.json({
        success: true,
        message: 'Resuming existing attempt',
        attempt: existingAttempt,
        questions,
      });
    }
  }

  // Check max attempts
  const countFilter = {
    examId,
    status: { $in: ['submitted', 'expired'] },
  };
  if (sessionId) {
    countFilter.sessionId = sessionId;
  } else if (userId) {
    countFilter.userId = userId;
  } else {
    countFilter.studentName = studentName;
  }

  const completedAttempts = await Attempt.countDocuments(countFilter);

  if (completedAttempts >= exam.maxAttempts) {
    throw new BadRequestError(
      `You have reached the maximum number of attempts (${exam.maxAttempts}) for this exam.`
    );
  }

  // Get questions
  const rawQuestions = await Question.find({ examId });
  if (rawQuestions.length === 0) {
    throw new BadRequestError('This exam has no questions.');
  }

  // Shuffle questions for each new candidate attempt
  const shouldShuffle = exam.shuffleQuestions !== false;
  const questions = shouldShuffle
    ? (() => {
        const arr = [...rawQuestions];
        for (let i = arr.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
      })()
    : rawQuestions.sort((a, b) => (a.order || 0) - (b.order || 0));

  const questionOrder = questions.map((q) => q._id);

  // Create attempt with empty answers
  const expiresAt = new Date(now.getTime() + exam.durationMinutes * 60 * 1000);
  const answers = questions.map((q) => ({
    questionId: q._id,
    selectedOption: null,
    selectedOptions: [],
    isMarkedForReview: false,
  }));

  const attempt = await Attempt.create({
    studentName,
    sessionId,
    userId,
    examId,
    startedAt: now,
    expiresAt,
    questionOrder,
    answers,
    currentQuestionIndex: 0,
  });

  // Return questions without correct answers
  const sanitizedQuestions = questions.map((q) => {
    const obj = q.toObject();
    const isMSQ = obj.questionType === 'MSQ';
    const selectCount = isMSQ && Array.isArray(obj.correctOptions) ? obj.correctOptions.length : 1;
    delete obj.correctOption;
    delete obj.correctOptions;
    delete obj.explanation;
    obj.selectCount = selectCount;
    return obj;
  });

  res.status(201).json({
    success: true,
    message: 'Exam attempt started',
    attempt,
    questions: sanitizedQuestions,
  });
});

// GET /api/attempts/:id — Get attempt details
export const getAttempt = asyncHandler(async (req, res) => {
  const attempt = await Attempt.findById(req.params.id).populate('examId');
  if (!attempt) throw new NotFoundError('Attempt not found');

  if (!verifyAttemptOwnership(attempt, req.user)) {
    throw new ForbiddenError('You can only view your own attempts.');
  }

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

  // If attempt is in progress, return questions without answers
  if (attempt.status === 'in_progress') {
    const rawQuestions = await Question.find({ examId: attempt.examId._id });
    const orderedQuestions = sortQuestionsByAttemptOrder(rawQuestions);
    const sanitizedQuestions = orderedQuestions.map((q) => {
      const obj = q.toObject();
      const isMSQ = obj.questionType === 'MSQ';
      const selectCount = isMSQ && Array.isArray(obj.correctOptions) ? obj.correctOptions.length : 1;
      delete obj.correctOption;
      delete obj.correctOptions;
      delete obj.explanation;
      obj.selectCount = selectCount;
      return obj;
    });

    return res.json({
      success: true,
      attempt,
      questions: sanitizedQuestions,
    });
  }

  // For completed attempts, check answer key visibility
  const exam = attempt.examId;
  const canShowAnswers = canRevealAnswerKey(exam);

  let rawQuestions;
  if (canShowAnswers) {
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
    showAnswerKey: canShowAnswers,
  });
});

// PATCH /api/attempts/:id/answers — Save answers (debounced)
export const saveAnswers = asyncHandler(async (req, res) => {
  const attempt = await Attempt.findById(req.params.id);
  if (!attempt) throw new NotFoundError('Attempt not found');

  if (!verifyAttemptOwnership(attempt, req.user)) {
    throw new ForbiddenError('You can only modify your own attempts.');
  }

  if (attempt.status !== 'in_progress') {
    throw new BadRequestError('This attempt has already been submitted.');
  }

  // Check if expired
  const now = new Date();
  if (now > attempt.expiresAt) {
    attempt.status = 'expired';
    attempt.submittedAt = attempt.expiresAt;
    const exam = await Exam.findById(attempt.examId);
    await gradeAttempt(attempt, exam);
    await attempt.save();
    throw new BadRequestError('This attempt has expired.');
  }

  const { answers, currentQuestionIndex } = req.body;

  if (answers && Array.isArray(answers)) {
    for (const incoming of answers) {
      const existing = attempt.answers.find(
        (a) => a.questionId.toString() === incoming.questionId
      );
      if (existing) {
        if (incoming.selectedOption !== undefined) {
          existing.selectedOption = incoming.selectedOption;
        }
        if (incoming.selectedOptions !== undefined) {
          existing.selectedOptions = incoming.selectedOptions;
        }
        if (incoming.isMarkedForReview !== undefined) {
          existing.isMarkedForReview = incoming.isMarkedForReview;
        }
      }
    }
  }

  if (currentQuestionIndex !== undefined) {
    attempt.currentQuestionIndex = currentQuestionIndex;
  }

  await attempt.save();

  res.json({
    success: true,
    message: 'Answers saved',
  });
});

// PATCH /api/attempts/:id/review — Toggle review flag
export const toggleReview = asyncHandler(async (req, res) => {
  const attempt = await Attempt.findById(req.params.id);
  if (!attempt) throw new NotFoundError('Attempt not found');

  if (!verifyAttemptOwnership(attempt, req.user)) {
    throw new ForbiddenError('You can only modify your own attempts.');
  }

  if (attempt.status !== 'in_progress') {
    throw new BadRequestError('This attempt has already been submitted.');
  }

  const { questionId, isMarkedForReview } = req.body;

  const answer = attempt.answers.find(
    (a) => a.questionId.toString() === questionId
  );
  if (answer) {
    answer.isMarkedForReview = isMarkedForReview;
  }

  await attempt.save();

  res.json({ success: true, message: 'Review flag updated' });
});

// POST /api/attempts/:id/submit — Submit exam
export const submitAttempt = asyncHandler(async (req, res) => {
  const attempt = await Attempt.findById(req.params.id);
  if (!attempt) throw new NotFoundError('Attempt not found');

  if (!verifyAttemptOwnership(attempt, req.user)) {
    throw new ForbiddenError('You can only submit your own attempts.');
  }

  if (attempt.status !== 'in_progress') {
    throw new ConflictError('This attempt has already been submitted.');
  }

  if (req.body.answers && Array.isArray(req.body.answers)) {
    for (const incoming of req.body.answers) {
      const existing = attempt.answers.find(
        (a) => a.questionId.toString() === incoming.questionId
      );
      if (existing) {
        if (incoming.selectedOption !== undefined) {
          existing.selectedOption = incoming.selectedOption;
        }
      }
    }
  }

  const now = new Date();
  attempt.submittedAt = now > attempt.expiresAt ? attempt.expiresAt : now;
  attempt.status = 'submitted';

  const exam = await Exam.findById(attempt.examId);
  await gradeAttempt(attempt, exam);
  await attempt.save();

  res.json({
    success: true,
    message: 'Exam submitted successfully',
    attempt,
  });
});

/**
 * Grade an attempt — server-side scoring
 */
async function gradeAttempt(attempt, exam) {
  const questions = await Question.find({ examId: attempt.examId }).sort({ order: 1 });

  let score = 0;
  let correctCount = 0;
  let incorrectCount = 0;
  let unansweredCount = 0;
  let maximumMarks = 0;

  for (const question of questions) {
    const questionMarks = question.marks || exam.marksPerQuestion;
    const questionNegMarks =
      question.negativeMarks !== null && question.negativeMarks !== undefined
        ? question.negativeMarks
        : exam.negativeMarks;
    maximumMarks += questionMarks;

    const answer = attempt.answers.find(
      (a) => a.questionId.toString() === question._id.toString()
    );

    const isMSQ = question.questionType === 'MSQ';
    let chosen = [];
    if (Array.isArray(answer?.selectedOptions) && answer.selectedOptions.length > 0) {
      chosen = answer.selectedOptions;
    } else if (Array.isArray(answer?.selectedOption)) {
      chosen = answer.selectedOption;
    } else if (answer?.selectedOption !== null && answer?.selectedOption !== undefined) {
      chosen = [answer.selectedOption];
    }

    if (!answer || chosen.length === 0) {
      unansweredCount++;
    } else {
      let isCorrect = false;
      if (isMSQ) {
        const sortedChosen = [...chosen].map(Number).sort((a, b) => a - b);
        const sortedCorrect = [...(question.correctOptions || [question.correctOption])].map(Number).sort((a, b) => a - b);
        isCorrect = sortedChosen.length === sortedCorrect.length &&
          sortedChosen.every((val, idx) => val === sortedCorrect[idx]);
      } else {
        isCorrect = Number(chosen[0]) === question.correctOption;
      }

      if (isCorrect) {
        score += questionMarks;
        correctCount++;
      } else {
        score -= questionNegMarks;
        incorrectCount++;
      }
    }
  }

  score = Math.max(0, score);
  const percentage = maximumMarks > 0 ? Math.round((score / maxMarks(maximumMarks)) * 100 * 100) / 100 : 0;
  const passed = percentage >= exam.passingPercentage;
  const timeTakenSeconds = Math.round(
    (attempt.submittedAt.getTime() - attempt.startedAt.getTime()) / 1000
  );

  attempt.score = score;
  attempt.maximumMarks = maximumMarks;
  attempt.percentage = percentage;
  attempt.correctCount = correctCount;
  attempt.incorrectCount = incorrectCount;
  attempt.unansweredCount = unansweredCount;
  attempt.timeTakenSeconds = timeTakenSeconds;
  attempt.passed = passed;
}

function maxMarks(m) {
  return m;
}

function canRevealAnswerKey(exam) {
  if (!exam.showAnswerKey) return false;
  if (exam.answerKeyReleaseDate) {
    return new Date() >= exam.answerKeyReleaseDate;
  }
  return true;
}
