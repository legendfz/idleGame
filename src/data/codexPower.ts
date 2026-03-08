/**
 * v147.0「图鉴之力」
 * 装备图鉴和妖怪图鉴收集里程碑 → 永久属性加成
 */

export interface CodexMilestone {
  type: 'equip' | 'enemy';
  count: number;        // 需要收集的数量
  name: string;
  atkPct: number;       // 攻击加成%
  hpPct: number;        // 生命加成%
  critRate: number;     // 暴击率(flat)
  critDmg: number;      // 暴伤(flat, e.g. 0.2 = 20%)
  expPct: number;       // 经验加成%
  lingshiPct: number;   // 灵石加成%
}

export const CODEX_MILESTONES: CodexMilestone[] = [
  // 装备图鉴里程碑
  { type: 'equip', count: 10, name: '初窥门径', atkPct: 3, hpPct: 3, critRate: 0, critDmg: 0, expPct: 0, lingshiPct: 0 },
  { type: 'equip', count: 20, name: '略知一二', atkPct: 5, hpPct: 5, critRate: 1, critDmg: 0, expPct: 0, lingshiPct: 0 },
  { type: 'equip', count: 35, name: '博学多闻', atkPct: 8, hpPct: 8, critRate: 2, critDmg: 0.1, expPct: 5, lingshiPct: 5 },
  { type: 'equip', count: 50, name: '见多识广', atkPct: 12, hpPct: 12, critRate: 3, critDmg: 0.2, expPct: 10, lingshiPct: 10 },
  { type: 'equip', count: 70, name: '神兵鉴赏家', atkPct: 20, hpPct: 20, critRate: 5, critDmg: 0.3, expPct: 15, lingshiPct: 15 },

  // 妖怪图鉴里程碑
  { type: 'enemy', count: 10, name: '初出茅庐', atkPct: 2, hpPct: 2, critRate: 0, critDmg: 0, expPct: 3, lingshiPct: 3 },
  { type: 'enemy', count: 20, name: '久经沙场', atkPct: 5, hpPct: 5, critRate: 1, critDmg: 0.1, expPct: 5, lingshiPct: 5 },
  { type: 'enemy', count: 35, name: '降妖除魔', atkPct: 8, hpPct: 8, critRate: 2, critDmg: 0.15, expPct: 8, lingshiPct: 8 },
  { type: 'enemy', count: 50, name: '妖王克星', atkPct: 15, hpPct: 15, critRate: 4, critDmg: 0.25, expPct: 12, lingshiPct: 12 },
];

export interface CodexBonusTotal {
  atkPct: number;
  hpPct: number;
  critRate: number;
  critDmg: number;
  expPct: number;
  lingshiPct: number;
}

/**
 * Calculate total codex bonuses based on collection counts
 */
export function getCodexBonuses(equipCount: number, enemyCount: number): CodexBonusTotal {
  const total: CodexBonusTotal = { atkPct: 0, hpPct: 0, critRate: 0, critDmg: 0, expPct: 0, lingshiPct: 0 };

  for (const m of CODEX_MILESTONES) {
    const count = m.type === 'equip' ? equipCount : enemyCount;
    if (count >= m.count) {
      total.atkPct += m.atkPct;
      total.hpPct += m.hpPct;
      total.critRate += m.critRate;
      total.critDmg += m.critDmg;
      total.expPct += m.expPct;
      total.lingshiPct += m.lingshiPct;
    }
  }

  return total;
}
