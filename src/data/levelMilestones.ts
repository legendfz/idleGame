/**
 * v154.0「登峰造极」
 * 历史最高等级里程碑 → 永久属性加成
 * 基于 highestLevelEver，跨转世/超越保留
 */

export interface LevelMilestone {
  level: number;
  name: string;
  icon: string;
  atkPct: number;
  hpPct: number;
  critRate: number;
  critDmg: number;
  expPct: number;
  lingshiPct: number;
}

export const LEVEL_MILESTONES: LevelMilestone[] = [
  { level: 100,  name: '百炼成钢',   icon: '🗡️', atkPct: 5,  hpPct: 5,  critRate: 0, critDmg: 0,   expPct: 0,  lingshiPct: 0 },
  { level: 200,  name: '初窥天道',   icon: '⭐', atkPct: 8,  hpPct: 8,  critRate: 1, critDmg: 0,   expPct: 5,  lingshiPct: 5 },
  { level: 500,  name: '渡劫成功',   icon: '⚡', atkPct: 12, hpPct: 12, critRate: 2, critDmg: 0.1, expPct: 8,  lingshiPct: 8 },
  { level: 1000, name: '千级仙尊',   icon: '🌟', atkPct: 20, hpPct: 20, critRate: 3, critDmg: 0.2, expPct: 12, lingshiPct: 12 },
  { level: 2000, name: '万劫不灭',   icon: '💫', atkPct: 30, hpPct: 30, critRate: 4, critDmg: 0.3, expPct: 15, lingshiPct: 15 },
  { level: 5000, name: '五千大道',   icon: '🔥', atkPct: 50, hpPct: 50, critRate: 5, critDmg: 0.5, expPct: 20, lingshiPct: 20 },
  { level: 9999, name: '至尊无上',   icon: '👑', atkPct: 80, hpPct: 80, critRate: 8, critDmg: 0.8, expPct: 30, lingshiPct: 30 },
];

/** Get cumulative bonuses from achieved level milestones */
export function getLevelMilestoneBonuses(highestLevel: number) {
  const b = { atkPct: 0, hpPct: 0, critRate: 0, critDmg: 0, expPct: 0, lingshiPct: 0 };
  for (const m of LEVEL_MILESTONES) {
    if (highestLevel >= m.level) {
      b.atkPct += m.atkPct;
      b.hpPct += m.hpPct;
      b.critRate += m.critRate;
      b.critDmg += m.critDmg;
      b.expPct += m.expPct;
      b.lingshiPct += m.lingshiPct;
    }
  }
  return b;
}
