import React from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';

export default function ErrorState({
  title = 'Something went wrong',
  message = 'Failed to load data. Please check your connection and try again.',
  onRetry,
}) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl glass-panel-subtle border border-red-500/20 bg-red-950/10">
      <div className="w-16 h-16 mb-4 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-400">
        <AlertCircle className="w-8 h-8" />
      </div>
      <h3 className="text-lg font-bold text-white mb-1">{title}</h3>
      <p className="text-sm text-slate-400 max-w-sm mb-6">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          Try Again
        </button>
      )}
    </div>
  );
}
