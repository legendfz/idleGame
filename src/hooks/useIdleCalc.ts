/**
 * useIdleCalc — 修为计算 hook
 */
import { usePlayerStore } from '../store/player';
import { getXiuweiPerSecond, getBreakthroughCost, canBreakthrough } from '../engine/idle';
import { bn } from '../engine/bignum';
import { getRealmConfig } from '../data/config';

export function useIdleCalc() {
  const player = usePlayerStore(s => s.player);
  const realm = getRealmConfig(player.realmId);
  const xps = getXiuweiPerSecond(player.realmId, 0, 0, 0);
  const cost = getBreakthroughCost(realm?.order ?? 1, player.realmLevel);
  const canBreak = canBreakthrough(bn(player.xiuwei), realm?.order ?? 1, player.realmLevel);

  return { xps, cost, canBreak, realm };
}
