import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { examService } from '../services/examService';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorState from '../components/ErrorState';
import {
  Clock,
  HelpCircle,
  Award,
  AlertTriangle,
  CheckSquare,
  ArrowRight,
  ArrowLeft,
  ShieldAlert,
  Info,
} from 'lucide-react';

export default function ExamInstructionsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [attemptCount, setAttemptCount] = useState(0);
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    examService
      .getExam(id)
      .then((res) => {
        if (res.success) {
          setExam(res.exam);
          setAttemptCount(res.attemptCount || 0);
        }
      })
      .catch((err) => setError(err.message || 'Failed to load exam details.'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <LoadingSpinner size="lg" text="Loading examination syllabus & rules..." />;
  }

  if (error || !exam) {
    return <ErrorState message={error || 'Exam not found'} onRetry={() => navigate('/exams')} />;
  }

  const isMaxAttemptsReached =
    exam.maxAttempts && attemptCount >= exam.maxAttempts;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Back button */}
      <div>
        <Link
          to="/exams"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Examinations</span>
        </Link>
      </div>

      {/* Main Container */}
      <div className="p-6 sm:p-10 rounded-3xl glass-panel border border-slate-800 shadow-2xl space-y-8">
        {/* Title and Category */}
        <div className="space-y-2 border-b border-slate-800/80 pb-6">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-lg bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
              {exam.category}
            </span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
              Difficulty: {exam.difficulty}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            {exam.title}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            {exam.description}
          </p>
        </div>

        {/* Exam Specifications Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Clock className="w-4 h-4 text-indigo-400" />
              <span>Duration</span>
            </div>
            <p className="text-lg font-bold text-white">{exam.durationMinutes} Minutes</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <HelpCircle className="w-4 h-4 text-cyan-400" />
              <span>Questions</span>
            </div>
            <p className="text-lg font-bold text-white">{exam.totalQuestions} Questions</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Award className="w-4 h-4 text-emerald-400" />
              <span>Passing Mark</span>
            </div>
            <p className="text-lg font-bold text-white">{exam.passingPercentage}% Required</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Negative Mark</span>
            </div>
            <p className="text-lg font-bold text-white">
              {exam.negativeMarks > 0 ? `-${exam.negativeMarks} / wrong` : 'None'}
            </p>
          </div>
        </div>

        {/* Detailed Guidelines & Instructions */}
        <div className="space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Info className="w-4 h-4 text-indigo-400" />
            <span>Instructions & Regulations</span>
          </h3>

          <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800/80 space-y-3 text-xs sm:text-sm text-slate-300 leading-relaxed">
            {exam.instructions ? (
              <p className="whitespace-pre-line">{exam.instructions}</p>
            ) : (
              <ul className="list-disc pl-5 space-y-2 text-slate-300">
                <li>Each multiple-choice question contains 4 options with exactly one correct answer.</li>
                <li>Each correct answer awards <strong>+{exam.marksPerQuestion || 1} mark(s)</strong>.</li>
                {exam.negativeMarks > 0 && (
                  <li className="text-rose-300">
                    Incorrect answers will incur a deduction of <strong>-{exam.negativeMarks} mark(s)</strong>.
                  </li>
                )}
                <li>Unanswered questions receive zero marks.</li>
                <li>
                  The countdown timer runs on server synchronization. When the time expires, your
                  exam will automatically submit and calculate your score.
                </li>
                <li>
                  You can mark questions for review and jump across questions using the question
                  palette anytime.
                </li>
              </ul>
            )}
          </div>
        </div>

        {/* Attempt Eligibility Check */}
        {isMaxAttemptsReached ? (
          <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-3">
            <ShieldAlert className="w-5 h-5 flex-shrink-0" />
            <span>
              You have already completed the maximum number of attempts allowed ({exam.maxAttempts})
              for this examination.
            </span>
          </div>
        ) : (
          <div className="space-y-6 pt-4 border-t border-slate-800/80">
            {/* Agreement Checkbox */}
            <label className="flex items-start gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={accepted}
                onChange={(e) => setAccepted(e.target.checked)}
                className="mt-1 w-4 h-4 rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-slate-950 cursor-pointer"
              />
              <span className="text-xs sm:text-sm text-slate-300">
                I have read, understood, and agreed to abide by the exam instructions, timing
                rules, and negative marking policies.
              </span>
            </label>

            {/* Launch Button */}
            <div className="flex justify-end">
              <button
                type="button"
                disabled={!accepted}
                onClick={() => navigate(`/exams/${exam._id}/attempt`)}
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl font-bold text-sm bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-xl shadow-indigo-600/30 disabled:opacity-40 disabled:cursor-not-allowed transition-all transform hover:-translate-y-0.5 cursor-pointer"
              >
                <span>Begin Examination</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
