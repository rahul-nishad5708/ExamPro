import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, HelpCircle, Award, ArrowRight, CheckCircle2, AlertTriangle } from 'lucide-react';

export default function ExamCard({ exam, attemptCount = 0 }) {
  const difficultyColors = {
    Easy: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    Medium: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    Hard: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  };

  const isMaxAttemptsReached =
    exam.maxAttempts && attemptCount >= exam.maxAttempts;

  return (
    <div className="flex flex-col justify-between p-6 rounded-2xl glass-panel glass-card-hover border border-slate-800/80 group">
      <div>
        {/* Top badges */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
            {exam.category}
          </span>
          <span
            className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
              difficultyColors[exam.difficulty] || difficultyColors.Medium
            }`}
          >
            {exam.difficulty}
          </span>
        </div>

        {/* Title & Description */}
        <h3 className="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors line-clamp-1 mb-2">
          {exam.title}
        </h3>
        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-4">
          {exam.description}
        </p>

        {/* Exam Specifications */}
        <div className="grid grid-cols-2 gap-2 py-3 px-3.5 rounded-xl bg-slate-900/50 border border-slate-800/60 mb-5 text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-indigo-400" />
            <span>{exam.durationMinutes} mins</span>
          </div>
          <div className="flex items-center gap-2">
            <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
            <span>{exam.totalQuestions} questions</span>
          </div>
          <div className="flex items-center gap-2">
            <Award className="w-3.5 h-3.5 text-amber-400" />
            <span>Pass: {exam.passingPercentage}%</span>
          </div>
          <div className="flex items-center gap-2">
            {exam.negativeMarks > 0 ? (
              <span className="text-rose-400 font-medium">-{exam.negativeMarks} neg</span>
            ) : (
              <span className="text-emerald-400 font-medium">No negative</span>
            )}
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
        <div className="text-[11px] text-slate-400">
          Attempts: <span className="font-semibold text-slate-300">{attemptCount}</span> / {exam.maxAttempts || '∞'}
        </div>

        {isMaxAttemptsReached ? (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-800 text-slate-400 cursor-not-allowed">
            <AlertTriangle className="w-3.5 h-3.5" /> Max Reached
          </span>
        ) : (
          <Link
            to={`/exams/${exam._id}/instructions`}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-md shadow-indigo-600/20 transition-all transform hover:-translate-y-0.5"
          >
            <span>Take Exam</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>
    </div>
  );
}
