import { UserStats } from '../types/game';

const STORAGE_KEY = 'tafelkampioen_stats_v1';

export const DEFAULT_STATS: UserStats = {
  playerName: 'Rekenheld',
  points: 0,
  totalCorrect: 0,
  totalAttempted: 0,
  bestStreak: 0,
  currentStreak: 0,
  tijdritHighScore: 0,
  overlevenHighScore: 0,
  level: 1,
  unlockedAchievements: [],
  tableMastery: {},
  diplomas: [],
  soundEnabled: true,
};

export function loadUserStats(): UserStats {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATS;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_STATS,
      ...parsed,
    };
  } catch {
    return DEFAULT_STATS;
  }
}

export function saveUserStats(stats: UserStats): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  } catch (e) {
    console.error('Failed to save user stats', e);
  }
}

export function calculateLevel(points: number): { level: number; title: string; nextLevelPoints: number; progressPercent: number } {
  // Levels:
  // 1: 0 - 99 (Rekenstarter)
  // 2: 100 - 249 (Tafelontdekker)
  // 3: 250 - 499 (Rekenheld)
  // 4: 500 - 999 (Tafelmeester)
  // 5: 1000 - 1999 (Rekenwonder)
  // 6: 2000+ (Tafellegende)
  const tiers = [
    { level: 1, min: 0, max: 100, title: 'Rekenstarter' },
    { level: 2, min: 100, max: 250, title: 'Tafelontdekker' },
    { level: 3, min: 250, max: 500, title: 'Rekenheld' },
    { level: 4, min: 500, max: 1000, title: 'Tafelmeester' },
    { level: 5, min: 1000, max: 2000, title: 'Rekenwonder' },
    { level: 6, min: 2000, max: 5000, title: 'Tafellegende' },
  ];

  for (let i = 0; i < tiers.length; i++) {
    const tier = tiers[i];
    if (points < tier.max || i === tiers.length - 1) {
      const span = tier.max - tier.min;
      const currentInSpan = Math.max(0, points - tier.min);
      const progressPercent = Math.min(100, Math.round((currentInSpan / span) * 100));
      return {
        level: tier.level,
        title: tier.title,
        nextLevelPoints: tier.max,
        progressPercent,
      };
    }
  }

  return {
    level: 6,
    title: 'Tafellegende',
    nextLevelPoints: 5000,
    progressPercent: 100,
  };
}
