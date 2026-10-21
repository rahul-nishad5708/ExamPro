import React from 'react';
import { Bookmark, CheckCircle, Circle, HelpCircle } from 'lucide-react';

export default function QuestionPalette({
  questions = [],
  answers = [],
  currentIndex,
  onSelectIndex,
  visitedIndices = new Set(),
}) {
  const getStatus = (index) => {
    const qId = questions[index]?._id;
    const answer = answers.find(
      (a) => a.questionId?.toString() === qId?.toString()
    );

    const isAnswered =
      answer && answer.selectedOption !== null && answer.selectedOption !== undefined;
    const isMarked = answer?.isMarkedForReview;

    if (isMarked && isAnswered) return 'marked-answered';
    if (isMarked) return 'marked';
    if (isAnswered) return 'answered';
    if (visitedIndices.has(index)) return 'unanswered';
    return 'not-visited';
  };

  const counts = {
    answered: 0,
    unanswered: 0,
    marked: 0,
    notVisited: 0,
  };

  questions.forEach((_, idx) => {
    const st = getStatus(idx);
    if (st === 'answered' || st === 'marked-answered') counts.answered++;
    if (st === 'marked' || st === 'marked-answered') counts.marked++;
    if (st === 'unanswered') counts.unanswered++;
    if (st === 'not-visited') counts.notVisited++;
  });

  const getButtonStyles = (index) => {
    const isCurrent = index === currentIndex;
    const status = getStatus(index);

    let base =
      'w-9 h-9 rounded-xl font-bold text-xs flex items-center justify-center transition-all cursor-pointer relative ';

    if (isCurrent) {
      base += 'ring-2 ring-indigo-400 ring-offset-2 ring-offset-slate-950 scale-105 z-10 ';
    }

    switch (status) {
      case 'answered':
        return base + 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30';
      case 'marked-answered':
        return (
          base +
          'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
        );
      case 'marked':
        return (
          base +
          'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
        );
      case 'unanswered':
        return (
          base +
          'bg-rose-500/10 text-rose-300 border border-rose-500/30 hover:bg-rose-500/20'
        );
      default:
        return (
          base +
          'bg-slate-900 text-slate-400 border border-slate-800 hover:bg-slate-800 hover:text-slate-200'
        );
    }
  };

  return (
    <div className="p-5 rounded-2xl glass-panel border border-slate-800/80 shadow-xl space-y-5">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
        <h3 className="text-sm font-bold text-white tracking-wide">
          Question Palette
        </h3>
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
          Total: {questions.length}
        </span>
      </div>

      {/* Grid of question buttons */}
      <div className="grid grid-cols-5 gap-2.5 max-h-64 overflow-y-auto p-1">
        {questions.map((q, idx) => {
          const st = getStatus(idx);
          const isMarked = st === 'marked' || st === 'marked-answered';
          return (
            <button
              key={q._id || idx}
              type="button"
              onClick={() => onSelectIndex(idx)}
              className={getButtonStyles(idx)}
              title={`Question ${idx + 1}`}
            >
              {idx + 1}
              {isMarked && (
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-400 ring-2 ring-slate-950" />
              )}
            </button>
          );
        })}
      </div>

      {/* Legend & Stats */}
      <div className="pt-3 border-t border-slate-800/80 space-y-2 text-xs">
        <div className="grid grid-cols-2 gap-2 text-[11px]">
          <div className="flex items-center gap-2 text-slate-300">
            <span className="w-3 h-3 rounded bg-emerald-500/20 border border-emerald-500/40" />
            <span>Answered ({counts.answered})</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <span className="w-3 h-3 rounded bg-rose-500/15 border border-rose-500/30" />
            <span>Unanswered ({counts.unanswered})</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <span className="w-3 h-3 rounded bg-amber-500/20 border border-amber-500/40" />
            <span>Review ({counts.marked})</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <span className="w-3 h-3 rounded bg-slate-900 border border-slate-800" />
            <span>Not Visited ({counts.notVisited})</span>
          </div>
        </div>
      </div>
    </div>
  );
}
