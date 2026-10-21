import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { examService } from '../../services/examService';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorState from '../../components/ErrorState';
import EmptyState from '../../components/EmptyState';
import { FileQuestion, ArrowRight, BookOpen, Search } from 'lucide-react';

export default function AdminGlobalQuestionsPage() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    examService
      .getExams({ limit: 100 })
      .then((res) => {
        if (res.success) setExams(res.exams || []);
      })
      .catch((err) => setError(err.message || 'Failed to load question banks.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <LoadingSpinner size="lg" text="Loading question repositories..." />;
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  const filteredExams = exams.filter(
    (e) =>
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Question Banks & Repositories
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Select an examination subject to manage, author, reorder, or preview question items.
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search exam bank..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {filteredExams.length === 0 ? (
        <EmptyState
          title="No Question Banks Found"
          description="Create an exam to start adding questions to your repository."
          actionText="Create Exam"
          actionLink="/admin/exams/create"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredExams.map((exam) => (
            <div
              key={exam._id}
              className="p-6 rounded-2xl glass-panel border border-slate-800/80 shadow-md flex flex-col justify-between space-y-4 hover:border-slate-700 transition-all"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                    {exam.category}
                  </span>
                  <span className="text-xs font-semibold text-slate-400">
                    {exam.difficulty}
                  </span>
                </div>

                <h3 className="text-base font-bold text-white line-clamp-1">
                  {exam.title}
                </h3>
                <p className="text-xs text-slate-400 line-clamp-2">
                  {exam.description}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300">
                  {exam.totalQuestions} Questions
                </span>
                <Link
                  to={`/admin/exams/${exam._id}/questions`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20 transition-all"
                >
                  <span>Manage Questions</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
