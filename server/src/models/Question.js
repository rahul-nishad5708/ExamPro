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
    correctOption: {
      type: Number,
      required: [true, 'Correct option index is required'],
      min: 0,
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

// Validate options length
questionSchema.pre('validate', function (next) {
  if (this.options && this.options.length < 2) {
    return next(new Error('A question must have at least 2 options'));
  }
  if (this.options && this.correctOption >= this.options.length) {
    return next(new Error('Correct option index is out of range'));
  }
  next();
});

const Question = mongoose.model('Question', questionSchema);
export default Question;
