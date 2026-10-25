import React from 'react';
import OptionSelector from './OptionSelector';
import { Bookmark, RotateCcw } from 'lucide-react';

export default function QuestionCard({
  question,
  questionNumber,
  totalQuestions,
  selectedOption,
  isMarkedForReview,
  onSelectOption,
  onClearAnswer,
  onToggleReview,
}) {
  return (
    <div className="p-6 sm:p-8 rounded-2xl glass-panel border border-slate-800/80 shadow-xl flex flex-col justify-between">
      <div>
        {/* Header meta */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-6 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-lg bg-indigo-600/20 text-indigo-300 font-bold text-xs border border-indigo-500/20">
              Question {questionNumber} of {totalQuestions}
            </span>
            {question.questionType === 'MSQ' && (
              <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 font-bold text-xs border border-amber-500/30">
                MSQ
              </span>
            )}
            {question.topic && (
              <span className="text-xs text-slate-400 font-medium px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
                {question.topic}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
              {question.difficulty || 'Medium'}
            </span>
            <span className="text-xs font-medium text-emerald-400">
              +{question.marks ?? 1} marks
            </span>
          </div>
        </div>

        {/* Question Text */}
        <div className="mb-6">
          <h2 className="text-base sm:text-lg font-semibold text-slate-100 leading-relaxed">
            {question.questionText}
            {question.questionType === 'MSQ' && (
              <span className="ml-2.5 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 align-middle">
                (Select {question.selectCount || 2} options)
              </span>
            )}
          </h2>

          {question.imageUrl && (
            <div className="mt-4 rounded-xl overflow-hidden border border-slate-800 max-h-80 flex items-center justify-center bg-slate-900">
              <img
                src={question.imageUrl}
                alt={`Question ${questionNumber}`}
                className="max-h-80 w-auto object-contain"
              />
            </div>
          )}
        </div>

        {/* Options */}
        <OptionSelector
          options={question.options}
          selectedOption={selectedOption}
          questionType={question.questionType || 'MCQ'}
          onSelectOption={onSelectOption}
        />
      </div>

      {/* Action Toolbar */}
      <div className="pt-6 mt-8 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={onToggleReview}
          className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            isMarkedForReview
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Bookmark
            className={`w-4 h-4 ${isMarkedForReview ? 'fill-amber-400 text-amber-400' : ''}`}
          />
          {isMarkedForReview ? 'Marked for Review' : 'Mark for Review'}
        </button>

        {selectedOption !== null && selectedOption !== undefined && (
          <button
            type="button"
            onClick={onClearAnswer}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Clear Selection
          </button>
        )}
      </div>
    </div>
  );
}
