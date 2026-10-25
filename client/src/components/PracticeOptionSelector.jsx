import React from 'react';
import { CheckCircle2, XCircle, Sparkles, Loader2, Check } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PracticeOptionSelector({
  options = [],
  selectedOption = null,
  selectedOptions = [],
  correctOption = null,
  correctOptions = [],
  isCorrect = null,
  hasAnswered = false,
  isEvaluating = false,
  evaluatingIndex = null,
  onSelectOption,
  disabled = false,
  questionType = 'MCQ',
}) {
  const letters = ['A', 'B', 'C', 'D', 'E', 'F'];
  const isMSQ = questionType === 'MSQ';

  // Normalize chosen list
  const chosenList = Array.isArray(selectedOptions) && selectedOptions.length > 0
    ? selectedOptions
    : (Array.isArray(selectedOption)
        ? selectedOption
        : (selectedOption !== null && selectedOption !== undefined ? [selectedOption] : []));

  // Normalize correct list
  const correctList = Array.isArray(correctOptions) && correctOptions.length > 0
    ? correctOptions
    : (correctOption !== null && correctOption !== undefined ? [correctOption] : []);

  return (
    <div className="space-y-3.5">
      {options.map((opt, index) => {
        const isChosen = chosenList.includes(index);
        const isTheCorrectOption = correctList.includes(index);
        const isCurrentEvaluating = isEvaluating && evaluatingIndex === index;

        // Determine visual appearance based on instant feedback state
        let cardStyle = 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-850 hover:border-slate-700';
        let badgeStyle = 'bg-slate-800 text-slate-400 border border-slate-700';
        let statusBadge = null;

        if (hasAnswered) {
          if (isChosen && isTheCorrectOption) {
            // Selected option is CORRECT -> Bright Emerald
            cardStyle = 'bg-emerald-500/20 border-emerald-500 shadow-lg shadow-emerald-500/15 text-white';
            badgeStyle = 'bg-emerald-500 text-white font-extrabold shadow-sm';
            statusBadge = (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/25 border border-emerald-500/40 text-emerald-300 text-xs font-bold animate-in fade-in zoom-in-95 duration-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Correct Option!</span>
              </span>
            );
          } else if (isChosen && !isTheCorrectOption) {
            // Selected option is WRONG -> Vibrant Rose/Red
            cardStyle = 'bg-rose-500/20 border-rose-500 shadow-lg shadow-rose-500/15 text-white';
            badgeStyle = 'bg-rose-500 text-white font-extrabold shadow-sm';
            statusBadge = (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-500/25 border border-rose-500/40 text-rose-300 text-xs font-bold animate-in fade-in zoom-in-95 duration-200">
                <XCircle className="w-4 h-4 text-rose-400" />
                <span>Wrong Selection</span>
              </span>
            );
          } else if (!isChosen && isTheCorrectOption) {
            // Correct option revealed after missing it -> Glowing Emerald outline
            cardStyle = 'bg-emerald-950/40 border-emerald-500/90 shadow-md shadow-emerald-500/10 text-emerald-100 ring-1 ring-emerald-500/40';
            badgeStyle = 'bg-emerald-600 text-white font-extrabold';
            statusBadge = (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold animate-in fade-in zoom-in-95 duration-200">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>Correct Option</span>
              </span>
            );
          } else {
            // Unselected neutral options become slightly muted
            cardStyle = 'bg-slate-900/30 border-slate-850 text-slate-400 opacity-60';
            badgeStyle = 'bg-slate-900 text-slate-500 border border-slate-800';
          }
        } else if (isChosen) {
          // Pre-submission active selection state
          cardStyle = 'bg-indigo-600/20 border-indigo-500 shadow-lg shadow-indigo-500/15 text-white ring-1 ring-indigo-500/40';
          badgeStyle = 'bg-indigo-600 text-white font-extrabold shadow-sm';
        }

        return (
          <motion.button
            key={index}
            type="button"
            disabled={disabled || (hasAnswered && disabled)}
            onClick={() => onSelectOption(index)}
            whileTap={!hasAnswered && !disabled ? { scale: 0.99 } : {}}
            className={`w-full text-left p-4 sm:p-4.5 rounded-2xl border transition-all flex items-start gap-4 cursor-pointer relative overflow-hidden ${cardStyle} ${
              disabled && !hasAnswered ? 'opacity-60 cursor-not-allowed' : ''
            }`}
          >
            {/* Letter Badge */}
            <span
              className={`flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs transition-colors mt-0.5 ${badgeStyle}`}
            >
              {letters[index] || index + 1}
            </span>

            {/* Option Text */}
            <div className="flex-1 min-w-0 pr-2">
              <span className="text-sm sm:text-base font-medium leading-relaxed block text-slate-100">
                {opt.text}
              </span>
            </div>

            {/* Checkbox indicator for MSQ or Radio indicator for MCQ when unanswered */}
            {!hasAnswered && (
              <div className="flex-shrink-0 mt-1">
                {isMSQ ? (
                  <span
                    className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                      isChosen
                        ? 'border-indigo-500 bg-indigo-600 text-white'
                        : 'border-slate-700 bg-slate-900'
                    }`}
                  >
                    {isChosen && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </span>
                ) : (
                  <span
                    className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                      isChosen
                        ? 'border-indigo-500 bg-indigo-600'
                        : 'border-slate-700 bg-slate-900'
                    }`}
                  >
                    {isChosen && <span className="w-2 h-2 rounded-full bg-white" />}
                  </span>
                )}
              </div>
            )}

            {/* Right side status indicator / Evaluation loader when answered */}
            {hasAnswered && (
              <div className="flex-shrink-0 flex items-center gap-2">
                {isCurrentEvaluating ? (
                  <div className="flex items-center gap-1.5 text-xs text-indigo-400 px-2 py-1 rounded-md bg-indigo-500/10 border border-indigo-500/20">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="hidden sm:inline">Evaluating...</span>
                  </div>
                ) : (
                  statusBadge
                )}
              </div>
            )}
          </motion.button>
        );
      })}
    </div>
  );
}
