import React from 'react';
import {
  CheckCircle2,
  XCircle,
  HelpCircle,
  Clock,
  Award,
  TrendingUp,
  Percent,
} from 'lucide-react';

export default function ResultSummary({ attempt, exam }) {
  const isPassed = attempt?.passed;

  const formatTime = (seconds) => {
    if (!seconds && seconds !== 0) return '0m 0s';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="space-y-6">
      {/* Top Pass / Fail Banner */}
      <div
        className={`p-6 sm:p-8 rounded-3xl border shadow-xl relative overflow-hidden ${
          isPassed
            ? 'bg-gradient-to-r from-emerald-950/40 via-emerald-900/20 to-slate-900 border-emerald-500/30'
            : 'bg-gradient-to-r from-rose-950/40 via-rose-900/20 to-slate-900 border-rose-500/30'
        }`}
      >
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div
              className={`w-16 h-16 rounded-2xl flex items-center justify-center font-bold text-2xl shadow-lg ${
                isPassed
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-emerald-500/10'
                  : 'bg-rose-500/20 text-rose-400 border border-rose-500/30 shadow-rose-500/10'
              }`}
            >
              {isPassed ? <CheckCircle2 className="w-9 h-9" /> : <XCircle className="w-9 h-9" />}
            </div>
            <div>
              <span
                className={`inline-block px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider mb-1 ${
                  isPassed
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                }`}
              >
                {isPassed ? 'Exam Passed' : 'Needs Improvement'}
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                {isPassed ? 'Congratulations!' : 'Better Luck Next Time!'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                {isPassed
                  ? `You achieved ${attempt?.percentage}% score which surpasses the required passing criteria (${exam?.passingPercentage}%).`
                  : `You achieved ${attempt?.percentage}% score. The passing threshold is ${exam?.passingPercentage}%.`}
              </p>
            </div>
          </div>

          {/* Big Score Badge */}
          <div className="flex items-baseline gap-2 bg-slate-900/80 px-6 py-4 rounded-2xl border border-slate-800 self-stretch md:self-auto justify-center">
            <span className="text-4xl sm:text-5xl font-black bg-gradient-to-r from-white via-indigo-200 to-indigo-400 bg-clip-text text-transparent">
              {attempt?.score}
            </span>
            <span className="text-sm font-semibold text-slate-400">
              / {attempt?.maximumMarks} Marks
            </span>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Percentage */}
        <div className="p-5 rounded-2xl glass-panel border border-slate-800/80 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Percent className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400">Percentage</p>
            <p className="text-xl font-bold text-white">{attempt?.percentage}%</p>
          </div>
        </div>

        {/* Correct */}
        <div className="p-5 rounded-2xl glass-panel border border-slate-800/80 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400">Correct Answers</p>
            <p className="text-xl font-bold text-emerald-400">{attempt?.correctCount}</p>
          </div>
        </div>

        {/* Incorrect */}
        <div className="p-5 rounded-2xl glass-panel border border-slate-800/80 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
            <XCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400">Incorrect Answers</p>
            <p className="text-xl font-bold text-rose-400">{attempt?.incorrectCount}</p>
          </div>
        </div>

        {/* Time Taken */}
        <div className="p-5 rounded-2xl glass-panel border border-slate-800/80 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400">Time Taken</p>
            <p className="text-xl font-bold text-white">
              {formatTime(attempt?.timeTakenSeconds)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
