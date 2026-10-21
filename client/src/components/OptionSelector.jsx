import React from 'react';

export default function OptionSelector({ options, selectedOption, onSelectOption, disabled = false }) {
  const letters = ['A', 'B', 'C', 'D', 'E', 'F'];

  return (
    <div className="space-y-3">
      {options.map((opt, index) => {
        const isSelected = selectedOption === index;
        return (
          <button
            key={index}
            type="button"
            disabled={disabled}
            onClick={() => onSelectOption(index)}
            className={`w-full text-left p-4 rounded-xl border transition-all flex items-start gap-4 cursor-pointer ${
              isSelected
                ? 'bg-indigo-600/20 border-indigo-500 shadow-md shadow-indigo-500/10 text-white'
                : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800/60 hover:border-slate-700'
            } ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
          >
            {/* Letter circle */}
            <span
              className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs transition-colors ${
                isSelected
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-800 text-slate-400 border border-slate-700'
              }`}
            >
              {letters[index] || index + 1}
            </span>

            {/* Option text */}
            <span className="flex-1 text-sm sm:text-base font-medium leading-relaxed pt-1">
              {opt.text}
            </span>

            {/* Radio indicator */}
            <span
              className={`flex-shrink-0 w-5 h-5 rounded-full border flex items-center justify-center mt-1.5 transition-colors ${
                isSelected
                  ? 'border-indigo-500 bg-indigo-600'
                  : 'border-slate-700 bg-slate-900'
              }`}
            >
              {isSelected && <span className="w-2 h-2 rounded-full bg-white" />}
            </span>
          </button>
        );
      })}
    </div>
  );
}
