import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../../services/adminService';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorState from '../../components/ErrorState';
import EmptyState from '../../components/EmptyState';
import {
  Users,
  Search,
  Award,
  Zap,
  Target,
  Calendar,
  PlayCircle,
  RotateCcw,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Info,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';

export default function AdminStudentActivityPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters & Pagination State
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all'); // 'all' | 'exam' | 'practice'
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'completed' | 'in_progress' | 'expired'
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(15);

  const fetchStudentActivity = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminService.getStudentActivity({
        page,
        limit,
        search: search.trim() || undefined,
        type: typeFilter !== 'all' ? typeFilter : undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });

      if (res.success) {
        setData(res);
      }
    } catch (err) {
      setError(err.message || 'Failed to load student activity records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentActivity();
  }, [page, limit, typeFilter, statusFilter, startDate, endDate]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchStudentActivity();
  };

  const handleResetFilters = () => {
    setSearch('');
    setTypeFilter('all');
    setStatusFilter('all');
    setStartDate('');
    setEndDate('');
    setPage(1);
  };

  const { stats = {}, attempts = [], pagination = {} } = data || {};

  // Helper to format duration in minutes and seconds
  const formatTimeTaken = (seconds) => {
    if (seconds === null || seconds === undefined) return '—';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    if (m === 0) return `${s}s`;
    return `${m}m ${s}s`;
  };

  // Helper to format date cleanly
  const formatDate = (dateString) => {
    if (!dateString) return '—';
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-500/10 text-violet-300 text-xs font-semibold border border-violet-500/20 mb-2">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
            <span>Supervisory Console</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Student Activity Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Real-time tracking of candidate attempts across proctored formal exams and interactive practice tests.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchStudentActivity}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-850 transition-colors cursor-pointer self-start sm:self-auto"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Refresh Records</span>
        </button>
      </div>

      {/* Dashboard KPI Statistics (MongoDB Aggregation) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Total Attempts */}
        <div className="p-5 sm:p-6 rounded-2xl glass-panel border border-slate-800/80 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Total Attempts</span>
            <div className="w-9 h-9 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-extrabold text-white">{stats.totalAttempts ?? 0}</p>
            <p className="text-[11px] text-slate-500 mt-1">
              {stats.totalExamAttempts ?? 0} Exams • {stats.totalPracticeAttempts ?? 0} Practice
            </p>
          </div>
        </div>

        {/* Unique Student Sessions (Distinguishing Sessions from Names) */}
        <div className="p-5 sm:p-6 rounded-2xl glass-panel border border-slate-800/80 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
              <span>Unique Sessions</span>
              <Info className="w-3.5 h-3.5 text-slate-500" title="Pseudonymous server session IDs (independent of entered candidate names)" />
            </span>
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-extrabold text-cyan-400">{stats.uniqueStudentSessions ?? 0}</p>
            <p className="text-[11px] text-slate-500 mt-1">
              From {stats.uniqueStudentNames ?? 0} distinct name labels
            </p>
          </div>
        </div>

        {/* In-Progress vs Completed */}
        <div className="p-5 sm:p-6 rounded-2xl glass-panel border border-slate-800/80 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Attempt Status</span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <PlayCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-extrabold text-white">
              {stats.completedAttempts ?? 0}{' '}
              <span className="text-xs font-semibold text-slate-400">completed</span>
            </p>
            <p className="text-[11px] text-amber-400 font-medium mt-1">
              {stats.inProgressAttempts ?? 0} currently in progress
            </p>
          </div>
        </div>

        {/* Average Scores */}
        <div className="p-5 sm:p-6 rounded-2xl glass-panel border border-slate-800/80 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Average Performance</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Target className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-extrabold text-emerald-400">
              {stats.avgExamPercentage ?? 0}%
            </p>
            <p className="text-[11px] text-slate-500 mt-1">
              Exams Avg • {stats.avgPracticeAccuracy ?? 0}% Practice Accuracy
            </p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl glass-panel-subtle border border-slate-800 space-y-4">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          {/* Search Input */}
          <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by student name..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-all"
            />
          </form>

          {/* Type and Status Filters */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Test Type Filter */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => { setTypeFilter('all'); setPage(1); }}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                  typeFilter === 'all'
                    ? 'bg-violet-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                All Types
              </button>
              <button
                type="button"
                onClick={() => { setTypeFilter('exam'); setPage(1); }}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                  typeFilter === 'exam'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Exams
              </button>
              <button
                type="button"
                onClick={() => { setTypeFilter('practice'); setPage(1); }}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                  typeFilter === 'practice'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Practice
              </button>
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-violet-500 cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="completed">Completed / Submitted</option>
              <option value="in_progress">In Progress</option>
              <option value="expired">Expired</option>
            </select>
          </div>
        </div>

        {/* Secondary Date Range Filters */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800/80 text-xs text-slate-400">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="font-semibold flex items-center gap-1.5 text-slate-300">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>Date Filter:</span>
            </span>

            <div className="flex items-center gap-2">
              <input
                type="date"
                value={startDate}
                onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
                className="px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-violet-500 cursor-pointer"
              />
              <span>to</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => { setEndDate(e.target.value); setPage(1); }}
                className="px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-violet-500 cursor-pointer"
              />
            </div>

            {(search || typeFilter !== 'all' || statusFilter !== 'all' || startDate || endDate) && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-xs text-rose-400 hover:text-rose-300 underline font-medium ml-2 cursor-pointer"
              >
                Reset Filters
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span>Rows per page:</span>
            <select
              value={limit}
              onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
              className="px-2 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 focus:outline-none cursor-pointer"
            >
              <option value={10}>10</option>
              <option value={15}>15</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>
      </div>

      {/* Unified Attempts Table */}
      {loading ? (
        <LoadingSpinner size="lg" text="Querying unified student attempts..." />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchStudentActivity} />
      ) : attempts.length === 0 ? (
        <EmptyState
          title="No student attempts match your criteria"
          description="Adjust your search keywords, status, or date range to view attempts."
        />
      ) : (
        <div className="rounded-2xl glass-panel border border-slate-800 overflow-hidden shadow-xl space-y-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/90 border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="py-3.5 px-4 font-bold">Candidate & Session</th>
                  <th className="py-3.5 px-4 font-bold">Test Title & Subject</th>
                  <th className="py-3.5 px-4 font-bold text-center">Type</th>
                  <th className="py-3.5 px-4 font-bold text-center">Status</th>
                  <th className="py-3.5 px-4 font-bold text-center">Attempted</th>
                  <th className="py-3.5 px-4 font-bold text-center">Correct</th>
                  <th className="py-3.5 px-4 font-bold text-center">Wrong</th>
                  <th className="py-3.5 px-4 font-bold text-center">Skipped</th>
                  <th className="py-3.5 px-4 font-bold text-center">Score</th>
                  <th className="py-3.5 px-4 font-bold text-center">Percentage</th>
                  <th className="py-3.5 px-4 font-bold text-center">Started</th>
                  <th className="py-3.5 px-4 font-bold text-center">Submitted</th>
                  <th className="py-3.5 px-4 font-bold text-center">Time</th>
                  <th className="py-3.5 px-4 font-bold text-right">View</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {attempts.map((att) => {
                  const isInProgress = att.status === 'in_progress';
                  const isExam = att.type === 'Exam';

                  return (
                    <tr key={att._id} className="hover:bg-slate-900/40 transition-colors">
                      {/* Candidate Name & Session ID snippet */}
                      <td className="py-3.5 px-4 font-semibold text-white whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                              isExam
                                ? 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30'
                                : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                            }`}
                          >
                            {att.studentName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-white text-xs">{att.studentName}</p>
                            <p className="text-[10px] text-slate-500 font-mono" title={`Session ID: ${att.sessionId}`}>
                              {att.sessionId && att.sessionId !== 'N/A'
                                ? `sess: ${att.sessionId.slice(0, 8)}...`
                                : 'no session id'}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Test Title & Subject */}
                      <td className="py-3.5 px-4 min-w-[180px]">
                        <p className="font-semibold text-white line-clamp-1">{att.testTitle}</p>
                        <span className="text-[10px] text-slate-400 font-medium">
                          {att.subject || 'General'}
                        </span>
                      </td>

                      {/* Type Badge */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        {isExam ? (
                          <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/25">
                            <BookOpen className="w-3 h-3 text-indigo-400" />
                            <span>Exam</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/25">
                            <Zap className="w-3 h-3 text-emerald-400" />
                            <span>Practice</span>
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        {att.status === 'in_progress' ? (
                          <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
                            In Progress
                          </span>
                        ) : att.status === 'completed' || att.status === 'submitted' ? (
                          <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                            Completed
                          </span>
                        ) : (
                          <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/30">
                            {att.status}
                          </span>
                        )}
                      </td>

                      {/* Attempted Questions */}
                      <td className="py-3.5 px-4 text-center font-medium whitespace-nowrap">
                        {att.attemptedQuestions ?? 0} / {att.totalQuestions ?? 0}
                      </td>

                      {/* Correct Answers */}
                      <td className="py-3.5 px-4 text-center font-bold text-emerald-400 whitespace-nowrap">
                        {isInProgress && isExam ? (
                          <span className="text-slate-500 font-normal">—</span>
                        ) : (
                          att.correctAnswers ?? '—'
                        )}
                      </td>

                      {/* Wrong Answers */}
                      <td className="py-3.5 px-4 text-center font-bold text-rose-400 whitespace-nowrap">
                        {isInProgress && isExam ? (
                          <span className="text-slate-500 font-normal">—</span>
                        ) : (
                          att.wrongAnswers ?? '—'
                        )}
                      </td>

                      {/* Skipped Questions */}
                      <td className="py-3.5 px-4 text-center text-slate-400 whitespace-nowrap">
                        {att.skippedQuestions ?? 0}
                      </td>

                      {/* Score */}
                      <td className="py-3.5 px-4 text-center font-bold text-indigo-300 whitespace-nowrap">
                        {isInProgress && isExam ? (
                          <span className="text-slate-500 font-normal">—</span>
                        ) : att.score !== null && att.score !== undefined ? (
                          `${att.score} pts`
                        ) : (
                          '—'
                        )}
                      </td>

                      {/* Percentage / Accuracy */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        {isInProgress && isExam ? (
                          <span className="text-slate-500 font-normal text-xs">Pending</span>
                        ) : att.percentage !== null && att.percentage !== undefined ? (
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full font-bold text-[11px] ${
                              att.percentage >= 70
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : att.percentage >= 40
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            }`}
                          >
                            {att.percentage}%
                          </span>
                        ) : (
                          '—'
                        )}
                      </td>

                      {/* Started At */}
                      <td className="py-3.5 px-4 text-center text-slate-400 whitespace-nowrap text-[11px]">
                        {formatDate(att.startedAt)}
                      </td>

                      {/* Submitted At */}
                      <td className="py-3.5 px-4 text-center text-slate-400 whitespace-nowrap text-[11px]">
                        {isInProgress ? (
                          <span className="text-amber-400 text-[10px] font-medium">Ongoing</span>
                        ) : (
                          formatDate(att.submittedAt)
                        )}
                      </td>

                      {/* Time Taken */}
                      <td className="py-3.5 px-4 text-center text-slate-400 whitespace-nowrap text-[11px]">
                        {isInProgress ? (
                          <span className="text-slate-500">—</span>
                        ) : (
                          formatTimeTaken(att.timeTakenSeconds)
                        )}
                      </td>

                      {/* View Action Link */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        {isExam ? (
                          <Link
                            to={`/results/${att._id}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600/30 border border-indigo-500/30 transition-colors"
                          >
                            <span>Inspect</span>
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                        ) : (
                          <Link
                            to={`/practice-results/${att._id}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600/30 border border-emerald-500/30 transition-colors"
                          >
                            <span>Inspect</span>
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination Toolbar */}
          <div className="p-4 bg-slate-900/90 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
            <div>
              Showing <span className="font-bold text-white">{attempts.length}</span> of{' '}
              <span className="font-bold text-white">{pagination.total ?? 0}</span> attempts
              {pagination.filteredSessionsCount ? (
                <span> ({pagination.filteredSessionsCount} unique sessions)</span>
              ) : null}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Previous</span>
              </button>

              <span className="px-2 text-slate-300 font-medium">
                Page {page} of {pagination.pages || 1}
              </span>

              <button
                type="button"
                disabled={page >= (pagination.pages || 1)}
                onClick={() => setPage((p) => p + 1)}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                <span>Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
