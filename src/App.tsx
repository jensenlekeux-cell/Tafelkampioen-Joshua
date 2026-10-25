import React, { useState, useEffect, useCallback } from 'react';
import {
  Difficulty,
  GameMode,
  Question,
  UserStats,
  Achievement,
  DiplomaRecord,
} from './types/game';
import { loadUserStats, saveUserStats, calculateLevel } from './utils/storage';
import { INITIAL_ACHIEVEMENTS, checkAchievements } from './utils/achievements';
import { soundManager } from './utils/audio';
import { Header } from './components/Header';
import { PracticeMode } from './components/Modes/PracticeMode';
import { TimeTrialMode } from './components/Modes/TimeTrialMode';
import { SurvivalMode } from './components/Modes/SurvivalMode';
import { MemoryMode } from './components/Modes/MemoryMode';
import { DiplomaMode } from './components/Modes/DiplomaMode';
import { MultiplicationTableGrid } from './components/Modes/MultiplicationTableGrid';
import { AchievementsModal } from './components/AchievementsModal';
import { DeviceShareModal } from './components/DeviceShareModal';
import { Trophy, Award, Sparkles, X, CheckCircle2, QrCode, Smartphone } from 'lucide-react';

export default function App() {
  const [stats, setStats] = useState<UserStats>(() => loadUserStats());
  const [currentMode, setCurrentMode] = useState<GameMode>('oefenen');
  const [difficulty, setDifficulty] = useState<Difficulty>('gemiddeld');
  const [customTables, setCustomTables] = useState<number[]>([]);
  const [isAchievementsOpen, setIsAchievementsOpen] = useState<boolean>(false);
  const [isDeviceShareOpen, setIsDeviceShareOpen] = useState<boolean>(false);
  const [activeToast, setActiveToast] = useState<Achievement | null>(null);

  // Sync sound manager with loaded preference
  useEffect(() => {
    soundManager.setSoundEnabled(stats.soundEnabled);
  }, [stats.soundEnabled]);

  // Persist stats whenever changed
  const updateStats = useCallback((updater: (prev: UserStats) => UserStats) => {
    setStats((prev) => {
      const next = updater(prev);
      saveUserStats(next);
      return next;
    });
  }, []);

  const handleToggleSound = () => {
    updateStats((prev) => {
      const nextVal = !prev.soundEnabled;
      soundManager.setSoundEnabled(nextVal);
      return { ...prev, soundEnabled: nextVal };
    });
  };

  const processAchievementsCheck = (
    nextStats: UserStats,
    extra: {
      justCorrect?: boolean;
      streak?: number;
      difficultyUsed?: Difficulty;
      isMemoryWin?: boolean;
      hasNewDiploma?: boolean;
      timeTrialCorrect?: number;
    }
  ) => {
    const { newlyUnlocked, pointsAdded } = checkAchievements(nextStats, extra);

    if (newlyUnlocked.length > 0) {
      const first = newlyUnlocked[0];
      setActiveToast(first);
      setTimeout(() => setActiveToast(null), 4500);

      const allNewIds = newlyUnlocked.map((a) => a.id);
      return {
        ...nextStats,
        points: nextStats.points + pointsAdded,
        unlockedAchievements: Array.from(
          new Set([...nextStats.unlockedAchievements, ...allNewIds])
        ),
      };
    }

    return nextStats;
  };

  // Correct answer handler in Practice Mode
  const handleCorrectAnswer = (
    pointsEarned: number,
    question: Question,
    streak: number
  ) => {
    updateStats((prev) => {
      const key = `${question.a}x${question.b}`;
      const prevFact = prev.tableMastery[key] || { correct: 0, incorrect: 0 };
      const updatedMastery = {
        ...prev.tableMastery,
        [key]: {
          correct: prevFact.correct + 1,
          incorrect: prevFact.incorrect,
          lastPracticed: new Date().toISOString(),
        },
      };

      const intermediateStats: UserStats = {
        ...prev,
        points: prev.points + pointsEarned,
        totalCorrect: prev.totalCorrect + 1,
        totalAttempted: prev.totalAttempted + 1,
        bestStreak: Math.max(prev.bestStreak, streak),
        currentStreak: streak,
        tableMastery: updatedMastery,
      };

      return processAchievementsCheck(intermediateStats, {
        justCorrect: true,
        streak,
        difficultyUsed: difficulty,
      });
    });
  };

  // Incorrect answer handler in Practice Mode
  const handleIncorrectAnswer = (question: Question) => {
    updateStats((prev) => {
      const key = `${question.a}x${question.b}`;
      const prevFact = prev.tableMastery[key] || { correct: 0, incorrect: 0 };
      const updatedMastery = {
        ...prev.tableMastery,
        [key]: {
          correct: prevFact.correct,
          incorrect: prevFact.incorrect + 1,
          lastPracticed: new Date().toISOString(),
        },
      };

      return {
        ...prev,
        totalAttempted: prev.totalAttempted + 1,
        currentStreak: 0,
        tableMastery: updatedMastery,
      };
    });
  };

  // Time Trial round finished
  const handleFinishTimeTrial = (
    correctCount: number,
    pointsEarned: number,
    diff: Difficulty
  ) => {
    updateStats((prev) => {
      const intermediateStats: UserStats = {
        ...prev,
        points: prev.points + pointsEarned,
        totalCorrect: prev.totalCorrect + correctCount,
        totalAttempted: prev.totalAttempted + correctCount,
        tijdritHighScore: Math.max(prev.tijdritHighScore, correctCount),
      };

      return processAchievementsCheck(intermediateStats, {
        timeTrialCorrect: correctCount,
        difficultyUsed: diff,
      });
    });
  };

  // Survival round finished
  const handleFinishSurvival = (survivedScore: number, pointsEarned: number) => {
    updateStats((prev) => {
      const intermediateStats: UserStats = {
        ...prev,
        points: prev.points + pointsEarned,
        totalCorrect: prev.totalCorrect + survivedScore,
        totalAttempted: prev.totalAttempted + survivedScore,
        overlevenHighScore: Math.max(prev.overlevenHighScore, survivedScore),
      };

      return processAchievementsCheck(intermediateStats, {});
    });
  };

  // Memory round finished
  const handleFinishMemory = (turns: number, pointsEarned: number) => {
    updateStats((prev) => {
      const intermediateStats: UserStats = {
        ...prev,
        points: prev.points + pointsEarned,
      };

      return processAchievementsCheck(intermediateStats, {
        isMemoryWin: true,
      });
    });
  };

  // Diploma earned
  const handleDiplomaEarned = (record: DiplomaRecord, bonusPoints: number) => {
    updateStats((prev) => {
      const intermediateStats: UserStats = {
        ...prev,
        points: prev.points + bonusPoints,
        diplomas: [record, ...prev.diplomas],
      };

      return processAchievementsCheck(intermediateStats, {
        hasNewDiploma: true,
      });
    });
  };

  const handleUpdatePlayerName = (name: string) => {
    updateStats((prev) => ({ ...prev, playerName: name }));
  };

  const { updatedAchievements } = checkAchievements(stats, {});

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      {/* Top Bar Contract compliant Navigation */}
      <Header
        currentMode={currentMode}
        onSelectMode={(m) => setCurrentMode(m)}
        points={stats.points}
        soundEnabled={stats.soundEnabled}
        onToggleSound={handleToggleSound}
        onOpenAchievements={() => setIsAchievementsOpen(true)}
        onOpenDeviceShare={() => setIsDeviceShareOpen(true)}
        unlockedCount={stats.unlockedAchievements.length}
        totalAchievements={INITIAL_ACHIEVEMENTS.length}
      />

      {/* Floating Achievement Toast notification */}
      {activeToast && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white p-4 rounded-2xl shadow-xl flex items-center gap-3.5 max-w-sm border border-slate-700 animate-bounce">
          <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0">
            <Trophy className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block">
              Prestatie Ontgrendeld!
            </span>
            <strong className="text-sm font-bold block truncate">
              {activeToast.title}
            </strong>
            <span className="text-xs text-slate-300 block">
              +{activeToast.rewardPoints} bonuspunten verdiend
            </span>
          </div>
          <button
            onClick={() => setActiveToast(null)}
            className="text-slate-400 hover:text-white p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Playful Welcome strip with Mascot */}
        <div className="bg-gradient-to-r from-amber-500/10 via-indigo-500/5 to-emerald-500/10 border border-slate-200/80 rounded-3xl p-4 sm:p-5 mb-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden bg-amber-100 border-2 border-amber-300 shrink-0 shadow-xs">
              <img
                src="/src/assets/images/tafel_mascot_robot_1792868960657.jpg"
                alt="Tafel Kampioen Rekenrobot"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                  Welkom, {stats.playerName || 'Rekenheld'}!
                </h1>
                <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md">
                  {calculateLevel(stats.points).title}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2 mt-1.5">
                <p className="text-xs sm:text-sm text-slate-600">
                  Oefen de tafels van vermenigvuldiging spelenderwijs en haal je tafeldiploma!
                </p>
                <button
                  onClick={() => setIsDeviceShareOpen(true)}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 bg-amber-100/80 hover:bg-amber-200/90 px-2 py-0.5 rounded-md transition-colors"
                >
                  <QrCode className="w-3 h-3 text-amber-600" />
                  <span>Scan QR voor mobiel</span>
                </button>
              </div>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-4 text-right">
            <div>
              <span className="text-[11px] font-semibold text-slate-500 block uppercase">
                Totaal Goed
              </span>
              <strong className="text-lg font-black text-slate-900 font-mono tabular-nums">
                {stats.totalCorrect}
              </strong>
            </div>
            <div className="w-px h-8 bg-slate-200" />
            <div>
              <span className="text-[11px] font-semibold text-slate-500 block uppercase">
                Beste Reeks
              </span>
              <strong className="text-lg font-black text-amber-600 font-mono tabular-nums">
                {stats.bestStreak} ★
              </strong>
            </div>
          </div>
        </div>

        {/* View Router */}
        {currentMode === 'oefenen' && (
          <PracticeMode
            stats={stats}
            difficulty={difficulty}
            onChangeDifficulty={setDifficulty}
            customTables={customTables}
            onChangeCustomTables={setCustomTables}
            onCorrectAnswer={handleCorrectAnswer}
            onIncorrectAnswer={handleIncorrectAnswer}
          />
        )}

        {currentMode === 'tijdrit' && (
          <TimeTrialMode
            stats={stats}
            difficulty={difficulty}
            onChangeDifficulty={setDifficulty}
            onFinishRound={handleFinishTimeTrial}
          />
        )}

        {currentMode === 'overleven' && (
          <SurvivalMode
            stats={stats}
            difficulty={difficulty}
            onChangeDifficulty={setDifficulty}
            onFinishSurvival={handleFinishSurvival}
          />
        )}

        {currentMode === 'memory' && (
          <MemoryMode
            stats={stats}
            difficulty={difficulty}
            onChangeDifficulty={setDifficulty}
            onFinishMemory={handleFinishMemory}
          />
        )}

        {currentMode === 'diploma' && (
          <DiplomaMode
            stats={stats}
            difficulty={difficulty}
            onChangeDifficulty={setDifficulty}
            onDiplomaEarned={handleDiplomaEarned}
            onUpdatePlayerName={handleUpdatePlayerName}
          />
        )}

        {currentMode === 'rooster' && (
          <MultiplicationTableGrid stats={stats} />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>
            © {new Date().getFullYear()} TafelKampioen · Het vrolijke rekenspel om alle tafels uit het hoofd te leren
          </p>
          <div className="flex items-center gap-4 text-xs font-medium text-slate-600">
            <span>Makkelijk: 1-5</span>
            <span>·</span>
            <span>Gemiddeld: 6-10</span>
            <span>·</span>
            <span>Moeilijk: 1-10 (Alle tafels)</span>
          </div>
        </div>
      </footer>

      {/* Achievements / Badges Modal */}
      <AchievementsModal
        isOpen={isAchievementsOpen}
        onClose={() => setIsAchievementsOpen(false)}
        achievements={updatedAchievements}
        totalPoints={stats.points}
      />

      {/* Cross-Device Sharing & QR Code Modal */}
      <DeviceShareModal
        isOpen={isDeviceShareOpen}
        onClose={() => setIsDeviceShareOpen(false)}
      />
    </div>
  );
}
