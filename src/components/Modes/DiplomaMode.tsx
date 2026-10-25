import React, { useState, useEffect } from 'react';
import { Difficulty, Question, UserStats, DiplomaRecord } from '../../types/game';
import { generateQuestionBatch } from '../../utils/mathQuestions';
import { soundManager } from '../../utils/audio';
import { fireDiplomaCelebration } from '../../utils/confetti';
import {
  GraduationCap,
  Award,
  Printer,
  RotateCcw,
  Play,
  Check,
  X,
  FileCheck,
  Calendar,
  User,
} from 'lucide-react';

interface DiplomaModeProps {
  stats: UserStats;
  difficulty: Difficulty;
  onChangeDifficulty: (diff: Difficulty) => void;
  onDiplomaEarned: (record: DiplomaRecord, bonusPoints: number) => void;
  onUpdatePlayerName: (name: string) => void;
}

export const DiplomaMode: React.FC<DiplomaModeProps> = ({
  stats,
  difficulty,
  onChangeDifficulty,
  onDiplomaEarned,
  onUpdatePlayerName,
}) => {
  const [examState, setExamState] = useState<'setup' | 'testing' | 'result'>('setup');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<number[]>([]);
  const [playerNameInput, setPlayerNameInput] = useState<string>(stats.playerName || 'Rekenheld');
  const [latestDiploma, setLatestDiploma] = useState<DiplomaRecord | null>(null);

  const startExam = () => {
    onUpdatePlayerName(playerNameInput.trim() || 'Rekenheld');
    const batch = generateQuestionBatch(20, difficulty);
    setQuestions(batch);
    setCurrentIndex(0);
    setUserAnswers([]);
    setExamState('testing');
    soundManager.playClick();
  };

  const handleSelectAnswer = (ans: number) => {
    soundManager.playClick();
    const updated = [...userAnswers, ans];
    setUserAnswers(updated);

    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      // Finished the 20 questions!
      evaluateExam(updated);
    }
  };

  const evaluateExam = (finalAnswers: number[]) => {
    let correct = 0;
    questions.forEach((q, idx) => {
      if (finalAnswers[idx] === q.answer) {
        correct++;
      }
    });

    const percentage = Math.round((correct / questions.length) * 100);
    const passed = percentage >= 90;

    if (passed) {
      soundManager.playFanfare();
      fireDiplomaCelebration();

      const newDiploma: DiplomaRecord = {
        id: `diploma-${Date.now()}`,
        date: new Date().toLocaleDateString('nl-NL', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        }),
        playerName: playerNameInput.trim() || 'Rekenheld',
        difficulty,
        score: correct,
        total: questions.length,
        percentage,
      };

      setLatestDiploma(newDiploma);
      onDiplomaEarned(newDiploma, 200); // 200 bonus points for diploma
    } else {
      soundManager.playWrong();
      setLatestDiploma(null);
    }

    setExamState('result');
  };

  const currentQ = questions[currentIndex];
  const passed = latestDiploma !== null;
  const correctCount = questions.reduce(
    (acc, q, idx) => (userAnswers[idx] === q.answer ? acc + 1 : acc),
    0
  );

  const diplomaTierName =
    difficulty === 'makkelijk'
      ? 'Brons (Tafels 1 t/m 5)'
      : difficulty === 'gemiddeld'
      ? 'Zilver (Tafels 6 t/m 10)'
      : 'Goud (Alle Tafels 1 t/m 10)';

  return (
    <div className="w-full max-w-2xl mx-auto">
      {examState === 'setup' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm text-center">
          <div className="w-16 h-16 rounded-3xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto mb-4">
            <GraduationCap className="w-8 h-8" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-2">
            Het Officiële Tafeldiploma
          </h2>
          <p className="text-sm text-slate-600 max-w-md mx-auto mb-6 leading-relaxed">
            Doe de grote 20-sommen toets. Haal minstens 90% (18 van de 20 goed) en verdien jouw officiële diploma met gouden medaille!
          </p>

          {/* Name input */}
          <div className="max-w-sm mx-auto mb-6 text-left">
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Naam op het diploma:
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={playerNameInput}
                onChange={(e) => setPlayerNameInput(e.target.value)}
                placeholder="Bijv. Lucas of Emma"
                maxLength={25}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-400"
              />
            </div>
          </div>

          {/* Tier buttons */}
          <div className="mb-6">
            <span className="block text-xs font-semibold uppercase text-slate-500 mb-2">
              Kies je diploma examen niveau:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 max-w-md mx-auto">
              {[
                { id: 'makkelijk', title: 'Brons', sub: 'Tafels 1 t/m 5' },
                { id: 'gemiddeld', title: 'Zilver', sub: 'Tafels 6 t/m 10' },
                { id: 'moeilijk', title: 'Goud', sub: 'Alle Tafels (1-10)' },
              ].map((t) => {
                const isSelected = difficulty === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => onChangeDifficulty(t.id as Difficulty)}
                    className={`p-3 rounded-xl border-2 text-center transition-all ${
                      isSelected
                        ? 'border-amber-500 bg-amber-50/50 text-amber-900 shadow-2xs font-bold'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <div className="text-sm font-extrabold">{t.title}</div>
                    <div className="text-[11px] text-slate-500 font-mono mt-0.5">{t.sub}</div>
                  </button>
                );
              })}
            </div>
          </div>

          <button
            onClick={startExam}
            className="w-full sm:w-auto px-8 py-3.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-2xl shadow-sm transition-all active:scale-95 flex items-center justify-center gap-2 mx-auto text-base"
          >
            <Play className="w-5 h-5 fill-white" />
            <span>Start Diploma Toets</span>
          </button>
        </div>
      )}

      {examState === 'testing' && currentQ && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8">
          {/* Header indicator */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-slate-500">
              Vraag {currentIndex + 1} van {questions.length}
            </span>
            <span className="text-xs font-semibold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
              {diplomaTierName}
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mb-8">
            <div
              className="h-full bg-amber-500 transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
            />
          </div>

          {/* Math Question */}
          <div className="text-center py-6 sm:py-10">
            <div className="text-5xl sm:text-7xl font-black text-slate-900 tracking-tight font-display flex items-center justify-center gap-3 sm:gap-4 select-none">
              <span className="text-indigo-600">{currentQ.a}</span>
              <span className="text-amber-500 text-4xl sm:text-6xl">×</span>
              <span className="text-indigo-600">{currentQ.b}</span>
              <span className="text-slate-400">=</span>
              <span className="min-w-16 sm:min-w-24 px-3 py-1 rounded-2xl border-2 border-slate-300 bg-slate-50 text-slate-800 font-mono tabular-nums">
                ?
              </span>
            </div>
          </div>

          {/* 4 Choices */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 max-w-md mx-auto">
            {currentQ.options.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectAnswer(opt)}
                className="h-16 sm:h-20 rounded-2xl border-2 border-slate-200 bg-slate-50 hover:bg-amber-50 hover:border-amber-300 text-slate-800 text-2xl sm:text-3xl font-extrabold font-mono tabular-nums shadow-xs transition-all active:scale-95 flex items-center justify-center"
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      )}

      {examState === 'result' && (
        <div>
          {passed ? (
            <div className="space-y-6">
              {/* Diploma Certificate Print Area */}
              <div
                id="diploma-print-area"
                className="bg-gradient-to-b from-amber-50/60 via-white to-amber-50/30 rounded-3xl border-4 border-amber-300/80 p-6 sm:p-10 shadow-lg text-center relative overflow-hidden"
              >
                {/* Decorative border frame */}
                <div className="border border-amber-300/60 rounded-2xl p-6 sm:p-8">
                  {/* Visual Medal Image */}
                  <div className="w-24 h-24 mx-auto mb-4 relative">
                    <img
                      src="/src/assets/images/tafel_diploma_banner_1792868973995.jpg"
                      alt="Tafeldiploma medaille"
                      className="w-full h-full object-contain drop-shadow-md rounded-xl"
                      referrerPolicy="no-referrer"
                    />
                  </div>

                  <span className="text-xs font-extrabold uppercase tracking-widest text-amber-800">
                    Officieel Getuigschrift
                  </span>
                  <h1 className="text-3xl sm:text-4xl font-black text-slate-900 mt-1 mb-2 font-display">
                    TAFELDIPLOMA
                  </h1>
                  <p className="text-xs sm:text-sm font-semibold text-amber-700 mb-6">
                    {diplomaTierName}
                  </p>

                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">
                    Dit bewijst dat
                  </p>
                  <p className="text-2xl sm:text-3xl font-black text-indigo-900 border-b-2 border-dashed border-indigo-200 pb-2 mb-4 inline-block px-6">
                    {playerNameInput || 'Rekenheld'}
                  </p>

                  <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed mb-6">
                    met succes alle vragen heeft beantwoord en heeft bewezen de tafels van vermenigvuldiging uitstekend uit het hoofd te kennen!
                  </p>

                  {/* Stats strip on diploma */}
                  <div className="flex items-center justify-center gap-6 py-3 border-y border-amber-200/60 max-w-sm mx-auto mb-6 text-xs text-slate-700">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Score</span>
                      <strong className="font-mono tabular-nums text-sm text-emerald-700">
                        {correctCount} / 20 goed
                      </strong>
                    </div>
                    <div className="w-px h-6 bg-amber-200" />
                    <div>
                      <span className="text-slate-400 block text-[10px]">Cijfer</span>
                      <strong className="font-mono tabular-nums text-sm text-indigo-700">
                        {Math.round((correctCount / 20) * 100)}%
                      </strong>
                    </div>
                    <div className="w-px h-6 bg-amber-200" />
                    <div>
                      <span className="text-slate-400 block text-[10px]">Datum</span>
                      <strong className="text-xs text-slate-800">
                        {new Date().toLocaleDateString('nl-NL')}
                      </strong>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-400 max-w-md mx-auto pt-2">
                    <span>Geverifieerd door: TafelKampioen</span>
                    <span className="font-serif italic text-slate-600">★ Meesterlijk ★</span>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={() => window.print()}
                  className="w-full sm:w-auto px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print of Bewaar Diploma</span>
                </button>
                <button
                  onClick={() => setExamState('setup')}
                  className="w-full sm:w-auto px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Ander Diploma Behalen</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm text-center">
              <div className="w-16 h-16 rounded-3xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto mb-4">
                <RotateCcw className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-black text-slate-900 mb-1">
                Net niet gehaald!
              </h2>
              <p className="text-sm text-slate-600 max-w-md mx-auto mb-4">
                Je had {correctCount} van de 20 vragen goed ({Math.round((correctCount / 20) * 100)}%). Voor het diploma heb je minimaal 18 van de 20 (90%) nodig.
              </p>
              <p className="text-xs text-slate-500 mb-6">
                Geen zorgen! Oefen nog even in de oefenmodus en probeer het daarna meteen nog een keer.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={startExam}
                  className="w-full sm:w-auto px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Probeer de Toets Opnieuw</span>
                </button>
                <button
                  onClick={() => setExamState('setup')}
                  className="w-full sm:w-auto px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-xl transition-colors"
                >
                  Kies Ander Niveau
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
