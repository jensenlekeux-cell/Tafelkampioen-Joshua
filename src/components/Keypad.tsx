import React from 'react';
import { Delete, ArrowRight } from 'lucide-react';

interface KeypadProps {
  value: string;
  onDigit: (digit: string) => void;
  onBackspace: () => void;
  onSubmit: () => void;
  disabled?: boolean;
}

export const Keypad: React.FC<KeypadProps> = ({
  value,
  onDigit,
  onBackspace,
  onSubmit,
  disabled = false,
}) => {
  const digits = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '⌫'];

  const handleKeyClick = (key: string) => {
    if (disabled) return;
    if (key === 'C') {
      // clear
      for (let i = 0; i < value.length; i++) onBackspace();
    } else if (key === '⌫') {
      onBackspace();
    } else {
      onDigit(key);
    }
  };

  return (
    <div className="w-full max-w-xs mx-auto">
      <div className="grid grid-cols-3 gap-2 mb-2">
        {digits.map((k) => (
          <button
            key={k}
            type="button"
            disabled={disabled}
            onClick={() => handleKeyClick(k)}
            className="h-13 sm:h-14 rounded-xl bg-white border border-slate-200 text-slate-800 text-lg font-bold shadow-2xs hover:bg-slate-50 active:scale-95 transition-all flex items-center justify-center disabled:opacity-50"
          >
            {k === '⌫' ? <Delete className="w-5 h-5 text-slate-600" /> : k}
          </button>
        ))}
      </div>
      <button
        type="button"
        disabled={disabled || value.trim().length === 0}
        onClick={onSubmit}
        className="w-full h-12 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm shadow-xs flex items-center justify-center gap-2 active:scale-98 transition-all disabled:opacity-40 disabled:pointer-events-none"
      >
        <span>Bevestig Antwoord</span>
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
};
