import { FactMastery, Difficulty } from '../types/game';
import { getTablesForDifficulty } from './mathQuestions';

export interface WeakSpot {
  a: number;
  b: number;
  key: string; // "axb"
  answer: number;
  incorrectCount: number;
  correctCount: number;
  errorRate: number; // 0 to 1
  smartTip: string;
}

export function getSmartTipForFact(a: number, b: number): string {
  // Specific famous facts
  if ((a === 7 && b === 8) || (a === 8 && b === 7)) {
    return 'Ezelsbruggetje 5-6-7-8: tel op de maat "5, 6, 7, 8" → dus 56 = 7 × 8!';
  }
  if ((a === 6 && b === 7) || (a === 7 && b === 6)) {
    return 'Denk aan 5 × 7 = 35, en tel er nog één keer 7 bij op: 35 + 7 = 42!';
  }
  if ((a === 6 && b === 8) || (a === 8 && b === 6)) {
    return 'Rijmpje: 6 × 8 = 48! Of doe de helft van 8 × 8 (64 - 16 = 48).';
  }
  if ((a === 7 && b === 9) || (a === 9 && b === 7)) {
    return 'Tafel van 9 truc: doe 10 × 7 = 70, min 7 = 63. De cijfers 6 + 3 zijn samen 9!';
  }
  if ((a === 8 && b === 9) || (a === 9 && b === 8)) {
    return 'Tafel van 9 truc: 10 × 8 = 80, min 8 = 72. De cijfers 7 + 2 = 9!';
  }
  if (a === b) {
    if (a === 6) return 'Kwadraat: 6 × 6 = 36 (zes keer zes is zesendertig!).';
    if (a === 7) return 'Kwadraat: 7 × 7 = 49 (zeven keer zeven is negenenveertig).';
    if (a === 8) return 'Kwadraat: 8 × 8 = 64 (acht keer acht viel in de gracht, vierenzestig!).';
    if (a === 9) return 'Kwadraat: 9 × 9 = 81 (negen keer negen is eenentachtig).';
    if (a === 12) return 'Kwadraat: 12 × 12 = 144 (een gros!).';
  }

  // General table rules
  if (a === 9 || b === 9) {
    const other = a === 9 ? b : a;
    return `Tafel van 9: doe 10 × ${other} = ${10 * other}, trek er dan ${other} vanaf: ${other * 9}!`;
  }

  if (a === 4 || b === 4) {
    const other = a === 4 ? b : a;
    return `Tafel van 4 is dubbel verdubbelen: 2 × ${other} = ${2 * other}, en dat nog eens verdubbelen = ${4 * other}!`;
  }

  if (a === 8 || b === 8) {
    const other = a === 8 ? b : a;
    return `Tafel van 8: verdubbel drie keer achter elkaar! (${other} → ${other * 2} → ${other * 4} → ${other * 8})`;
  }

  if (a === 5 || b === 5) {
    const other = a === 5 ? b : a;
    return `Tafel van 5: neem de helft van 10 × ${other} (${10 * other} ÷ 2 = ${5 * other})!`;
  }

  if (a === 6 || b === 6) {
    const other = a === 6 ? b : a;
    return `Tafel van 6: bereken eerst 5 × ${other} = ${5 * other}, en tel er nog 1× ${other} bij op: ${6 * other}!`;
  }

  if (a === 11 || b === 11) {
    const other = a === 11 ? b : a;
    if (other <= 9) return `Tafel van 11: herhaal gewoon het cijfer twee keer: ${other}${other} = ${11 * other}!`;
    return `Tafel van 11: splits in 10 × ${other} + 1 × ${other} = ${11 * other}.`;
  }

  if (a === 12 || b === 12) {
    const other = a === 12 ? b : a;
    return `Tafel van 12: splits in 10 × ${other} (${10 * other}) + 2 × ${other} (${2 * other}) = ${12 * other}!`;
  }

  return `Denk aan herhaald optellen of draai de som om: ${a} × ${b} is hetzelfde als ${b} × ${a} = ${a * b}!`;
}

export function identifyWeakSpots(
  tableMastery: Record<string, FactMastery>,
  difficulty: Difficulty,
  customTables?: number[]
): WeakSpot[] {
  const allowedTables =
    customTables && customTables.length > 0
      ? customTables
      : getTablesForDifficulty(difficulty);

  const maxB = 10;
  const weakSpots: WeakSpot[] = [];

  Object.entries(tableMastery).forEach(([key, mastery]) => {
    const parts = key.split('x');
    if (parts.length !== 2) return;
    const a = parseInt(parts[0], 10);
    const b = parseInt(parts[1], 10);

    // Only consider facts within tables 1-10 and current selected difficulty
    if (!allowedTables.includes(a) || a > 10 || b > maxB) return;

    const total = mastery.correct + mastery.incorrect;
    // Consider weak if incorrect > 0 and error rate >= 30%, or if incorrect >= 2
    if (mastery.incorrect > 0) {
      const errorRate = total > 0 ? mastery.incorrect / total : 1;
      if (errorRate >= 0.25 || mastery.incorrect >= 2) {
        weakSpots.push({
          a,
          b,
          key,
          answer: a * b,
          incorrectCount: mastery.incorrect,
          correctCount: mastery.correct,
          errorRate,
          smartTip: getSmartTipForFact(a, b),
        });
      }
    }
  });

  // Sort by highest incorrect count and error rate
  return weakSpots.sort((x, y) => {
    if (y.incorrectCount !== x.incorrectCount) {
      return y.incorrectCount - x.incorrectCount;
    }
    return y.errorRate - x.errorRate;
  });
}
