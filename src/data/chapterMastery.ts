/**
 * v174.0「章节精通」— Chapter Mastery System
 * Kill enemies in a chapter to gain mastery → permanent bonuses per chapter
 */

export interface MasteryLevel {
  kills: number;
  label: string;
  goldBonus: number;   // % extra gold in this chapter
  expBonus: number;    // % extra exp in this chapter  
  dropBonus: number;   // % extra drop rate in this chapter
}

export const MASTERY_LEVELS: MasteryLevel[] = [
  { kills: 0,     label: '初探',   goldBonus: 0,    expBonus: 0,    dropBonus: 0 },
  { kills: 100,   label: '熟悉',   goldBonus: 0.05, expBonus: 0.05, dropBonus: 0.02 },
  { kills: 500,   label: '精通',   goldBonus: 0.10, expBonus: 0.10, dropBonus: 0.05 },
  { kills: 2000,  label: '大师',   goldBonus: 0.20, expBonus: 0.15, dropBonus: 0.08 },
  { kills: 10000, label: '宗师',   goldBonus: 0.30, expBonus: 0.25, dropBonus: 0.12 },
  { kills: 50000, label: '传说',   goldBonus: 0.50, expBonus: 0.40, dropBonus: 0.18 },
];

/** Get mastery level for a kill count */
export function getMasteryLevel(kills: number): MasteryLevel {
  let best = MASTERY_LEVELS[0];
  for (const ml of MASTERY_LEVELS) {
    if (kills >= ml.kills) best = ml;
  }
  return best;
}

/** Get next mastery level (or null if max) */
export function getNextMastery(kills: number): MasteryLevel | null {
  for (const ml of MASTERY_LEVELS) {
    if (kills < ml.kills) return ml;
  }
  return null;
}

/** Get mastery bonuses for a specific chapter */
export function getChapterMasteryBonus(chapterKills: Record<number, number>, chapterId: number) {
  const kills = chapterKills[chapterId] ?? 0;
  return getMasteryLevel(kills);
}

/** Get total mastery across all chapters (for overview) */
export function getTotalMasteryBonuses(chapterKills: Record<number, number>) {
  let totalGold = 0, totalExp = 0, totalDrop = 0;
  for (const [, kills] of Object.entries(chapterKills)) {
    const m = getMasteryLevel(kills);
    totalGold += m.goldBonus;
    totalExp += m.expBonus;
    totalDrop += m.dropBonus;
  }
  return { goldPct: totalGold / 8, expPct: totalExp / 8, dropPct: totalDrop / 8 }; // average across 8 chapters
}
