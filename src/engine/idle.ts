/**
 * IdleCalc — 修为产出计算、离线收益
 * 基于 CORE-LOOP-SPEC §1.3, §1.4
 */
import Decimal from 'break_infinity.js';
import { bn, ZERO } from './bignum';
import { xiuweiPerSecond, offlineXiuwei, offlineBonusXiuwei, xiuweiRequired } from './formulas';
import { getRealmConfig } from '../data/config';

export interface OfflineReward {
  duration: number;       // 离线秒数(capped)
  xiuwei: Decimal;
  coins: Decimal;
  bonusXiuwei: Decimal;   // >8h bonus
  bonusApplied: boolean;
}

/**
 * 计算每秒修为产出
 */
export function getXiuweiPerSecond(
  realmId: string,
  equipBonus: number,
  teamBonus: number,
  buffBonus: number,
): Decimal {
  const realm = getRealmConfig(realmId);
  if (!realm) return bn(1);
  return xiuweiPerSecond(realm.multiplier, equipBonus, teamBonus, buffBonus);
}

/**
 * 计算离线收益
 */
export function calcOfflineReward(
  lastOnline: number,
  now: number,
  realmId: string,
  equipBonus: number,
  teamBonus: number,
  buffBonus: number,
  offlineEfficiency: number = 0.5,
): OfflineReward {
  const seconds = Math.max(0, (now - lastOnline) / 1000);
  if (seconds < 60) {
    return { duration: 0, xiuwei: ZERO, coins: ZERO, bonusXiuwei: ZERO, bonusApplied: false };
  }

  const xps = getXiuweiPerSecond(realmId, equipBonus, teamBonus, buffBonus);
  const xiuwei = offlineXiuwei(seconds, xps, offlineEfficiency);
  const bonus = offlineBonusXiuwei(xiuwei, seconds);
  const bonusApplied = seconds > 8 * 3600;

  // 离线金币 = offline_seconds × gold_per_sec × offline_efficiency
  // gold_per_sec 简化为 修为产出的 10 倍
  const coins = xps.mul(10).mul(Math.min(seconds, 86400)).mul(offlineEfficiency);

  return {
    duration: Math.min(seconds, 86400),
    xiuwei: xiuwei.add(bonus).floor(),
    coins: coins.floor(),
    bonusXiuwei: bonus.floor(),
    bonusApplied,
  };
}

/**
 * 检查是否可以突破
 */
export function canBreakthrough(
  currentXiuwei: Decimal,
  realmOrder: number,
  subLevel: number,
): boolean {
  const required = xiuweiRequired(realmOrder, subLevel);
  return currentXiuwei.gte(required);
}

/**
 * 获取突破所需修为
 */
export function getBreakthroughCost(realmOrder: number, subLevel: number): Decimal {
  return xiuweiRequired(realmOrder, subLevel);
}
