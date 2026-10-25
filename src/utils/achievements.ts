import { Achievement, UserStats } from '../types/game';

export const INITIAL_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_correct',
    title: 'Eerste Succes',
    description: 'Beantwoord je allereerste tafelsom goed',
    icon: 'Sparkles',
    unlocked: false,
    progress: 0,
    target: 1,
    rewardPoints: 15,
    category: 'score',
  },
  {
    id: 'points_50',
    title: 'Tafel Starter',
    description: 'Bereik de eerste mijlpaal van 50 punten',
    icon: 'Trophy',
    unlocked: false,
    progress: 0,
    target: 50,
    rewardPoints: 25,
    category: 'score',
  },
  {
    id: 'points_200',
    title: 'Rekenster',
    description: 'Verzamel 200 punten met slimme berekeningen',
    icon: 'Award',
    unlocked: false,
    progress: 0,
    target: 200,
    rewardPoints: 50,
    category: 'score',
  },
  {
    id: 'points_500',
    title: 'Tafelkampioen in Spe',
    description: 'Bereik 500 punten op je rekenteller',
    icon: 'Crown',
    unlocked: false,
    progress: 0,
    target: 500,
    rewardPoints: 100,
    category: 'score',
  },
  {
    id: 'points_1000',
    title: 'Tafelmeester',
    description: 'Doorbraak naar de magische 1000 punten!',
    icon: 'Medal',
    unlocked: false,
    progress: 0,
    target: 1000,
    rewardPoints: 200,
    category: 'score',
  },
  {
    id: 'streak_5',
    title: 'Op Stoom',
    description: 'Behaal een reeks van 5 goede antwoorden achter elkaar',
    icon: 'Flame',
    unlocked: false,
    progress: 0,
    target: 5,
    rewardPoints: 30,
    category: 'streak',
  },
  {
    id: 'streak_10',
    title: 'Onstuitbaar',
    description: 'Behaal een vlekkeloze reeks van 10 goede antwoorden',
    icon: 'Zap',
    unlocked: false,
    progress: 0,
    target: 10,
    rewardPoints: 75,
    category: 'streak',
  },
  {
    id: 'streak_20',
    title: 'Tafel Tovenaar',
    description: '20 goede antwoorden achter elkaar zonder fouten!',
    icon: 'ShieldCheck',
    unlocked: false,
    progress: 0,
    target: 20,
    rewardPoints: 150,
    category: 'streak',
  },
  {
    id: 'table_easy_master',
    title: 'Kleine Tafels Meester',
    description: 'Beantwoord minstens 25 sommen goed in niveau Makkelijk (1 t/m 5)',
    icon: 'Compass',
    unlocked: false,
    progress: 0,
    target: 25,
    rewardPoints: 60,
    category: 'tafels',
  },
  {
    id: 'table_medium_master',
    title: 'Hogere Tafels Rekenaar',
    description: 'Beantwoord minstens 30 sommen goed in niveau Gemiddeld (6 t/m 10)',
    icon: 'Target',
    unlocked: false,
    progress: 0,
    target: 30,
    rewardPoints: 120,
    category: 'tafels',
  },
  {
    id: 'table_hard_master',
    title: 'Tafelkampioen 1 t/m 10',
    description: 'Beantwoord minstens 50 sommen goed over alle tafels van 1 t/m 10',
    icon: 'Star',
    unlocked: false,
    progress: 0,
    target: 50,
    rewardPoints: 180,
    category: 'tafels',
  },
  {
    id: 'first_diploma',
    title: 'Gediplomeerd Rekenheld',
    description: 'Haal een officieel Tafeldiploma met 90% of meer goed',
    icon: 'GraduationCap',
    unlocked: false,
    progress: 0,
    target: 1,
    rewardPoints: 150,
    category: 'diploma',
  },
  {
    id: 'time_trial_pro',
    title: 'Snelle Sprinter',
    description: 'Scoor minimaal 12 goede antwoorden in 60 seconden Tijdrit',
    icon: 'Timer',
    unlocked: false,
    progress: 0,
    target: 12,
    rewardPoints: 80,
    category: 'snelheid',
  },
  {
    id: 'memory_champ',
    title: 'Geheugenkampioen',
    description: 'Speel een ronde Tafel Memory helemaal uit',
    icon: 'Grid',
    unlocked: false,
    progress: 0,
    target: 1,
    rewardPoints: 50,
    category: 'tafels',
  },
];

export function checkAchievements(
  stats: UserStats,
  extra: {
    justCorrect?: boolean;
    streak?: number;
    difficultyUsed?: 'makkelijk' | 'gemiddeld' | 'moeilijk';
    isMemoryWin?: boolean;
    hasNewDiploma?: boolean;
    timeTrialCorrect?: number;
  }
): { updatedAchievements: Achievement[]; newlyUnlocked: Achievement[]; pointsAdded: number } {
  const currentUnlocked = new Set(stats.unlockedAchievements);
  const newlyUnlocked: Achievement[] = [];
  let pointsAdded = 0;

  const updatedAchievements = INITIAL_ACHIEVEMENTS.map((ach) => {
    const isAlreadyUnlocked = currentUnlocked.has(ach.id);
    let progress = 0;

    switch (ach.id) {
      case 'first_correct':
        progress = stats.totalCorrect;
        break;
      case 'points_50':
      case 'points_200':
      case 'points_500':
      case 'points_1000':
        progress = stats.points;
        break;
      case 'streak_5':
      case 'streak_10':
      case 'streak_20':
        progress = Math.max(stats.bestStreak, extra.streak || 0);
        break;
      case 'table_easy_master':
        progress = Object.entries(stats.tableMastery).reduce((acc, [key, val]) => {
          const a = parseInt(key.split('x')[0], 10);
          return a <= 5 ? acc + val.correct : acc;
        }, 0);
        break;
      case 'table_medium_master':
        progress = Object.entries(stats.tableMastery).reduce((acc, [key, val]) => {
          const a = parseInt(key.split('x')[0], 10);
          return a >= 6 && a <= 10 ? acc + val.correct : acc;
        }, 0);
        break;
      case 'table_hard_master':
        progress = Object.entries(stats.tableMastery).reduce((acc, [key, val]) => {
          const a = parseInt(key.split('x')[0], 10);
          return a <= 10 ? acc + val.correct : acc;
        }, 0);
        break;
      case 'first_diploma':
        progress = stats.diplomas.length;
        break;
      case 'time_trial_pro':
        progress = Math.max(stats.tijdritHighScore, extra.timeTrialCorrect || 0);
        break;
      case 'memory_champ':
        progress = extra.isMemoryWin ? 1 : isAlreadyUnlocked ? 1 : 0;
        break;
      default:
        progress = 0;
    }

    const shouldUnlock = !isAlreadyUnlocked && progress >= ach.target;

    if (shouldUnlock) {
      const unlockedObj: Achievement = {
        ...ach,
        unlocked: true,
        progress: ach.target,
        unlockedAt: new Date().toISOString(),
      };
      newlyUnlocked.push(unlockedObj);
      pointsAdded += ach.rewardPoints;
      return unlockedObj;
    }

    return {
      ...ach,
      unlocked: isAlreadyUnlocked,
      progress: isAlreadyUnlocked ? ach.target : Math.min(progress, ach.target),
    };
  });

  return { updatedAchievements, newlyUnlocked, pointsAdded };
}
