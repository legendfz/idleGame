/**
 * BreakThrough — 境界突破逻辑
 * 基于 CORE-LOOP-SPEC §1.1, §1.2
 */
import Decimal from 'break_infinity.js';
import { bn } from './bignum';
import { xiuweiRequired } from './formulas';
import { getRealmConfig, getRealmByOrder, REALM_COUNT, MAX_SUB_LEVEL } from '../data/config';
import { eventBus } from './events';

export interface BreakthroughResult {
  success: boolean;
  newRealmId: string;
  newRealmLevel: number;
  xiuweiConsumed: Decimal;
  message: string;
  unlockMessage?: string;
}

/**
 * 尝试突破
 */
export function doBreakthrough(
  currentXiuwei: Decimal,
  realmId: string,
  realmLevel: number,
): BreakthroughResult {
  const realm = getRealmConfig(realmId);
  if (!realm) {
    return { success: false, newRealmId: realmId, newRealmLevel: realmLevel, xiuweiConsumed: bn(0), message: '未知境界' };
  }

  const cost = xiuweiRequired(realm.order, realmLevel);

  if (currentXiuwei.lt(cost)) {
    return {
      success: false,
      newRealmId: realmId,
      newRealmLevel: realmLevel,
      xiuweiConsumed: bn(0),
      message: `修为不足，需要 ${cost.toString()}`,
    };
  }

  // 小层级突破 (1→2→...→9)
  if (realmLevel < MAX_SUB_LEVEL) {
    const result: BreakthroughResult = {
      success: true,
      newRealmId: realmId,
      newRealmLevel: realmLevel + 1,
      xiuweiConsumed: cost,
      message: `突破至 ${realm.name}·${levelName(realmLevel + 1)}`,
    };
    eventBus.emit({
      type: 'BREAKTHROUGH',
      fromRealm: realmId,
      toRealm: realmId,
      fromLevel: realmLevel,
      toLevel: realmLevel + 1,
    });
    return result;
  }

  // 大境界突破 (九层→下一境界一层)
  const nextRealm = getRealmByOrder(realm.order + 1);
  if (!nextRealm) {
    return {
      success: false,
      newRealmId: realmId,
      newRealmLevel: realmLevel,
      xiuweiConsumed: bn(0),
      message: '已达最高境界！',
    };
  }

  const result: BreakthroughResult = {
    success: true,
    newRealmId: nextRealm.id,
    newRealmLevel: 1,
    xiuweiConsumed: cost,
    message: `突破至 ${nextRealm.name}·一层！`,
    unlockMessage: nextRealm.unlock || undefined,
  };

  eventBus.emit({
    type: 'BREAKTHROUGH',
    fromRealm: realmId,
    toRealm: nextRealm.id,
    fromLevel: realmLevel,
    toLevel: 1,
  });

  return result;
}

const LEVEL_NAMES = ['', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
function levelName(level: number): string {
  return `${LEVEL_NAMES[level] || level}层`;
}
