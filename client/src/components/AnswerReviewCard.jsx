import React from 'react';
import { CheckCircle2, XCircle, HelpCircle, Info } from 'lucide-react';

export default function AnswerReviewCard({
  question,
  questionNumber,
  selectedAnswer,
  showAnswerKey = true,
}) {
  const letters = ['A', 'B', 'C', 'D', 'E', 'F'];
  const userOption = selectedAnswer?.selectedOption;
  const isUnanswered = userOption === null || userOption === undefined;
  const isCorrect = !isUnanswered && userOption === question.correctOption;

  return (
    <div
      className={`p-6 sm:p-7 rounded-2xl glass-panel border transition-all ${
        isUnanswered
          ? 'border-slate-800'
          : isCorrect
          ? 'border-emerald-500/30 bg-emerald-950/5'
          : 'border-rose-500/30 bg-rose-950/5'
      }`}
    >
      {/* Question Header & Status */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <span className="font-bold text-xs px-2.5 py-1 rounded-lg bg-slate-800 text-slate-200">
            Q{questionNumber}
          </span>
          {question.topic && (
            <span className="text-xs text-slate-400 font-medium px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
              {question.topic}
            </span>
          )}
        </div>

        <div>
          {isUnanswered ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-400 border border-slate-700">
              <HelpCircle className="w-3.5 h-3.5" /> Skipped / Unanswered
            </span>
          ) : isCorrect ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Correct (+{question.marks || 1})
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-300 border border-rose-500/30">
              <XCircle className="w-3.5 h-3.5 text-rose-400" /> Incorrect (-{question.negativeMarks || 0})
            </span>
          )}
        </div>
      </div>

      {/* Question Text */}
      <h3 className="text-base font-semibold text-white leading-relaxed mb-4">
        {question.questionText}
      </h3>

      {question.imageUrl && (
        <div className="mb-4 rounded-xl overflow-hidden border border-slate-800 max-h-60 flex items-center justify-center bg-slate-900">
          <img
            src={question.imageUrl}
            alt={`Question ${questionNumber}`}
            className="max-h-60 w-auto object-contain"
          />
        </div>
      )}

      {/* Options List */}
      <div className="space-y-2.5 mb-5">
        {question.options.map((opt, idx) => {
          const isUserChoice = userOption === idx;
          const isRealCorrect = showAnswerKey && question.correctOption === idx;

          let optionStyle = 'bg-slate-900/60 border-slate-800 text-slate-300';
          let badgeStyle = 'bg-slate-800 text-slate-400 border-slate-700';

          if (showAnswerKey) {
            if (isRealCorrect) {
              optionStyle =
                'bg-emerald-500/15 border-emerald-500/50 text-white font-medium shadow-sm';
              badgeStyle = 'bg-emerald-600 text-white';
            } else if (isUserChoice && !isRealCorrect) {
              optionStyle =
                'bg-rose-500/15 border-rose-500/50 text-rose-200';
              badgeStyle = 'bg-rose-600 text-white';
            }
          } else if (isUserChoice) {
            optionStyle = 'bg-indigo-600/20 border-indigo-500 text-white';
            badgeStyle = 'bg-indigo-600 text-white';
          }

          return (
            <div
              key={idx}
              className={`p-3.5 rounded-xl border flex items-start gap-3.5 text-xs sm:text-sm transition-all ${optionStyle}`}
            >
              <span
                className={`w-6 h-6 rounded-md flex items-center justify-center font-bold text-xs flex-shrink-0 ${badgeStyle}`}
              >
                {letters[idx] || idx + 1}
              </span>
              <span className="flex-1 pt-0.5">{opt.text}</span>

              {/* Status indicators */}
              <div className="flex items-center gap-2">
                {isUserChoice && (
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-800/80 text-slate-300 border border-slate-700">
                    Your Choice
                  </span>
                )}
                {showAnswerKey && isRealCorrect && (
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Correct Answer
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Explanation Box */}
      {showAnswerKey && question.explanation && (
        <div className="p-4 rounded-xl bg-indigo-950/20 border border-indigo-500/20 text-xs text-indigo-200 flex items-start gap-3">
          <Info className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold text-indigo-300">Explanation</p>
            <p className="text-slate-300 leading-relaxed">{question.explanation}</p>
          </div>
        </div>
      )}
    </div>
  );
}
