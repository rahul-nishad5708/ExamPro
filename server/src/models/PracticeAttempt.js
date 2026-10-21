import mongoose from 'mongoose';

const practiceAnswerSchema = new mongoose.Schema(
  {
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    selectedOption: {
      type: Number,
      required: true,
    },
    isCorrect: {
      type: Boolean,
      required: true,
    },
    answeredAt: {
      type: Date,
      default: Date.now,
    },
    scoreAwarded: {
      type: Number,
      default: 0,
    },
    correctOption: {
      type: Number,
      required: false,
    },
    explanation: {
      type: String,
      default: '',
    },
    _id: false,
  }
);

const practiceAttemptSchema = new mongoose.Schema(
  {
    studentName: {
      type: String,
      required: [true, 'Student name is required'],
      trim: true,
      index: true,
    },
    studentSessionId: {
      type: String,
      required: [true, 'Student session ID is required'],
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      required: false,
      index: true,
    },
    practiceTestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PracticeTest',
      required: true,
      index: true,
    },
    practiceTestTitle: {
      type: String,
      required: true,
      trim: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    startedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
    submittedAt: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ['in_progress', 'completed'],
      default: 'in_progress',
      index: true,
    },
    answers: [practiceAnswerSchema],
    totalQuestions: {
      type: Number,
      default: 0,
    },
    attemptedQuestions: {
      type: Number,
      default: 0,
    },
    correctAnswers: {
      type: Number,
      default: 0,
    },
    incorrectAnswers: {
      type: Number,
      default: 0,
    },
    skippedQuestions: {
      type: Number,
      default: 0,
    },
    totalScore: {
      type: Number,
      default: 0,
    },
    maximumMarks: {
      type: Number,
      default: 0,
    },
    accuracyPercentage: {
      type: Number,
      default: 0,
    },
    timeTakenSeconds: {
      type: Number,
      default: 0,
    },
    currentQuestionIndex: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for fast lookup of student sessions, history, and admin analytics
practiceAttemptSchema.index({ studentSessionId: 1, practiceTestId: 1, status: 1 });
practiceAttemptSchema.index({ studentName: 1, practiceTestId: 1 });
practiceAttemptSchema.index({ status: 1, submittedAt: -1 });
practiceAttemptSchema.index({ practiceTestId: 1, submittedAt: -1 });
practiceAttemptSchema.index({ createdAt: -1 });

const PracticeAttempt = mongoose.model('PracticeAttempt', practiceAttemptSchema);
export default PracticeAttempt;
