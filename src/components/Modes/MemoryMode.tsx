import React, { useState, useEffect } from 'react';
import { Difficulty, UserStats } from '../../types/game';
import { getTablesForDifficulty } from '../../utils/mathQuestions';
import { DifficultySelector } from '../DifficultySelector';
import { soundManager } from '../../utils/audio';
import { fireCelebrationConfetti } from '../../utils/confetti';
import { Grid, Sparkles, RotateCcw, CheckCircle2, Play } from 'lucide-react';

interface MemoryCard {
  id: string;
  pairId: string;
  type: 'problem' | 'answer';
  content: string; // e.g. "6 × 7" or "42"
  isFlipped: boolean;
  isMatched: boolean;
}

interface MemoryModeProps {
  stats: UserStats;
  difficulty: Difficulty;
  onChangeDifficulty: (diff: Difficulty) => void;
  onFinishMemory: (turns: number, pointsEarned: number) => void;
}

export const MemoryMode: React.FC<MemoryModeProps> = ({
  difficulty,
  onChangeDifficulty,
  onFinishMemory,
}) => {
  const [cards, setCards] = useState<MemoryCard[]>([]);
  const [flippedCards, setFlippedCards] = useState<MemoryCard[]>([]);
  const [turns, setTurns] = useState<number>(0);
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [isWon, setIsWon] = useState<boolean>(false);

  const setupCards = () => {
    const tables = getTablesForDifficulty(difficulty);
    const maxB = difficulty === 'moeilijk' ? 12 : 10;

    // Pick 6 unique pairs
    const pairs: Array<{ a: number; b: number }> = [];
    const used = new Set<string>();

    while (pairs.length < 6) {
      const a = tables[Math.floor(Math.random() * tables.length)];
      const b = Math.floor(Math.random() * maxB) + 1;
      const key = `${a}x${b}`;
      if (!used.has(key)) {
        used.add(key);
        pairs.push({ a, b });
      }
    }

    const cardList: MemoryCard[] = [];

    pairs.forEach((p, idx) => {
      const pairId = `pair-${idx}`;
      cardList.push({
        id: `${pairId}-prob`,
        pairId,
        type: 'problem',
        content: `${p.a} × ${p.b}`,
        isFlipped: false,
        isMatched: false,
      });
      cardList.push({
        id: `${pairId}-ans`,
        pairId,
        type: 'answer',
        content: `${p.a * p.b}`,
        isFlipped: false,
        isMatched: false,
      });
    });

    // Shuffle cards
    setCards(cardList.sort(() => Math.random() - 0.5));
    setFlippedCards([]);
    setTurns(0);
    setIsLocked(false);
    setIsWon(false);
  };

  useEffect(() => {
    setupCards();
  }, [difficulty]);

  const handleCardClick = (card: MemoryCard) => {
    if (isLocked || card.isFlipped || card.isMatched) return;

    soundManager.playClick();
    const updatedCards = cards.map((c) =>
      c.id === card.id ? { ...c, isFlipped: true } : c
    );
    setCards(updatedCards);

    const newFlipped = [...flippedCards, card];
    setFlippedCards(newFlipped);

    if (newFlipped.length === 2) {
      setTurns((prev) => prev + 1);
      setIsLocked(true);

      const [first, second] = newFlipped;
      if (first.pairId === second.pairId) {
        // MATCH!
        soundManager.playCorrect();
        setTimeout(() => {
          setCards((prev) =>
            prev.map((c) =>
              c.pairId === first.pairId ? { ...c, isMatched: true } : c
            )
          );
          setFlippedCards([]);
          setIsLocked(false);
        }, 500);
      } else {
        // NO MATCH
        soundManager.playWrong();
        setTimeout(() => {
          setCards((prev) =>
            prev.map((c) =>
              c.id === first.id || c.id === second.id
                ? { ...c, isFlipped: false }
                : c
            )
          );
          setFlippedCards([]);
          setIsLocked(false);
        }, 1100);
      }
    }
  };

  // Check victory
  useEffect(() => {
    if (cards.length > 0 && cards.every((c) => c.isMatched) && !isWon) {
      setIsWon(true);
      soundManager.playFanfare();
      fireCelebrationConfetti();
      const points = Math.max(30, 100 - turns * 3);
      onFinishMemory(turns, points);
    }
  }, [cards, isWon, turns, onFinishMemory]);

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Difficulty Selector */}
      <DifficultySelector
        difficulty={difficulty}
        onChangeDifficulty={onChangeDifficulty}
      />

      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
        {/* Top bar info */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-slate-800">Tafel Memory</span>
            <span className="text-xs text-slate-500 font-mono tabular-nums">
              · {turns} beurten
            </span>
          </div>
          <button
            onClick={setupCards}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Nieuw Spel</span>
          </button>
        </div>

        {isWon ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-1">
              Gefeliciteerd!
            </h3>
            <p className="text-sm text-slate-600 mb-6">
              Je hebt alle sommen en uitkomsten gematcht in {turns} beurten!
            </p>
            <button
              onClick={setupCards}
              className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl shadow-xs transition-colors inline-flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Nog een ronde spelen</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 sm:gap-4">
            {cards.map((card) => {
              const isRevealed = card.isFlipped || card.isMatched;

              return (
                <button
                  key={card.id}
                  disabled={isRevealed || isLocked}
                  onClick={() => handleCardClick(card)}
                  className={`h-24 sm:h-28 rounded-2xl border-2 transition-all duration-300 font-extrabold flex items-center justify-center p-2 relative active:scale-95 ${
                    card.isMatched
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-800 opacity-90'
                      : isRevealed
                      ? 'bg-white border-amber-400 text-slate-900 shadow-md ring-2 ring-amber-100'
                      : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-400'
                  }`}
                >
                  {isRevealed ? (
                    <span
                      className={`font-mono tabular-nums leading-tight ${
                        card.type === 'problem'
                          ? 'text-lg sm:text-xl text-indigo-700'
                          : 'text-2xl sm:text-3xl text-amber-700'
                      }`}
                    >
                      {card.content}
                    </span>
                  ) : (
                    <span className="text-2xl text-slate-300 font-black">?</span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
