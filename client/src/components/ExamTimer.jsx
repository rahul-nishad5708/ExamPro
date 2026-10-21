import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';

export default function ExamTimer({ expiresAt, onTimeUp }) {
  const [timeLeft, setTimeLeft] = useState(() => {
    const diff = Math.max(0, new Date(expiresAt).getTime() - Date.now());
    return Math.floor(diff / 1000);
  });

  useEffect(() => {
    const targetTime = new Date(expiresAt).getTime();

    const interval = setInterval(() => {
      const now = Date.now();
      const diff = Math.max(0, targetTime - now);
      const secondsRemaining = Math.floor(diff / 1000);

      setTimeLeft(secondsRemaining);

      if (secondsRemaining <= 0) {
        clearInterval(interval);
        if (onTimeUp) onTimeUp();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt, onTimeUp]);

  const hours = Math.floor(timeLeft / 3600);
  const minutes = Math.floor((timeLeft % 3600) / 60);
  const seconds = timeLeft % 60;

  const pad = (n) => String(n).padStart(2, '0');

  const isUrgent = timeLeft < 300; // < 5 mins
  const isWarning = timeLeft < 600 && !isUrgent; // < 10 mins

  return (
    <div
      className={`flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl border transition-all select-none ${
        isUrgent
          ? 'bg-rose-500/15 border-rose-500/30 text-rose-300 animate-pulse'
          : isWarning
          ? 'bg-amber-500/15 border-amber-500/30 text-amber-300'
          : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-200'
      }`}
    >
      {isUrgent ? (
        <AlertTriangle className="w-4 h-4 text-rose-400 animate-bounce" />
      ) : (
        <Clock className="w-4 h-4 text-indigo-400" />
      )}
      <div className="flex flex-col">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
          Time Remaining
        </span>
        <span className="font-mono text-sm sm:text-base font-bold tracking-tight text-white">
          {hours > 0 ? `${pad(hours)}:` : ''}
          {pad(minutes)}:{pad(seconds)}
        </span>
      </div>
    </div>
  );
}
