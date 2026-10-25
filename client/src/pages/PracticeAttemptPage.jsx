import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { practiceService } from '../services/practiceService';
import { useAuth } from '../context/AuthContext';
import PracticeOptionSelector from '../components/PracticeOptionSelector';
import PracticeQuestionPalette from '../components/PracticeQuestionPalette';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorState from '../components/ErrorState';
import {
  ChevronLeft,
  ChevronRight,
  Send,
  Sparkles,
  CheckCircle2,
  XCircle,
  Info,
  Award,
  Zap,
  Target,
  Loader2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';

export default function PracticeAttemptPage() {
  const { id: practiceTestId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [attempt, setAttempt] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [allowChangeAnswer, setAllowChangeAnswer] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Instant evaluation state
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluatingIndex, setEvaluatingIndex] = useState(null);
  const [pendingMSQSelections, setPendingMSQSelections] = useState({});

  // Live metrics summary
  const [stats, setStats] = useState({
    attemptedQuestions: 0,
    correctAnswers: 0,
    incorrectAnswers: 0,
    skippedQuestions: 0,
    totalScore: 0,
    accuracyPercentage: 0,
    totalQuestions: 0,
  });

  // Finish confirmation modal
  const [showFinishModal, setShowFinishModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize or resume practice attempt
  useEffect(() => {
    let isMounted = true;

    const initPractice = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await practiceService.startPracticeAttempt(practiceTestId, false);
        if (!isMounted) return;

        if (res.success && res.attempt) {
          setAttempt(res.attempt);
          setQuestions(res.questions || []);
          setAllowChangeAnswer(!!res.allowChangeAnswer);

          const startIdx = res.attempt.currentQuestionIndex || 0;
          setCurrentIndex(Math.min(startIdx, (res.questions?.length || 1) - 1));

          setStats({
            attemptedQuestions: res.attempt.attemptedQuestions || 0,
            correctAnswers: res.attempt.correctAnswers || 0,
            incorrectAnswers: res.attempt.incorrectAnswers || 0,
            skippedQuestions:
              res.attempt.skippedQuestions !== undefined
                ? res.attempt.skippedQuestions
                : (res.questions?.length || 0) - (res.attempt.attemptedQuestions || 0),
            totalScore: res.attempt.totalScore || 0,
            accuracyPercentage: res.attempt.accuracyPercentage || 0,
            totalQuestions: res.attempt.totalQuestions || res.questions?.length || 0,
          });
        }
      } catch (err) {
        if (!isMounted) return;
        setError(err.message || 'Unable to start practice session.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    initPractice();

    return () => {
      isMounted = false;
    };
  }, [practiceTestId]);

  // Handle option selection
  const handleSelectOption = async (optionIndex) => {
    if (!attempt?._id) return;
    const currentQ = questions[currentIndex];
    if (!currentQ) return;

    // Check if already answered and changing is locked
    if (currentQ.hasAnswered && !allowChangeAnswer) {
      toast('First selection is locked for this practice test.', {
        icon: '🔒',
      });
      return;
    }

    // For MSQ: toggle selection without immediately evaluating!
    if (currentQ.questionType === 'MSQ') {
      setPendingMSQSelections((prev) => {
        const list = prev[currentQ._id] ||
          (currentQ.hasAnswered && currentQ.selectedOptions ? [...currentQ.selectedOptions] : []);
        const nextList = list.includes(optionIndex)
          ? list.filter((i) => i !== optionIndex)
          : [...list, optionIndex].sort((a, b) => a - b);
        return { ...prev, [currentQ._id]: nextList };
      });
      return;
    }

    // For MCQ: immediate submit & evaluation
    setIsEvaluating(true);
    setEvaluatingIndex(optionIndex);

    try {
      const res = await practiceService.submitPracticeAnswer(attempt._id, {
        questionId: currentQ._id,
        selectedOption: optionIndex,
        currentQuestionIndex: currentIndex,
      });

      if (res.success) {
        const updatedQuestions = [...questions];
        updatedQuestions[currentIndex] = {
          ...currentQ,
          hasAnswered: true,
          selectedOption: optionIndex,
          selectedOptions: res.selectedOptions || [optionIndex],
          isCorrect: res.isCorrect,
          correctOption: res.correctOption,
          correctOptions: res.correctOptions,
          explanation: res.explanation || currentQ.explanation || '',
        };
        setQuestions(updatedQuestions);

        if (res.stats) {
          setStats(res.stats);
        }

        if (res.isCorrect) {
          toast.success('Correct Answer! 🎉', { duration: 2500 });
        } else {
          toast.error('Wrong Answer! Check the explanation below.', { duration: 3000 });
        }
      }
    } catch (err) {
      toast.error(err.message || 'Failed to submit answer.');
    } finally {
      setIsEvaluating(false);
      setEvaluatingIndex(null);
    }
  };

  // Explicit submit for MSQ questions
  const handleSubmitMSQ = async () => {
    if (!attempt?._id || isEvaluating) return;
    const currentQ = questions[currentIndex];
    if (!currentQ) return;

    const selections = pendingMSQSelections[currentQ._id] ||
      (currentQ.hasAnswered && currentQ.selectedOptions ? currentQ.selectedOptions : []);

    if (selections.length === 0) {
      toast.error('Please select at least one option before submitting.');
      return;
    }

    setIsEvaluating(true);

    try {
      const res = await practiceService.submitPracticeAnswer(attempt._id, {
        questionId: currentQ._id,
        selectedOptions: selections,
        currentQuestionIndex: currentIndex,
      });

      if (res.success) {
        const updatedQuestions = [...questions];
        updatedQuestions[currentIndex] = {
          ...currentQ,
          hasAnswered: true,
          selectedOption: res.selectedOption,
          selectedOptions: res.selectedOptions || selections,
          isCorrect: res.isCorrect,
          correctOption: res.correctOption,
          correctOptions: res.correctOptions,
          explanation: res.explanation || currentQ.explanation || '',
        };
        setQuestions(updatedQuestions);

        if (res.stats) {
          setStats(res.stats);
        }

        if (res.isCorrect) {
          toast.success('Correct Answer! All correct options selected! 🎉', { duration: 3000 });
        } else {
          toast.error('Wrong Answer! Not all correct options were selected.', { duration: 3500 });
        }
      }
    } catch (err) {
      toast.error(err.message || 'Failed to submit answer.');
    } finally {
      setIsEvaluating(false);
    }
  };

  // Navigation handlers
  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleJumpToIndex = (idx) => {
    if (idx >= 0 && idx < questions.length) {
      setCurrentIndex(idx);
    }
  };

  // Submit and finish practice attempt
  const handleFinalSubmit = async () => {
    if (!attempt?._id || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const res = await practiceService.submitPracticeAttempt(attempt._id);
      if (res.success && res.attempt) {
        toast.success('Practice test completed!');
        navigate(`/practice-results/${attempt._id}`);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to submit practice test.');
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner size="lg" text="Setting up practice session..." />;
  }

  if (error || !attempt) {
    return (
      <ErrorState
        message={error || 'Practice session failed to load.'}
        onRetry={() => window.location.reload()}
      />
    );
  }

  const currentQ = questions[currentIndex] || {};
  const progressPercent = questions.length > 0
    ? Math.round((questions.filter((q) => q.hasAnswered).length / questions.length) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Practice Header Bar */}
      <header className="sticky top-0 z-40 h-16 glass-panel border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl flex items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <Link
            to="/practice-tests"
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent hover:border-slate-800 transition-colors"
            title="Exit Practice"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-violet-500/15 text-violet-300 border border-violet-500/25">
                <Zap className="w-3 h-3 text-amber-400" />
                Practice Mode
              </span>
              <h1 className="text-xs sm:text-sm font-bold text-white line-clamp-1">
                {attempt.practiceTestTitle}
              </h1>
            </div>
            <p className="text-[10px] text-slate-400">
              Candidate: <span className="text-slate-200 font-medium">{user?.name}</span>
            </p>
          </div>
        </div>

        {/* Live Score & Metrics Indicators */}
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="hidden md:flex items-center gap-3 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
            <div className="flex items-center gap-1 text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span className="font-bold">{stats.correctAnswers}</span>
            </div>
            <div className="flex items-center gap-1 text-rose-400">
              <XCircle className="w-3.5 h-3.5" />
              <span className="font-bold">{stats.incorrectAnswers}</span>
            </div>
            <div className="w-px h-3 bg-slate-800" />
            <div className="text-slate-400">
              Score: <span className="font-bold text-indigo-300">{stats.totalScore}</span> pts
            </div>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-500/10 border border-indigo-500/25 text-xs text-indigo-300 font-bold">
            <Target className="w-3.5 h-3.5 text-cyan-400" />
            <span>{stats.accuracyPercentage}% Acc</span>
          </div>

          <button
            type="button"
            onClick={() => setShowFinishModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-violet-600 hover:bg-violet-500 text-white shadow-md shadow-violet-600/20 transition-all cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Finish Practice</span>
          </button>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="w-full bg-slate-900 h-1">
        <div
          className="h-1 bg-gradient-to-r from-violet-500 via-indigo-500 to-emerald-400 transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Main Practice Workspace */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Left 3 Columns: Active Question Card & Options */}
        <div className="lg:col-span-3 space-y-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQ._id || currentIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="p-6 sm:p-8 rounded-3xl glass-panel border border-slate-800/80 shadow-2xl relative"
            >
              {/* Question Header Meta */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-6 border-b border-slate-800/80">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-xl bg-violet-600/20 text-violet-300 font-extrabold text-xs border border-violet-500/30">
                    Question {currentIndex + 1} of {questions.length}
                  </span>
                  {currentQ.questionType === 'MSQ' && (
                    <span className="px-2.5 py-1 rounded-xl bg-amber-500/15 text-amber-300 font-extrabold text-xs border border-amber-500/30">
                      MSQ
                    </span>
                  )}
                  {currentQ.topic && (
                    <span className="text-xs text-slate-400 font-medium px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800">
                      #{currentQ.topic}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                    {currentQ.difficulty || 'Medium'}
                  </span>
                  <span className="text-xs font-semibold text-emerald-400 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                    +{currentQ.marks || 1} mark(s)
                  </span>
                </div>
              </div>

              {/* Question Text & Optional Image */}
              <div className="space-y-4 mb-8">
                <h2 className="text-base sm:text-lg font-bold text-slate-100 leading-relaxed">
                  {currentQ.questionText}
                  {currentQ.questionType === 'MSQ' && (
                    <span className="ml-2.5 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 align-middle">
                      (Select {currentQ.selectCount || 2} options)
                    </span>
                  )}
                </h2>

                {currentQ.imageUrl && (
                  <div className="rounded-2xl overflow-hidden border border-slate-800 max-h-80 flex items-center justify-center bg-slate-900">
                    <img
                      src={currentQ.imageUrl}
                      alt={`Question ${currentIndex + 1}`}
                      className="max-h-80 w-auto object-contain"
                    />
                  </div>
                )}
              </div>

              {/* Interactive Options with Instant Feedback */}
              <div className="mb-6">
                <PracticeOptionSelector
                  options={currentQ.options}
                  selectedOption={currentQ.selectedOption}
                  selectedOptions={
                    currentQ.hasAnswered
                      ? (currentQ.selectedOptions || (Array.isArray(currentQ.selectedOption) ? currentQ.selectedOption : (currentQ.selectedOption !== null && currentQ.selectedOption !== undefined ? [currentQ.selectedOption] : [])))
                      : (pendingMSQSelections[currentQ._id] || [])
                  }
                  correctOption={currentQ.correctOption}
                  correctOptions={currentQ.correctOptions}
                  isCorrect={currentQ.isCorrect}
                  hasAnswered={currentQ.hasAnswered}
                  isEvaluating={isEvaluating}
                  evaluatingIndex={evaluatingIndex}
                  onSelectOption={handleSelectOption}
                  disabled={isEvaluating}
                  questionType={currentQ.questionType || 'MCQ'}
                />

                {/* Explicit Submit button for MSQ questions */}
                {currentQ.questionType === 'MSQ' && (!currentQ.hasAnswered || allowChangeAnswer) && (
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-indigo-950/20 border border-indigo-500/30">
                    <div className="text-xs text-slate-300 flex items-center gap-2">
                      <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                        {(pendingMSQSelections[currentQ._id] || currentQ.selectedOptions || []).length} of {currentQ.selectCount || 2} selected
                      </span>
                      <span className="text-slate-400">
                        Select all {currentQ.selectCount || 2} correct options before checking answer
                      </span>
                    </div>
                    <button
                      type="button"
                      disabled={isEvaluating || (pendingMSQSelections[currentQ._id] || currentQ.selectedOptions || []).length === 0}
                      onClick={handleSubmitMSQ}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
                    >
                      {isEvaluating ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Evaluating...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Submit Answer</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>

              {/* Immediate Explanation Box (Revealed once answered) */}
              {currentQ.hasAnswered && currentQ.explanation && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  transition={{ duration: 0.3 }}
                  className="p-5 rounded-2xl bg-indigo-950/30 border border-indigo-500/30 mt-6 space-y-2 overflow-hidden"
                >
                  <div className="flex items-center gap-2 text-indigo-300 text-xs font-bold uppercase tracking-wider">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    <span>Explanation & Rationale</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                    {currentQ.explanation}
                  </p>
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Bottom Navigation Toolbar */}
          <div className="p-4 rounded-2xl glass-panel-subtle border border-slate-800 flex items-center justify-between gap-4">
            <button
              type="button"
              disabled={currentIndex === 0}
              onClick={handlePrev}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 border border-slate-800 hover:bg-slate-850 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="font-bold text-slate-200">{currentIndex + 1}</span>
              <span>/</span>
              <span>{questions.length}</span>
            </div>

            <div className="flex items-center gap-2">
              {currentIndex < questions.length - 1 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-violet-600 hover:bg-violet-500 shadow-md shadow-violet-600/20 transition-all cursor-pointer"
                >
                  <span>Next Question</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowFinishModal(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
                >
                  <span>Submit Practice</span>
                  <CheckCircle2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right 1 Column: Question Palette & Live Stats */}
        <div className="space-y-6">
          <PracticeQuestionPalette
            questions={questions}
            currentIndex={currentIndex}
            onSelectIndex={handleJumpToIndex}
            stats={stats}
          />

          {/* Quick Info Box */}
          <div className="p-5 rounded-2xl glass-panel-subtle border border-slate-800 text-xs text-slate-400 space-y-3">
            <div className="flex items-center gap-2 text-slate-300 font-bold">
              <Info className="w-4 h-4 text-cyan-400" />
              <span>Practice Guidelines</span>
            </div>
            <p className="leading-relaxed">
              Answers are evaluated immediately by the server. Your selections and revealed explanations
              are preserved automatically.
            </p>
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px]">
              <span>Change Answer Policy:</span>
              <span className="font-bold text-slate-300">
                {allowChangeAnswer ? 'Allowed' : 'Locked on Selection'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Submit Confirmation Modal */}
      {showFinishModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md p-6 rounded-3xl glass-panel border border-slate-800 bg-slate-950 shadow-2xl space-y-6">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-violet-600/20 text-violet-400 border border-violet-500/30 flex items-center justify-center mx-auto">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Complete Practice Test?</h3>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                Ready to review your complete question-by-question breakdown, accuracy percentage, and total score?
              </p>
            </div>

            {/* Quick Summary Grid */}
            <div className="grid grid-cols-3 gap-3 p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-center">
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-bold">Answered</p>
                <p className="text-base font-extrabold text-white mt-0.5">
                  {stats.attemptedQuestions} / {questions.length}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-bold">Correct</p>
                <p className="text-base font-extrabold text-emerald-400 mt-0.5">
                  {stats.correctAnswers}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-bold">Accuracy</p>
                <p className="text-base font-extrabold text-cyan-400 mt-0.5">
                  {stats.accuracyPercentage}%
                </p>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => setShowFinishModal(false)}
                className="flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800 transition-colors cursor-pointer"
              >
                Continue Practicing
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleFinalSubmit}
                className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-600/30 transition-all cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? 'Calculating Result...' : 'Yes, Complete Test'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
