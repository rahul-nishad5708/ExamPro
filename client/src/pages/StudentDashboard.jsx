import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { resultService } from '../services/resultService';
import { practiceService } from '../services/practiceService';
import ExamCard from '../components/ExamCard';
import PracticeCard from '../components/PracticeCard';
import ScoreChart from '../components/ScoreChart';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorState from '../components/ErrorState';
import EmptyState from '../components/EmptyState';
import {
  Award,
  BookOpen,
  CheckCircle2,
  Clock,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Percent,
  PlayCircle,
  Zap,
  Target,
  History,
  XCircle,
  HelpCircle,
} from 'lucide-react';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [practiceHistory, setPracticeHistory] = useState([]);
  const [practiceStats, setPracticeStats] = useState(null);
  const [featuredPracticeTests, setFeaturedPracticeTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const [res, historyRes, practiceRes] = await Promise.all([
        resultService.getStudentDashboard(),
        practiceService.getMyPracticeHistory(),
        practiceService.getPracticeTests({ limit: 3 }),
      ]);

      if (res.success) {
        setData(res);
      }
      if (historyRes.success) {
        setPracticeHistory(historyRes.attempts || []);
        setPracticeStats(historyRes.stats || null);
      }
      if (practiceRes.success) {
        setFeaturedPracticeTests(practiceRes.tests || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to load dashboard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) {
    return <LoadingSpinner size="lg" text="Loading candidate dashboard..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={fetchDashboard} />;
  }

  const { stats, availableExams = [], recentResults = [], activeAttempt } = data || {};

  // Prepare chart data from recent results
  const chartData = (recentResults || [])
    .slice()
    .reverse()
    .map((r) => ({
      name: r.examId?.title?.substring(0, 15) || 'Exam',
      score: r.percentage || 0,
    }));

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Welcome Hero Banner */}
      <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-indigo-500/20 bg-gradient-to-r from-indigo-950/40 via-slate-900 to-slate-950 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-300 text-xs font-semibold border border-indigo-500/20">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Candidate Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Welcome back, {user?.name}! 👋
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
              Track your exam progress, challenge yourself with practice mode, and review
              detailed explanations to enhance your scores.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/practice-tests"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-600/30 transition-all"
            >
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Practice Tests</span>
            </Link>
            <Link
              to="/exams"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs bg-indigo-600/80 hover:bg-indigo-600 text-white border border-indigo-500/30 transition-all"
            >
              <BookOpen className="w-4 h-4" />
              <span>Formal Exams</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Active Attempt Alert Banner if Candidate has ongoing exam */}
      {activeAttempt && (
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-300">
              <PlayCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-amber-200">
                Active Exam In Progress: {activeAttempt.examId?.title}
              </p>
              <p className="text-xs text-amber-300/80">
                You have an ongoing test session. Click resume to continue your examination.
              </p>
            </div>
          </div>
          <Link
            to={`/exams/${activeAttempt.examId?._id}/attempt`}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 text-slate-950 hover:bg-amber-400 transition-all whitespace-nowrap"
          >
            Resume Exam
          </Link>
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Exams Attempted */}
        <div className="p-5 sm:p-6 rounded-2xl glass-panel border border-slate-800/80 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Exams Attempted</p>
            <p className="text-2xl font-extrabold text-white mt-0.5">
              {stats?.totalAttempted ?? 0}
            </p>
          </div>
        </div>

        {/* Average Score */}
        <div className="p-5 sm:p-6 rounded-2xl glass-panel border border-slate-800/80 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
            <Percent className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Average Score</p>
            <p className="text-2xl font-extrabold text-cyan-400 mt-0.5">
              {stats?.averageScore ?? 0}%
            </p>
          </div>
        </div>

        {/* Practice Attempts */}
        <div className="p-5 sm:p-6 rounded-2xl glass-panel border border-slate-800/80 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Practice Attempts</p>
            <p className="text-2xl font-extrabold text-violet-400 mt-0.5">
              {practiceStats?.totalAttempts ?? 0}
            </p>
          </div>
        </div>

        {/* Practice Accuracy */}
        <div className="p-5 sm:p-6 rounded-2xl glass-panel border border-slate-800/80 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Target className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Practice Accuracy</p>
            <p className="text-2xl font-extrabold text-emerald-400 mt-0.5">
              {practiceStats?.averageAccuracy ?? 0}%
            </p>
          </div>
        </div>
      </div>

      {/* Analytics Chart & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ScoreChart data={chartData} title="Recent Exam Performance Progression" />
        </div>

        {/* Recent Results Sidebar List */}
        <div className="p-6 rounded-2xl glass-panel border border-slate-800/80 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
            <h3 className="text-sm font-bold text-white">Recent Exam Results</h3>
            <Link
              to="/results"
              className="text-xs text-indigo-400 hover:text-indigo-300 font-medium"
            >
              View All
            </Link>
          </div>

          {recentResults.length === 0 ? (
            <p className="text-xs text-slate-400 py-8 text-center">
              No completed exams yet. Take your first test below!
            </p>
          ) : (
            <div className="space-y-3">
              {recentResults.map((r) => (
                <Link
                  key={r._id}
                  to={`/results/${r._id}`}
                  className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition-all flex items-center justify-between group block"
                >
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-white group-hover:text-indigo-300 transition-colors line-clamp-1">
                      {r.examId?.title}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {new Date(r.submittedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`text-xs font-bold ${
                        r.passed ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {r.percentage}%
                    </span>
                    <p className="text-[10px] text-slate-500">
                      {r.passed ? 'Passed' : 'Failed'}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* FEATURE 1: Dedicated Practice Tests Section */}
      <div className="space-y-4 pt-4 border-t border-slate-800/80">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-violet-400" />
              <h2 className="text-xl font-bold text-white">Practice Mode Drills</h2>
            </div>
            <p className="text-xs text-slate-400">
              Interactive questions with instant server validation and explanation reveals
            </p>
          </div>
          <Link
            to="/practice-tests"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-violet-400 hover:text-violet-300"
          >
            <span>Explore All Practice Tests</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {featuredPracticeTests.length === 0 ? (
          <EmptyState
            title="No practice tests published"
            description="Practice tests will appear here once administrators publish them."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredPracticeTests.map((pt) => (
              <PracticeCard key={pt._id} test={pt} />
            ))}
          </div>
        )}
      </div>

      {/* FEATURE 6: My Practice History Table */}
      <div className="space-y-4 pt-4 border-t border-slate-800/80">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-indigo-400" />
              <h2 className="text-xl font-bold text-white">My Practice History</h2>
            </div>
            <p className="text-xs text-slate-400">
              Your historical performance across interactive practice sessions
            </p>
          </div>
          <Link
            to="/practice-tests"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {practiceHistory.length === 0 ? (
          <div className="p-6 rounded-2xl glass-panel border border-slate-800 text-center space-y-2">
            <p className="text-xs text-slate-400">
              You haven't completed any practice tests yet. Try a practice drill above!
            </p>
          </div>
        ) : (
          <div className="rounded-2xl glass-panel border border-slate-800 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900/80 border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-400">
                  <tr>
                    <th className="py-3 px-4 font-bold">Student</th>
                    <th className="py-3 px-4 font-bold">Practice Test</th>
                    <th className="py-3 px-4 font-bold">Attempt Date</th>
                    <th className="py-3 px-4 font-bold text-center">Attempted</th>
                    <th className="py-3 px-4 font-bold text-center">Correct</th>
                    <th className="py-3 px-4 font-bold text-center">Wrong</th>
                    <th className="py-3 px-4 font-bold text-center">Skipped</th>
                    <th className="py-3 px-4 font-bold text-center">Accuracy</th>
                    <th className="py-3 px-4 font-bold text-center">Score</th>
                    <th className="py-3 px-4 font-bold text-center">Time</th>
                    <th className="py-3 px-4 font-bold text-center">Status</th>
                    <th className="py-3 px-4 font-bold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {practiceHistory.slice(0, 5).map((att) => {
                    const formattedDate = new Date(att.createdAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    });
                    const minutes = Math.floor((att.timeTakenSeconds || 0) / 60);
                    const seconds = (att.timeTakenSeconds || 0) % 60;
                    const timeString = `${minutes}m ${seconds}s`;

                    return (
                      <tr key={att._id} className="hover:bg-slate-900/40 transition-colors">
                        <td className="py-3 px-4 font-semibold text-white">
                          {att.studentName || user?.name}
                        </td>
                        <td className="py-3 px-4">
                          <p className="font-semibold text-white line-clamp-1">
                            {att.practiceTestTitle}
                          </p>
                          <span className="text-[10px] text-slate-500 uppercase font-bold">
                            {att.subject}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
                          {formattedDate}
                        </td>
                        <td className="py-3 px-4 text-center font-medium">
                          {att.attemptedQuestions} / {att.totalQuestions}
                        </td>
                        <td className="py-3 px-4 text-center font-bold text-emerald-400">
                          {att.correctAnswers}
                        </td>
                        <td className="py-3 px-4 text-center font-bold text-rose-400">
                          {att.incorrectAnswers}
                        </td>
                        <td className="py-3 px-4 text-center text-slate-400">
                          {att.skippedQuestions}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full font-bold text-[11px] ${
                              att.accuracyPercentage >= 70
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : att.accuracyPercentage >= 40
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            }`}
                          >
                            {att.accuracyPercentage}%
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center font-bold text-indigo-300">
                          {att.totalScore} pts
                        </td>
                        <td className="py-3 px-4 text-center text-slate-400 whitespace-nowrap">
                          {timeString}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {att.status === 'completed' ? (
                            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/25">
                              Completed
                            </span>
                          ) : (
                            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/25">
                              In Progress
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          {att.status === 'completed' ? (
                            <Link
                              to={`/practice-results/${att._id}`}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-violet-600/20 text-violet-300 hover:bg-violet-600/30 border border-violet-500/30 transition-colors"
                            >
                              <span>Result</span>
                              <ArrowRight className="w-3 h-3" />
                            </Link>
                          ) : (
                            <Link
                              to={`/practice-tests/${att.practiceTestId}/attempt`}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-500 shadow-sm transition-colors"
                            >
                              <span>Resume</span>
                              <ArrowRight className="w-3 h-3" />
                            </Link>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Available Formal Exams Section */}
      <div className="space-y-4 pt-4 border-t border-slate-800/80">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">Available Examinations</h2>
            <p className="text-xs text-slate-400">
              Browse formal proctored examinations
            </p>
          </div>
          <Link
            to="/exams"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300"
          >
            <span>View All Exams</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {availableExams.length === 0 ? (
          <EmptyState
            title="No exams available"
            description="There are currently no published exams to take. Please check back later."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableExams.map((exam) => (
              <ExamCard key={exam._id} exam={exam} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
