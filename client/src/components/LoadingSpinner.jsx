import React from 'react';
import { Loader2 } from 'lucide-react';

export default function LoadingSpinner({ size = 'md', text = 'Loading...' }) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 gap-3">
      <Loader2 className={`${sizes[size]} text-indigo-500 animate-spin`} />
      {text && <p className="text-sm text-slate-400 font-medium animate-pulse">{text}</p>}
    </div>
  );
}
