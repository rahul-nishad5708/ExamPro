import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { resultService } from '../../services/resultService';
import ScoreChart from '../../components/ScoreChart';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorState from '../../components/ErrorState';
import {
  BookOpen,
  Users,
  Award,
  TrendingUp,
  PlusCircle,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
} from 'lucide-react';

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await resultService.getAdminDashboard();
      if (res.success) {
        setData(res);
      }
    } catch (err) {
      setError(err.message || 'Failed to load administrator statistics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) {
    return <LoadingSpinner size="lg" text="Aggregating portal analytics..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={fetchDashboard} />;
  }

  const { stats, recentAttempts = [], categoryStats = [] } = data || {};

  // Prepare chart data from category performance
  const chartData = (categoryStats || []).map((cat) => ({
    name: cat._id || 'General',
    score: Math.round(cat.avgScore || 0),
  }));

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-amber-500/20 bg-gradient-to-r from-amber-950/20 via-slate-900 to-slate-950 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-300 text-xs font-semibold border border-amber-500/20">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Administrator Control Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Portal Overview & Insights
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Manage your question repository, review student completions, and publish examinations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin/exams/create"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition-all whitespace-nowrap"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create New Exam</span>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Total Exams */}
        <div className="p-5 sm:p-6 rounded-2xl glass-panel border border-slate-800/80">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-slate-400 font-medium">Total Exams</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-white">{stats?.totalExams ?? 0}</p>
          <p className="text-[11px] text-slate-500 mt-1">
            <span className="text-emerald-400 font-semibold">{stats?.publishedExams}</span>{' '}
            published, <span className="text-amber-400 font-semibold">{stats?.draftExams}</span>{' '}
            drafts
          </p>
        </div>

        {/* Registered Students */}
        <div className="p-5 sm:p-6 rounded-2xl glass-panel border border-slate-800/80">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-slate-400 font-medium">Candidates</span>
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-white">{stats?.totalStudents ?? 0}</p>
          <p className="text-[11px] text-slate-500 mt-1">Enrolled candidate accounts</p>
        </div>

        {/* Total Attempts */}
        <div className="p-5 sm:p-6 rounded-2xl glass-panel border border-slate-800/80">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-slate-400 font-medium">Total Attempts</span>
            <div className="w-8 h-8 rounded-lg bg-violet-500/10 text-violet-400 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-white">{stats?.totalAttempts ?? 0}</p>
          <p className="text-[11px] text-slate-500 mt-1">Completed exam sessions</p>
        </div>

        {/* Average Score */}
        <div className="p-5 sm:p-6 rounded-2xl glass-panel border border-slate-800/80">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-slate-400 font-medium">Average Score</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-emerald-400">
            {stats?.averageScore ?? 0}%
          </p>
          <p className="text-[11px] text-slate-500 mt-1">Across all completed tests</p>
        </div>
      </div>

      {/* Analytics Chart & Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ScoreChart
            data={chartData}
            title="Average Candidate Performance by Subject Category"
          />
        </div>

        {/* Category Stats Table */}
        <div className="p-6 rounded-2xl glass-panel border border-slate-800/80 space-y-4">
          <h3 className="text-sm font-bold text-white pb-3 border-b border-slate-800/80">
            Subject Performance
          </h3>
          <div className="space-y-3">
            {categoryStats.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">
                No attempt metrics recorded yet.
              </p>
            ) : (
              categoryStats.map((cat) => (
                <div
                  key={cat._id}
                  className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between"
                >
                  <div className="space-y-0.5">
                    <p className="text-xs font-semibold text-white">{cat._id}</p>
                    <p className="text-[10px] text-slate-400">{cat.attempts} attempts</p>
                  </div>
                  <span className="text-xs font-bold text-indigo-400">
                    {Math.round(cat.avgScore || 0)}% avg
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Recent Candidate Submissions Table */}
      <div className="p-6 rounded-2xl glass-panel border border-slate-800/80 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
          <div>
            <h3 className="text-sm font-bold text-white">Recent Candidate Submissions</h3>
            <p className="text-xs text-slate-400">Latest completed examinations</p>
          </div>
          <Link
            to="/admin/results"
            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300"
          >
            View Full Records
          </Link>
        </div>

        {recentAttempts.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-8">
            No examinations have been completed yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="text-[11px] uppercase tracking-wider text-slate-400 bg-slate-900/60 border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Candidate</th>
                  <th className="py-3 px-4">Exam</th>
                  <th className="py-3 px-4">Score</th>
                  <th className="py-3 px-4">Percentage</th>
                  <th className="py-3 px-4">Result</th>
                  <th className="py-3 px-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {recentAttempts.map((att) => (
                  <tr key={att._id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-3 px-4 font-medium text-white">
                      <div>
                        <p>{att.studentName || att.userId?.name || 'Candidate'}</p>
                        <p className="text-[10px] text-slate-500">{att.userId?.email || 'Exam Access Entry'}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      {att.examId?.title || 'Unknown Exam'}
                    </td>
                    <td className="py-3 px-4 font-mono font-semibold">
                      {att.score} / {att.maximumMarks}
                    </td>
                    <td className="py-3 px-4 font-bold text-white">
                      {att.percentage}%
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          att.passed
                            ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                            : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                        }`}
                      >
                        {att.passed ? 'PASSED' : 'FAILED'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-400 text-[11px]">
                      {new Date(att.submittedAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
