import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema(
  {
    examId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Exam',
      required: [true, 'Exam ID is required'],
      index: true,
    },
    questionText: {
      type: String,
      required: [true, 'Question text is required'],
      maxlength: [5000, 'Question text cannot exceed 5000 characters'],
    },
    imageUrl: {
      type: String,
      default: '',
    },
    options: [
      {
        text: {
          type: String,
          required: [true, 'Option text is required'],
        },
        _id: false,
      },
    ],
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
      maxlength: [3000, 'Explanation cannot exceed 3000 characters'],
    },
    marks: {
      type: Number,
      default: null, // null means use exam's marksPerQuestion
    },
    negativeMarks: {
      type: Number,
      default: null, // null means use exam's negativeMarks
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
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

questionSchema.index({ examId: 1, order: 1 });

// Validate options length and correct choices
questionSchema.pre('validate', function (next) {
  if (this.options && this.options.length < 2) {
    return next(new Error('A question must have at least 2 options'));
  }

  if (this.questionType === 'MSQ') {
    if (!this.correctOptions || this.correctOptions.length < 2) {
      return next(new Error('MSQ questions must have at least 2 correct options'));
    }
    for (const optIndex of this.correctOptions) {
      if (optIndex < 0 || optIndex >= this.options.length) {
        return next(new Error('Correct option index is out of range'));
      }
    }
    // Backwards-compatibility fallback
    if (this.correctOption === undefined || this.correctOption === null) {
      this.correctOption = this.correctOptions[0];
    }
  } else {
    // MCQ
    if (this.correctOption === undefined || this.correctOption === null) {
      if (this.correctOptions && this.correctOptions.length > 0) {
        this.correctOption = this.correctOptions[0];
      } else {
        return next(new Error('Correct option index is required for MCQ'));
      }
    }
    if (this.options && this.correctOption >= this.options.length) {
      return next(new Error('Correct option index is out of range'));
    }
    if (!this.correctOptions || this.correctOptions.length === 0) {
      this.correctOptions = [this.correctOption];
    }
  }

  next();
});

const Question = mongoose.model('Question', questionSchema);
export default Question;
