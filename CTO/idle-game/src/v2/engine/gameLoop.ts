/**
 * v2.0 Core Game Loop Engine
 */

import { D, add, mul, toDecStr, gte, sub, Decimal } from '../utils/bignum';
import { GameState, PlayerState } from '../types';
import { getRealmById, REALMS_V2 } from '../data/realms';

/** Calculate cultivation per second */
export function getCultivationPerSec(state: GameState): Decimal {
  const realm = getRealmById(state.player.realmId);
  const baseCps = D(1); // 1 per second at fanren
  const realmMul = D(realm?.multiplier ?? 1);
  const subLevelMul = D(1 + (state.player.realmSubLevel - 1) * 0.1);
  // TODO: add character passives, equipment bonuses, pill buffs
  return baseCps.mul(realmMul).mul(subLevelMul);
}

/** Process one tick (dt in seconds) */
export function tick(state: GameState, dt: number): GameState {
  const cps = getCultivationPerSec(state);
  const gain = cps.mul(dt);

  return {
    ...state,
    player: {
      ...state.player,
      cultivationXp: toDecStr(add(state.player.cultivationXp, gain)),
      totalCultivation: toDecStr(add(state.player.totalCultivation, gain)),
      totalPlayTime: state.player.totalPlayTime + dt,
    },
  };
}

/** Attempt realm breakthrough */
export function attemptBreakthrough(state: GameState): {
  success: boolean;
  newState: GameState;
  message: string;
} {
  const realm = getRealmById(state.player.realmId);
  if (!realm) return { success: false, newState: state, message: '未知境界' };

  // Sub-level advancement (1→2→...→9→next realm)
  if (state.player.realmSubLevel < 9) {
    const cost = D(realm.breakCost.cultivation).mul(state.player.realmSubLevel);
    if (!gte(state.player.cultivationXp, cost)) {
      return { success: false, newState: state, message: `修为不足，需要 ${cost.toString()}` };
    }
    return {
      success: true,
      newState: {
        ...state,
        player: {
          ...state.player,
          cultivationXp: toDecStr(sub(state.player.cultivationXp, cost)),
          realmSubLevel: state.player.realmSubLevel + 1,
        },
      },
      message: `突破至 ${realm.name} ${state.player.realmSubLevel + 1}层`,
    };
  }

  // Major realm breakthrough
  const nextRealm = REALMS_V2.find(r => r.order === realm.order + 1);
  if (!nextRealm) return { success: false, newState: state, message: '已达最高境界' };

  const cost = D(nextRealm.breakCost.cultivation);
  if (!gte(state.player.cultivationXp, cost)) {
    return { success: false, newState: state, message: `修为不足，需要 ${cost.toString()}` };
  }

  return {
    success: true,
    newState: {
      ...state,
      player: {
        ...state.player,
        cultivationXp: toDecStr(sub(state.player.cultivationXp, cost)),
        realmId: nextRealm.id,
        realmSubLevel: 1,
      },
    },
    message: `突破至 ${nextRealm.name}！`,
  };
}
