import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, GraduationCap } from 'lucide-react';

export default function Logo({ size = 'md', link = true }) {
  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  const content = (
    <div className="flex items-center gap-2.5 font-bold tracking-tight select-none group">
      <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-200">
        <GraduationCap className="w-5 h-5 text-white" />
        <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
        </span>
      </div>
      <div className="flex items-baseline">
        <span className={`${sizeClasses[size]} font-extrabold bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent`}>
          Exam
        </span>
        <span className={`${sizeClasses[size]} font-extrabold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent`}>
          Pro
        </span>
        <span className="ml-1 text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
          v2.0
        </span>
      </div>
    </div>
  );

  if (link) {
    return <Link to="/">{content}</Link>;
  }

  return content;
}
