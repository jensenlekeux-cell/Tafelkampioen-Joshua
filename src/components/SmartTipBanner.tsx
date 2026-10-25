import React, { useState } from 'react';
import { WeakSpot, getSmartTipForFact } from '../utils/smartTips';
import { Lightbulb, Target, ChevronRight, CheckCircle2, Sparkles, ToggleLeft, ToggleRight } from 'lucide-react';

interface SmartTipBannerProps {
  weakSpots: WeakSpot[];
  prioritizeWeakSpots: boolean;
  onTogglePrioritize: () => void;
  onSelectWeakSpot?: (a: number, b: number) => void;
  currentFact?: { a: number; b: number; isFocusQuestion?: boolean; smartTip?: string };
}

export const SmartTipBanner: React.FC<SmartTipBannerProps> = ({
  weakSpots,
  prioritizeWeakSpots,
  onTogglePrioritize,
  onSelectWeakSpot,
  currentFact,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  // Tip for currently displayed question
  const currentTip =
    currentFact?.smartTip ||
    (currentFact ? getSmartTipForFact(currentFact.a, currentFact.b) : null);

  const hasWeakSpots = weakSpots.length > 0;

  return (
    <div className="w-full bg-linear-to-r from-amber-500/10 via-amber-50 to-amber-500/10 border border-amber-200/90 rounded-2xl p-4 shadow-2xs mb-5">
      {/* Top Bar of the Module */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs shrink-0">
            <Lightbulb className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wide text-amber-900">
                Slimme Tip & Zwakke Punten
              </span>
              {hasWeakSpots && (
                <span className="text-[10px] font-bold bg-amber-200/80 text-amber-900 px-2 py-0.5 rounded-full font-mono tabular-nums">
                  {weakSpots.length} {weakSpots.length === 1 ? 'aandachtspunt' : 'aandachtspunten'}
                </span>
              )}
            </div>
            <p className="text-xs text-amber-800/80 mt-0.5">
              {hasWeakSpots
                ? 'Sommen waar je eerder moeite mee had worden vaker herhaald met handige rekentrucjes.'
                : 'Maak je een foutje? Dan onthoudt het spel dit en geeft het je gerichte rekentips!'}
            </p>
          </div>
        </div>

        {/* Prioritize Toggle */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onTogglePrioritize}
            title={prioritizeWeakSpots ? 'Prioriteit uitschakelen' : 'Prioriteit inschakelen'}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all bg-white border-amber-300 text-amber-900 hover:bg-amber-50 shadow-2xs"
          >
            <Target className="w-3.5 h-3.5 text-amber-600" />
            <span>Herhaalhulp:</span>
            <strong className={prioritizeWeakSpots ? 'text-emerald-700' : 'text-slate-500'}>
              {prioritizeWeakSpots ? 'Aan' : 'Uit'}
            </strong>
          </button>
        </div>
      </div>

      {/* Active Focus Question Hint (if currently playing a focus question) */}
      {currentFact?.isFocusQuestion && currentTip && (
        <div className="mt-3.5 pt-3 border-t border-amber-200/60 flex items-start gap-2.5 bg-amber-100/60 rounded-xl p-3">
          <Sparkles className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-950">
            <strong className="font-bold text-amber-900 block mb-0.5">
              💡 Rekentruc voor {currentFact.a} × {currentFact.b}:
            </strong>
            <p className="leading-relaxed">{currentTip}</p>
          </div>
        </div>
      )}

      {/* Weak spots list chips */}
      {hasWeakSpots && (
        <div className="mt-3 pt-3 border-t border-amber-200/60">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-amber-900">
              Jouw persoonlijke aandachtssommen:
            </span>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-[11px] text-amber-700 hover:text-amber-900 underline font-medium"
            >
              {isExpanded ? 'Verberg details' : 'Bekijk tips per som'}
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {weakSpots.map((ws) => (
              <button
                key={ws.key}
                onClick={() => onSelectWeakSpot && onSelectWeakSpot(ws.a, ws.b)}
                title={`Fouten: ${ws.incorrectCount}x · Klik om deze som direct te oefenen`}
                className="px-2.5 py-1 rounded-xl bg-white border border-amber-300 hover:border-amber-500 text-xs font-bold font-mono tabular-nums text-amber-950 shadow-2xs hover:bg-amber-100/50 transition-all flex items-center gap-1.5"
              >
                <span>
                  {ws.a} × {ws.b} = <strong>{ws.answer}</strong>
                </span>
                <span className="text-[10px] text-red-600 bg-red-50 px-1 rounded-sm font-sans font-normal">
                  {ws.incorrectCount}× fout
                </span>
              </button>
            ))}
          </div>

          {/* Expanded details with specific tips */}
          {isExpanded && (
            <div className="mt-3 space-y-2 max-h-56 overflow-y-auto pr-1">
              {weakSpots.map((ws) => (
                <div
                  key={ws.key}
                  className="bg-white/90 border border-amber-200 rounded-xl p-2.5 text-xs text-amber-950"
                >
                  <div className="flex items-center justify-between font-bold mb-1">
                    <span className="font-mono tabular-nums text-indigo-900">
                      {ws.a} × {ws.b} = {ws.answer}
                    </span>
                    <span className="text-[10px] text-amber-700">
                      {ws.correctCount} goed · {ws.incorrectCount} fout ({Math.round(ws.errorRate * 100)}% foutratio)
                    </span>
                  </div>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    💡 {ws.smartTip}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
