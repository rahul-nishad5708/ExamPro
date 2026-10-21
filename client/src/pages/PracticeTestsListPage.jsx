import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { practiceService } from '../services/practiceService';
import { useAuth } from '../context/AuthContext';
import PracticeCard from '../components/PracticeCard';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorState from '../components/ErrorState';
import EmptyState from '../components/EmptyState';
import {
  Sparkles,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Award,
  Zap,
  Target,
  ArrowRight,
  TrendingUp,
  History,
  RotateCcw,
} from 'lucide-react';

export default function PracticeTestsListPage() {
  const { user } = useAuth();

  const [tests, setTests] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Practice History & Stats
  const [history, setHistory] = useState([]);
  const [historyStats, setHistoryStats] = useState(null);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const fetchPracticeData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [testsRes, subjectsRes, historyRes] = await Promise.all([
        practiceService.getPracticeTests({
          subject: selectedSubject !== 'All' ? selectedSubject : undefined,
          difficulty: selectedDifficulty !== 'All' ? selectedDifficulty : undefined,
          search: search.trim() || undefined,
        }),
        practiceService.getPracticeSubjects(),
        practiceService.getMyPracticeHistory(),
      ]);

      if (testsRes.success) setTests(testsRes.tests || []);
      if (subjectsRes.success) setSubjects(['All', ...(subjectsRes.subjects || [])]);
      if (historyRes.success) {
        setHistory(historyRes.attempts || []);
        setHistoryStats(historyRes.stats || null);
      }
    } catch (err) {
      setError(err.message || 'Failed to load practice tests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPracticeData();
  }, [selectedSubject, selectedDifficulty]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchPracticeData();
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Hero Welcome Banner */}
      <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-violet-500/20 bg-gradient-to-r from-violet-950/40 via-slate-900 to-indigo-950/30 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-500/10 text-violet-300 text-xs font-semibold border border-violet-500/20">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Interactive Learning Mode</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Practice Test Mode 🎯
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl leading-relaxed">
              Test your knowledge with immediate right/wrong feedback on every selection.
              Inspect detailed explanations, track live accuracy, and retry tests to master subjects.
            </p>
          </div>

          {/* Quick Metrics Badge */}
          {historyStats && historyStats.totalAttempts > 0 && (
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
              <div className="text-center px-2">
                <p className="text-xs text-slate-400 font-medium">Tests</p>
                <p className="text-xl font-bold text-white">{historyStats.totalAttempts}</p>
              </div>
              <div className="w-px h-8 bg-slate-800" />
              <div className="text-center px-2">
                <p className="text-xs text-slate-400 font-medium">Accuracy</p>
                <p className="text-xl font-bold text-emerald-400">
                  {historyStats.averageAccuracy}%
                </p>
              </div>
              <div className="w-px h-8 bg-slate-800" />
              <div className="text-center px-2">
                <p className="text-xs text-slate-400 font-medium">Best Score</p>
                <p className="text-xl font-bold text-indigo-400">{historyStats.bestScore}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl glass-panel-subtle border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search practice tests or topics..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-all"
          />
        </form>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Subject Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 md:pb-0">
            {subjects.map((subj) => (
              <button
                key={subj}
                type="button"
                onClick={() => setSelectedSubject(subj)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  selectedSubject === subj
                    ? 'bg-violet-600 text-white shadow-sm shadow-violet-500/20'
                    : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {subj}
              </button>
            ))}
          </div>

          {/* Difficulty Dropdown */}
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-violet-500 cursor-pointer"
          >
            <option value="All">All Difficulties</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
        </div>
      </div>

      {/* Available Practice Tests Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-white">Available Practice Tests</h2>
            <p className="text-xs text-slate-400">
              Select a test to begin answering questions with immediate feedback
            </p>
          </div>
          <span className="text-xs text-slate-400 font-medium">
            {tests.length} {tests.length === 1 ? 'Test' : 'Tests'} Found
          </span>
        </div>

        {loading ? (
          <LoadingSpinner size="lg" text="Loading practice tests catalog..." />
        ) : error ? (
          <ErrorState message={error} onRetry={fetchPracticeData} />
        ) : tests.length === 0 ? (
          <EmptyState
            title="No practice tests found"
            description="No practice tests match your current search or filter criteria. Try selecting another subject."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tests.map((test) => (
              <PracticeCard key={test._id} test={test} />
            ))}
          </div>
        )}
      </div>

      {/* FEATURE 6: "My Practice History" Section */}
      <div className="pt-8 border-t border-slate-800/80 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-violet-400" />
              <h2 className="text-xl font-bold text-white">My Practice History</h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Review your past practice sessions, accuracy rates, and question breakdown
            </p>
          </div>

          {historyStats && (
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400">Total Questions Attempted:</span>
              <span className="font-bold text-indigo-300">
                {historyStats.totalQuestionsAttempted}
              </span>
            </div>
          )}
        </div>

        {history.length === 0 ? (
          <div className="p-8 rounded-2xl glass-panel border border-slate-800 text-center space-y-2">
            <p className="text-sm font-semibold text-slate-300">No practice attempts recorded yet.</p>
            <p className="text-xs text-slate-500">
              Choose any practice test above to sharpen your skills and build your activity record!
            </p>
          </div>
        ) : (
          <div className="rounded-2xl glass-panel border border-slate-800 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900/80 border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-400">
                  <tr>
                    <th className="py-3.5 px-4 font-bold">Student</th>
                    <th className="py-3.5 px-4 font-bold">Practice Test</th>
                    <th className="py-3.5 px-4 font-bold">Attempt Date</th>
                    <th className="py-3.5 px-4 font-bold text-center">Attempted</th>
                    <th className="py-3.5 px-4 font-bold text-center">Correct</th>
                    <th className="py-3.5 px-4 font-bold text-center">Wrong</th>
                    <th className="py-3.5 px-4 font-bold text-center">Skipped</th>
                    <th className="py-3.5 px-4 font-bold text-center">Accuracy</th>
                    <th className="py-3.5 px-4 font-bold text-center">Score</th>
                    <th className="py-3.5 px-4 font-bold text-center">Time</th>
                    <th className="py-3.5 px-4 font-bold text-center">Status</th>
                    <th className="py-3.5 px-4 font-bold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {history.map((att) => {
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
                        <td className="py-3.5 px-4 font-semibold text-white">
                          {att.studentName || user?.name}
                        </td>
                        <td className="py-3.5 px-4">
                          <p className="font-semibold text-white line-clamp-1">
                            {att.practiceTestTitle}
                          </p>
                          <span className="text-[10px] text-slate-500 uppercase font-bold">
                            {att.subject}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-400 whitespace-nowrap">
                          {formattedDate}
                        </td>
                        <td className="py-3.5 px-4 text-center font-medium">
                          {att.attemptedQuestions} / {att.totalQuestions}
                        </td>
                        <td className="py-3.5 px-4 text-center font-bold text-emerald-400">
                          {att.correctAnswers}
                        </td>
                        <td className="py-3.5 px-4 text-center font-bold text-rose-400">
                          {att.incorrectAnswers}
                        </td>
                        <td className="py-3.5 px-4 text-center text-slate-400">
                          {att.skippedQuestions}
                        </td>
                        <td className="py-3.5 px-4 text-center">
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
                        <td className="py-3.5 px-4 text-center font-bold text-indigo-300">
                          {att.totalScore} pts
                        </td>
                        <td className="py-3.5 px-4 text-center text-slate-400 whitespace-nowrap">
                          {timeString}
                        </td>
                        <td className="py-3.5 px-4 text-center">
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
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          {att.status === 'completed' ? (
                            <Link
                              to={`/practice-results/${att._id}`}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-violet-600/20 text-violet-300 hover:bg-violet-600/30 border border-violet-500/30 transition-colors"
                            >
                              <span>View Result</span>
                              <ArrowRight className="w-3 h-3" />
                            </Link>
                          ) : (
                            <Link
                              to={`/practice-tests/${att.practiceTestId}/attempt`}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-500 shadow-sm transition-colors"
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
    </div>
  );
}
