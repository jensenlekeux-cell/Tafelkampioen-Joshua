import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Difficulty, Question, UserStats } from '../../types/game';
import { generateQuestion } from '../../utils/mathQuestions';
import { DifficultySelector } from '../DifficultySelector';
import { soundManager } from '../../utils/audio';
import { fireCelebrationConfetti } from '../../utils/confetti';
import { Timer, Zap, Trophy, RotateCcw, Play, Check, X, Award } from 'lucide-react';

interface TimeTrialModeProps {
  stats: UserStats;
  difficulty: Difficulty;
  onChangeDifficulty: (diff: Difficulty) => void;
  onFinishRound: (correctCount: number, pointsEarned: number, difficulty: Difficulty) => void;
}

export const TimeTrialMode: React.FC<TimeTrialModeProps> = ({
  stats,
  difficulty,
  onChangeDifficulty,
  onFinishRound,
}) => {
  const [gameState, setGameState] = useState<'intro' | 'playing' | 'summary'>('intro');
  const [timeLeft, setTimeLeft] = useState<number>(60);
  const [currentQuestion, setCurrentQuestion] = useState<Question>(() =>
    generateQuestion(difficulty)
  );
  const [correctCount, setCorrectCount] = useState<number>(0);
  const [wrongCount, setWrongCount] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [pointsEarned, setPointsEarned] = useState<number>(0);
  const [feedback, setFeedback] = useState<'idle' | 'correct' | 'wrong'>('idle');

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startGame = () => {
    setCorrectCount(0);
    setWrongCount(0);
    setStreak(0);
    setPointsEarned(0);
    setTimeLeft(60);
    setFeedback('idle');
    setCurrentQuestion(generateQuestion(difficulty));
    setGameState('playing');
    soundManager.playClick();
  };

  const finishGame = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setGameState('summary');
    soundManager.playFanfare();
    if (correctCount > 10) {
      fireCelebrationConfetti();
    }
    onFinishRound(correctCount, pointsEarned, difficulty);
  }, [correctCount, pointsEarned, difficulty, onFinishRound]);

  // Timer loop
  useEffect(() => {
    if (gameState === 'playing') {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            return 0;
          }
          if (prev <= 11) {
            soundManager.playTick(prev <= 5);
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState]);

  // Trigger finish when time hits 0
  useEffect(() => {
    if (gameState === 'playing' && timeLeft === 0) {
      finishGame();
    }
  }, [gameState, timeLeft, finishGame]);

  const handleAnswer = (choice: number) => {
    if (feedback !== 'idle' || gameState !== 'playing') return;

    if (choice === currentQuestion.answer) {
      const newStreak = streak + 1;
      setStreak(newStreak);
      setCorrectCount((prev) => prev + 1);

      // Points calculation
      const pts = 10 + (newStreak >= 5 ? 10 : newStreak >= 3 ? 5 : 0);
      setPointsEarned((prev) => prev + pts);

      soundManager.playCorrect(newStreak);
      setFeedback('correct');

      setTimeout(() => {
        setFeedback('idle');
        setCurrentQuestion((prev) => generateQuestion(difficulty, undefined, prev));
      }, 200);
    } else {
      setStreak(0);
      setWrongCount((prev) => prev + 1);
      soundManager.playWrong();
      setFeedback('wrong');

      setTimeout(() => {
        setFeedback('idle');
        setCurrentQuestion((prev) => generateQuestion(difficulty, undefined, prev));
      }, 350);
    }
  };

  // Keyboard shortcut listener
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
          <div className="w-16 h-16 rounded-3xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-4">
            <Timer className="w-8 h-8" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-2">
            Tegen de Klok (60 Seconden)
          </h2>
          <p className="text-sm text-slate-600 max-w-md mx-auto mb-6 leading-relaxed">
            Hoeveel tafelsommen kun jij binnen 1 minuut oplossen? Blijf geconcentreerd en verdien bonuspunten voor reeksen!
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
                {stats.tijdritHighScore} goed
              </p>
            </div>
            <div className="w-px h-8 bg-slate-200" />
            <div className="text-center">
              <span className="text-[11px] font-semibold uppercase text-slate-500">
                Tijdslimiet
              </span>
              <p className="text-xl font-black text-amber-600 font-mono tabular-nums">
                60 sec
              </p>
            </div>
          </div>

          <button
            onClick={startGame}
            className="w-full sm:w-auto px-8 py-3.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-2xl shadow-sm transition-all active:scale-95 flex items-center justify-center gap-2 mx-auto text-base"
          >
            <Play className="w-5 h-5 fill-white" />
            <span>Start de Tijdrit!</span>
          </button>
        </div>
      )}

      {gameState === 'playing' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 relative">
          {/* Top Timer and Score Header */}
          <div className="flex items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-2">
              <div
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-mono tabular-nums font-bold text-sm ${
                  timeLeft <= 10
                    ? 'bg-red-100 text-red-700 animate-pulse ring-2 ring-red-300'
                    : 'bg-slate-100 text-slate-800'
                }`}
              >
                <Timer className="w-4 h-4 text-amber-600" />
                <span>{timeLeft}s</span>
              </div>
              <span className="text-xs text-slate-500 font-semibold hidden sm:inline">
                {streak > 2 && `🔥 ${streak} streak!`}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-emerald-700 font-mono tabular-nums bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                {correctCount} goed
              </span>
              <span className="text-xs font-bold text-amber-700 font-mono tabular-nums bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                +{pointsEarned} ptn
              </span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mb-6">
            <div
              className={`h-full transition-all duration-1000 ${
                timeLeft <= 10 ? 'bg-red-500' : 'bg-amber-500'
              }`}
              style={{ width: `${(timeLeft / 60) * 100}%` }}
            />
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

          {/* 4 Quick Choice Options */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 max-w-md mx-auto">
            {currentQuestion.options.map((opt, idx) => (
              <button
                key={idx}
                disabled={feedback !== 'idle'}
                onClick={() => handleAnswer(opt)}
                className="h-16 sm:h-20 rounded-2xl border-2 border-slate-200 bg-slate-50 hover:bg-amber-50 hover:border-amber-300 text-slate-800 text-2xl sm:text-3xl font-extrabold font-mono tabular-nums shadow-xs transition-all active:scale-95 disabled:pointer-events-none flex items-center justify-center relative"
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

      {gameState === 'summary' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm text-center">
          <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
            <Trophy className="w-8 h-8" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-1">
            Tijd is om!
          </h2>
          <p className="text-sm text-slate-500 mb-6">
            Fantastische inzet! Bekijk hieronder hoe snel je hebt gerekend.
          </p>

          <div className="grid grid-cols-3 gap-3 max-w-md mx-auto mb-6">
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 text-center">
              <span className="text-[10px] font-bold uppercase text-slate-500">
                Goed Beantwoord
              </span>
              <p className="text-2xl font-black text-emerald-600 font-mono tabular-nums mt-1">
                {correctCount}
              </p>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 text-center">
              <span className="text-[10px] font-bold uppercase text-slate-500">
                Foutjes
              </span>
              <p className="text-2xl font-black text-slate-500 font-mono tabular-nums mt-1">
                {wrongCount}
              </p>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 text-center">
              <span className="text-[10px] font-bold uppercase text-amber-700">
                Punten Verdiend
              </span>
              <p className="text-2xl font-black text-amber-600 font-mono tabular-nums mt-1">
                +{pointsEarned}
              </p>
            </div>
          </div>

          {correctCount > stats.tijdritHighScore && (
            <div className="mb-6 p-3 bg-amber-100 text-amber-900 border border-amber-300 rounded-2xl text-xs font-bold inline-flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-600" />
              <span>Nieuw persoonlijk record: {correctCount} goede sommen!</span>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={startGame}
              className="w-full sm:w-auto px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Nog een keer!</span>
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
