import mongoose from 'mongoose';

const answerSchema = new mongoose.Schema(
  {
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Question',
      required: true,
    },
    selectedOption: {
      type: Number,
      default: null, // null = unanswered
    },
    isMarkedForReview: {
      type: Boolean,
      default: false,
    },
    _id: false,
  }
);

const attemptSchema = new mongoose.Schema(
  {
    studentName: {
      type: String,
      required: [true, 'Student name is required'],
      trim: true,
    },
    sessionId: {
      type: String,
      default: '',
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      required: false,
      index: true,
    },
    examId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Exam',
      required: true,
      index: true,
    },
    startedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    submittedAt: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ['in_progress', 'submitted', 'expired'],
      default: 'in_progress',
    },
    answers: [answerSchema],
    // Result fields (populated after submission)
    score: {
      type: Number,
      default: null,
    },
    maximumMarks: {
      type: Number,
      default: null,
    },
    percentage: {
      type: Number,
      default: null,
    },
    correctCount: {
      type: Number,
      default: null,
    },
    incorrectCount: {
      type: Number,
      default: null,
    },
    unansweredCount: {
      type: Number,
      default: null,
    },
    timeTakenSeconds: {
      type: Number,
      default: null,
    },
    passed: {
      type: Boolean,
      default: null,
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

// Indexes for active attempt lookup and history
attemptSchema.index({ sessionId: 1, examId: 1, status: 1 });
attemptSchema.index({ studentName: 1, examId: 1 });
attemptSchema.index({ status: 1, expiresAt: 1 });

const Attempt = mongoose.model('Attempt', attemptSchema);
export default Attempt;
