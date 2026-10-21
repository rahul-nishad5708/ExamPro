import React from 'react';
import { CheckCircle2, XCircle, Circle } from 'lucide-react';

export default function PracticeQuestionPalette({
  questions = [],
  currentIndex = 0,
  onSelectIndex,
  stats = {},
}) {
  return (
    <div className="p-5 rounded-2xl glass-panel border border-slate-800/80 space-y-4">
      {/* Title */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
          Question Palette
        </h4>
        <span className="text-[11px] font-semibold text-slate-400">
          {questions.filter((q) => q.hasAnswered).length} / {questions.length} Answered
        </span>
      </div>

      {/* Grid of Question Numbers */}
      <div className="grid grid-cols-5 sm:grid-cols-6 lg:grid-cols-5 gap-2 max-h-60 overflow-y-auto pr-1">
        {questions.map((q, idx) => {
          const isCurrent = idx === currentIndex;
          const isAnswered = q.hasAnswered;
          const isCorrect = q.isCorrect;

          let btnColor = 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700';

          if (isAnswered) {
            if (isCorrect) {
              btnColor = 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold';
            } else {
              btnColor = 'bg-rose-500/20 border-rose-500 text-rose-300 font-bold';
            }
          }

          if (isCurrent) {
            btnColor += ' ring-2 ring-indigo-500 ring-offset-2 ring-offset-slate-950';
          }

          return (
            <button
              key={idx}
              type="button"
              onClick={() => onSelectIndex(idx)}
              className={`h-9 rounded-xl border text-xs font-semibold flex items-center justify-center transition-all cursor-pointer ${btnColor}`}
              title={`Question ${idx + 1}: ${
                isAnswered ? (isCorrect ? 'Correct' : 'Incorrect') : 'Unanswered'
              }`}
            >
              <span>{idx + 1}</span>
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="pt-3 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-[11px] text-slate-400">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <span>Correct ({stats.correctAnswers || 0})</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
          <span>Incorrect ({stats.incorrectAnswers || 0})</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-slate-700" />
          <span>Skipped ({stats.skippedQuestions || 0})</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full border border-indigo-400" />
          <span>Current</span>
        </div>
      </div>
    </div>
  );
}
