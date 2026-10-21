import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { practiceService } from '../services/practiceService';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorState from '../components/ErrorState';
import {
  Sparkles,
  Zap,
  CheckCircle2,
  Lock,
  ArrowRight,
  ChevronLeft,
  User,
  RotateCcw,
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function PracticeTestInstructionsPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [test, setTest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    const fetchTest = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await practiceService.getPracticeTest(id);
        if (res.success && res.practiceTest) {
          setTest(res.practiceTest);
        }
      } catch (err) {
        setError(err.message || 'Failed to load practice test details.');
      } finally {
        setLoading(false);
      }
    };

    fetchTest();
  }, [id]);

  const handleStartPractice = async (retry = false) => {
    setStarting(true);
    try {
      const res = await practiceService.startPracticeAttempt(id, retry);
      if (res.success && res.attempt) {
        navigate(`/practice-tests/${id}/attempt`);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to initialize practice session.');
    } finally {
      setStarting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner size="lg" text="Loading practice test instructions..." />;
  }

  if (error || !test) {
    return <ErrorState message={error || 'Practice test not found'} onRetry={() => window.location.reload()} />;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Back button */}
      <Link
        to="/practice-tests"
        className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        <span>Back to Practice Tests</span>
      </Link>

      {/* Hero Card */}
      <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-violet-500/20 bg-gradient-to-r from-violet-950/30 via-slate-900 to-indigo-950/20 relative overflow-hidden">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30">
              {test.subject}
            </span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
              {test.difficulty || 'Medium'} Difficulty
            </span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
              Instant Feedback Active
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            {test.title}
          </h1>

          <p className="text-sm text-slate-400 leading-relaxed max-w-2xl">
            {test.description ||
              'Enhance your knowledge and prepare for examinations through interactive practice questions with immediate explanations.'}
          </p>

          {/* Student Identity Tag */}
          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <User className="w-4 h-4" />
            </div>
            <div className="text-xs">
              <p className="text-slate-400">Practicing as Candidate:</p>
              <p className="font-bold text-white">{user?.name} (Session Active)</p>
            </div>
          </div>
        </div>
      </div>

      {/* Key Specifications & Rules */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Specification Stats */}
        <div className="p-6 rounded-2xl glass-panel border border-slate-800/80 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Test Overview
          </h3>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-slate-400">Total Questions</span>
              <span className="font-bold text-white">
                {test.totalQuestions || test.questions?.length || 0} Questions
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-slate-400">Points per Correct Answer</span>
              <span className="font-bold text-emerald-400">
                +{test.marksPerQuestion || 1} mark(s)
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-slate-400">Negative Marking</span>
              <span className="font-bold text-rose-400">
                {test.negativeMarks > 0 ? `-${test.negativeMarks} marks` : 'None (0 marks)'}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-slate-400">Answer Change Policy</span>
              <span className="font-bold text-indigo-300">
                {test.allowChangeAnswer ? 'Modifications Allowed' : 'Locked on First Selection'}
              </span>
            </div>
          </div>
        </div>

        {/* Practice Instructions */}
        <div className="p-6 rounded-2xl glass-panel border border-slate-800/80 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            <span>Practice Mode Mechanics</span>
          </h3>

          <ul className="space-y-3 text-xs text-slate-300">
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <span>
                <strong>Instant Right/Wrong Validation:</strong> Selecting any option evaluates your choice through the backend in real time.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
              <span>
                <strong>Answer & Explanation Reveal:</strong> Green reveals the correct option and detailed explanations help you understand the concept.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <Lock className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
              <span>
                <strong>Anti-Cheat Score Locking:</strong> First selections are verified and locked to preserve accurate performance tracking.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <RotateCcw className="w-4 h-4 text-violet-400 flex-shrink-0 mt-0.5" />
              <span>
                <strong>Skip & Revisit:</strong> You can navigate between questions freely. Answers and explanations are preserved on page refresh.
              </span>
            </li>
          </ul>
        </div>
      </div>

      {/* Start Button Bar */}
      <div className="p-6 rounded-2xl glass-panel border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <p className="text-sm font-bold text-white">Ready to begin practicing?</p>
          <p className="text-xs text-slate-400">
            Your progress will be saved continuously to MongoDB.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            type="button"
            disabled={starting}
            onClick={() => handleStartPractice(false)}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-xs sm:text-sm bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-600/30 transition-all cursor-pointer disabled:opacity-60"
          >
            {starting ? (
              <span>Preparing Practice Session...</span>
            ) : (
              <>
                <span>Launch Practice Test</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
