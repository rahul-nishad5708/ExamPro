import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { examService } from '../../services/examService';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorState from '../../components/ErrorState';
import EmptyState from '../../components/EmptyState';
import {
  PlusCircle,
  Search,
  BookOpen,
  Edit,
  Trash2,
  FileQuestion,
  CheckCircle,
  XCircle,
  Globe,
  Lock,
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function AdminExamsPage() {
  const [exams, setExams] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchExams = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await examService.getExams({
        search: search.trim() || undefined,
        status: statusFilter || undefined,
        limit: 50,
      });
      if (res.success) {
        setExams(res.exams || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch exams.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, [statusFilter]);

  const handleTogglePublish = async (id) => {
    try {
      const res = await examService.togglePublish(id);
      toast.success(res.message);
      fetchExams();
    } catch (err) {
      toast.error(err.message || 'Failed to update publication status.');
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}" and all its questions?`)) {
      return;
    }
    try {
      await examService.deleteExam(id);
      toast.success('Exam deleted successfully');
      setExams((prev) => prev.filter((e) => e._id !== id));
    } catch (err) {
      toast.error(err.message || 'Failed to delete exam.');
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchExams();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Manage Examinations
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Create, configure, publish, and structure question banks.
          </p>
        </div>

        <Link
          to="/admin/exams/create"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition-all self-start sm:self-auto cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Examination</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl glass-panel-subtle border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
        <form onSubmit={handleSearch} className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search exam title or subject..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all"
          />
        </form>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-900 border border-slate-800 text-slate-300 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-500 cursor-pointer w-full md:w-auto"
          >
            <option value="">All Statuses</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
        </div>
      </div>

      {/* Table of Exams */}
      {loading ? (
        <LoadingSpinner size="lg" text="Loading examinations repository..." />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchExams} />
      ) : exams.length === 0 ? (
        <EmptyState
          title="No examinations found"
          description="Create your first exam to populate tests and invite students."
          actionText="Create Exam"
          actionLink="/admin/exams/create"
        />
      ) : (
        <div className="p-6 rounded-2xl glass-panel border border-slate-800/80 shadow-xl overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="text-[11px] uppercase tracking-wider text-slate-400 bg-slate-900/60 border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Exam Title</th>
                <th className="py-3 px-4">Subject</th>
                <th className="py-3 px-4">Difficulty</th>
                <th className="py-3 px-4">Questions</th>
                <th className="py-3 px-4">Duration</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {exams.map((exam) => (
                <tr key={exam._id} className="hover:bg-slate-900/40 transition-colors">
                  <td className="py-3 px-4">
                    <p className="font-bold text-white text-sm line-clamp-1">{exam.title}</p>
                    <p className="text-[11px] text-slate-500 line-clamp-1">
                      {exam.description}
                    </p>
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-[11px]">
                      {exam.category}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-300">{exam.difficulty}</td>
                  <td className="py-3 px-4 font-mono font-semibold">
                    {exam.totalQuestions} Qs
                  </td>
                  <td className="py-3 px-4">{exam.durationMinutes} mins</td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => handleTogglePublish(exam._id)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold cursor-pointer transition-all ${
                        exam.status === 'published'
                          ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/25'
                          : 'bg-amber-500/15 text-amber-300 border border-amber-500/30 hover:bg-amber-500/25'
                      }`}
                      title="Click to toggle publish status"
                    >
                      {exam.status === 'published' ? (
                        <>
                          <Globe className="w-3 h-3" /> Published
                        </>
                      ) : (
                        <>
                          <Lock className="w-3 h-3" /> Draft
                        </>
                      )}
                    </button>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        to={`/admin/exams/${exam._id}/questions`}
                        className="p-1.5 rounded-lg bg-slate-900 hover:bg-indigo-600/20 text-slate-400 hover:text-indigo-400 border border-slate-800 transition-colors"
                        title="Manage Questions"
                      >
                        <FileQuestion className="w-4 h-4" />
                      </Link>

                      <Link
                        to={`/admin/exams/${exam._id}/edit`}
                        className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors"
                        title="Edit Exam"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>

                      <button
                        onClick={() => handleDelete(exam._id, exam.title)}
                        className="p-1.5 rounded-lg bg-slate-900 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-slate-800 transition-colors cursor-pointer"
                        title="Delete Exam"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
