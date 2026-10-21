import React from 'react';

export default function SkeletonLoader({ count = 3, type = 'card' }) {
  if (type === 'card') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 animate-pulse space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="h-6 w-24 bg-slate-800 rounded-lg"></div>
              <div className="h-5 w-16 bg-slate-800 rounded-full"></div>
            </div>
            <div className="h-6 w-3/4 bg-slate-800 rounded-lg"></div>
            <div className="space-y-2">
              <div className="h-4 w-full bg-slate-800/60 rounded"></div>
              <div className="h-4 w-2/3 bg-slate-800/60 rounded"></div>
            </div>
            <div className="pt-4 border-t border-slate-800/60 flex items-center justify-between">
              <div className="h-4 w-20 bg-slate-800 rounded"></div>
              <div className="h-9 w-28 bg-indigo-900/30 rounded-xl"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="h-16 w-full bg-slate-900/60 border border-slate-800 rounded-xl animate-pulse"
        ></div>
      ))}
    </div>
  );
}
