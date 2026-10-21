import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { questionService } from '../../services/questionService';
import { examService } from '../../services/examService';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorState from '../../components/ErrorState';
import EmptyState from '../../components/EmptyState';
import {
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  Copy,
  ChevronUp,
  ChevronDown,
  CheckCircle2,
  X,
  Loader2,
  HelpCircle,
  Sparkles,
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function AdminQuestionsPage() {
  const { id: examId } = useParams();
  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal State for Add / Edit
  const [modalOpen, setModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [savingQuestion, setSavingQuestion] = useState(false);

  // Form State
  const [questionText, setQuestionText] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [options, setOptions] = useState([
    { text: '' },
    { text: '' },
    { text: '' },
    { text: '' },
  ]);
  const [correctOption, setCorrectOption] = useState(0);
  const [explanation, setExplanation] = useState('');
  const [difficulty, setDifficulty] = useState('Medium');
  const [topic, setTopic] = useState('');

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [examRes, qRes] = await Promise.all([
        examService.getExam(examId),
        questionService.getQuestions(examId),
      ]);
      if (examRes.success) setExam(examRes.exam);
      if (qRes.success) setQuestions(qRes.questions || []);
    } catch (err) {
      setError(err.message || 'Failed to load exam questions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [examId]);

  const openAddModal = () => {
    setEditingQuestion(null);
    setQuestionText('');
    setImageUrl('');
    setOptions([{ text: '' }, { text: '' }, { text: '' }, { text: '' }]);
    setCorrectOption(0);
    setExplanation('');
    setDifficulty('Medium');
    setTopic('');
    setModalOpen(true);
  };

  const openEditModal = (q) => {
    setEditingQuestion(q);
    setQuestionText(q.questionText);
    setImageUrl(q.imageUrl || '');
    setOptions(q.options.map((o) => ({ text: o.text })));
    setCorrectOption(q.correctOption ?? 0);
    setExplanation(q.explanation || '');
    setDifficulty(q.difficulty || 'Medium');
    setTopic(q.topic || '');
    setModalOpen(true);
  };

  const handleOptionChange = (idx, text) => {
    setOptions((prev) => {
      const next = [...prev];
      next[idx] = { text };
      return next;
    });
  };

  const addOption = () => {
    if (options.length < 6) {
      setOptions((prev) => [...prev, { text: '' }]);
    }
  };

  const removeOption = (idx) => {
    if (options.length > 2) {
      setOptions((prev) => prev.filter((_, i) => i !== idx));
      if (correctOption >= idx && correctOption > 0) {
        setCorrectOption((prev) => prev - 1);
      }
    }
  };

  const handleSaveQuestion = async (e) => {
    e.preventDefault();
    if (!questionText.trim()) {
      toast.error('Question text is required.');
      return;
    }
    const emptyOption = options.some((opt) => !opt.text.trim());
    if (emptyOption) {
      toast.error('All options must contain valid text.');
      return;
    }

    setSavingQuestion(true);
    const payload = {
      questionText: questionText.trim(),
      imageUrl: imageUrl.trim(),
      options: options.map((o) => ({ text: o.text.trim() })),
      correctOption,
      explanation: explanation.trim(),
      difficulty,
      topic: topic.trim(),
    };

    try {
      if (editingQuestion) {
        const res = await questionService.updateQuestion(editingQuestion._id, payload);
        toast.success('Question updated successfully!');
        setQuestions((prev) =>
          prev.map((q) => (q._id === editingQuestion._id ? res.question : q))
        );
      } else {
        const res = await questionService.createQuestion(examId, payload);
        toast.success('Question added successfully!');
        setQuestions((prev) => [...prev, res.question]);
      }
      setModalOpen(false);
    } catch (err) {
      toast.error(err.message || 'Failed to save question.');
    } finally {
      setSavingQuestion(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this question?')) return;
    try {
      await questionService.deleteQuestion(id);
      toast.success('Question deleted');
      setQuestions((prev) => prev.filter((q) => q._id !== id));
    } catch (err) {
      toast.error(err.message || 'Failed to delete question.');
    }
  };

  const handleDuplicate = async (id) => {
    try {
      const res = await questionService.duplicateQuestion(id);
      toast.success('Question duplicated');
      setQuestions((prev) => [...prev, res.question]);
    } catch (err) {
      toast.error(err.message || 'Failed to duplicate question.');
    }
  };

  const handleMove = async (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= questions.length) return;

    const newQuestions = [...questions];
    const temp = newQuestions[index];
    newQuestions[index] = newQuestions[targetIndex];
    newQuestions[targetIndex] = temp;

    setQuestions(newQuestions);

    try {
      await questionService.reorderQuestions(
        examId,
        newQuestions.map((q) => q._id)
      );
    } catch {
      toast.error('Failed to sync question order.');
    }
  };

  if (loading) {
    return <LoadingSpinner size="lg" text="Loading questions repository..." />;
  }

  if (error || !exam) {
    return <ErrorState message={error || 'Exam not found'} onRetry={fetchData} />;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            to="/admin/exams"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Exams</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Question Bank: {exam.title}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            {questions.length} Question{questions.length !== 1 ? 's' : ''} configured
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Question</span>
        </button>
      </div>

      {/* Questions List */}
      {questions.length === 0 ? (
        <EmptyState
          title="No questions in this examination"
          description="Click the Add Question button above to create multiple-choice items."
          actionText="Add First Question"
          onAction={openAddModal}
        />
      ) : (
        <div className="space-y-4">
          {questions.map((q, idx) => (
            <div
              key={q._id}
              className="p-5 sm:p-6 rounded-2xl glass-panel border border-slate-800/80 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
            >
              {/* Question overview */}
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs px-2.5 py-0.5 rounded-lg bg-indigo-500/15 text-indigo-300">
                    Q{idx + 1}
                  </span>
                  <span className="text-xs text-slate-400 font-medium px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
                    {q.topic || 'General'}
                  </span>
                  <span className="text-xs text-slate-400 font-semibold px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
                    {q.difficulty}
                  </span>
                </div>

                <p className="text-sm sm:text-base font-semibold text-white leading-relaxed">
                  {q.questionText}
                </p>

                {/* Options summary */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                  {q.options?.map((opt, oIdx) => (
                    <div
                      key={oIdx}
                      className={`px-3 py-1.5 rounded-lg text-xs flex items-center gap-2 ${
                        oIdx === q.correctOption
                          ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-medium'
                          : 'bg-slate-900 text-slate-400 border border-slate-800'
                      }`}
                    >
                      <span className="font-bold">{String.fromCharCode(65 + oIdx)}.</span>
                      <span className="truncate">{opt.text}</span>
                      {oIdx === q.correctOption && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 ml-auto flex-shrink-0" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="flex items-center gap-1.5 self-end md:self-center border-t md:border-t-0 pt-3 md:pt-0 border-slate-800 w-full md:w-auto justify-end">
                {/* Reorder Buttons */}
                <button
                  disabled={idx === 0}
                  onClick={() => handleMove(idx, -1)}
                  className="p-1.5 rounded-lg bg-slate-900 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed border border-slate-800"
                  title="Move Up"
                >
                  <ChevronUp className="w-4 h-4" />
                </button>
                <button
                  disabled={idx === questions.length - 1}
                  onClick={() => handleMove(idx, 1)}
                  className="p-1.5 rounded-lg bg-slate-900 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed border border-slate-800"
                  title="Move Down"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>

                {/* Duplicate */}
                <button
                  onClick={() => handleDuplicate(q._id)}
                  className="p-1.5 rounded-lg bg-slate-900 text-slate-400 hover:text-indigo-400 border border-slate-800"
                  title="Duplicate Question"
                >
                  <Copy className="w-4 h-4" />
                </button>

                {/* Edit */}
                <button
                  onClick={() => openEditModal(q)}
                  className="p-1.5 rounded-lg bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
                  title="Edit Question"
                >
                  <Edit className="w-4 h-4" />
                </button>

                {/* Delete */}
                <button
                  onClick={() => handleDelete(q._id)}
                  className="p-1.5 rounded-lg bg-slate-900 text-slate-400 hover:text-rose-400 border border-slate-800"
                  title="Delete Question"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Question Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl glass-panel border border-slate-800 shadow-2xl p-6 sm:p-8 space-y-6 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white">
                {editingQuestion ? 'Edit Question' : 'Add New Question'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveQuestion} className="space-y-4">
              {/* Question Text */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Question Text *
                </label>
                <textarea
                  rows={3}
                  required
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  placeholder="Enter the MCQ question statement..."
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-y"
                />
              </div>

              {/* Optional Image URL */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Optional Image URL
                </label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-4 py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Topic & Difficulty */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Topic / Sub-topic
                  </label>
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g. Memory, Scheduling"
                    className="w-full px-4 py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Difficulty
                  </label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
              </div>

              {/* Options Section */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-slate-300">
                    Options & Correct Answer Selection *
                  </label>
                  {options.length < 6 && (
                    <button
                      type="button"
                      onClick={addOption}
                      className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 cursor-pointer"
                    >
                      + Add Option
                    </button>
                  )}
                </div>

                <div className="space-y-2.5">
                  {options.map((opt, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setCorrectOption(idx)}
                        className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs flex-shrink-0 cursor-pointer transition-all ${
                          correctOption === idx
                            ? 'bg-emerald-600 text-white shadow-md'
                            : 'bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700'
                        }`}
                        title="Click to set as correct answer"
                      >
                        {String.fromCharCode(65 + idx)}
                      </button>

                      <input
                        type="text"
                        required
                        value={opt.text}
                        onChange={(e) => handleOptionChange(idx, e.target.value)}
                        placeholder={`Option ${String.fromCharCode(65 + idx)} text`}
                        className={`w-full px-3.5 py-2 rounded-xl bg-slate-900/80 border text-xs text-white placeholder-slate-500 focus:outline-none transition-all ${
                          correctOption === idx
                            ? 'border-emerald-500/60 ring-1 ring-emerald-500/40'
                            : 'border-slate-800 focus:border-indigo-500'
                        }`}
                      />

                      {options.length > 2 && (
                        <button
                          type="button"
                          onClick={() => removeOption(idx)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <p className="text-[11px] text-slate-500">
                  Click on the option letter button to toggle which option is verified correct (marked in green).
                </p>
              </div>

              {/* Explanation */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Explanation (Shown on result review)
                </label>
                <textarea
                  rows={2}
                  value={explanation}
                  onChange={(e) => setExplanation(e.target.value)}
                  placeholder="Provide step-by-step logic or source justification..."
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-y"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingQuestion}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
                >
                  {savingQuestion ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Question'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
