import React, { useState, useEffect } from 'react';
import { Difficulty, Question, UserStats } from '../../types/game';
import { generateQuestion } from '../../utils/mathQuestions';
import { DifficultySelector } from '../DifficultySelector';
import { soundManager } from '../../utils/audio';
import { fireCelebrationConfetti } from '../../utils/confetti';
import { Heart, ShieldAlert, Trophy, Play, RotateCcw, Flame } from 'lucide-react';

interface SurvivalModeProps {
  stats: UserStats;
  difficulty: Difficulty;
  onChangeDifficulty: (diff: Difficulty) => void;
  onFinishSurvival: (score: number, pointsEarned: number) => void;
}

export const SurvivalMode: React.FC<SurvivalModeProps> = ({
  stats,
  difficulty,
  onChangeDifficulty,
  onFinishSurvival,
}) => {
  const [gameState, setGameState] = useState<'intro' | 'playing' | 'gameover'>('intro');
  const [lives, setLives] = useState<number>(3);
  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [pointsEarned, setPointsEarned] = useState<number>(0);
  const [currentQuestion, setCurrentQuestion] = useState<Question>(() =>
    generateQuestion(difficulty)
  );
  const [feedback, setFeedback] = useState<'idle' | 'correct' | 'wrong'>('idle');

  const startSurvival = () => {
    setLives(3);
    setScore(0);
    setStreak(0);
    setPointsEarned(0);
    setFeedback('idle');
    setCurrentQuestion(generateQuestion(difficulty));
    setGameState('playing');
    soundManager.playClick();
  };

  const handleAnswer = (choice: number) => {
    if (feedback !== 'idle' || gameState !== 'playing') return;

    if (choice === currentQuestion.answer) {
      const newStreak = streak + 1;
      setStreak(newStreak);
      setScore((prev) => prev + 1);

      // Multiplier points
      const multiplier = newStreak >= 10 ? 3 : newStreak >= 5 ? 2 : 1;
      const pts = 10 * multiplier;
      setPointsEarned((prev) => prev + pts);

      soundManager.playCorrect(newStreak);
      setFeedback('correct');

      setTimeout(() => {
        setFeedback('idle');
        setCurrentQuestion((prev) => generateQuestion(difficulty, undefined, prev));
      }, 300);
    } else {
      const remainingLives = lives - 1;
      setLives(remainingLives);
      setStreak(0);
      soundManager.playWrong();
      setFeedback('wrong');

      if (remainingLives <= 0) {
        setTimeout(() => {
          setGameState('gameover');
          soundManager.playFanfare();
          if (score > 10) fireCelebrationConfetti();
          onFinishSurvival(score, pointsEarned);
        }, 800);
      } else {
        setTimeout(() => {
          setFeedback('idle');
          setCurrentQuestion((prev) => generateQuestion(difficulty, undefined, prev));
        }, 600);
      }
    }
  };

  // Keyboard controls 1, 2, 3, 4
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState !== 'playing' || feedback !== 'idle') return;
      if (['1', '2', '3', '4'].includes(e.key)) {
        const idx = parseInt(e.key, 10) - 1;
        if (currentQuestion.options[idx] !== undefined) {
          handleAnswer(currentQuestion.options[idx]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, feedback, currentQuestion]);

  return (
    <div className="w-full max-w-2xl mx-auto">
      {gameState === 'intro' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm text-center">
          <div className="w-16 h-16 rounded-3xl bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
            <Heart className="w-8 h-8 fill-red-500 text-red-500" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-2">
            Overleven (3 Levens)
          </h2>
          <p className="text-sm text-slate-600 max-w-md mx-auto mb-6 leading-relaxed">
            Je hebt 3 hartjes. Elke fout kost een leven! Hoe ver kun jij komen zonder al je hartjes te verliezen?
          </p>

          <DifficultySelector
            difficulty={difficulty}
            onChangeDifficulty={onChangeDifficulty}
          />

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 mb-6 flex items-center justify-around max-w-md mx-auto">
            <div className="text-center">
              <span className="text-[11px] font-semibold uppercase text-slate-500">
                Jouw Record
              </span>
              <p className="text-xl font-black text-slate-900 font-mono tabular-nums">
                {stats.overlevenHighScore} sommen
              </p>
            </div>
            <div className="w-px h-8 bg-slate-200" />
            <div className="text-center">
              <span className="text-[11px] font-semibold uppercase text-slate-500">
                Levens
              </span>
              <div className="flex items-center justify-center gap-1 mt-1">
                {[1, 2, 3].map((h) => (
                  <Heart key={h} className="w-5 h-5 fill-red-500 text-red-500" />
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={startSurvival}
            className="w-full sm:w-auto px-8 py-3.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-2xl shadow-sm transition-all active:scale-95 flex items-center justify-center gap-2 mx-auto text-base"
          >
            <Play className="w-5 h-5 fill-white" />
            <span>Start Overleven!</span>
          </button>
        </div>
      )}

      {gameState === 'playing' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8">
          {/* Header Hearts & Multiplier */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-1">
              {[1, 2, 3].map((h) => (
                <Heart
                  key={h}
                  className={`w-6 h-6 transition-all ${
                    h <= lives
                      ? 'fill-red-500 text-red-500 scale-100'
                      : 'fill-slate-200 text-slate-200 scale-90'
                  }`}
                />
              ))}
            </div>

            <div className="flex items-center gap-2">
              {streak >= 3 && (
                <div className="flex items-center gap-1 text-xs font-bold text-amber-900 bg-amber-100 px-2.5 py-1 rounded-lg">
                  <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  <span>{streak >= 10 ? '3x' : streak >= 5 ? '2x' : '1.5x'}</span>
                </div>
              )}
              <span className="text-xs font-bold text-slate-800 font-mono tabular-nums bg-slate-100 px-3 py-1 rounded-lg">
                Score: {score}
              </span>
            </div>
          </div>

          {/* Math Problem */}
          <div className="text-center py-6 sm:py-10">
            <div className="text-5xl sm:text-7xl font-black text-slate-900 tracking-tight font-display flex items-center justify-center gap-3 sm:gap-4 select-none">
              <span className="text-indigo-600">{currentQuestion.a}</span>
              <span className="text-amber-500 text-4xl sm:text-6xl">×</span>
              <span className="text-indigo-600">{currentQuestion.b}</span>
              <span className="text-slate-400">=</span>
              <span className="min-w-16 sm:min-w-24 px-3 py-1 rounded-2xl border-2 border-slate-300 bg-slate-50 text-slate-800 font-mono tabular-nums">
                ?
              </span>
            </div>
          </div>

          {/* 4 Choices */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 max-w-md mx-auto">
            {currentQuestion.options.map((opt, idx) => (
              <button
                key={idx}
                disabled={feedback !== 'idle'}
                onClick={() => handleAnswer(opt)}
                className="h-16 sm:h-20 rounded-2xl border-2 border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 text-2xl sm:text-3xl font-extrabold font-mono tabular-nums shadow-xs transition-all active:scale-95 disabled:pointer-events-none flex items-center justify-center relative"
              >
                <span className="absolute top-2 left-2 text-[10px] text-slate-600/70 font-sans hidden sm:block">
                  {idx + 1}
                </span>
                {opt}
              </button>
            ))}
          </div>
        </div>
      )}

      {gameState === 'gameover' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm text-center">
          <div className="w-16 h-16 rounded-3xl bg-slate-100 text-slate-600 flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-8 h-8 text-red-500" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-1">
            Al je levens zijn op!
          </h2>
          <p className="text-sm text-slate-500 mb-6">
            Je hebt {score} sommen overleefd en daarmee flink geoefend.
          </p>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 max-w-xs mx-auto mb-6">
            <span className="text-xs font-semibold text-slate-500">
              Punten Verdiend
            </span>
            <p className="text-3xl font-black text-amber-600 font-mono tabular-nums mt-1">
              +{pointsEarned} ptn
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={startSurvival}
              className="w-full sm:w-auto px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Opnieuw Proberen</span>
            </button>
            <button
              onClick={() => setGameState('intro')}
              className="w-full sm:w-auto px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-xl transition-colors"
            >
              Ander niveau kiezen
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
