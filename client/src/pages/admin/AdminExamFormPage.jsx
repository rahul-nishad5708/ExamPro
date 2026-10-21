import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { examService } from '../../services/examService';
import LoadingSpinner from '../../components/LoadingSpinner';
import { ArrowLeft, Save, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

const examFormSchema = z.object({
  title: z.string().trim().min(3, 'Title must be at least 3 characters'),
  description: z.string().trim().min(10, 'Description must be at least 10 characters'),
  category: z.string().trim().min(2, 'Category is required'),
  difficulty: z.enum(['Easy', 'Medium', 'Hard']),
  durationMinutes: z.coerce.number().min(1, 'Duration must be at least 1 minute'),
  marksPerQuestion: z.coerce.number().min(0.5, 'Marks must be at least 0.5'),
  negativeMarks: z.coerce.number().min(0, 'Negative marks cannot be negative'),
  passingPercentage: z.coerce.number().min(0).max(100, 'Must be between 0 and 100'),
  instructions: z.string().optional(),
  maxAttempts: z.coerce.number().min(1).default(1),
  status: z.enum(['draft', 'published']),
  showAnswerKey: z.boolean().default(true),
});

export default function AdminExamFormPage() {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(isEditMode);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(examFormSchema),
    defaultValues: {
      title: '',
      description: '',
      category: 'Computer Science',
      difficulty: 'Medium',
      durationMinutes: 30,
      marksPerQuestion: 2,
      negativeMarks: 0.5,
      passingPercentage: 40,
      instructions: '',
      maxAttempts: 3,
      status: 'draft',
      showAnswerKey: true,
    },
  });

  useEffect(() => {
    if (isEditMode) {
      examService
        .getExam(id)
        .then((res) => {
          if (res.success && res.exam) {
            reset({
              title: res.exam.title,
              description: res.exam.description,
              category: res.exam.category,
              difficulty: res.exam.difficulty,
              durationMinutes: res.exam.durationMinutes,
              marksPerQuestion: res.exam.marksPerQuestion,
              negativeMarks: res.exam.negativeMarks,
              passingPercentage: res.exam.passingPercentage,
              instructions: res.exam.instructions || '',
              maxAttempts: res.exam.maxAttempts || 1,
              status: res.exam.status,
              showAnswerKey: res.exam.showAnswerKey,
            });
          }
        })
        .catch((err) => toast.error(err.message || 'Failed to load exam data.'))
        .finally(() => setLoading(false));
    }
  }, [id, isEditMode, reset]);

  const onSubmit = async (values) => {
    setIsSubmitting(true);
    try {
      if (isEditMode) {
        await examService.updateExam(id, values);
        toast.success('Exam configuration updated successfully!');
        navigate('/admin/exams');
      } else {
        const res = await examService.createExam(values);
        toast.success('Exam created! Now add questions to your exam.');
        navigate(`/admin/exams/${res.exam._id}/questions`);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to save exam.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner size="lg" text="Loading exam configuration..." />;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
      <div>
        <Link
          to="/admin/exams"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Exams</span>
        </Link>
      </div>

      <div className="p-6 sm:p-10 rounded-3xl glass-panel border border-slate-800 shadow-2xl space-y-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            {isEditMode ? 'Edit Examination' : 'Create New Examination'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Define exam parameters, scoring rubric, passing thresholds, and publication status.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Exam Title *
            </label>
            <input
              type="text"
              {...register('title')}
              placeholder="e.g. Advanced Operating Systems & Concurrency"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all"
            />
            {errors.title && (
              <p className="mt-1 text-xs text-rose-400">{errors.title.message}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Description *
            </label>
            <textarea
              rows={3}
              {...register('description')}
              placeholder="Provide a comprehensive summary of the topics and scope covered..."
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all resize-y"
            />
            {errors.description && (
              <p className="mt-1 text-xs text-rose-400">{errors.description.message}</p>
            )}
          </div>

          {/* Category & Difficulty */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Subject / Category *
              </label>
              <input
                type="text"
                {...register('category')}
                placeholder="e.g. DBMS, Networking, DSA"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all"
              />
              {errors.category && (
                <p className="mt-1 text-xs text-rose-400">{errors.category.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Difficulty Level *
              </label>
              <select
                {...register('difficulty')}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-sm text-white focus:outline-none focus:border-indigo-500 transition-all cursor-pointer"
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
          </div>

          {/* Scoring & Duration Settings */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Duration (Mins) *
              </label>
              <input
                type="number"
                {...register('durationMinutes')}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
              {errors.durationMinutes && (
                <p className="mt-1 text-[11px] text-rose-400">{errors.durationMinutes.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Marks / Correct *
              </label>
              <input
                type="number"
                step="0.5"
                {...register('marksPerQuestion')}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Negative Marks
              </label>
              <input
                type="number"
                step="0.25"
                {...register('negativeMarks')}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Pass Threshold (%) *
              </label>
              <input
                type="number"
                {...register('passingPercentage')}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Max Attempts & Publication Status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Max Attempts Allowed
              </label>
              <input
                type="number"
                min="1"
                {...register('maxAttempts')}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Publication Status *
              </label>
              <select
                {...register('status')}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-sm text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="draft">Draft (Hidden from students)</option>
                <option value="published">Published (Visible to students)</option>
              </select>
            </div>

            <div className="flex flex-col justify-end">
              <label className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  {...register('showAnswerKey')}
                  className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-xs font-medium text-slate-300">
                  Release Answer Key After Submission
                </span>
              </label>
            </div>
          </div>

          {/* Instructions */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Examination Instructions
            </label>
            <textarea
              rows={4}
              {...register('instructions')}
              placeholder="1. Each correct answer awards 2 marks.&#10;2. -0.5 negative marking for incorrect choices.&#10;3. Do not switch tabs."
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all resize-y font-mono text-xs"
            />
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800/80">
            <Link
              to="/admin/exams"
              className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Saving Exam...
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>{isEditMode ? 'Save Changes' : 'Create & Add Questions'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
