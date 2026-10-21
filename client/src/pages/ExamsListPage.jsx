import React, { useState, useEffect } from 'react';
import { examService } from '../services/examService';
import ExamCard from '../components/ExamCard';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorState from '../components/ErrorState';
import EmptyState from '../components/EmptyState';
import { Search, Filter, BookOpen, ChevronLeft, ChevronRight } from 'lucide-react';

export default function ExamsListPage() {
  const [exams, setExams] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch categories on mount
  useEffect(() => {
    examService
      .getCategories()
      .then((res) => {
        if (res.success) setCategories(res.categories || []);
      })
      .catch(() => {});
  }, []);

  const fetchExams = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await examService.getExams({
        page,
        limit: 9,
        category: selectedCategory || undefined,
        difficulty: selectedDifficulty || undefined,
        search: search.trim() || undefined,
      });

      if (res.success) {
        setExams(res.exams || []);
        setPagination(res.pagination || { total: 0, pages: 1 });
      }
    } catch (err) {
      setError(err.message || 'Failed to load exams.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, [page, selectedCategory, selectedDifficulty]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchExams();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Available Examinations
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Select a verified technical assessment to test your competency.
          </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 max-w-md w-full md:w-80">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by topic or keyword..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all cursor-pointer whitespace-nowrap"
          >
            Search
          </button>
        </form>
      </div>

      {/* Filter Chips Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl glass-panel-subtle border border-slate-800">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              setSelectedCategory('');
              setPage(1);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              selectedCategory === ''
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setSelectedCategory(cat);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Difficulty Dropdown */}
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={selectedDifficulty}
            onChange={(e) => {
              setSelectedDifficulty(e.target.value);
              setPage(1);
            }}
            className="bg-slate-900 border border-slate-800 text-slate-300 text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:border-indigo-500 cursor-pointer"
          >
            <option value="">All Difficulties</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
        </div>
      </div>

      {/* Exam Cards Grid or Status */}
      {loading ? (
        <LoadingSpinner size="lg" text="Searching available examinations..." />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchExams} />
      ) : exams.length === 0 ? (
        <EmptyState
          title="No exams match your filters"
          description="Try clearing search filters or choosing a different subject category."
          actionText="Clear Filters"
          onAction={() => {
            setSelectedCategory('');
            setSelectedDifficulty('');
            setSearch('');
            setPage(1);
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exams.map((exam) => (
            <ExamCard key={exam._id} exam={exam} />
          ))}
        </div>
      )}

      {/* Pagination Controls */}
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
