import React, { useState, useEffect } from 'react';
import { practiceService } from '../../services/practiceService';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorState from '../../components/ErrorState';
import EmptyState from '../../components/EmptyState';
import {
  PlusCircle,
  Search,
  Edit,
  Trash2,
  Sparkles,
  Plus,
  X,
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function AdminPracticeTestsPage() {
  const [tests, setTests] = useState([]);
  const [search, setSearch] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal State for Create / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTestId, setEditingTestId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    subject: '',
    difficulty: 'Medium',
    description: '',
    topicsInput: '',
    allowChangeAnswer: false,
    marksPerQuestion: 1,
    negativeMarks: 0,
    status: 'published',
    questions: [
      {
        questionText: '',
        options: [{ text: '' }, { text: '' }, { text: '' }, { text: '' }],
        correctOption: 0,
        explanation: '',
        topic: '',
        difficulty: 'Medium',
        marks: 1,
      },
    ],
  });

  const fetchPracticeTests = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await practiceService.getPracticeTests({
        search: search.trim() || undefined,
        difficulty: difficultyFilter !== 'All' ? difficultyFilter : undefined,
        limit: 50,
      });
      if (res.success) {
        setTests(res.tests || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to load practice tests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPracticeTests();
  }, [difficultyFilter]);

  const handleOpenCreateModal = () => {
    setEditingTestId(null);
    setFormData({
      title: '',
      subject: '',
      difficulty: 'Medium',
      description: '',
      topicsInput: '',
      allowChangeAnswer: false,
      marksPerQuestion: 1,
      negativeMarks: 0,
      status: 'published',
      questions: [
        {
          questionText: '',
          options: [{ text: '' }, { text: '' }, { text: '' }, { text: '' }],
          correctOption: 0,
          explanation: '',
          topic: '',
          difficulty: 'Medium',
          marks: 1,
        },
      ],
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (test) => {
    setEditingTestId(test._id);
    setFormData({
      title: test.title || '',
      subject: test.subject || '',
      difficulty: test.difficulty || 'Medium',
      description: test.description || '',
      topicsInput: (test.topics || []).join(', '),
      allowChangeAnswer: !!test.allowChangeAnswer,
      marksPerQuestion: test.marksPerQuestion || 1,
      negativeMarks: test.negativeMarks || 0,
      status: test.status || 'published',
      questions: (test.questions || []).map((q) => ({
        questionText: q.questionText || '',
        options: q.options?.length ? q.options.map((o) => ({ text: o.text || '' })) : [{ text: '' }, { text: '' }],
        correctOption: q.correctOption !== undefined ? q.correctOption : 0,
        explanation: q.explanation || '',
        topic: q.topic || '',
        difficulty: q.difficulty || 'Medium',
        marks: q.marks || 1,
      })),
    });
    setIsModalOpen(true);
  };

  const handleDeleteTest = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete practice test "${title}"?`)) return;

    try {
      const res = await practiceService.deletePracticeTest(id);
      toast.success(res.message || 'Practice test deleted successfully');
      setTests((prev) => prev.filter((t) => t._id !== id));
    } catch (err) {
      toast.error(err.message || 'Failed to delete practice test.');
    }
  };

  const handleTogglePublish = async (test) => {
    const newStatus = test.status === 'published' ? 'draft' : 'published';
    try {
      const res = await practiceService.updatePracticeTest(test._id, { status: newStatus });
      toast.success(`Practice test set to ${newStatus}`);
      setTests((prev) =>
        prev.map((t) => (t._id === test._id ? { ...t, status: newStatus } : t))
      );
    } catch (err) {
      toast.error(err.message || 'Failed to update publication status.');
    }
  };

  // Question editing helpers
  const handleAddQuestion = () => {
    setFormData((prev) => ({
      ...prev,
      questions: [
        ...prev.questions,
        {
          questionText: '',
          options: [{ text: '' }, { text: '' }, { text: '' }, { text: '' }],
          correctOption: 0,
          explanation: '',
          topic: '',
          difficulty: prev.difficulty,
          marks: prev.marksPerQuestion,
        },
      ],
    }));
  };

  const handleRemoveQuestion = (idx) => {
    if (formData.questions.length <= 1) {
      toast.error('Practice test must contain at least 1 question.');
      return;
    }
    setFormData((prev) => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== idx),
    }));
  };

  const handleAddOption = (qIdx) => {
    setFormData((prev) => {
      const updated = [...prev.questions];
      updated[qIdx].options.push({ text: '' });
      return { ...prev, questions: updated };
    });
  };

  const handleRemoveOption = (qIdx, optIdx) => {
    setFormData((prev) => {
      const updated = [...prev.questions];
      if (updated[qIdx].options.length <= 2) {
        toast.error('A question must have at least 2 options.');
        return prev;
      }
      updated[qIdx].options = updated[qIdx].options.filter((_, i) => i !== optIdx);
      if (updated[qIdx].correctOption >= updated[qIdx].options.length) {
        updated[qIdx].correctOption = 0;
      }
      return { ...prev, questions: updated };
    });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.subject.trim()) {
      toast.error('Title and Subject are required.');
      return;
    }

    // Validate questions
    for (let i = 0; i < formData.questions.length; i++) {
      const q = formData.questions[i];
      if (!q.questionText.trim()) {
        toast.error(`Question ${i + 1} text cannot be empty.`);
        return;
      }
      for (let j = 0; j < q.options.length; j++) {
        if (!q.options[j].text.trim()) {
          toast.error(`Question ${i + 1}, Option ${j + 1} cannot be empty.`);
          return;
        }
      }
    }

    const payload = {
      title: formData.title.trim(),
      subject: formData.subject.trim(),
      difficulty: formData.difficulty,
      description: formData.description.trim(),
      topics: formData.topicsInput
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      allowChangeAnswer: formData.allowChangeAnswer,
      marksPerQuestion: Number(formData.marksPerQuestion) || 1,
      negativeMarks: Number(formData.negativeMarks) || 0,
      status: formData.status,
      questions: formData.questions.map((q, idx) => ({
        questionText: q.questionText.trim(),
        options: q.options.map((o) => ({ text: o.text.trim() })),
        correctOption: Number(q.correctOption),
        explanation: q.explanation.trim(),
        topic: q.topic.trim(),
        difficulty: q.difficulty,
        marks: Number(q.marks) || 1,
        order: idx + 1,
      })),
    };

    setIsSaving(true);
    try {
      if (editingTestId) {
        const res = await practiceService.updatePracticeTest(editingTestId, payload);
        toast.success('Practice test updated successfully!');
      } else {
        const res = await practiceService.createPracticeTest(payload);
        toast.success('Practice test created successfully!');
      }
      setIsModalOpen(false);
      fetchPracticeTests();
    } catch (err) {
      toast.error(err.message || 'Failed to save practice test.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Manage Practice Tests
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Create, publish, and configure MCQ practice tests with automated feedback and explanations.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreateModal}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-600/30 transition-all cursor-pointer whitespace-nowrap self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Practice Test</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl glass-panel-subtle border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
        <form onSubmit={(e) => { e.preventDefault(); fetchPracticeTests(); }} className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by test title or subject..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-all"
          />
        </form>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-violet-500 cursor-pointer"
          >
            <option value="All">All Difficulties</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
        </div>
      </div>

      {/* Practice Tests Table */}
      {loading ? (
        <LoadingSpinner size="lg" text="Loading practice tests..." />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchPracticeTests} />
      ) : tests.length === 0 ? (
        <EmptyState
          title="No practice tests found"
          description="Click 'New Practice Test' above to author your first practice test with instant explanations."
        />
      ) : (
        <div className="rounded-2xl glass-panel border border-slate-800 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/80 border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="py-3.5 px-4 font-bold">Title & Description</th>
                  <th className="py-3.5 px-4 font-bold">Subject</th>
                  <th className="py-3.5 px-4 font-bold text-center">Questions</th>
                  <th className="py-3.5 px-4 font-bold text-center">Difficulty</th>
                  <th className="py-3.5 px-4 font-bold text-center">Answer Policy</th>
                  <th className="py-3.5 px-4 font-bold text-center">Status</th>
                  <th className="py-3.5 px-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {tests.map((test) => (
                  <tr key={test._id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-white text-sm line-clamp-1">{test.title}</p>
                      <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                        {test.description || 'No description provided.'}
                      </p>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap font-medium text-slate-300">
                      {test.subject}
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-white whitespace-nowrap">
                      {test.totalQuestions || test.questions?.length || 0}
                    </td>
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          test.difficulty === 'Easy'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : test.difficulty === 'Hard'
                            ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        }`}
                      >
                        {test.difficulty || 'Medium'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <span className="text-[10px] text-slate-400 font-semibold">
                        {test.allowChangeAnswer ? 'Allow Change' : 'Locked'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => handleTogglePublish(test)}
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase transition-colors cursor-pointer border ${
                          test.status === 'published'
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/30'
                            : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
                        }`}
                      >
                        {test.status}
                      </button>
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(test)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                          title="Edit Practice Test"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteTest(test._id, test.title)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                          title="Delete Practice Test"
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
        </div>
      )}

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
          <div className="w-full max-w-4xl p-6 sm:p-8 rounded-3xl glass-panel border border-slate-800 bg-slate-950 shadow-2xl space-y-6 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-violet-400" />
                <h2 className="text-lg sm:text-xl font-bold text-white">
                  {editingTestId ? 'Edit Practice Test' : 'Create New Practice Test'}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-6">
              {/* Basic Fields Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-300">Practice Test Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. React & TypeScript Advanced Practice Drill"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Subject *</label>
                  <input
                    type="text"
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="e.g. Frontend Development, Algorithms, Physics"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Difficulty</label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-violet-500 cursor-pointer"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-300">Description</label>
                  <textarea
                    rows={2}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Provide overview of topics tested and learning objectives..."
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-300">
                    Topics (Comma-separated)
                  </label>
                  <input
                    type="text"
                    value={formData.topicsInput}
                    onChange={(e) => setFormData({ ...formData, topicsInput: e.target.value })}
                    placeholder="e.g. Hooks, Context, Virtual DOM, Performance"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Marks per Question</label>
                  <input
                    type="number"
                    min="0.5"
                    step="0.5"
                    value={formData.marksPerQuestion}
                    onChange={(e) => setFormData({ ...formData, marksPerQuestion: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-violet-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Negative Marks</label>
                  <input
                    type="number"
                    min="0"
                    step="0.25"
                    value={formData.negativeMarks}
                    onChange={(e) => setFormData({ ...formData, negativeMarks: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-violet-500"
                  />
                </div>

                {/* FEATURE 2: Configurable lock on first selection */}
                <div className="sm:col-span-2 flex items-center justify-between p-4 rounded-xl bg-slate-900 border border-slate-800">
                  <div>
                    <p className="text-xs font-bold text-white">Allow Answer Modification</p>
                    <p className="text-[11px] text-slate-400">
                      When disabled (default), the first option selected is locked immediately after feedback.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.allowChangeAnswer}
                      onChange={(e) => setFormData({ ...formData, allowChangeAnswer: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-violet-600"></div>
                  </label>
                </div>
              </div>

              {/* Questions Section */}
              <div className="pt-6 border-t border-slate-800 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                      Questions ({formData.questions.length})
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Add MCQ questions, options, select the correct answer, and provide rich explanations.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddQuestion}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-violet-600/20 text-violet-300 hover:bg-violet-600/30 border border-violet-500/30 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Question</span>
                  </button>
                </div>

                <div className="space-y-6">
                  {formData.questions.map((q, qIdx) => (
                    <div
                      key={qIdx}
                      className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4 relative"
                    >
                      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                        <span className="text-xs font-bold text-violet-400">
                          Question {qIdx + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveQuestion(qIdx)}
                          className="p-1 rounded-lg text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                          title="Remove question"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Question Text */}
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-300">Question Text *</label>
                        <textarea
                          rows={2}
                          required
                          value={q.questionText}
                          onChange={(e) => {
                            const updated = [...formData.questions];
                            updated[qIdx].questionText = e.target.value;
                            setFormData({ ...formData, questions: updated });
                          }}
                          placeholder="Enter question prompt..."
                          className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
                        />
                      </div>

                      {/* Options List */}
                      <div className="space-y-2.5">
                        <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                          <span>Options (Select the correct radio button)</span>
                          <button
                            type="button"
                            onClick={() => handleAddOption(qIdx)}
                            className="text-[11px] text-violet-400 hover:text-violet-300 font-bold"
                          >
                            + Add Option
                          </button>
                        </label>

                        {q.options.map((opt, optIdx) => (
                          <div key={optIdx} className="flex items-center gap-2.5">
                            <input
                              type="radio"
                              name={`correct-${qIdx}`}
                              checked={q.correctOption === optIdx}
                              onChange={() => {
                                const updated = [...formData.questions];
                                updated[qIdx].correctOption = optIdx;
                                setFormData({ ...formData, questions: updated });
                              }}
                              className="w-4 h-4 text-emerald-500 accent-emerald-500 cursor-pointer"
                              title="Mark as correct answer"
                            />
                            <input
                              type="text"
                              required
                              value={opt.text}
                              onChange={(e) => {
                                const updated = [...formData.questions];
                                updated[qIdx].options[optIdx].text = e.target.value;
                                setFormData({ ...formData, questions: updated });
                              }}
                              placeholder={`Option ${optIdx + 1} text...`}
                              className={`flex-1 px-3 py-2 rounded-xl bg-slate-950 border text-xs text-white placeholder-slate-500 focus:outline-none ${
                                q.correctOption === optIdx
                                  ? 'border-emerald-500/80 ring-1 ring-emerald-500/30'
                                  : 'border-slate-800 focus:border-violet-500'
                              }`}
                            />
                            {q.options.length > 2 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveOption(qIdx, optIdx)}
                                className="p-1.5 text-slate-500 hover:text-rose-400 cursor-pointer"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Explanation */}
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                          <span>Explanation for Correct Answer</span>
                        </label>
                        <textarea
                          rows={2}
                          value={q.explanation}
                          onChange={(e) => {
                            const updated = [...formData.questions];
                            updated[qIdx].explanation = e.target.value;
                            setFormData({ ...formData, questions: updated });
                          }}
                          placeholder="Explain why the correct answer is right and clarify key concepts..."
                          className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Form Actions */}
              <div className="pt-6 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-xl text-xs font-bold bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-600/30 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSaving ? 'Saving Practice Test...' : editingTestId ? 'Update Test' : 'Create Practice Test'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
