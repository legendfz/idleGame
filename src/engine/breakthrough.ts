/**
 * BreakThrough — 境界突破逻辑
 * 基于 CORE-LOOP-SPEC §1.1, §1.2
 * BUG-01 fix: 大境界突破检查材料
 */
import Decimal from 'break_infinity.js';
import { bn } from './bignum';
import { xiuweiRequired } from './formulas';
import { getRealmConfig, getRealmByOrder, MAX_SUB_LEVEL, RealmMaterial } from '../data/config';
import { eventBus } from './events';

export interface BreakthroughResult {
  success: boolean;
  newRealmId: string;
  newRealmLevel: number;
  xiuweiConsumed: Decimal;
  materialsConsumed: { id: string; count: number }[];
  message: string;
  unlockMessage?: string;
}

/**
 * 检查大境界突破所需材料
 */
function checkMaterials(
  required: RealmMaterial[],
  inventory: Record<string, number>,
): { ok: boolean; missing: string[] } {
  const missing: string[] = [];
  for (const mat of required) {
    const have = inventory[mat.id] ?? 0;
    if (have < mat.count) {
      missing.push(`${mat.name} ×${mat.count}（当前 ${have}）`);
    }
  }
  return { ok: missing.length === 0, missing };
}

/**
 * 尝试突破
 * @param materials - 玩家材料库存 Record<materialId, count>
 */
export function doBreakthrough(
  currentXiuwei: Decimal,
  realmId: string,
  realmLevel: number,
  materials: Record<string, number> = {},
): BreakthroughResult {
  const realm = getRealmConfig(realmId);
  if (!realm) {
    return { success: false, newRealmId: realmId, newRealmLevel: realmLevel, xiuweiConsumed: bn(0), materialsConsumed: [], message: '未知境界' };
  }

  const cost = xiuweiRequired(realm.order, realmLevel);

  if (currentXiuwei.lt(cost)) {
    return {
      success: false, newRealmId: realmId, newRealmLevel: realmLevel,
      xiuweiConsumed: bn(0), materialsConsumed: [],
      message: `修为不足，需要 ${cost.toString()}`,
    };
  }

  // === 小层级突破 (1→2→...→9) — 不需材料 ===
  if (realmLevel < MAX_SUB_LEVEL) {
    eventBus.emit({ type: 'BREAKTHROUGH', fromRealm: realmId, toRealm: realmId, fromLevel: realmLevel, toLevel: realmLevel + 1 });
    return {
      success: true, newRealmId: realmId, newRealmLevel: realmLevel + 1,
      xiuweiConsumed: cost, materialsConsumed: [],
      message: `突破至 ${realm.name}·${levelName(realmLevel + 1)}`,
    };
  }

  // === 大境界突破 (九层→下一境界) — 需材料 ===
  const nextRealm = getRealmByOrder(realm.order + 1);
  if (!nextRealm) {
    return { success: false, newRealmId: realmId, newRealmLevel: realmLevel, xiuweiConsumed: bn(0), materialsConsumed: [], message: '已达最高境界！' };
  }

  // 检查材料 (BUG-01 fix)
  const requiredMats = nextRealm.materials || [];
  if (requiredMats.length > 0) {
    const { ok, missing } = checkMaterials(requiredMats, materials);
    if (!ok) {
      return {
        success: false, newRealmId: realmId, newRealmLevel: realmLevel,
        xiuweiConsumed: bn(0), materialsConsumed: [],
        message: `材料不足：${missing.join('、')}`,
      };
    }
  }

  eventBus.emit({ type: 'BREAKTHROUGH', fromRealm: realmId, toRealm: nextRealm.id, fromLevel: realmLevel, toLevel: 1 });

  return {
    success: true, newRealmId: nextRealm.id, newRealmLevel: 1,
    xiuweiConsumed: cost,
    materialsConsumed: requiredMats.map(m => ({ id: m.id, count: m.count })),
    message: `突破至 ${nextRealm.name}·一层！`,
    unlockMessage: nextRealm.unlock || undefined,
  };
}

const LEVEL_NAMES = ['', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
function levelName(level: number): string {
  return `${LEVEL_NAMES[level] || level}层`;
}
