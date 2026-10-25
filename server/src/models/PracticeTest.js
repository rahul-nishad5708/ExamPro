import mongoose from 'mongoose';

const optionSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: [true, 'Option text is required'],
      trim: true,
    },
  },
  { _id: false }
);

const practiceQuestionSchema = new mongoose.Schema(
  {
    questionText: {
      type: String,
      required: [true, 'Question text is required'],
      maxlength: [5000, 'Question text cannot exceed 5000 characters'],
    },
    imageUrl: {
      type: String,
      default: '',
    },
    options: {
      type: [optionSchema],
      validate: {
        validator: function (v) {
          return Array.isArray(v) && v.length >= 2;
        },
        message: 'A practice question must have at least 2 options',
      },
    },
    questionType: {
      type: String,
      enum: ['MCQ', 'MSQ'],
      default: 'MCQ',
    },
    correctOption: {
      type: Number,
      required: false,
      min: 0,
    },
    correctOptions: {
      type: [Number],
      default: undefined,
    },
    explanation: {
      type: String,
      default: '',
      maxlength: [4000, 'Explanation cannot exceed 4000 characters'],
    },
    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard'],
      default: 'Medium',
    },
    topic: {
      type: String,
      default: '',
      trim: true,
    },
    marks: {
      type: Number,
      default: 1,
      min: [0.5, 'Marks must be at least 0.5'],
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const practiceTestSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Practice test title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      default: '',
      maxlength: [3000, 'Description cannot exceed 3000 characters'],
    },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true,
      index: true,
    },
    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard'],
      default: 'Medium',
    },
    topics: [
      {
        type: String,
        trim: true,
      },
    ],
    allowChangeAnswer: {
      type: Boolean,
      default: false, // Default: lock first selection after feedback
    },
    shuffleQuestions: {
      type: Boolean,
      default: true,
    },
    marksPerQuestion: {
      type: Number,
      default: 1,
      min: [0.5, 'Marks per question must be at least 0.5'],
    },
    negativeMarks: {
      type: Number,
      default: 0,
      min: [0, 'Negative marks cannot be negative'],
    },
    timeLimitMinutes: {
      type: Number,
      default: 0, // 0 = untimed open practice
    },
    status: {
      type: String,
      enum: ['draft', 'published'],
      default: 'published',
      index: true,
    },
    questions: [practiceQuestionSchema],
    totalQuestions: {
      type: Number,
      default: 0,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for fast catalog browsing & filtering
practiceTestSchema.index({ status: 1, subject: 1, difficulty: 1 });
practiceTestSchema.index({ title: 'text', description: 'text', subject: 'text' });

practiceTestSchema.pre('save', function (next) {
  if (this.questions) {
    this.totalQuestions = this.questions.length;
  }
  next();
});

const PracticeTest = mongoose.model('PracticeTest', practiceTestSchema);
export default PracticeTest;
