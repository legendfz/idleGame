/**
 * v170.0「千层妖塔」— Abyss floor milestone rewards
 * Every 10 floors grants permanent stat bonuses
 */

export interface AbyssMilestone {
  floor: number;
  label: string;
  bonuses: {
    atkPct?: number;    // attack %
    hpPct?: number;     // hp %
    critRate?: number;  // flat crit rate
    critDmg?: number;   // flat crit damage
    expPct?: number;    // exp %
    goldPct?: number;   // lingshi %
  };
}

export const ABYSS_MILESTONES: AbyssMilestone[] = [
  { floor: 10,  label: '深渊探索者',   bonuses: { atkPct: 0.03, hpPct: 0.03 } },
  { floor: 20,  label: '深渊行者',     bonuses: { atkPct: 0.05, hpPct: 0.05, expPct: 0.03 } },
  { floor: 30,  label: '深渊猎手',     bonuses: { atkPct: 0.08, hpPct: 0.08, critRate: 0.01 } },
  { floor: 50,  label: '深渊征服者',   bonuses: { atkPct: 0.12, hpPct: 0.12, critRate: 0.02, critDmg: 0.1 } },
  { floor: 75,  label: '深渊领主',     bonuses: { atkPct: 0.15, hpPct: 0.15, critRate: 0.03, expPct: 0.05 } },
  { floor: 100, label: '深渊霸主',     bonuses: { atkPct: 0.20, hpPct: 0.20, critRate: 0.04, critDmg: 0.2, goldPct: 0.05 } },
  { floor: 150, label: '深渊之王',     bonuses: { atkPct: 0.25, hpPct: 0.25, critRate: 0.05, critDmg: 0.3, expPct: 0.08, goldPct: 0.08 } },
  { floor: 200, label: '深渊主宰',     bonuses: { atkPct: 0.30, hpPct: 0.30, critRate: 0.06, critDmg: 0.4, expPct: 0.10, goldPct: 0.10 } },
  { floor: 300, label: '深渊永恒',     bonuses: { atkPct: 0.40, hpPct: 0.40, critRate: 0.08, critDmg: 0.5, expPct: 0.15, goldPct: 0.15 } },
  { floor: 500, label: '混沌深渊神',   bonuses: { atkPct: 0.50, hpPct: 0.50, critRate: 0.10, critDmg: 0.8, expPct: 0.20, goldPct: 0.20 } },
];

/** Get cumulative bonuses for a given highest floor */
export function getAbyssMilestoneBonuses(highestFloor: number) {
  let atkPct = 0, hpPct = 0, critRate = 0, critDmg = 0, expPct = 0, goldPct = 0;
  for (const m of ABYSS_MILESTONES) {
    if (highestFloor >= m.floor) {
      atkPct += m.bonuses.atkPct ?? 0;
      hpPct += m.bonuses.hpPct ?? 0;
      critRate += m.bonuses.critRate ?? 0;
      critDmg += m.bonuses.critDmg ?? 0;
      expPct += m.bonuses.expPct ?? 0;
      goldPct += m.bonuses.goldPct ?? 0;
    }
  }
  return { atkPct, hpPct, critRate, critDmg, expPct, goldPct };
}
