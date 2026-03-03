/**
 * PvpStore — 擂台状态管理
 */
import { create } from 'zustand';
import {
  PvpState, PvpOpponent, createPvpState, generateOpponents,
  simulatePvp, checkPvpDailyReset, calcPvpRank, PVP_DAILY_LIMIT,
} from '../engine/pvp';
import { usePlayerStore } from './player';
import { useUIStore } from './ui';
import { bn } from '../engine/bignum';
import { getRealmConfig } from '../data/config';

interface PvpStoreType {
  state: PvpState;
  opponents: PvpOpponent[];

  refreshOpponents: () => void;
  fight: (opponentIndex: number) => { won: boolean } | null;
  tickReset: () => void;
  loadState: (s: PvpState) => void;
  getState: () => PvpState;
}

function getPlayerPower(): number {
  const p = usePlayerStore.getState().player;
  const realm = getRealmConfig(p.realmId);
  return Math.floor(Number(p.totalXiuwei) / 1000) + p.totalKills * 10 + (realm?.multiplier ?? 1) * 100;
}

export const usePvpStore = create<PvpStoreType>((set, get) => ({
  state: createPvpState(),
  opponents: [],

  refreshOpponents: () => {
    set({ opponents: generateOpponents(getPlayerPower()) });
  },

  fight: (opponentIndex) => {
    const st = get().state;
    if (st.dailyAttempts >= PVP_DAILY_LIMIT) {
      useUIStore.getState().addToast('今日挑战次数已用完', 'warn');
      return null;
    }
    const opp = get().opponents[opponentIndex];
    if (!opp) return null;

    const power = getPlayerPower();
    const { won, honorChange } = simulatePvp(power, opp.power);
    const newHonor = Math.max(0, st.honor + honorChange);
    const newRank = calcPvpRank(newHonor);

    const log = { opponent: opp.name, won, honorChange, timestamp: Date.now() };
    set({
      state: {
        ...st,
        honor: newHonor, rank: newRank,
        dailyAttempts: st.dailyAttempts + 1,
        logs: [log, ...st.logs.slice(0, 19)],
      },
    });

    if (won) {
      usePlayerStore.getState().addCoins(bn(opp.power));
      useUIStore.getState().addToast(`⚔️ 击败 ${opp.name}！仙誉+${honorChange}`, 'success');
    } else {
      useUIStore.getState().addToast(`💀 败给 ${opp.name}，仙誉${honorChange}`, 'warn');
    }

    // 刷新对手
    set({ opponents: generateOpponents(power) });
    return { won };
  },

  tickReset: () => {
    const st = get().state;
    const newSt = checkPvpDailyReset(st);
    if (newSt !== st) set({ state: newSt });
  },

  loadState: (s) => set({ state: s }),
  getState: () => get().state,
}));
