import { Difficulty, Question } from '../types/game';

export function getTablesForDifficulty(difficulty: Difficulty): number[] {
  switch (difficulty) {
    case 'makkelijk':
      return [1, 2, 3, 4, 5];
    case 'gemiddeld':
      return [6, 7, 8, 9, 10];
    case 'moeilijk':
      return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  }
}

export function generateDistractors(a: number, b: number, answer: number): number[] {
  const options = new Set<number>([answer]);
  const candidates: number[] = [
    a * (b + 1),
    a * (b - 1),
    (a + 1) * b,
    (a - 1) * b,
    answer + 2,
    answer - 2,
    answer + 10,
    answer - 10,
    answer + 5,
    answer - 5,
    (a + 2) * b,
    a * (b + 2),
  ];

  // Filter positive valid candidates not equal to answer
  const validCandidates = candidates.filter((c) => c > 0 && c !== answer);
  // Shuffle candidates
  const shuffledCandidates = [...validCandidates].sort(() => Math.random() - 0.5);

  for (const cand of shuffledCandidates) {
    if (options.size >= 4) break;
    options.add(cand);
  }

  // If still need more, generate plausible nearby numbers
  let step = 1;
  while (options.size < 4) {
    const cand1 = answer + step;
    if (cand1 > 0) options.add(cand1);
    const cand2 = answer - step;
    if (cand2 > 0) options.add(cand2);
    step++;
  }

  // Shuffle final 4 options
  return Array.from(options).sort(() => Math.random() - 0.5);
}

export function generateQuestion(
  difficulty: Difficulty,
  customTables?: number[],
  previousQuestion?: Question | null,
  weakSpots?: Array<{ a: number; b: number; smartTip: string }>,
  prioritizeWeakSpots: boolean = true
): Question {
  const availableTables =
    customTables && customTables.length > 0
      ? customTables.filter((t) => t >= 1 && t <= 10)
      : getTablesForDifficulty(difficulty);

  const maxB = 10;

  let a: number;
  let b: number;
  let isFocusQuestion = false;
  let smartTip: string | undefined = undefined;

  // 65% chance to prioritize a weak spot if available
  if (
    prioritizeWeakSpots &&
    weakSpots &&
    weakSpots.length > 0 &&
    Math.random() < 0.65
  ) {
    // Pick from weak spots strictly within 1-10
    const eligibleWeakSpots = weakSpots.filter((ws) =>
      availableTables.includes(ws.a) && ws.b <= maxB && ws.a <= 10 &&
      (!previousQuestion || previousQuestion.a !== ws.a || previousQuestion.b !== ws.b)
    );

    const pool = eligibleWeakSpots.length > 0 ? eligibleWeakSpots : weakSpots.filter((ws) => ws.a <= 10 && ws.b <= 10);
    if (pool.length > 0) {
      const selected = pool[Math.floor(Math.random() * pool.length)];
      a = selected.a;
      b = selected.b;
      isFocusQuestion = true;
      smartTip = selected.smartTip;
    } else {
      a = availableTables[Math.floor(Math.random() * availableTables.length)];
      b = Math.floor(Math.random() * maxB) + 1;
    }
  } else {
    a = availableTables[Math.floor(Math.random() * availableTables.length)];
    b = Math.floor(Math.random() * maxB) + 1;

    // Avoid giving the exact same question back-to-back if possible
    if (
      previousQuestion &&
      previousQuestion.a === a &&
      previousQuestion.b === b &&
      (availableTables.length > 1 || maxB > 1)
    ) {
      b = (b % maxB) + 1;
    }
  }

  const answer = a * b;
  const options = generateDistractors(a, b, answer);

  return {
    id: `${a}x${b}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    a,
    b,
    answer,
    options,
    isFocusQuestion,
    smartTip,
  };
}

export function generateQuestionBatch(
  count: number,
  difficulty: Difficulty,
  customTables?: number[]
): Question[] {
  const tables =
    customTables && customTables.length > 0
      ? customTables.filter((t) => t >= 1 && t <= 10)
      : getTablesForDifficulty(difficulty);

  const maxB = 10;
  const allPairs: Array<[number, number]> = [];

  for (const t of tables) {
    for (let b = 1; b <= maxB; b++) {
      allPairs.push([t, b]);
    }
  }

  // Shuffle all pairs
  const shuffledPairs = allPairs.sort(() => Math.random() - 0.5);
  const selectedPairs = shuffledPairs.slice(0, count);

  return selectedPairs.map(([a, b]) => {
    const answer = a * b;
    return {
      id: `${a}x${b}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      a,
      b,
      answer,
      options: generateDistractors(a, b, answer),
    };
  });
}
