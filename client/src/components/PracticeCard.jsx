import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Sparkles, Clock, ArrowRight, ShieldCheck, Zap } from 'lucide-react';

export default function PracticeCard({ test }) {
  const getDifficultyColor = (diff) => {
    switch (diff?.toLowerCase()) {
      case 'easy':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'hard':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      case 'medium':
      default:
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    }
  };

  return (
    <div className="p-6 rounded-2xl glass-panel border border-slate-800/80 glass-card-hover flex flex-col justify-between group h-full">
      <div className="space-y-4">
        {/* Top Badges */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/25">
            {test.subject}
          </span>
          <div className="flex items-center gap-1.5">
            <span
              className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${getDifficultyColor(
                test.difficulty
              )}`}
            >
              {test.difficulty || 'Medium'}
            </span>
          </div>
        </div>

        {/* Title & Description */}
        <div>
          <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-indigo-300 transition-colors line-clamp-2">
            {test.title}
          </h3>
          <p className="text-xs text-slate-400 line-clamp-2 mt-1.5 leading-relaxed">
            {test.description || 'Test your proficiency with real-time feedback and in-depth explanations.'}
          </p>
        </div>

        {/* Topic Tags */}
        {test.topics && test.topics.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {test.topics.slice(0, 3).map((topic, i) => (
              <span
                key={i}
                className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-900 text-slate-400 border border-slate-800"
              >
                #{topic}
              </span>
            ))}
            {test.topics.length > 3 && (
              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-slate-900 text-slate-500">
                +{test.topics.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Metadata Details */}
        <div className="pt-3 border-t border-slate-800/80 grid grid-cols-2 gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
            <span>{test.totalQuestions || test.questions?.length || 0} Questions</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Instant Feedback</span>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-5 mt-4">
        <Link
          to={`/practice-tests/${test._id}`}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold bg-indigo-600/90 hover:bg-indigo-600 text-white shadow-md shadow-indigo-600/20 group-hover:shadow-indigo-600/30 transition-all cursor-pointer"
        >
          <span>Start Practice</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  );
}
