import React from 'react';
import { FolderOpen, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function EmptyState({
  title = 'No items found',
  description = 'There are no records to display at this time.',
  actionText,
  actionLink,
  onAction,
  icon: Icon = FolderOpen,
}) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl glass-panel-subtle border border-dashed border-slate-800">
      <div className="w-16 h-16 mb-4 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-lg font-bold text-white mb-1">{title}</h3>
      <p className="text-sm text-slate-400 max-w-sm mb-6">{description}</p>
      {actionText && actionLink && (
        <Link
          to={actionLink}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/25 transition-all"
        >
          {actionText}
          <ArrowRight className="w-4 h-4" />
        </Link>
      )}
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/25 transition-all cursor-pointer"
        >
          {actionText}
        </button>
      )}
    </div>
  );
}
