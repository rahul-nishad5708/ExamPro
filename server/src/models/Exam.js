import mongoose from 'mongoose';

const examSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Exam title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
    },
    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard'],
      default: 'Medium',
    },
    durationMinutes: {
      type: Number,
      required: [true, 'Duration is required'],
      min: [1, 'Duration must be at least 1 minute'],
      max: [600, 'Duration cannot exceed 600 minutes'],
    },
    totalQuestions: {
      type: Number,
      default: 0,
    },
    marksPerQuestion: {
      type: Number,
      required: true,
      default: 1,
      min: [0.5, 'Marks per question must be at least 0.5'],
    },
    negativeMarks: {
      type: Number,
      default: 0,
      min: [0, 'Negative marks cannot be negative'],
    },
    passingPercentage: {
      type: Number,
      required: true,
      default: 40,
      min: [0, 'Passing percentage cannot be negative'],
      max: [100, 'Passing percentage cannot exceed 100'],
    },
    instructions: {
      type: String,
      default: '',
      maxlength: [5000, 'Instructions cannot exceed 5000 characters'],
    },
    startDate: {
      type: Date,
      default: null,
    },
    endDate: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ['draft', 'published'],
      default: 'draft',
    },
    showAnswerKey: {
      type: Boolean,
      default: true,
    },
    answerKeyReleaseDate: {
      type: Date,
      default: null,
    },
    maxAttempts: {
      type: Number,
      default: 1,
      min: [1, 'Max attempts must be at least 1'],
    },
    shuffleQuestions: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

examSchema.index({ status: 1, category: 1 });
examSchema.index({ createdBy: 1 });
examSchema.index({ startDate: 1, endDate: 1 });

// Virtual to check if exam is currently available
examSchema.virtual('isAvailable').get(function () {
  if (this.status !== 'published') return false;
  const now = new Date();
  if (this.startDate && now < this.startDate) return false;
  if (this.endDate && now > this.endDate) return false;
  return true;
});

const Exam = mongoose.model('Exam', examSchema);
export default Exam;
