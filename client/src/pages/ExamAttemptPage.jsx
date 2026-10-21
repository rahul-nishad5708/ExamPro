import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { attemptService } from '../services/attemptService';
import { useAuth } from '../context/AuthContext';
import ExamTimer from '../components/ExamTimer';
import QuestionCard from '../components/QuestionCard';
import QuestionPalette from '../components/QuestionPalette';
import ExamProgress from '../components/ExamProgress';
import SubmitConfirmationModal from '../components/SubmitConfirmationModal';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorState from '../components/ErrorState';
import Logo from '../components/Logo';
import { ChevronLeft, ChevronRight, Send, AlertTriangle } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function ExamAttemptPage() {
  const { id: examId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [attempt, setAttempt] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState([]); // [{ questionId, selectedOption, isMarkedForReview }]
  const [visitedIndices, setVisitedIndices] = useState(new Set([0]));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Submission modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Debounced save ref
  const saveTimeoutRef = useRef(null);
  const isSubmittedRef = useRef(false);

  // Initialize or resume attempt
  useEffect(() => {
    let isMounted = true;

    const initExam = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await attemptService.startAttempt(examId);
        if (!isMounted) return;

        if (res.success && res.attempt) {
          setAttempt(res.attempt);
          setQuestions(res.questions || []);
          setAnswers(res.attempt.answers || []);
          const startIdx = res.attempt.currentQuestionIndex || 0;
          setCurrentIndex(startIdx);
          setVisitedIndices(new Set([startIdx]));

          // Check if already expired
          if (new Date() >= new Date(res.attempt.expiresAt)) {
            toast.error('This exam time has expired.');
            handleAutoSubmit(res.attempt._id);
          }
        }
      } catch (err) {
        if (!isMounted) return;
        setError(err.message || 'Unable to launch examination.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    initExam();

    return () => {
      isMounted = false;
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [examId]);

  // Debounced answer saver to persistent MongoDB
  const persistAnswers = useCallback(
    (currentAnswers, currentIdx) => {
      if (!attempt?._id || isSubmittedRef.current) return;

      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      saveTimeoutRef.current = setTimeout(async () => {
        try {
          await attemptService.saveAnswers(attempt._id, {
            answers: currentAnswers,
            currentQuestionIndex: currentIdx,
          });
        } catch (err) {
          console.error('Failed to auto-save answers:', err.message);
        }
      }, 1000);
    },
    [attempt?._id]
  );

  // Update current question index & mark as visited
  const handleSelectIndex = (idx) => {
    if (idx < 0 || idx >= questions.length) return;
    setCurrentIndex(idx);
    setVisitedIndices((prev) => new Set([...prev, idx]));
    persistAnswers(answers, idx);
  };

  // Option selection
  const handleSelectOption = (optionIndex) => {
    const currentQ = questions[currentIndex];
    if (!currentQ) return;

    setAnswers((prev) => {
      const next = prev.map((a) => {
        if (a.questionId?.toString() === currentQ._id?.toString()) {
          return { ...a, selectedOption: optionIndex };
        }
        return a;
      });
      persistAnswers(next, currentIndex);
      return next;
    });
  };

  // Clear answer
  const handleClearAnswer = () => {
    const currentQ = questions[currentIndex];
    if (!currentQ) return;

    setAnswers((prev) => {
      const next = prev.map((a) => {
        if (a.questionId?.toString() === currentQ._id?.toString()) {
          return { ...a, selectedOption: null };
        }
        return a;
      });
      persistAnswers(next, currentIndex);
      return next;
    });
  };

  // Toggle review flag
  const handleToggleReview = () => {
    const currentQ = questions[currentIndex];
    if (!currentQ) return;

    setAnswers((prev) => {
      const next = prev.map((a) => {
        if (a.questionId?.toString() === currentQ._id?.toString()) {
          return { ...a, isMarkedForReview: !a.isMarkedForReview };
        }
        return a;
      });
      persistAnswers(next, currentIndex);
      return next;
    });
  };

  // Auto-submit when countdown hits zero
  const handleAutoSubmit = async (attemptIdToUse) => {
    const targetId = attemptIdToUse || attempt?._id;
    if (!targetId || isSubmittedRef.current) return;
    isSubmittedRef.current = true;

    try {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      toast('Time is up! Automatically submitting exam...', { icon: '⏰' });

      const res = await attemptService.submitAttempt(targetId, { answers });
      if (res.success) {
        toast.success('Exam submitted successfully!');
        navigate(`/results/${targetId}`, { replace: true });
      }
    } catch (err) {
      toast.error(err.message || 'Error auto-submitting exam.');
      navigate('/results', { replace: true });
    }
  };

  // Manual submit action
  const handleManualSubmit = async () => {
    if (!attempt?._id || isSubmittedRef.current) return;
    setIsSubmitting(true);
    isSubmittedRef.current = true;

    try {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

      const res = await attemptService.submitAttempt(attempt._id, { answers });
      if (res.success) {
        toast.success('Exam submitted and graded successfully!');
        setIsModalOpen(false);
        navigate(`/results/${attempt._id}`, { replace: true });
      }
    } catch (err) {
      setIsSubmitting(false);
      isSubmittedRef.current = false;
      toast.error(err.message || 'Submission failed. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <LoadingSpinner size="lg" text="Restoring examination session..." />
      </div>
    );
  }

  if (error || !attempt) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
        <ErrorState
          title="Could Not Start Examination"
          message={error || 'An unexpected error occurred.'}
          onRetry={() => navigate('/exams')}
        />
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const currentAnswer = answers.find(
    (a) => a.questionId?.toString() === currentQuestion?._id?.toString()
  );

  // Calculate live counts
  const answeredCount = answers.filter(
    (a) => a.selectedOption !== null && a.selectedOption !== undefined
  ).length;
  const markedCount = answers.filter((a) => a.isMarkedForReview).length;
  const unansweredCount = questions.length - answeredCount;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Top Examination Control Bar */}
      <header className="sticky top-0 z-40 glass-panel border-b border-slate-800 bg-slate-950/90 px-4 sm:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Logo size="sm" link={false} />
          <div className="hidden md:block pl-4 border-l border-slate-800">
            <h1 className="text-xs sm:text-sm font-bold text-white line-clamp-1">
              Candidate: <span className="text-indigo-400">{user?.name}</span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Synchronized Server Countdown Timer */}
          <ExamTimer
            expiresAt={attempt.expiresAt}
            onTimeUp={() => handleAutoSubmit(attempt._id)}
          />

          {/* Submit Exam Button */}
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
          >
            <span>Submit Exam</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column: Question Area */}
        <div className="lg:col-span-3 space-y-6 flex flex-col justify-between">
          <div>
            {/* Top Progress bar */}
            <div className="mb-6">
              <ExamProgress total={questions.length} answered={answeredCount} />
            </div>

            {/* Question Card */}
            {currentQuestion ? (
              <QuestionCard
                question={currentQuestion}
                questionNumber={currentIndex + 1}
                totalQuestions={questions.length}
                selectedOption={currentAnswer?.selectedOption}
                isMarkedForReview={currentAnswer?.isMarkedForReview}
                onSelectOption={handleSelectOption}
                onClearAnswer={handleClearAnswer}
                onToggleReview={handleToggleReview}
              />
            ) : (
              <div className="p-8 text-center text-slate-400">Question not available</div>
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between pt-4">
            <button
              type="button"
              disabled={currentIndex <= 0}
              onClick={() => handleSelectIndex(currentIndex - 1)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous Question</span>
            </button>

            {currentIndex < questions.length - 1 ? (
              <button
                type="button"
                onClick={() => handleSelectIndex(currentIndex + 1)}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/25 transition-all cursor-pointer"
              >
                <span>Next Question</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/25 transition-all cursor-pointer"
              >
                <span>Review & Finish</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Right Column: Question Palette */}
        <div className="lg:col-span-1 space-y-6">
          <QuestionPalette
            questions={questions}
            answers={answers}
            currentIndex={currentIndex}
            onSelectIndex={handleSelectIndex}
            visitedIndices={visitedIndices}
          />
        </div>
      </div>

      {/* Confirmation Modal */}
      <SubmitConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleManualSubmit}
        isSubmitting={isSubmitting}
        stats={{
          total: questions.length,
          answered: answeredCount,
          unanswered: unansweredCount,
          marked: markedCount,
        }}
      />
    </div>
  );
}
