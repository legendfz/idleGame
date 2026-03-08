// ═══════════════════════════════════════════
// v155.0「仙途璀璨」— 宝石镶嵌系统
// 装备镶嵌宝石获得额外属性加成
// ═══════════════════════════════════════════

export interface GemType {
  id: string;
  name: string;
  emoji: string;
  color: string;
  effect: 'atk' | 'hp' | 'critRate' | 'critDmg' | 'expMul' | 'goldMul';
  baseValue: number;     // level 1 value
  perLevel: number;      // additional per level
  desc: (lv: number) => string;
}

export interface GemItem {
  typeId: string;
  level: number;  // 1-10
}

export const GEM_TYPES: GemType[] = [
  { id: 'ruby', name: '红宝石', emoji: '🔴', color: '#ef4444', effect: 'atk', baseValue: 5, perLevel: 5, desc: (lv) => `攻击+${5 + (lv - 1) * 5}%` },
  { id: 'sapphire', name: '蓝宝石', emoji: '🔵', color: '#3b82f6', effect: 'hp', baseValue: 5, perLevel: 5, desc: (lv) => `生命+${5 + (lv - 1) * 5}%` },
  { id: 'emerald', name: '绿宝石', emoji: '🟢', color: '#22c55e', effect: 'expMul', baseValue: 3, perLevel: 3, desc: (lv) => `经验+${3 + (lv - 1) * 3}%` },
  { id: 'topaz', name: '黄宝石', emoji: '🟡', color: '#eab308', effect: 'goldMul', baseValue: 3, perLevel: 3, desc: (lv) => `灵石+${3 + (lv - 1) * 3}%` },
  { id: 'amethyst', name: '紫宝石', emoji: '🟣', color: '#a855f7', effect: 'critRate', baseValue: 1, perLevel: 1, desc: (lv) => `暴击率+${1 + (lv - 1) * 1}%` },
  { id: 'diamond', name: '钻石', emoji: '💎', color: '#e0f2fe', effect: 'critDmg', baseValue: 5, perLevel: 5, desc: (lv) => `暴伤+${5 + (lv - 1) * 5}%` },
];

/** Gem slots per quality */
const QUALITY_SLOTS: Record<string, number> = {
  common: 0, spirit: 1, immortal: 1, divine: 2, legendary: 2, mythic: 3,
};
export function gemSlotsForQuality(quality: string): number {
  return QUALITY_SLOTS[quality] ?? 0;
}

/** Upgrade cost: 3 same-type same-level gems → 1 gem of level+1 */
export const GEM_MERGE_COUNT = 3;
export const GEM_MAX_LEVEL = 10;

/** Drop chance from boss kills */
export function gemDropChance(playerLevel: number): number {
  // 0.5% base, +0.1% per 100 levels, max 3%
  return Math.min(0.03, 0.005 + Math.floor(playerLevel / 100) * 0.001);
}

/** Get gem bonus values */
export function getGemBonuses(gems: GemItem[]): {
  atkPct: number; hpPct: number; critRate: number; critDmg: number; expMul: number; goldMul: number;
} {
  const b = { atkPct: 0, hpPct: 0, critRate: 0, critDmg: 0, expMul: 0, goldMul: 0 };
  for (const gem of gems) {
    const type = GEM_TYPES.find(t => t.id === gem.typeId);
    if (!type) continue;
    const val = type.baseValue + (gem.level - 1) * type.perLevel;
    switch (type.effect) {
      case 'atk': b.atkPct += val; break;
      case 'hp': b.hpPct += val; break;
      case 'critRate': b.critRate += val; break;
      case 'critDmg': b.critDmg += val; break;
      case 'expMul': b.expMul += val; break;
      case 'goldMul': b.goldMul += val; break;
    }
  }
  return b;
}
