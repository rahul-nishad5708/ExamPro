import React from 'react';
import { AlertCircle, CheckCircle2, Bookmark, HelpCircle, Loader2 } from 'lucide-react';

export default function SubmitConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  isSubmitting,
  stats = { total: 0, answered: 0, unanswered: 0, marked: 0 },
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-2xl glass-panel border border-slate-800 shadow-2xl p-6 sm:p-8 space-y-6 animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Submit Examination?</h3>
            <p className="text-xs text-slate-400">
              Please review your question status before final submission.
            </p>
          </div>
        </div>

        {/* Stats Summary Grid */}
        <div className="grid grid-cols-2 gap-3 py-2">
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <div>
              <p className="text-lg font-bold text-white leading-tight">
                {stats.answered}
              </p>
              <p className="text-[11px] text-slate-400">Answered</p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center gap-3">
            <HelpCircle className="w-5 h-5 text-rose-400" />
            <div>
              <p className="text-lg font-bold text-white leading-tight">
                {stats.unanswered}
              </p>
              <p className="text-[11px] text-slate-400">Unanswered</p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center gap-3 col-span-2">
            <Bookmark className="w-5 h-5 text-amber-400" />
            <div>
              <p className="text-lg font-bold text-white leading-tight">
                {stats.marked}
              </p>
              <p className="text-[11px] text-slate-400">Marked for Review</p>
            </div>
          </div>
        </div>

        {/* Warning if unanswered */}
        {stats.unanswered > 0 && (
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs leading-relaxed flex items-start gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>
              You still have <strong>{stats.unanswered} unanswered</strong>{' '}
              question{stats.unanswered > 1 ? 's' : ''}. Once submitted, you cannot change your answers.
            </span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-800/80">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors cursor-pointer"
          >
            Return to Exam
          </button>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={onConfirm}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Submitting...
              </>
            ) : (
              'Confirm & Submit'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
