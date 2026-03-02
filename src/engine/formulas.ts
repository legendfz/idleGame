/**
 * FormulaLib — 所有数值公式集中管理
 */
import { Decimal, bn, ZERO } from './bignum';

/** 修为产出/秒 = 基础值 × 境界倍率 × (1 + 装备加成) */
export function xiuweiPerSecond(
  base: Decimal,
  realmMultiplier: Decimal,
  equipBonus: Decimal
): Decimal {
  return base.mul(realmMultiplier).mul(ONE_PLUS(equipBonus));
}

/** 突破所需修为 = 基础需求 × 1.5^境界层级 */
export function breakthroughCost(baseCost: Decimal, realmTier: number): Decimal {
  return baseCost.mul(Decimal.pow(1.5, realmTier));
}

/** 战斗伤害 = 攻击力 × (1 + 暴击倍率 × isCrit) × 随机波动 */
export function battleDamage(
  attack: Decimal,
  critMultiplier: number,
  isCrit: boolean,
  variance = 0.1
): Decimal {
  const critFactor = isCrit ? 1 + critMultiplier : 1;
  const rand = 1 + (Math.random() * 2 - 1) * variance;
  return attack.mul(critFactor).mul(rand);
}

/** 离线收益 = 产出/秒 × 时间(秒) × 离线效率 */
export function offlineReward(
  perSecond: Decimal,
  seconds: number,
  efficiency: number = 0.5
): Decimal {
  return perSecond.mul(seconds).mul(efficiency);
}

/** 装备强化费用 = 基础费用 × 2^当前等级 */
export function enhanceCost(baseCost: Decimal, currentLevel: number): Decimal {
  return baseCost.mul(Decimal.pow(2, currentLevel));
}

function ONE_PLUS(bonus: Decimal): Decimal {
  return bn(1).add(bonus);
}
