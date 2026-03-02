/**
 * EquipmentEngine — 装备穿戴、强化、属性计算
 * 基于 TECH-SPEC §5.1
 */
import Decimal from 'break_infinity.js';
import { bn, ZERO } from './bignum';
import { enhanceCost, enhanceSuccessRate, enhanceMultiplier } from './formulas';
import { eventBus } from './events';

export type Quality = 'common' | 'spirit' | 'immortal' | 'divine' | 'chaos' | 'hongmeng';
export type EquipSlot = 'weapon' | 'headgear' | 'armor' | 'accessory' | 'mount' | 'treasure';

export const QUALITY_ORDER: Quality[] = ['common', 'spirit', 'immortal', 'divine', 'chaos', 'hongmeng'];
export const QUALITY_NAMES: Record<Quality, string> = {
  common: '凡品', spirit: '灵品', immortal: '仙品',
  divine: '神品', chaos: '混沌', hongmeng: '鸿蒙',
};
export const QUALITY_COLORS: Record<Quality, string> = {
  common: '#9E9E9E', spirit: '#4CAF50', immortal: '#2196F3',
  divine: '#9C27B0', chaos: '#FF9800', hongmeng: '#F44336',
};

export interface EquipmentInstance {
  uid: string;
  templateId: string;
  quality: Quality;
  enhanceLevel: number;
  baseAtk: number;
  baseDef: number;
  baseHp: number;
}

export interface EquipStats {
  atk: Decimal;
  def: Decimal;
  hp: Decimal;
}

let uidCounter = 0;
function genUid(): string {
  return `eq_${Date.now()}_${++uidCounter}`;
}

/**
 * 生成装备实例
 */
export function generateEquip(
  templateId: string,
  baseAtk: number,
  baseDef: number,
  baseHp: number,
  quality: Quality = 'common',
): EquipmentInstance {
  // 品质加成: common=1, spirit=1.2, immortal=1.5, divine=2, chaos=3, hongmeng=5
  const qualityMult = getQualityMultiplier(quality);
  return {
    uid: genUid(),
    templateId,
    quality,
    enhanceLevel: 0,
    baseAtk: Math.floor(baseAtk * qualityMult),
    baseDef: Math.floor(baseDef * qualityMult),
    baseHp: Math.floor(baseHp * qualityMult),
  };
}

function getQualityMultiplier(q: Quality): number {
  const map: Record<Quality, number> = {
    common: 1, spirit: 1.2, immortal: 1.5, divine: 2, chaos: 3, hongmeng: 5,
  };
  return map[q];
}

/**
 * 计算装备实际属性（含强化）
 */
export function calcEquipStats(item: EquipmentInstance): EquipStats {
  const mult = enhanceMultiplier(item.enhanceLevel);
  return {
    atk: bn(item.baseAtk).mul(mult).floor(),
    def: bn(item.baseDef).mul(mult).floor(),
    hp: bn(item.baseHp).mul(mult).floor(),
  };
}

/**
 * 获取强化费用
 */
export function getEnhanceCost(item: EquipmentInstance): Decimal {
  const baseCost = (item.baseAtk + item.baseDef + item.baseHp) * 10;
  return enhanceCost(baseCost, item.enhanceLevel);
}

/**
 * 尝试强化
 */
export function tryEnhance(item: EquipmentInstance): {
  success: boolean;
  result: EquipmentInstance;
  cost: Decimal;
} {
  const cost = getEnhanceCost(item);
  const rate = enhanceSuccessRate(item.enhanceLevel);
  const success = Math.random() < rate;

  const result = success
    ? { ...item, enhanceLevel: item.enhanceLevel + 1 }
    : { ...item }; // 失败不降级 (+10 以下)

  eventBus.emit({
    type: 'EQUIP_ENHANCED',
    itemUid: item.uid,
    level: result.enhanceLevel,
    success,
  });

  return { success, result, cost };
}

/**
 * 计算角色总装备属性加成百分比
 */
export function calcEquipBonusPercent(
  equippedItems: (EquipmentInstance | null)[],
): { atkPercent: number; defPercent: number; hpPercent: number } {
  let totalAtk = 0, totalDef = 0, totalHp = 0;
  for (const item of equippedItems) {
    if (!item) continue;
    const stats = calcEquipStats(item);
    totalAtk += stats.atk.toNumber();
    totalDef += stats.def.toNumber();
    totalHp += stats.hp.toNumber();
  }
  // 简化：装备属性作为百分比加成，每 100 点 = 10%
  return {
    atkPercent: totalAtk / 1000,
    defPercent: totalDef / 1000,
    hpPercent: totalHp / 1000,
  };
}
