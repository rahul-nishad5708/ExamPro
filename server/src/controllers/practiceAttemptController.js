import PracticeAttempt from '../models/PracticeAttempt.js';
import PracticeTest from '../models/PracticeTest.js';
import { NotFoundError, BadRequestError, ForbiddenError } from '../utils/errors.js';
import asyncHandler from '../utils/asyncHandler.js';

/**
 * Verify ownership of a practice attempt
 */
const verifyPracticeAttemptOwnership = (attempt, user) => {
  if (!attempt || !user) return false;
  if (user.role === 'admin') return true;

  if (attempt.studentSessionId && user.sessionId && attempt.studentSessionId === user.sessionId) {
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

/**
 * Merges practice questions with student's answered feedback.
 * CRITICAL SECURITY: Questions not yet answered NEVER contain correctOption or explanation!
 */
const buildStudentQuestionsView = (questions, answers) => {
  const answeredMap = new Map();
  for (const a of answers) {
    answeredMap.set(a.questionId.toString(), a);
  }

  return questions.map((q) => {
    const raw = q.toObject ? q.toObject() : { ...q };
    const answered = answeredMap.get(raw._id.toString());
    const isMSQ = raw.questionType === 'MSQ';
    const selectCount = isMSQ && Array.isArray(raw.correctOptions) ? raw.correctOptions.length : 1;

    if (answered) {
      // For answered questions, reveal stored feedback and selections
      const resolvedSelectedOptions = answered.selectedOptions ||
        (Array.isArray(answered.selectedOption)
          ? answered.selectedOption
          : (answered.selectedOption !== null && answered.selectedOption !== undefined ? [answered.selectedOption] : []));

      const resolvedCorrectOptions = answered.correctOptions || raw.correctOptions ||
        (raw.correctOption !== undefined ? [raw.correctOption] : []);

      return {
        _id: raw._id,
        questionText: raw.questionText,
        imageUrl: raw.imageUrl,
        options: raw.options,
        questionType: raw.questionType || 'MCQ',
        selectCount,
        topic: raw.topic,
        difficulty: raw.difficulty,
        marks: raw.marks,
        order: raw.order,
        hasAnswered: true,
        selectedOption: answered.selectedOption,
        selectedOptions: resolvedSelectedOptions,
        isCorrect: answered.isCorrect,
        correctOption: answered.correctOption !== undefined ? answered.correctOption : raw.correctOption,
        correctOptions: resolvedCorrectOptions,
        explanation: answered.explanation || raw.explanation || '',
      };
    }

    // For unanswered questions, strip correctOption/correctOptions and explanation!
    return {
      _id: raw._id,
      questionText: raw.questionText,
      imageUrl: raw.imageUrl,
      options: raw.options,
      questionType: raw.questionType || 'MCQ',
      selectCount,
      topic: raw.topic,
      difficulty: raw.difficulty,
      marks: raw.marks,
      order: raw.order,
      hasAnswered: false,
      selectedOption: null,
      selectedOptions: [],
      isCorrect: null,
    };
  });
};

/**
 * Fisher-Yates shuffle helper
 */
const shuffleArray = (items) => {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

/**
 * Re-order questions based on attempt's saved questionOrder
 */
const getOrderedPracticeQuestions = (practiceTestQuestions, questionOrder) => {
  if (!questionOrder || questionOrder.length === 0) {
    return practiceTestQuestions;
  }
  const orderMap = new Map();
  questionOrder.forEach((id, idx) => orderMap.set(id.toString(), idx));
  return [...practiceTestQuestions].sort((a, b) => {
    const idxA = orderMap.has(a._id.toString()) ? orderMap.get(a._id.toString()) : 9999;
    const idxB = orderMap.has(b._id.toString()) ? orderMap.get(b._id.toString()) : 9999;
    return idxA - idxB;
  });
};

// POST /api/practice-tests/:id/attempts — Start or resume practice attempt
export const startPracticeAttempt = asyncHandler(async (req, res) => {
  const { id: practiceTestId } = req.params;
  const { retry = false } = req.query;
  const studentName = (req.user?.name || 'Candidate').trim();
  const studentSessionId = req.user?.sessionId || '';
  const userId = req.user?._id || null;

  if (!studentSessionId && !userId) {
    throw new ForbiddenError('Valid student session is required to practice.');
  }

  const practiceTest = await PracticeTest.findById(practiceTestId);
  if (!practiceTest) throw new NotFoundError('Practice test not found');
  if (req.user?.role !== 'admin' && practiceTest.status !== 'published') {
    throw new BadRequestError('This practice test is currently unavailable.');
  }

  if (!practiceTest.questions || practiceTest.questions.length === 0) {
    throw new BadRequestError('This practice test has no questions yet.');
  }

  // Calculate maximum marks
  const maximumMarks = practiceTest.questions.reduce(
    (sum, q) => sum + (q.marks || practiceTest.marksPerQuestion || 1),
    0
  );

  // If not retrying, check for an existing in_progress attempt to resume
  if (!retry) {
    const existing = await PracticeAttempt.findOne({
      practiceTestId,
      studentSessionId,
      status: 'in_progress',
    });

    if (existing) {
      const orderedQuestions = getOrderedPracticeQuestions(practiceTest.questions, existing.questionOrder);
      const questionsView = buildStudentQuestionsView(orderedQuestions, existing.answers);
      return res.json({
        success: true,
        message: 'Resuming existing practice session',
        attempt: existing,
        questions: questionsView,
        allowChangeAnswer: practiceTest.allowChangeAnswer,
      });
    }
  }

  // Fresh attempt: shuffle questions so every new user sees questions in a unique random order!
  const shouldShuffle = practiceTest.shuffleQuestions !== false;
  const questionsToUse = shouldShuffle ? shuffleArray(practiceTest.questions) : [...practiceTest.questions];
  const questionOrder = questionsToUse.map((q) => q._id);

  // Start a fresh practice attempt (new record)
  const now = new Date();
  const attempt = await PracticeAttempt.create({
    studentName,
    studentSessionId,
    userId,
    practiceTestId: practiceTest._id,
    practiceTestTitle: practiceTest.title,
    subject: practiceTest.subject,
    startedAt: now,
    status: 'in_progress',
    questionOrder,
    answers: [],
    totalQuestions: practiceTest.questions.length,
    attemptedQuestions: 0,
    correctAnswers: 0,
    incorrectAnswers: 0,
    skippedQuestions: practiceTest.questions.length,
    totalScore: 0,
    maximumMarks,
    accuracyPercentage: 0,
    timeTakenSeconds: 0,
    currentQuestionIndex: 0,
  });

  const sanitizedQuestions = buildStudentQuestionsView(questionsToUse, []);

  res.status(201).json({
    success: true,
    message: 'Practice attempt started',
    attempt,
    questions: sanitizedQuestions,
    allowChangeAnswer: practiceTest.allowChangeAnswer,
  });
});

// GET /api/practice-attempts/:id — Get attempt details and questions
export const getPracticeAttempt = asyncHandler(async (req, res) => {
  const attempt = await PracticeAttempt.findById(req.params.id);
  if (!attempt) throw new NotFoundError('Practice attempt not found');

  if (!verifyPracticeAttemptOwnership(attempt, req.user)) {
    throw new ForbiddenError('You can only access your own practice attempts.');
  }

  const practiceTest = await PracticeTest.findById(attempt.practiceTestId);
  if (!practiceTest) throw new NotFoundError('Associated practice test not found');

  const orderedQuestions = getOrderedPracticeQuestions(practiceTest.questions, attempt.questionOrder);

  // If completed, provide full question review
  if (attempt.status === 'completed') {
    const fullQuestions = orderedQuestions.map((q) => {
      const raw = q.toObject ? q.toObject() : { ...q };
      const ans = attempt.answers.find((a) => a.questionId.toString() === raw._id.toString());
      const isMSQ = raw.questionType === 'MSQ';
      const selectCount = isMSQ && Array.isArray(raw.correctOptions) ? raw.correctOptions.length : 1;
      const resolvedSelectedOptions = ans
        ? (ans.selectedOptions || (Array.isArray(ans.selectedOption) ? ans.selectedOption : (ans.selectedOption !== null && ans.selectedOption !== undefined ? [ans.selectedOption] : [])))
        : [];
      const resolvedCorrectOptions = ans?.correctOptions || raw.correctOptions || (raw.correctOption !== undefined ? [raw.correctOption] : []);

      return {
        ...raw,
        questionType: raw.questionType || 'MCQ',
        selectCount,
        hasAnswered: !!ans,
        selectedOption: ans ? ans.selectedOption : null,
        selectedOptions: resolvedSelectedOptions,
        correctOption: ans?.correctOption !== undefined ? ans.correctOption : raw.correctOption,
        correctOptions: resolvedCorrectOptions,
        isCorrect: ans ? ans.isCorrect : false,
      };
    });

    return res.json({
      success: true,
      attempt,
      questions: fullQuestions,
      allowChangeAnswer: practiceTest.allowChangeAnswer,
    });
  }

  // If in_progress, strip answers for questions that have not been answered yet!
  const questionsView = buildStudentQuestionsView(orderedQuestions, attempt.answers);

  res.json({
    success: true,
    attempt,
    questions: questionsView,
    allowChangeAnswer: practiceTest.allowChangeAnswer,
  });
});

// POST /api/practice-attempts/:id/answer — Evaluate selected answer with instant feedback
export const evaluatePracticeAnswer = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { questionId, selectedOption, selectedOptions, currentQuestionIndex } = req.body;

  if (questionId === undefined || (selectedOption === undefined && selectedOptions === undefined)) {
    throw new BadRequestError('Question ID and selected option(s) are required.');
  }

  const attempt = await PracticeAttempt.findById(id);
  if (!attempt) throw new NotFoundError('Practice attempt not found');

  if (!verifyPracticeAttemptOwnership(attempt, req.user)) {
    throw new ForbiddenError('You can only answer questions in your own attempt.');
  }

  if (attempt.status !== 'in_progress') {
    throw new BadRequestError('This practice attempt is already completed.');
  }

  const practiceTest = await PracticeTest.findById(attempt.practiceTestId);
  if (!practiceTest) throw new NotFoundError('Associated practice test not found');

  const question = practiceTest.questions.id(questionId);
  if (!question) {
    throw new NotFoundError('Question not found in this practice test.');
  }

  // Normalize selected options
  let chosenIndices = [];
  if (Array.isArray(selectedOptions)) {
    chosenIndices = selectedOptions.map(Number);
  } else if (Array.isArray(selectedOption)) {
    chosenIndices = selectedOption.map(Number);
  } else if (selectedOption !== null && selectedOption !== undefined) {
    chosenIndices = [Number(selectedOption)];
  }

  chosenIndices = Array.from(new Set(chosenIndices)).sort((a, b) => a - b);

  if (chosenIndices.length === 0) {
    throw new BadRequestError('At least one option must be selected.');
  }

  for (const idx of chosenIndices) {
    if (idx < 0 || idx >= question.options.length) {
      throw new BadRequestError('Selected option index is out of range.');
    }
  }

  const isMSQ = question.questionType === 'MSQ';
  const targetCorrectOptions = (isMSQ && Array.isArray(question.correctOptions) && question.correctOptions.length > 0)
    ? [...question.correctOptions].sort((a, b) => a - b)
    : (question.correctOption !== undefined ? [question.correctOption] : []);

  // Strict check: all correct options must be selected and none of the wrong options
  let isCorrect = false;
  if (isMSQ) {
    isCorrect = chosenIndices.length === targetCorrectOptions.length &&
      chosenIndices.every((val, i) => val === targetCorrectOptions[i]);
  } else {
    isCorrect = chosenIndices.length === 1 && chosenIndices[0] === question.correctOption;
  }

  const questionMarks = question.marks || practiceTest.marksPerQuestion || 1;
  const questionNegMarks = practiceTest.negativeMarks || 0;
  const scoreAwarded = isCorrect ? questionMarks : -questionNegMarks;
  const primarySelected = chosenIndices.length === 1 ? chosenIndices[0] : chosenIndices;

  // Check if this question was already answered
  const existingAnswerIndex = attempt.answers.findIndex(
    (a) => a.questionId.toString() === questionId.toString()
  );

  if (existingAnswerIndex !== -1) {
    const existingAnswer = attempt.answers[existingAnswerIndex];

    // If answer changes are disallowed, lock first selection and return existing feedback
    if (!practiceTest.allowChangeAnswer) {
      return res.json({
        success: true,
        message: 'First selection is locked for this practice test.',
        isCorrect: existingAnswer.isCorrect,
        correctOption: question.correctOption,
        correctOptions: targetCorrectOptions,
        explanation: question.explanation || '',
        selectedOption: existingAnswer.selectedOption,
        selectedOptions: existingAnswer.selectedOptions || (Array.isArray(existingAnswer.selectedOption) ? existingAnswer.selectedOption : [existingAnswer.selectedOption]),
        locked: true,
        stats: {
          attemptedQuestions: attempt.attemptedQuestions,
          correctAnswers: attempt.correctAnswers,
          incorrectAnswers: attempt.incorrectAnswers,
          skippedQuestions: attempt.skippedQuestions,
          totalScore: attempt.totalScore,
          accuracyPercentage: attempt.accuracyPercentage,
          totalQuestions: attempt.totalQuestions,
        },
      });
    }

    // Changing answer is permitted by admin configuration
    existingAnswer.selectedOption = primarySelected;
    existingAnswer.selectedOptions = chosenIndices;
    existingAnswer.isCorrect = isCorrect;
    existingAnswer.scoreAwarded = scoreAwarded;
    existingAnswer.correctOption = question.correctOption;
    existingAnswer.correctOptions = targetCorrectOptions;
    existingAnswer.explanation = question.explanation || '';
    existingAnswer.answeredAt = new Date();
  } else {
    // First-time answering this question
    attempt.answers.push({
      questionId: question._id,
      selectedOption: primarySelected,
      selectedOptions: chosenIndices,
      isCorrect,
      scoreAwarded,
      correctOption: question.correctOption,
      correctOptions: targetCorrectOptions,
      explanation: question.explanation || '',
      answeredAt: new Date(),
    });
  }

  // Recalculate metrics accurately
  const totalAttempted = attempt.answers.length;
  const correctCount = attempt.answers.filter((a) => a.isCorrect).length;
  const incorrectCount = attempt.answers.filter((a) => !a.isCorrect).length;
  const skippedCount = Math.max(0, attempt.totalQuestions - totalAttempted);
  const accuracy = totalAttempted > 0 ? Math.round((correctCount / totalAttempted) * 100 * 100) / 100 : 0;
  const rawScore = attempt.answers.reduce((sum, a) => sum + (a.scoreAwarded || 0), 0);
  const totalScore = Math.max(0, Math.round(rawScore * 100) / 100);

  attempt.attemptedQuestions = totalAttempted;
  attempt.correctAnswers = correctCount;
  attempt.incorrectAnswers = incorrectCount;
  attempt.skippedQuestions = skippedCount;
  attempt.accuracyPercentage = accuracy;
  attempt.totalScore = totalScore;

  if (currentQuestionIndex !== undefined) {
    attempt.currentQuestionIndex = currentQuestionIndex;
  }

  await attempt.save();

  res.json({
    success: true,
    message: isCorrect ? 'Correct Answer!' : 'Wrong Answer!',
    isCorrect,
    correctOption: question.correctOption,
    correctOptions: targetCorrectOptions,
    explanation: question.explanation || '',
    selectedOption: primarySelected,
    selectedOptions: chosenIndices,
    stats: {
      attemptedQuestions: attempt.attemptedQuestions,
      correctAnswers: attempt.correctAnswers,
      incorrectAnswers: attempt.incorrectAnswers,
      skippedQuestions: attempt.skippedQuestions,
      totalScore: attempt.totalScore,
      maximumMarks: attempt.maximumMarks,
      accuracyPercentage: attempt.accuracyPercentage,
      totalQuestions: attempt.totalQuestions,
    },
  });
});

// POST /api/practice-attempts/:id/submit — Complete practice test
export const submitPracticeAttempt = asyncHandler(async (req, res) => {
  const attempt = await PracticeAttempt.findById(req.params.id);
  if (!attempt) throw new NotFoundError('Practice attempt not found');

  if (!verifyPracticeAttemptOwnership(attempt, req.user)) {
    throw new ForbiddenError('You can only submit your own practice attempts.');
  }

  const practiceTest = await PracticeTest.findById(attempt.practiceTestId);
  if (!practiceTest) throw new NotFoundError('Associated practice test not found');

  const now = new Date();
  attempt.submittedAt = now;
  attempt.status = 'completed';
  attempt.timeTakenSeconds = Math.max(
    1,
    Math.round((now.getTime() - new Date(attempt.startedAt).getTime()) / 1000)
  );

  // Recalculate metrics on backend (Never trust client scores!)
  const totalAttempted = attempt.answers.length;
  const correctCount = attempt.answers.filter((a) => a.isCorrect).length;
  const incorrectCount = attempt.answers.filter((a) => !a.isCorrect).length;
  const skippedCount = Math.max(0, attempt.totalQuestions - totalAttempted);
  const accuracy = totalAttempted > 0 ? Math.round((correctCount / totalAttempted) * 100 * 100) / 100 : 0;
  const rawScore = attempt.answers.reduce((sum, a) => sum + (a.scoreAwarded || 0), 0);

  attempt.attemptedQuestions = totalAttempted;
  attempt.correctAnswers = correctCount;
  attempt.incorrectAnswers = incorrectCount;
  attempt.skippedQuestions = skippedCount;
  attempt.accuracyPercentage = accuracy;
  attempt.totalScore = Math.max(0, Math.round(rawScore * 100) / 100);

  // Ensure maximumMarks is populated
  if (!attempt.maximumMarks || attempt.maximumMarks === 0) {
    attempt.maximumMarks = practiceTest.questions.reduce(
      (sum, q) => sum + (q.marks || practiceTest.marksPerQuestion || 1),
      0
    );
  }

  await attempt.save();

  // Return full question review
  const fullQuestions = practiceTest.questions.map((q) => {
    const raw = q.toObject ? q.toObject() : { ...q };
    const ans = attempt.answers.find((a) => a.questionId.toString() === raw._id.toString());
    return {
      _id: raw._id,
      questionText: raw.questionText,
      imageUrl: raw.imageUrl,
      options: raw.options,
      correctOption: raw.correctOption,
      explanation: raw.explanation || '',
      topic: raw.topic,
      difficulty: raw.difficulty,
      marks: raw.marks,
      hasAnswered: !!ans,
      selectedOption: ans ? ans.selectedOption : null,
      isCorrect: ans ? ans.isCorrect : false,
    };
  });

  res.json({
    success: true,
    message: 'Practice test completed successfully',
    attempt,
    questions: fullQuestions,
  });
});

// GET /api/practice-attempts/my-history — Student practice history & statistics
export const getMyPracticeHistory = asyncHandler(async (req, res) => {
  const sessionId = req.user?.sessionId;
  const studentName = req.user?.name;
  const userId = req.user?._id;

  if (!sessionId && !studentName && !userId) {
    throw new ForbiddenError('Authentication required.');
  }

  // Filter strictly by server-validated session identity
  const filter = {};
  if (sessionId) {
    filter.$or = [{ studentSessionId: sessionId }, { studentName: studentName }];
  } else if (userId) {
    filter.userId = userId;
  } else {
    filter.studentName = studentName;
  }

  const [attempts, total] = await Promise.all([
    PracticeAttempt.find(filter).sort({ createdAt: -1 }),
    PracticeAttempt.countDocuments(filter),
  ]);

  const completedAttempts = attempts.filter((a) => a.status === 'completed');

  // Compute dashboard statistics
  const totalAttempts = attempts.length;
  const totalCompleted = completedAttempts.length;
  const totalQuestionsAttempted = attempts.reduce((sum, a) => sum + (a.attemptedQuestions || 0), 0);
  const totalCorrectAnswers = attempts.reduce((sum, a) => sum + (a.correctAnswers || 0), 0);
  const totalIncorrectAnswers = attempts.reduce((sum, a) => sum + (a.incorrectAnswers || 0), 0);

  const averageAccuracy =
    completedAttempts.length > 0
      ? Math.round(
          (completedAttempts.reduce((sum, a) => sum + (a.accuracyPercentage || 0), 0) /
            completedAttempts.length) *
            100
        ) / 100
      : 0;

  const bestScore =
    attempts.length > 0
      ? Math.max(...attempts.map((a) => a.totalScore || 0))
      : 0;

  res.json({
    success: true,
    attempts,
    stats: {
      totalAttempts,
      totalCompleted,
      totalQuestionsAttempted,
      totalCorrectAnswers,
      totalIncorrectAnswers,
      averageAccuracy,
      bestScore,
      recentAttempts: attempts.slice(0, 5),
    },
  });
});

// GET /api/practice-results/:id — Get completed practice result and answer review
export const getPracticeResult = asyncHandler(async (req, res) => {
  const attempt = await PracticeAttempt.findById(req.params.id);
  if (!attempt) throw new NotFoundError('Practice result not found');

  if (!verifyPracticeAttemptOwnership(attempt, req.user)) {
    throw new ForbiddenError('You can only view your own practice results.');
  }

  const practiceTest = await PracticeTest.findById(attempt.practiceTestId);
  if (!practiceTest) throw new NotFoundError('Associated practice test not found');

  const questionsReview = practiceTest.questions.map((q) => {
    const raw = q.toObject ? q.toObject() : { ...q };
    const ans = attempt.answers.find((a) => a.questionId.toString() === raw._id.toString());
    return {
      _id: raw._id,
      questionText: raw.questionText,
      imageUrl: raw.imageUrl,
      options: raw.options,
      correctOption: raw.correctOption,
      explanation: raw.explanation || '',
      topic: raw.topic,
      difficulty: raw.difficulty,
      marks: raw.marks,
      hasAnswered: !!ans,
      selectedOption: ans ? ans.selectedOption : null,
      isCorrect: ans ? ans.isCorrect : false,
      answeredAt: ans ? ans.answeredAt : null,
    };
  });

  res.json({
    success: true,
    attempt,
    practiceTest: {
      _id: practiceTest._id,
      title: practiceTest.title,
      subject: practiceTest.subject,
      difficulty: practiceTest.difficulty,
      topics: practiceTest.topics,
      marksPerQuestion: practiceTest.marksPerQuestion,
      allowChangeAnswer: practiceTest.allowChangeAnswer,
    },
    questions: questionsReview,
  });
});
