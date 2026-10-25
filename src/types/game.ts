export type Difficulty = 'makkelijk' | 'gemiddeld' | 'moeilijk';

export type GameMode = 'oefenen' | 'tijdrit' | 'overleven' | 'memory' | 'diploma' | 'rooster';

export type InputMode = 'knoppen' | 'toetsenbord';

export interface Question {
  id: string;
  a: number; // e.g. 6
  b: number; // e.g. 7
  answer: number; // 42
  options: number[]; // 4 choices
  userAnswer?: number;
  isCorrect?: boolean;
  timeSpentMs?: number;
  isFocusQuestion?: boolean;
  smartTip?: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress: number;
  target: number;
  rewardPoints: number;
  unlockedAt?: string;
  category: 'score' | 'tafels' | 'streak' | 'snelheid' | 'diploma';
}

export interface DiplomaRecord {
  id: string;
  date: string;
  playerName: string;
  difficulty: Difficulty;
  score: number;
  total: number;
  percentage: number;
}

export interface FactMastery {
  correct: number;
  incorrect: number;
  lastPracticed?: string;
}

export interface UserStats {
  playerName: string;
  points: number;
  totalCorrect: number;
  totalAttempted: number;
  bestStreak: number;
  currentStreak: number;
  tijdritHighScore: number;
  overlevenHighScore: number;
  level: number;
  unlockedAchievements: string[];
  tableMastery: Record<string, FactMastery>; // key: "a x b"
  diplomas: DiplomaRecord[];
  soundEnabled: boolean;
}
