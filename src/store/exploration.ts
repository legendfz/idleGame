/**
 * ExplorationStore — 秘境探索状态
 */
import { create } from 'zustand';
import {
  ExplorationState, createExplorationState, generateRun, resolveNode,
  getDifficultyConfig, Difficulty,
} from '../engine/exploration';
import { usePlayerStore } from './player';
import { useUIStore } from './ui';
import { bn } from '../engine/bignum';

const EXTRA_COST = 500;

interface ExplorationStoreType {
  state: ExplorationState;

  startRun: (difficulty: Difficulty) => boolean;
  resolve: () => void;
  tickReset: () => void;
  loadState: (s: ExplorationState) => void;
  getState: () => ExplorationState;
}

export const useExplorationStore = create<ExplorationStoreType>((set, get) => ({
  state: createExplorationState(),

  startRun: (difficulty) => {
    const st = get().state;
    if (st.currentRun && !st.currentRun.completed) {
      useUIStore.getState().addToast('探索进行中', 'warn'); return false;
    }
    let newFree = st.dailyFreeRuns;
    if (newFree > 0) {
      newFree--;
    } else {
      const coins = Number(usePlayerStore.getState().player.coins);
      if (coins < EXTRA_COST) { useUIStore.getState().addToast(`灵石不足(需${EXTRA_COST})`, 'warn'); return false; }
      usePlayerStore.setState(s => ({ player: { ...s.player, coins: bn(s.player.coins).sub(EXTRA_COST).toString() } }));
    }
    const run = generateRun(difficulty);
    set({ state: { ...st, dailyFreeRuns: newFree, currentRun: run, totalRuns: st.totalRuns + 1 } });
    useUIStore.getState().addToast(`🗺️ ${getDifficultyConfig(difficulty).name} 开始！`, 'success');
    return true;
  },

  resolve: () => {
    const st = get().state;
    if (!st.currentRun || st.currentRun.completed) return;
    const run = { ...st.currentRun, nodes: st.currentRun.nodes.map(n => ({ ...n })) };
    const result = resolveNode(run);

    if (result.success && result.reward) {
      if (result.reward.coins) usePlayerStore.getState().addCoins(bn(result.reward.coins));
      if (result.reward.xiuwei) usePlayerStore.getState().addXiuwei(bn(result.reward.xiuwei));
    } else if (!result.success) {
      useUIStore.getState().addToast('⚠️ 遭遇陷阱！', 'warn');
    }

    if (run.completed) {
      useUIStore.getState().addToast('🎉 秘境探索完成！', 'success');
    }
    set({ state: { ...st, currentRun: run } });
  },

  tickReset: () => {
    const st = get().state;
    const today = new Date().toDateString();
    if (st.lastResetDay !== today) {
      set({ state: { ...st, dailyFreeRuns: 3, lastResetDay: today } });
    }
  },

  loadState: (s) => set({ state: s }),
  getState: () => get().state,
}));
