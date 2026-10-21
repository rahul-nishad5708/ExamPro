import { z } from 'zod';

export const examSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(200),
  description: z.string().trim().min(1, 'Description is required').max(2000),
  category: z.string().trim().min(1, 'Category is required'),
  difficulty: z.enum(['Easy', 'Medium', 'Hard']).default('Medium'),
  durationMinutes: z.number().min(1).max(600),
  marksPerQuestion: z.number().min(0.5).default(1),
  negativeMarks: z.number().min(0).default(0),
  passingPercentage: z.number().min(0).max(100).default(40),
  instructions: z.string().max(5000).default(''),
  startDate: z.string().nullable().optional(),
  endDate: z.string().nullable().optional(),
  status: z.enum(['draft', 'published']).default('draft'),
  showAnswerKey: z.boolean().default(true),
  answerKeyReleaseDate: z.string().nullable().optional(),
  maxAttempts: z.number().min(1).default(1),
  shuffleQuestions: z.boolean().default(false),
});

export const questionSchema = z.object({
  questionText: z.string().trim().min(1, 'Question text is required').max(5000),
  imageUrl: z.string().default(''),
  options: z
    .array(
      z.object({
        text: z.string().trim().min(1, 'Option text cannot be empty'),
      })
    )
    .min(2, 'At least 2 options required')
    .max(6, 'Maximum 6 options allowed'),
  correctOption: z.number().min(0, 'Correct option is required'),
  explanation: z.string().max(3000).default(''),
  marks: z.number().nullable().optional(),
  negativeMarks: z.number().nullable().optional(),
  difficulty: z.enum(['Easy', 'Medium', 'Hard']).default('Medium'),
  topic: z.string().default(''),
  order: z.number().optional(),
});

export const reorderSchema = z.object({
  questionIds: z.array(z.string()).min(1, 'At least one question ID is required'),
});
