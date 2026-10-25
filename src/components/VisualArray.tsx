import React from 'react';

interface VisualArrayProps {
  a: number; // rows
  b: number; // columns
}

export const VisualArray: React.FC<VisualArrayProps> = ({ a, b }) => {
  // Cap visual grid if larger than 12x12 to keep it tidy
  const rows = Math.min(a, 12);
  const cols = Math.min(b, 12);

  return (
    <div className="bg-amber-50/70 border border-amber-200/70 rounded-xl p-4 my-3 text-center">
      <div className="flex items-center justify-between text-xs text-amber-900 font-medium mb-3">
        <span>Visuele hulp: {a} rijen van {b}</span>
        <span className="font-mono tabular-nums text-amber-700">Totaal: {a * b}</span>
      </div>

      <div className="inline-flex flex-col gap-1.5 items-center justify-center max-w-full overflow-x-auto p-1">
        {Array.from({ length: rows }).map((_, rIdx) => (
          <div key={rIdx} className="flex items-center gap-1.5">
            <span className="text-[10px] text-amber-600/70 w-4 text-right font-mono tabular-nums">
              {rIdx + 1}
            </span>
            <div className="flex items-center gap-1.5">
              {Array.from({ length: cols }).map((_, cIdx) => (
                <div
                  key={cIdx}
                  title={`Rij ${rIdx + 1}, kolom ${cIdx + 1}`}
                  className="w-5 h-5 rounded-full bg-amber-400 border border-amber-500 shadow-xs flex items-center justify-center text-[9px] font-bold text-amber-900 transition-transform hover:scale-125"
                >
                  ★
                </div>
              ))}
            </div>
            <span className="text-[10px] text-amber-700 font-mono tabular-nums w-6 text-left pl-1">
              ={(rIdx + 1) * b}
            </span>
          </div>
        ))}
      </div>
      <p className="text-[11px] text-amber-700/80 mt-2">
        Tip: Tel per rij van {b} om sneller bij de uitkomst te komen!
      </p>
    </div>
  );
};
