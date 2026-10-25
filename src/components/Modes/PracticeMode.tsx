import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Difficulty, Question, UserStats } from '../../types/game';
import { generateQuestion } from '../../utils/mathQuestions';
import { identifyWeakSpots, getSmartTipForFact } from '../../utils/smartTips';
import { DifficultySelector } from '../DifficultySelector';
import { VisualArray } from '../VisualArray';
import { Keypad } from '../Keypad';
import { SmartTipBanner } from '../SmartTipBanner';
import { soundManager } from '../../utils/audio';
import { fireStreakBurst } from '../../utils/confetti';
import {
  Flame,
  HelpCircle,
  RotateCcw,
  Sparkles,
  Keyboard,
  MousePointer,
  Check,
  X,
  Eye,
  EyeOff,
  Target,
  Lightbulb,
} from 'lucide-react';

interface PracticeModeProps {
  stats: UserStats;
  difficulty: Difficulty;
  onChangeDifficulty: (diff: Difficulty) => void;
  customTables: number[];
  onChangeCustomTables: (tables: number[]) => void;
  onCorrectAnswer: (pointsEarned: number, question: Question, streak: number) => void;
  onIncorrectAnswer: (question: Question) => void;
}

export const PracticeMode: React.FC<PracticeModeProps> = ({
  stats,
  difficulty,
  onChangeDifficulty,
  customTables,
  onChangeCustomTables,
  onCorrectAnswer,
  onIncorrectAnswer,
}) => {
  const [prioritizeWeakSpots, setPrioritizeWeakSpots] = useState<boolean>(true);

  // Identify weak spots based on user stats
  const weakSpots = useMemo(() => {
    return identifyWeakSpots(stats.tableMastery, difficulty, customTables);
  }, [stats.tableMastery, difficulty, customTables]);

  const [currentQuestion, setCurrentQuestion] = useState<Question>(() =>
    generateQuestion(difficulty, customTables, null, weakSpots, true)
  );
  const [inputMode, setInputMode] = useState<'knoppen' | 'toetsenbord'>('knoppen');
  const [keypadInput, setKeypadInput] = useState<string>('');
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<'idle' | 'correct' | 'wrong'>('idle');
  const [showVisualArray, setShowVisualArray] = useState<boolean>(false);
  const [streak, setStreak] = useState<number>(0);
  const [pointPopup, setPointPopup] = useState<number | null>(null);
  const [mistakes, setMistakes] = useState<Question[]>([]);
  const questionStartTimeRef = useRef<number>(Date.now());

  // Regenerate question when difficulty or custom tables change
  useEffect(() => {
    setCurrentQuestion(
      generateQuestion(difficulty, customTables, null, weakSpots, prioritizeWeakSpots)
    );
    setFeedback('idle');
    setSelectedAnswer(null);
    setKeypadInput('');
    questionStartTimeRef.current = Date.now();
  }, [difficulty, customTables]);

  const handleNextQuestion = useCallback(() => {
    setFeedback('idle');
    setSelectedAnswer(null);
    setKeypadInput('');
    questionStartTimeRef.current = Date.now();
    setCurrentQuestion((prev) =>
      generateQuestion(difficulty, customTables, prev, weakSpots, prioritizeWeakSpots)
    );
  }, [difficulty, customTables, weakSpots, prioritizeWeakSpots]);

  const handleSelectSpecificFact = (a: number, b: number) => {
    soundManager.playClick();
    setFeedback('idle');
    setSelectedAnswer(null);
    setKeypadInput('');
    questionStartTimeRef.current = Date.now();
    const answer = a * b;
    setCurrentQuestion({
      id: `${a}x${b}-${Date.now()}`,
      a,
      b,
      answer,
      options: [answer, answer + 2, answer - 2, answer + 5].sort(() => Math.random() - 0.5),
      isFocusQuestion: true,
      smartTip: getSmartTipForFact(a, b),
    });
  };

  const verifyAnswer = useCallback(
    (answerNum: number) => {
      if (feedback !== 'idle') return;

      const timeSpent = Date.now() - questionStartTimeRef.current;
      setSelectedAnswer(answerNum);

      if (answerNum === currentQuestion.answer) {
        // Correct answer!
        const newStreak = streak + 1;
        setStreak(newStreak);

        // Point calculation: base 10 + streak bonus + speed bonus
        let points = 10;
        if (newStreak >= 10) points += 20;
        else if (newStreak >= 5) points += 10;
        else if (newStreak >= 3) points += 5;

        if (timeSpent < 3500) {
          points += 5; // Fast answer bonus
        }

        setPointPopup(points);
        setTimeout(() => setPointPopup(null), 1200);

        soundManager.playCorrect(newStreak);
        if (newStreak % 5 === 0) {
          soundManager.playCombo();
          fireStreakBurst();
        }

        setFeedback('correct');
        onCorrectAnswer(points, { ...currentQuestion, userAnswer: answerNum, timeSpentMs: timeSpent }, newStreak);

        // Auto advance after 800ms
        setTimeout(() => {
          handleNextQuestion();
        }, 850);
      } else {
        // Incorrect answer
        setStreak(0);
        soundManager.playWrong();
        setFeedback('wrong');
        setMistakes((prev) => {
          const exists = prev.some((m) => m.a === currentQuestion.a && m.b === currentQuestion.b);
          return exists ? prev : [...prev, currentQuestion];
        });
        onIncorrectAnswer({ ...currentQuestion, userAnswer: answerNum, timeSpentMs: timeSpent });

        // Show correct answer for a moment before continuing
        setTimeout(() => {
          handleNextQuestion();
        }, 1800);
      }
    },
    [feedback, currentQuestion, streak, onCorrectAnswer, onIncorrectAnswer, handleNextQuestion]
  );

  // Keyboard listener for physical typing
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (feedback !== 'idle') return;

      if (inputMode === 'toetsenbord') {
        if (e.key >= '0' && e.key <= '9') {
          soundManager.playClick();
          setKeypadInput((prev) => (prev.length < 3 ? prev + e.key : prev));
        } else if (e.key === 'Backspace') {
          soundManager.playClick();
          setKeypadInput((prev) => prev.slice(0, -1));
        } else if (e.key === 'Enter') {
          if (keypadInput.trim().length > 0) {
            verifyAnswer(parseInt(keypadInput.trim(), 10));
          }
        }
      } else if (inputMode === 'knoppen') {
        // Map 1, 2, 3, 4 keys to options
        if (['1', '2', '3', '4'].includes(e.key)) {
          const index = parseInt(e.key, 10) - 1;
          if (currentQuestion.options[index] !== undefined) {
            verifyAnswer(currentQuestion.options[index]);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [inputMode, keypadInput, feedback, currentQuestion, verifyAnswer]);

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Difficulty Selector */}
      <DifficultySelector
        difficulty={difficulty}
        onChangeDifficulty={onChangeDifficulty}
        customTables={customTables}
        onChangeCustomTables={onChangeCustomTables}
      />

      {/* Slimme Tip & Zwakke Punten Module */}
      <SmartTipBanner
        weakSpots={weakSpots}
        prioritizeWeakSpots={prioritizeWeakSpots}
        onTogglePrioritize={() => setPrioritizeWeakSpots((prev) => !prev)}
        onSelectWeakSpot={handleSelectSpecificFact}
        currentFact={{
          a: currentQuestion.a,
          b: currentQuestion.b,
          isFocusQuestion: currentQuestion.isFocusQuestion,
          smartTip: currentQuestion.smartTip,
        }}
      />

      {/* Main Practice Game Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 relative overflow-hidden">
        {/* Streak & points badge top strip */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div
              className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                streak >= 3
                  ? 'bg-amber-100 text-amber-900 ring-2 ring-amber-300'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              <Flame
                className={`w-4 h-4 ${
                  streak >= 3 ? 'text-amber-500 fill-amber-500 animate-bounce' : 'text-slate-400'
                }`}
              />
              <span>
                {streak} op een rij {streak >= 5 ? '(2x bonus!)' : streak >= 3 ? '(1.5x)' : ''}
              </span>
            </div>

            {currentQuestion.isFocusQuestion && (
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold text-amber-900 bg-amber-100 px-2.5 py-1 rounded-xl border border-amber-300">
                <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
                Focus-som
              </span>
            )}
          </div>

          {/* Toggle Controls: Visual Array & Input Mode */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setShowVisualArray(!showVisualArray)}
              title={showVisualArray ? 'Verberg visuele sterren' : 'Toon visuele hulp met sterren'}
              className={`p-2 rounded-xl text-xs font-medium border transition-colors flex items-center gap-1.5 ${
                showVisualArray
                  ? 'bg-amber-50 text-amber-900 border-amber-300'
                  : 'text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {showVisualArray ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">Visuele hulp</span>
            </button>

            <button
              onClick={() => {
                setInputMode(inputMode === 'knoppen' ? 'toetsenbord' : 'knoppen');
                setKeypadInput('');
              }}
              title="Wissel invoermethode"
              className="p-2 rounded-xl text-xs font-medium border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors flex items-center gap-1.5"
            >
              {inputMode === 'knoppen' ? (
                <>
                  <Keyboard className="w-3.5 h-3.5 text-indigo-600" />
                  <span className="hidden sm:inline">Cijfertoetsen</span>
                </>
              ) : (
                <>
                  <MousePointer className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="hidden sm:inline">Keuzeknoppen</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Visual Array Helper if enabled */}
        {showVisualArray && (
          <VisualArray a={currentQuestion.a} b={currentQuestion.b} />
        )}

        {/* The Big Math Problem */}
        <div className="text-center py-6 sm:py-8 relative">
          {/* Floating point award popup */}
          {pointPopup !== null && (
            <div className="absolute top-2 left-1/2 -translate-x-1/2 -translate-y-4 font-black text-2xl text-amber-500 animate-float pointer-events-none drop-shadow-xs">
              +{pointPopup} ptn!
            </div>
          )}

          <div className="text-5xl sm:text-7xl font-black text-slate-900 tracking-tight font-display flex items-center justify-center gap-3 sm:gap-4 select-none">
            <span className="text-indigo-600">{currentQuestion.a}</span>
            <span className="text-amber-500 text-4xl sm:text-6xl">×</span>
            <span className="text-indigo-600">{currentQuestion.b}</span>
            <span className="text-slate-400">=</span>
            <span
              className={`min-w-16 sm:min-w-24 px-3 py-1 rounded-2xl border-2 transition-all font-mono tabular-nums ${
                feedback === 'correct'
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-700 ring-4 ring-emerald-100'
                  : feedback === 'wrong'
                  ? 'border-red-500 bg-red-50 text-red-700 ring-4 ring-red-100'
                  : 'border-slate-300 bg-slate-50 text-slate-800'
              }`}
            >
              {inputMode === 'toetsenbord'
                ? keypadInput || '?'
                : selectedAnswer !== null
                ? selectedAnswer
                : '?'}
            </span>
          </div>

          {/* Feedback message banner */}
          <div className="h-8 mt-3 flex items-center justify-center">
            {feedback === 'correct' && (
              <span className="inline-flex items-center gap-1.5 text-sm font-bold text-emerald-600 animate-pulse">
                <Check className="w-4 h-4" /> Uitstekend gedaan!
              </span>
            )}
            {feedback === 'wrong' && (
              <span className="inline-flex items-center gap-1.5 text-sm font-bold text-red-600">
                <X className="w-4 h-4" /> Bijna! {currentQuestion.a} × {currentQuestion.b} = {currentQuestion.answer}
              </span>
            )}
            {feedback === 'idle' && (
              <span className="text-xs text-slate-600">
                {inputMode === 'knoppen'
                  ? 'Tik op het juiste antwoord hieronder'
                  : 'Voer de uitkomst in met het toetsenbord'}
              </span>
            )}
          </div>
        </div>

        {/* Input Controls */}
        {inputMode === 'knoppen' ? (
          <div className="grid grid-cols-2 gap-3 sm:gap-4 max-w-md mx-auto mt-2">
            {currentQuestion.options.map((opt, idx) => {
              const isSelected = selectedAnswer === opt;
              const isCorrectAnswer = opt === currentQuestion.answer;
              let btnStyle =
                'bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100 hover:border-slate-300';

              if (feedback !== 'idle') {
                if (isCorrectAnswer) {
                  btnStyle = 'bg-emerald-500 border-emerald-600 text-white font-black shadow-xs';
                } else if (isSelected && !isCorrectAnswer) {
                  btnStyle = 'bg-red-500 border-red-600 text-white font-black';
                } else {
                  btnStyle = 'opacity-40 bg-slate-50 border-slate-200 text-slate-400';
                }
              }

              return (
                <button
                  key={idx}
                  disabled={feedback !== 'idle'}
                  onClick={() => verifyAnswer(opt)}
                  className={`h-16 sm:h-20 rounded-2xl border-2 text-2xl sm:text-3xl font-extrabold font-mono tabular-nums shadow-xs transition-all active:scale-95 disabled:pointer-events-none flex items-center justify-center relative ${btnStyle}`}
                >
                  <span className="absolute top-2 left-2 text-[10px] text-slate-600/70 font-sans hidden sm:block">
                    {idx + 1}
                  </span>
                  {opt}
                </button>
              );
            })}
          </div>
        ) : (
          <Keypad
            value={keypadInput}
            onDigit={(d) => {
              soundManager.playClick();
              setKeypadInput((prev) => (prev.length < 3 ? prev + d : prev));
            }}
            onBackspace={() => {
              soundManager.playClick();
              setKeypadInput((prev) => prev.slice(0, -1));
            }}
            onSubmit={() => {
              if (keypadInput.trim().length > 0) {
                verifyAnswer(parseInt(keypadInput.trim(), 10));
              }
            }}
            disabled={feedback !== 'idle'}
          />
        )}
      </div>

      {/* Mistakes review bar if any happened in this session */}
      {mistakes.length > 0 && (
        <div className="mt-4 p-4 bg-amber-50/60 rounded-2xl border border-amber-200/80">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-amber-900">
              Aandachtspunten ({mistakes.length} sommen om extra te onthouden)
            </span>
            <button
              onClick={() => setMistakes([])}
              className="text-[11px] text-amber-700 hover:text-amber-900 underline"
            >
              Wissen
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {mistakes.map((m) => (
              <button
                key={m.id}
                onClick={() => {
                  setCurrentQuestion(m);
                  setFeedback('idle');
                  setSelectedAnswer(null);
                  setKeypadInput('');
                }}
                className="px-2.5 py-1 rounded-lg bg-white border border-amber-300 text-xs font-mono tabular-nums text-amber-950 font-semibold hover:bg-amber-100 transition-colors"
              >
                {m.a} × {m.b} = <strong>{m.answer}</strong>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
