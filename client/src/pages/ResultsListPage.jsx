import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { resultService } from '../services/resultService';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorState from '../components/ErrorState';
import EmptyState from '../components/EmptyState';
import {
  Award,
  Clock,
  ArrowRight,
  CheckCircle2,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Calendar,
} from 'lucide-react';

export default function ResultsListPage() {
  const [results, setResults] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchResults = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await resultService.getMyResults({ page, limit: 10 });
      if (res.success) {
        setResults(res.results || []);
        setPagination(res.pagination || { total: 0, pages: 1 });
      }
    } catch (err) {
      setError(err.message || 'Failed to load exam history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, [page]);

  if (loading) {
    return <LoadingSpinner size="lg" text="Loading test history & results..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={fetchResults} />;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
          My Exam Results
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Review your performance scores, pass/fail status, and verified answer keys.
        </p>
      </div>

      {results.length === 0 ? (
        <EmptyState
          title="No exam records yet"
          description="You have not submitted any examinations yet. Explore available tests to get started!"
          actionText="Browse Exams"
          actionLink="/exams"
        />
      ) : (
        <div className="space-y-3">
          {results.map((result) => {
            const isPassed = result.passed;
            return (
              <div
                key={result._id}
                className="p-5 sm:p-6 rounded-2xl glass-panel border border-slate-800/80 hover:border-slate-700 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                      {result.examId?.category || 'General'}
                    </span>
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                        isPassed
                          ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                          : 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                      }`}
                    >
                      {isPassed ? 'Passed' : 'Failed'}
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-white line-clamp-1">
                    {result.examId?.title}
                  </h3>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      {new Date(result.submittedAt).toLocaleDateString()} at{' '}
                      {new Date(result.submittedAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      {Math.round((result.timeTakenSeconds || 0) / 60)} mins taken
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-6 pt-3 md:pt-0 border-t md:border-t-0 border-slate-800/80">
                  <div className="text-left md:text-right">
                    <p className="text-xl sm:text-2xl font-black text-white">
                      {result.percentage}%
                    </p>
                    <p className="text-xs text-slate-400">
                      Score: <strong className="text-slate-300">{result.score}</strong> /{' '}
                      {result.maximumMarks}
                    </p>
                  </div>

                  <Link
                    to={`/results/${result._id}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 hover:border-slate-700 transition-all"
                  >
                    <span>View Analysis</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-6">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-800 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs text-slate-400 font-medium px-4">
            Page <strong className="text-white">{page}</strong> of{' '}
            <strong className="text-white">{pagination.pages}</strong>
          </span>
          <button
            disabled={page >= pagination.pages}
            onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-800 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
