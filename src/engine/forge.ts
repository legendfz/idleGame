/**
 * ForgeEngine — 锻造系统引擎
 * 材料验证 → 品质抽奖 → 随机属性 → 装备生成
 */
import Decimal from 'break_infinity.js';
import { bn } from './bignum';
import { generateEquip, Quality, EquipmentInstance, QUALITY_ORDER } from './equipment';
import { eventBus } from './events';

// === Types ===

export interface ForgeRecipe {
  id: string;
  name: string;
  resultTemplateId: string;
  resultSlot: string;
  materials: { materialId: string; count: number }[];
  coinsCost: number;
  minQuality: Quality;
  forgeTime: number;
  successRate: number;
  levelRequired: number;
}

export interface BonusStat {
  stat: string;
  value: number;
  description: string;
}

export interface ForgeResult {
  success: boolean;
  item?: EquipmentInstance;
  quality?: Quality;
  bonusRolls?: BonusStat[];
  expGained: number;
  message: string;
}

// === Bonus Stat Pool ===

const BONUS_STAT_POOL: { stat: string; range: [number, number]; desc: string }[] = [
  { stat: 'atkPercent', range: [3, 15], desc: '攻击+{v}%' },
  { stat: 'defPercent', range: [3, 15], desc: '防御+{v}%' },
  { stat: 'hpPercent', range: [3, 15], desc: '生命+{v}%' },
  { stat: 'critRate', range: [1, 5], desc: '暴击+{v}%' },
  { stat: 'critDmg', range: [5, 20], desc: '暴击伤害+{v}%' },
  { stat: 'xiuweiBonus', range: [2, 10], desc: '修炼加速+{v}%' },
  { stat: 'goldBonus', range: [3, 12], desc: '金币+{v}%' },
];

// === Engine ===

/**
 * 检查是否可以锻造
 */
export function canForge(
  recipe: ForgeRecipe,
  materials: Record<string, number>,
  coins: Decimal,
  forgeLevel: number,
): { ok: boolean; missing: string[] } {
  const missing: string[] = [];

  if (forgeLevel < recipe.levelRequired) {
    missing.push(`锻造等级需要 ${recipe.levelRequired}（当前 ${forgeLevel}）`);
  }
  if (coins.lt(recipe.coinsCost)) {
    missing.push(`金币不足（需要 ${recipe.coinsCost}）`);
  }
  for (const mat of recipe.materials) {
    const have = materials[mat.materialId] ?? 0;
    if (have < mat.count) {
      missing.push(`${mat.materialId} ×${mat.count}（当前 ${have}）`);
    }
  }

  return { ok: missing.length === 0, missing };
}

/**
 * 品质抽奖
 * 锻造等级越高，品质越好
 */
export function rollQuality(recipe: ForgeRecipe, forgeLevel: number): Quality {
  const minIdx = QUALITY_ORDER.indexOf(recipe.minQuality);
  const levelBonus = Math.min(forgeLevel * 0.01, 0.3); // 最多+30%概率提升
  const roll = Math.random();

  // 每个更高品质的概率递减
  if (roll < 0.02 + levelBonus * 0.05 && minIdx + 3 < QUALITY_ORDER.length) return QUALITY_ORDER[minIdx + 3];
  if (roll < 0.10 + levelBonus * 0.1 && minIdx + 2 < QUALITY_ORDER.length) return QUALITY_ORDER[minIdx + 2];
  if (roll < 0.30 + levelBonus && minIdx + 1 < QUALITY_ORDER.length) return QUALITY_ORDER[minIdx + 1];
  return recipe.minQuality;
}

/**
 * 随机属性词条
 */
export function rollBonusStats(quality: Quality): BonusStat[] {
  const maxRolls: Record<Quality, number> = {
    common: 0, spirit: 1, immortal: 2, divine: 3, chaos: 3, hongmeng: 3,
  };
  const count = Math.floor(Math.random() * (maxRolls[quality] + 1));
  const stats: BonusStat[] = [];
  const used = new Set<number>();

  for (let i = 0; i < count; i++) {
    let idx: number;
    do { idx = Math.floor(Math.random() * BONUS_STAT_POOL.length); } while (used.has(idx) && used.size < BONUS_STAT_POOL.length);
    used.add(idx);
    const pool = BONUS_STAT_POOL[idx];
    const value = pool.range[0] + Math.floor(Math.random() * (pool.range[1] - pool.range[0] + 1));
    stats.push({ stat: pool.stat, value, description: pool.desc.replace('{v}', String(value)) });
  }

  return stats;
}

/**
 * 锻造经验
 */
export function getForgeExp(recipe: ForgeRecipe): number {
  return 10 + recipe.levelRequired * 2;
}

/**
 * 锻造等级所需经验
 */
export function forgeLevelExp(level: number): number {
  return Math.floor(100 * Math.pow(level, 1.5));
}

/**
 * 执行锻造
 */
export function doForge(recipe: ForgeRecipe, forgeLevel: number): ForgeResult {
  // 成功判定
  const levelBonus = Math.min(forgeLevel * 0.005, 0.2);
  const finalRate = Math.min(recipe.successRate + levelBonus, 0.99);
  const success = Math.random() < finalRate;
  const expGained = getForgeExp(recipe);

  if (!success) {
    return { success: false, expGained, message: '锻造失败！材料已消耗。' };
  }

  // 品质抽奖
  const quality = rollQuality(recipe, forgeLevel);
  const bonusRolls = rollBonusStats(quality);

  // 生成装备 (baseAtk 根据配方等级缩放)
  const basePower = recipe.levelRequired * 5 + 10;
  const item = generateEquip(
    recipe.resultTemplateId,
    recipe.resultSlot === 'weapon' ? basePower : Math.floor(basePower * 0.3),
    recipe.resultSlot === 'armor' ? basePower : Math.floor(basePower * 0.3),
    basePower * 2,
    quality,
  );

  eventBus.emit({ type: 'EQUIP_ENHANCED', itemUid: item.uid, level: 0, success: true });

  return {
    success: true,
    item,
    quality,
    bonusRolls,
    expGained,
    message: `锻造成功！获得 [${quality}] ${recipe.name}`,
  };
}
