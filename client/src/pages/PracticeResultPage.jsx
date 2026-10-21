import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { practiceService } from '../services/practiceService';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorState from '../components/ErrorState';
import {
  Award,
  CheckCircle2,
  XCircle,
  Clock,
  RotateCcw,
  LayoutDashboard,
  Sparkles,
  Target,
  BookOpen,
  User,
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function PracticeResultPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retrying, setRetrying] = useState(false);

  useEffect(() => {
    const fetchResult = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await practiceService.getPracticeResult(id);
        if (res.success) {
          setResult(res);
        }
      } catch (err) {
        setError(err.message || 'Failed to load practice results.');
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
  }, [id]);

  // Handle retry (creates separate attempt record)
  const handleRetry = async () => {
    if (!result?.attempt?.practiceTestId) return;

    setRetrying(true);
    try {
      const res = await practiceService.startPracticeAttempt(
        result.attempt.practiceTestId,
        true // retry = true -> force new attempt record
      );
      if (res.success && res.attempt) {
        toast.success('Fresh practice attempt started!');
        navigate(`/practice-tests/${result.attempt.practiceTestId}/attempt`);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to restart practice test.');
    } finally {
      setRetrying(false);
    }
  };

  if (loading) {
    return <LoadingSpinner size="lg" text="Loading practice assessment result..." />;
  }

  if (error || !result) {
    return (
      <ErrorState
        message={error || 'Practice result not found.'}
        onRetry={() => window.location.reload()}
      />
    );
  }

  const { attempt, questions = [] } = result;
  const letters = ['A', 'B', 'C', 'D', 'E', 'F'];

  const minutes = Math.floor((attempt.timeTakenSeconds || 0) / 60);
  const seconds = (attempt.timeTakenSeconds || 0) % 60;
  const timeTakenFormatted = `${minutes} min ${seconds} sec`;

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Top Banner & Header */}
      <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-violet-500/20 bg-gradient-to-r from-violet-950/40 via-slate-900 to-indigo-950/30 relative overflow-hidden">
        <div className="relative z-10 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30">
                {attempt.subject}
              </span>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/25">
                Completed
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Clock className="w-4 h-4 text-slate-400" />
              <span>Time Taken: {timeTakenFormatted}</span>
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            {attempt.practiceTestTitle} — Practice Results
          </h1>

          <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <User className="w-4 h-4" />
            </div>
            <div className="text-xs">
              <span className="text-slate-400">Student Name: </span>
              <span className="font-bold text-white">{attempt.studentName || user?.name}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Summary Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        {/* Accuracy */}
        <div className="p-5 sm:p-6 rounded-2xl glass-panel border border-slate-800/80 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
            <Target className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Accuracy Rate</p>
            <p className="text-2xl font-extrabold text-cyan-400 mt-0.5">
              {attempt.accuracyPercentage}%
            </p>
          </div>
        </div>

        {/* Total Score */}
        <div className="p-5 sm:p-6 rounded-2xl glass-panel border border-slate-800/80 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Total Score</p>
            <p className="text-2xl font-extrabold text-indigo-300 mt-0.5">
              {attempt.totalScore} / {attempt.maximumMarks || 0}
            </p>
          </div>
        </div>

        {/* Correct Answers */}
        <div className="p-5 sm:p-6 rounded-2xl glass-panel border border-slate-800/80 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Correct Answers</p>
            <p className="text-2xl font-extrabold text-emerald-400 mt-0.5">
              {attempt.correctAnswers} / {attempt.totalQuestions}
            </p>
          </div>
        </div>

        {/* Incorrect & Skipped */}
        <div className="p-5 sm:p-6 rounded-2xl glass-panel border border-slate-800/80 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
            <XCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Wrong / Skipped</p>
            <p className="text-2xl font-extrabold text-rose-400 mt-0.5">
              {attempt.incorrectAnswers} / {attempt.skippedQuestions}
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons Bar */}
      <div className="p-5 rounded-2xl glass-panel border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-850 border border-slate-800 transition-colors"
        >
          <LayoutDashboard className="w-4 h-4 text-slate-400" />
          <span>Return to Dashboard</span>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            to="/practice-tests"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-slate-900 text-slate-300 hover:text-white border border-slate-800 transition-colors"
          >
            <BookOpen className="w-4 h-4 text-violet-400" />
            <span>All Practice Tests</span>
          </Link>

          <button
            type="button"
            disabled={retrying}
            onClick={handleRetry}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-600/30 transition-all cursor-pointer disabled:opacity-50"
          >
            <RotateCcw className="w-4 h-4" />
            <span>{retrying ? 'Starting New Attempt...' : 'Retry Practice Test'}</span>
          </button>
        </div>
      </div>

      {/* FEATURE 3: Question-by-Question Answer Review */}
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-white">Question-by-Question Answer Review</h2>
          <p className="text-xs text-slate-400">
            Review each question, your selected option, the verified correct option, and detailed rationales.
          </p>
        </div>

        <div className="space-y-6">
          {questions.map((q, idx) => {
            const hasAnswered = q.hasAnswered;
            const isCorrect = q.isCorrect;
            const selectedOpt = q.selectedOption;
            const correctOpt = q.correctOption;

            return (
              <div
                key={q._id || idx}
                className={`p-6 sm:p-8 rounded-3xl glass-panel border transition-all ${
                  !hasAnswered
                    ? 'border-slate-800'
                    : isCorrect
                    ? 'border-emerald-500/40 bg-emerald-950/10'
                    : 'border-rose-500/40 bg-rose-950/10'
                }`}
              >
                {/* Question Header */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-800/80">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-xs px-2.5 py-1 rounded-lg bg-slate-900 text-slate-300 border border-slate-800">
                      Question {idx + 1}
                    </span>
                    {q.topic && (
                      <span className="text-xs text-slate-400 px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
                        #{q.topic}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {!hasAnswered ? (
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                        Skipped
                      </span>
                    ) : isCorrect ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Correct (+{q.marks || 1} mark)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                        <XCircle className="w-3.5 h-3.5" />
                        Incorrect
                      </span>
                    )}
                  </div>
                </div>

                {/* Question Text */}
                <h3 className="text-base font-bold text-white mb-6 leading-relaxed">
                  {q.questionText}
                </h3>

                {/* Options Review */}
                <div className="space-y-3 mb-6">
                  {q.options.map((opt, optIdx) => {
                    const isCandidateChoice = selectedOpt === optIdx;
                    const isCorrectAnswer = correctOpt === optIdx;

                    let optBg = 'bg-slate-900/60 border-slate-800 text-slate-300';
                    let optBadge = 'bg-slate-800 text-slate-400 border-slate-700';

                    if (isCandidateChoice && isCorrect) {
                      optBg = 'bg-emerald-500/20 border-emerald-500 text-emerald-100 font-semibold';
                      optBadge = 'bg-emerald-500 text-white font-extrabold';
                    } else if (isCandidateChoice && !isCorrect) {
                      optBg = 'bg-rose-500/20 border-rose-500 text-rose-100 font-semibold';
                      optBadge = 'bg-rose-500 text-white font-extrabold';
                    } else if (!isCandidateChoice && isCorrectAnswer) {
                      optBg = 'bg-emerald-950/40 border-emerald-500/80 text-emerald-100 font-semibold';
                      optBadge = 'bg-emerald-600 text-white font-extrabold';
                    }

                    return (
                      <div
                        key={optIdx}
                        className={`p-4 rounded-xl border flex items-start justify-between gap-4 ${optBg}`}
                      >
                        <div className="flex items-start gap-3">
                          <span
                            className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold mt-0.5 border ${optBadge}`}
                          >
                            {letters[optIdx] || optIdx + 1}
                          </span>
                          <span className="text-sm pt-0.5">{opt.text}</span>
                        </div>

                        {/* Status Label on Option */}
                        <div className="flex-shrink-0">
                          {isCandidateChoice && isCorrect && (
                            <span className="text-[11px] font-bold text-emerald-400">
                              Your Answer (Correct)
                            </span>
                          )}
                          {isCandidateChoice && !isCorrect && (
                            <span className="text-[11px] font-bold text-rose-400">
                              Your Answer (Wrong)
                            </span>
                          )}
                          {!isCandidateChoice && isCorrectAnswer && (
                            <span className="text-[11px] font-bold text-emerald-400">
                              Correct Option
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Explanation */}
                {q.explanation && (
                  <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/30 space-y-1 text-xs">
                    <p className="font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Explanation:</span>
                    </p>
                    <p className="text-slate-200 leading-relaxed">{q.explanation}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
