import React, { useState } from 'react';
import { Difficulty } from '../types/game';
import { Sparkles, SlidersHorizontal, Check } from 'lucide-react';
import { getTablesForDifficulty } from '../utils/mathQuestions';

interface DifficultySelectorProps {
  difficulty: Difficulty;
  onChangeDifficulty: (diff: Difficulty) => void;
  customTables?: number[];
  onChangeCustomTables?: (tables: number[]) => void;
}

export const DifficultySelector: React.FC<DifficultySelectorProps> = ({
  difficulty,
  onChangeDifficulty,
  customTables,
  onChangeCustomTables,
}) => {
  const [showCustomPicker, setShowCustomPicker] = useState<boolean>(false);

  const levels: Array<{
    id: Difficulty;
    label: string;
    subtitle: string;
    badgeColor: string;
    description: string;
  }> = [
    {
      id: 'makkelijk',
      label: 'Makkelijk',
      subtitle: 'Tafels 1 t/m 5',
      badgeColor: 'border-emerald-500 text-emerald-800 bg-emerald-50/50',
      description: 'Start rustig met de basistafels van 1, 2, 3, 4 en 5.',
    },
    {
      id: 'gemiddeld',
      label: 'Gemiddeld',
      subtitle: 'Tafels 6 t/m 10',
      badgeColor: 'border-blue-500 text-blue-800 bg-blue-50/50',
      description: 'Oefen de hogere basisschooltafels van 6, 7, 8, 9 en 10.',
    },
    {
      id: 'moeilijk',
      label: 'Moeilijk',
      subtitle: 'Alle Tafels (1 t/m 10)',
      badgeColor: 'border-purple-500 text-purple-800 bg-purple-50/50',
      description: 'Voor echte kampioenen: alle tafels van 1 t/m 10 door elkaar!',
    },
  ];

  const toggleTable = (num: number) => {
    if (!onChangeCustomTables) return;
    const current = customTables || getTablesForDifficulty(difficulty);
    let updated: number[];
    if (current.includes(num)) {
      if (current.length === 1) return; // keep at least 1 table
      updated = current.filter((n) => n !== num);
    } else {
      updated = [...current, num].sort((a, b) => a - b);
    }
    onChangeCustomTables(updated);
  };

  const isCustomActive = Boolean(customTables && customTables.length > 0);

  return (
    <div className="w-full bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Moeilijkheidsgraad
          </span>
          <p className="text-sm font-medium text-slate-800">
            Kies je uitdaging voor de willekeurige sommen
          </p>
        </div>

        {onChangeCustomTables && (
          <button
            onClick={() => setShowCustomPicker(!showCustomPicker)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap shrink-0 ${
              isCustomActive || showCustomPicker
                ? 'bg-amber-50 text-amber-900 border-amber-300'
                : 'text-slate-600 bg-slate-50 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>{isCustomActive ? `Aangepast (${customTables?.length} tafels)` : 'Zelf tafels kiezen'}</span>
          </button>
        )}
      </div>

      {/* Difficulty Segmented Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        {levels.map((lvl) => {
          const isSelected = difficulty === lvl.id && !isCustomActive;
          return (
            <button
              key={lvl.id}
              onClick={() => {
                if (onChangeCustomTables) onChangeCustomTables([]);
                onChangeDifficulty(lvl.id);
              }}
              className={`p-3.5 rounded-xl text-left border-2 transition-all relative ${
                isSelected
                  ? `${lvl.badgeColor} ring-2 ring-slate-900/5 shadow-xs`
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-sm text-slate-900">{lvl.label}</span>
                {isSelected && (
                  <span className="w-4 h-4 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px]">
                    <Check className="w-2.5 h-2.5" />
                  </span>
                )}
              </div>
              <div className="text-xs font-semibold text-slate-600 font-mono">
                {lvl.subtitle}
              </div>
              <p className="text-[11px] text-slate-500 mt-1 line-clamp-1 leading-normal">
                {lvl.description}
              </p>
            </button>
          );
        })}
      </div>

      {/* Custom Table Picker Dropdown/Accordion */}
      {showCustomPicker && onChangeCustomTables && (
        <div className="mt-4 pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-700">
              Vink de tafels aan die je nu wilt oefenen:
            </span>
            <button
              onClick={() => {
                onChangeCustomTables([]);
                setShowCustomPicker(false);
              }}
              className="text-xs text-slate-500 hover:text-slate-800 underline"
            >
              Herstel naar {difficulty}
            </button>
          </div>
          <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5">
            {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => {
              const activeList = customTables || getTablesForDifficulty(difficulty);
              const isChecked = activeList.includes(num);
              return (
                <button
                  key={num}
                  onClick={() => toggleTable(num)}
                  className={`py-2 px-1 text-center rounded-lg border font-bold text-xs transition-colors ${
                    isChecked
                      ? 'bg-amber-500 text-white border-amber-600 shadow-2xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {num}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
