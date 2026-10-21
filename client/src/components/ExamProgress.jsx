import React from 'react';

export default function ExamProgress({ total, answered }) {
  const percentage = total > 0 ? Math.round((answered / total) * 100) : 0;

  return (
    <div className="space-y-1.5 w-full">
      <div className="flex items-center justify-between text-xs font-semibold">
        <span className="text-slate-400">Completion</span>
        <span className="text-indigo-400">
          {answered} of {total} ({percentage}%)
        </span>
      </div>
      <div className="w-full h-2 rounded-full bg-slate-900 border border-slate-800 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-indigo-400 to-cyan-400 transition-all duration-300 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
