import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { resultService } from '../services/resultService';
import ResultSummary from '../components/ResultSummary';
import AnswerReviewCard from '../components/AnswerReviewCard';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorState from '../components/ErrorState';
import { ArrowLeft, LayoutDashboard, Filter, CheckCircle2, XCircle, HelpCircle } from 'lucide-react';

export default function ResultDetailPage() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [filter, setFilter] = useState('all'); // all | correct | incorrect | unanswered
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    resultService
      .getResult(id)
      .then((res) => {
        if (res.success) {
          setData(res);
        }
      })
      .catch((err) => setError(err.message || 'Failed to load assessment report.'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <LoadingSpinner size="lg" text="Calculating and preparing evaluation report..." />;
  }

  if (error || !data) {
    return <ErrorState message={error || 'Result record not found'} />;
  }

  const { attempt, questions = [], showAnswerKey } = data;
  const exam = attempt?.examId;

  // Filter questions based on student's performance
  const filteredQuestions = questions.filter((q) => {
    const answer = attempt.answers?.find(
      (a) => a.questionId?.toString() === q._id?.toString()
    );
    const userOption = answer?.selectedOption;
    const isUnanswered = userOption === null || userOption === undefined;
    const isCorrect = !isUnanswered && userOption === q.correctOption;

    if (filter === 'correct') return isCorrect;
    if (filter === 'incorrect') return !isUnanswered && !isCorrect;
    if (filter === 'unanswered') return isUnanswered;
    return true;
  });

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Top Breadcrumb & Actions */}
      <div className="flex items-center justify-between">
        <Link
          to="/results"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to All Results</span>
        </Link>

        <Link
          to="/dashboard"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-all"
        >
          <LayoutDashboard className="w-3.5 h-3.5 text-indigo-400" />
          <span>Dashboard</span>
        </Link>
      </div>

      {/* Result Metrics Banner */}
      <ResultSummary attempt={attempt} exam={exam} />

      {/* Answer Key Privacy Alert if answers are hidden */}
      {!showAnswerKey && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-center gap-3">
          <span>
            ℹ️ Correct answer keys and explanations are restricted for this exam until the
            designated release date by the examiner.
          </span>
        </div>
      )}

      {/* Question Review Section */}
      <div className="space-y-4 pt-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
          <div>
            <h3 className="text-lg font-bold text-white">Question Review</h3>
            <p className="text-xs text-slate-400">
              Examine each question, your chosen option, and verified solutions.
            </p>
          </div>

          {/* Filter Chips */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                filter === 'all'
                  ? 'bg-indigo-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All ({questions.length})
            </button>
            <button
              onClick={() => setFilter('correct')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                filter === 'correct'
                  ? 'bg-emerald-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Correct ({attempt.correctCount || 0})
            </button>
            <button
              onClick={() => setFilter('incorrect')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                filter === 'incorrect'
                  ? 'bg-rose-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Wrong ({attempt.incorrectCount || 0})
            </button>
            <button
              onClick={() => setFilter('unanswered')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                filter === 'unanswered'
                  ? 'bg-slate-700 text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Skipped ({attempt.unansweredCount || 0})
            </button>
          </div>
        </div>

        {/* Questions Cards */}
        <div className="space-y-4">
          {filteredQuestions.map((q, idx) => {
            const answer = attempt.answers?.find(
              (a) => a.questionId?.toString() === q._id?.toString()
            );
            return (
              <AnswerReviewCard
                key={q._id || idx}
                question={q}
                questionNumber={idx + 1}
                selectedAnswer={answer}
                showAnswerKey={showAnswerKey}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
