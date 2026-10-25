import React, { useState } from 'react';
import { UserStats } from '../../types/game';
import { soundManager } from '../../utils/audio';
import { VisualArray } from '../VisualArray';
import { Sparkles, Grid, Eye, Check } from 'lucide-react';

interface MultiplicationTableGridProps {
  stats: UserStats;
}

export const MultiplicationTableGrid: React.FC<MultiplicationTableGridProps> = ({ stats }) => {
  const [selectedCell, setSelectedCell] = useState<{ a: number; b: number } | null>({ a: 6, b: 7 });
  const [highlightRow, setHighlightRow] = useState<number | null>(null);
  const [highlightCol, setHighlightCol] = useState<number | null>(null);
  const [highlightSquares, setHighlightSquares] = useState<boolean>(false);

  const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  const handleCellClick = (r: number, c: number) => {
    soundManager.playClick();
    setSelectedCell({ a: r, b: c });
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Intro & filters */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Interactief Tafelrooster (1 t/m 10)
            </h2>
            <p className="text-xs text-slate-500">
              Tik op een som om patronen en de visuele sterrenweergave te ontdekken
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setHighlightSquares(!highlightSquares)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                highlightSquares
                  ? 'bg-amber-100 text-amber-900 border-amber-300'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Kwadraten (Vierkanten)</span>
            </button>
          </div>
        </div>

        {/* Selected Cell Preview Card */}
        {selectedCell && (
          <div className="bg-indigo-50/70 border border-indigo-200/80 rounded-2xl p-4 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-left">
              <span className="text-xs font-semibold text-indigo-700 uppercase tracking-wide">
                Geselecteerde Som
              </span>
              <div className="text-2xl sm:text-3xl font-black text-indigo-950 font-display mt-0.5">
                {selectedCell.a} × {selectedCell.b} = {selectedCell.a * selectedCell.b}
              </div>
              <p className="text-xs text-indigo-800/80 mt-1">
                Dat is {selectedCell.a} keer het getal {selectedCell.b} bij elkaar opgeteld!
              </p>
            </div>

            <div className="flex-1 max-w-md w-full">
              <VisualArray a={selectedCell.a} b={selectedCell.b} />
            </div>
          </div>
        )}

        {/* The 12x12 Grid Container */}
        <div className="overflow-x-auto pb-2">
          <table className="w-full border-collapse text-center select-none text-xs sm:text-sm">
            <thead>
              <tr>
                <th className="p-1 sm:p-2 bg-slate-100 text-slate-400 font-bold border border-slate-200 rounded-tl-lg">
                  ×
                </th>
                {numbers.map((col) => (
                  <th
                    key={col}
                    onClick={() => setHighlightCol(highlightCol === col ? null : col)}
                    className={`p-1 sm:p-2 font-bold cursor-pointer border border-slate-200 transition-colors ${
                      highlightCol === col
                        ? 'bg-amber-200 text-amber-900'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {numbers.map((row) => (
                <tr key={row}>
                  <th
                    onClick={() => setHighlightRow(highlightRow === row ? null : row)}
                    className={`p-1 sm:p-2 font-bold cursor-pointer border border-slate-200 transition-colors ${
                      highlightRow === row
                        ? 'bg-amber-200 text-amber-900'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {row}
                  </th>
                  {numbers.map((col) => {
                    const product = row * col;
                    const isSelected = selectedCell?.a === row && selectedCell?.b === col;
                    const isSquare = row === col;
                    const isHighlighted =
                      highlightRow === row ||
                      highlightCol === col ||
                      (highlightSquares && isSquare);

                    const masteryKey = `${row}x${col}`;
                    const hasPracticed = stats.tableMastery[masteryKey]?.correct > 0;

                    let cellBg = 'bg-white hover:bg-slate-50';
                    if (isSelected) {
                      cellBg = 'bg-indigo-600 text-white font-black shadow-xs';
                    } else if (isHighlighted) {
                      cellBg = isSquare && highlightSquares
                        ? 'bg-amber-300 text-amber-950 font-black'
                        : 'bg-amber-100/70 text-amber-950 font-bold';
                    } else if (isSquare) {
                      cellBg = 'bg-amber-50/70 font-semibold';
                    }

                    return (
                      <td
                        key={col}
                        onClick={() => handleCellClick(row, col)}
                        className={`p-1 sm:p-2 border border-slate-200 font-mono tabular-nums cursor-pointer transition-colors relative ${cellBg}`}
                      >
                        <span>{product}</span>
                        {hasPracticed && !isSelected && (
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 absolute top-1 right-1" />
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
