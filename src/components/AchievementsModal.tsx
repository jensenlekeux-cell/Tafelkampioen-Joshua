import React, { useState } from 'react';
import { Achievement } from '../types/game';
import {
  X,
  Trophy,
  Award,
  Crown,
  Medal,
  Flame,
  Zap,
  ShieldCheck,
  Compass,
  Target,
  Star,
  GraduationCap,
  Timer,
  Grid,
  Sparkles,
  Lock,
  CheckCircle2,
} from 'lucide-react';

interface AchievementsModalProps {
  isOpen: boolean;
  onClose: () => void;
  achievements: Achievement[];
  totalPoints: number;
}

export const AchievementsModal: React.FC<AchievementsModalProps> = ({
  isOpen,
  onClose,
  achievements,
  totalPoints,
}) => {
  const [filter, setFilter] = useState<'all' | 'unlocked' | 'locked'>('all');

  if (!isOpen) return null;

  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const totalCount = achievements.length;
  const progressPercent = Math.round((unlockedCount / totalCount) * 100);

  const getIcon = (iconName: string) => {
    const props = { className: 'w-5 h-5' };
    switch (iconName) {
      case 'Trophy':
        return <Trophy {...props} />;
      case 'Award':
        return <Award {...props} />;
      case 'Crown':
        return <Crown {...props} />;
      case 'Medal':
        return <Medal {...props} />;
      case 'Flame':
        return <Flame {...props} />;
      case 'Zap':
        return <Zap {...props} />;
      case 'ShieldCheck':
        return <ShieldCheck {...props} />;
      case 'Compass':
        return <Compass {...props} />;
      case 'Target':
        return <Target {...props} />;
      case 'Star':
        return <Star {...props} />;
      case 'GraduationCap':
        return <GraduationCap {...props} />;
      case 'Timer':
        return <Timer {...props} />;
      case 'Grid':
        return <Grid {...props} />;
      default:
        return <Sparkles {...props} />;
    }
  };

  const filteredAchievements = achievements.filter((ach) => {
    if (filter === 'unlocked') return ach.unlocked;
    if (filter === 'locked') return !ach.unlocked;
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-xl overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Prestaties & Medailles
              </h2>
              <p className="text-xs text-slate-500">
                Verdien bonuspunten door mijlpalen te bereiken
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress summary banner */}
        <div className="bg-slate-50 px-5 sm:px-6 py-4 border-b border-slate-100">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1.5">
            <span>
              Voortgang: {unlockedCount} van de {totalCount} behaald
            </span>
            <span className="font-mono tabular-nums text-amber-700">{progressPercent}%</span>
          </div>
          <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-400 to-amber-500 transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Interactive filter tabs */}
          <div className="flex items-center gap-1.5 mt-4 p-1 bg-slate-200/60 rounded-xl w-fit">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                filter === 'all'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Alle ({totalCount})
            </button>
            <button
              onClick={() => setFilter('unlocked')}
              className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                filter === 'unlocked'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Ontgrendeld ({unlockedCount})
            </button>
            <button
              onClick={() => setFilter('locked')}
              className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                filter === 'locked'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Nog te behalen ({totalCount - unlockedCount})
            </button>
          </div>
        </div>

        {/* List of achievements */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-3">
          {filteredAchievements.map((ach) => {
            const isUnlocked = ach.unlocked;
            const pct = Math.min(100, Math.round((ach.progress / ach.target) * 100));

            return (
              <div
                key={ach.id}
                className={`p-4 rounded-2xl border transition-all flex items-start gap-3.5 ${
                  isUnlocked
                    ? 'bg-amber-50/40 border-amber-200/80'
                    : 'bg-white border-slate-200 opacity-80'
                }`}
              >
                <div
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
                    isUnlocked
                      ? 'bg-amber-500 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  {isUnlocked ? getIcon(ach.icon) : <Lock className="w-5 h-5" />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3
                      className={`text-sm font-bold truncate ${
                        isUnlocked ? 'text-slate-900' : 'text-slate-700'
                      }`}
                    >
                      {ach.title}
                    </h3>
                    <span className="text-xs font-bold text-amber-700 font-mono tabular-nums whitespace-nowrap shrink-0">
                      +{ach.rewardPoints} ptn
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                    {ach.description}
                  </p>

                  <div className="mt-2.5 flex items-center gap-3">
                    <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          isUnlocked ? 'bg-amber-500' : 'bg-slate-300'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-[11px] font-mono tabular-nums text-slate-500 shrink-0">
                      {ach.progress} / {ach.target}
                    </span>
                  </div>
                </div>

                {isUnlocked && (
                  <div className="shrink-0 self-center text-emerald-600">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Huidige score:{' '}
            <strong className="text-slate-800 font-mono tabular-nums">{totalPoints} punten</strong>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-xl transition-colors"
          >
            Sluiten
          </button>
        </div>
      </div>
    </div>
  );
};
