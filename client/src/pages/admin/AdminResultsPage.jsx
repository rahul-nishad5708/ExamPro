import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { resultService } from '../../services/resultService';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorState from '../../components/ErrorState';
import EmptyState from '../../components/EmptyState';
import { Award, Search, ChevronLeft, ChevronRight, Eye } from 'lucide-react';

export default function AdminResultsPage() {
  const [results, setResults] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchResults = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await resultService.getAdminResults({ page, limit: 15 });
      if (res.success) {
        setResults(res.results || []);
        setPagination(res.pagination || { total: 0, pages: 1 });
      }
    } catch (err) {
      setError(err.message || 'Failed to load student attempts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, [page]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
          Student Assessment Submissions
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Monitor candidate exam scores, pass rates, and review submitted answer papers.
        </p>
      </div>

      {loading ? (
        <LoadingSpinner size="lg" text="Aggregating student assessment records..." />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchResults} />
      ) : results.length === 0 ? (
        <EmptyState
          title="No submissions recorded"
          description="Candidates have not taken any published tests yet."
        />
      ) : (
        <div className="p-6 rounded-2xl glass-panel border border-slate-800/80 shadow-xl overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="text-[11px] uppercase tracking-wider text-slate-400 bg-slate-900/60 border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Candidate Name</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Exam</th>
                <th className="py-3 px-4">Score</th>
                <th className="py-3 px-4">Percentage</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4 text-right">Review</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {results.map((r) => (
                <tr key={r._id} className="hover:bg-slate-900/40 transition-colors">
                  <td className="py-3 px-4 font-bold text-white">
                    {r.studentName || r.userId?.name || 'Candidate'}
                  </td>
                  <td className="py-3 px-4 text-slate-400">
                    {r.userId?.email || 'Exam Access Entry'}
                  </td>
                  <td className="py-3 px-4 text-slate-200">
                    {r.examId?.title || 'Unknown Exam'}
                  </td>
                  <td className="py-3 px-4 font-mono font-semibold">
                    {r.score} / {r.maximumMarks}
                  </td>
                  <td className="py-3 px-4 font-extrabold text-white">
                    {r.percentage}%
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        r.passed
                          ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                          : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                      }`}
                    >
                      {r.passed ? 'PASSED' : 'FAILED'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-400 text-[11px]">
                    {new Date(r.submittedAt).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Link
                      to={`/results/${r._id}`}
                      className="inline-flex items-center gap-1.5 p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-colors"
                      title="Inspect Submission"
                    >
                      <Eye className="w-4 h-4 text-indigo-400" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
