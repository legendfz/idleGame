/**
 * PlayerStore — 玩家状态（修为、境界、资源）
 */
import { create } from 'zustand';
import Decimal from 'break_infinity.js';
import { bn, ZERO } from '../engine/bignum';
import { getXiuweiPerSecond } from '../engine/idle';
import { doBreakthrough } from '../engine/breakthrough';
import { getRealmConfig } from '../data/config';
import { formatBigNum } from '../engine/bignum';

export interface PlayerState {
  xiuwei: string;         // Decimal string
  coins: string;
  lingshi: string;
  realmId: string;
  realmLevel: number;     // 1-9
  totalXiuwei: string;
  lastOnlineAt: number;
  createdAt: number;
  playTime: number;       // seconds
  totalClicks: number;
  totalKills: number;
  totalBreakthroughs: number;
  prestigeCount: number;
}

interface PlayerStore {
  player: PlayerState;
  xpsDisplay: string;

  tick: (dt: number) => void;
  addXiuwei: (amount: Decimal) => void;
  addCoins: (amount: Decimal) => void;
  addLingshi: (amount: number) => void;
  spendCoins: (amount: Decimal) => boolean;
  breakthrough: () => { success: boolean; message: string; unlockMessage?: string };
  incrementClicks: () => void;
  incrementKills: (count?: number) => void;
  setLastOnline: (t: number) => void;
  resetForPrestige: (startRealmId: string) => void;
  loadState: (state: PlayerState) => void;
  getState: () => PlayerState;
}

function createInitialPlayer(): PlayerState {
  return {
    xiuwei: '0',
    coins: '0',
    lingshi: '0',
    realmId: 'fanren',
    realmLevel: 1,
    totalXiuwei: '0',
    lastOnlineAt: Date.now(),
    createdAt: Date.now(),
    playTime: 0,
    totalClicks: 0,
    totalKills: 0,
    totalBreakthroughs: 0,
    prestigeCount: 0,
  };
}

export const usePlayerStore = create<PlayerStore>((set, get) => ({
  player: createInitialPlayer(),
  xpsDisplay: '0/秒',

  tick: (dt) => {
    const { player } = get();
    const xps = getXiuweiPerSecond(player.realmId, 0, 0, 0); // TODO: pass equip/team/buff bonuses
    const gain = xps.mul(dt);
    const newXiuwei = bn(player.xiuwei).add(gain);
    const newTotal = bn(player.totalXiuwei).add(gain);

    set({
      player: {
        ...player,
        xiuwei: newXiuwei.toString(),
        totalXiuwei: newTotal.toString(),
        playTime: player.playTime + dt,
        lastOnlineAt: Date.now(),
      },
      xpsDisplay: formatBigNum(xps) + '/秒',
    });
  },

  addXiuwei: (amount) => {
    const { player } = get();
    set({
      player: {
        ...player,
        xiuwei: bn(player.xiuwei).add(amount).toString(),
        totalXiuwei: bn(player.totalXiuwei).add(amount).toString(),
      },
    });
  },

  addCoins: (amount) => {
    const { player } = get();
    set({ player: { ...player, coins: bn(player.coins).add(amount).toString() } });
  },

  addLingshi: (amount) => {
    const { player } = get();
    set({ player: { ...player, lingshi: bn(player.lingshi).add(amount).toString() } });
  },

  spendCoins: (amount) => {
    const { player } = get();
    const current = bn(player.coins);
    if (current.lt(amount)) return false;
    set({ player: { ...player, coins: current.sub(amount).toString() } });
    return true;
  },

  breakthrough: () => {
    const { player } = get();
    const result = doBreakthrough(bn(player.xiuwei), player.realmId, player.realmLevel);
    if (result.success) {
      set({
        player: {
          ...player,
          xiuwei: bn(player.xiuwei).sub(result.xiuweiConsumed).toString(),
          realmId: result.newRealmId,
          realmLevel: result.newRealmLevel,
          totalBreakthroughs: player.totalBreakthroughs + 1,
        },
      });
    }
    return { success: result.success, message: result.message, unlockMessage: result.unlockMessage };
  },

  incrementClicks: () => set(s => ({ player: { ...s.player, totalClicks: s.player.totalClicks + 1 } })),
  incrementKills: (count = 1) => set(s => ({ player: { ...s.player, totalKills: s.player.totalKills + count } })),
  setLastOnline: (t) => set(s => ({ player: { ...s.player, lastOnlineAt: t } })),

  resetForPrestige: (startRealmId) => {
    const { player } = get();
    set({
      player: {
        ...createInitialPlayer(),
        realmId: startRealmId,
        createdAt: player.createdAt,
        prestigeCount: player.prestigeCount + 1,
        totalXiuwei: player.totalXiuwei, // keep for foyuan calc
      },
    });
  },

  loadState: (state) => set({ player: state }),
  getState: () => get().player,
}));
