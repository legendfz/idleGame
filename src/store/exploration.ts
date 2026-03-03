/**
 * ExplorationStore — 秘境探索状态管理
 */
import { create } from 'zustand';
import { ExplorationState, createExplorationState, generateRun, resolveNode, getDifficultyConfig, Difficulty } from '../engine/exploration';
import { usePlayerStore } from './player';
import { useUIStore } from './ui';

interface ExplorationStoreType {
  state: ExplorationState;
  startRun: (difficulty: Difficulty) => void;
  stepForward: () => void;
  abandonRun: () => void;
  tickReset: () => void;
  getState: () => ExplorationState;
  loadState: (s: ExplorationState) => void;
}

export const useExplorationStore = create<ExplorationStoreType>((set, get) => ({
  state: createExplorationState(),

  startRun: (difficulty: Difficulty) => {
    const s = get().state;
    const today = new Date().toDateString();
    let freeRuns = s.lastResetDay === today ? s.dailyFreeRuns : 3;

    if (s.currentRun && !s.currentRun.completed) {
      useUIStore.getState().addToast('请先完成当前秘境', 'warning'); return;
    }

    if (freeRuns <= 0) {
      const player = usePlayerStore.getState().player;
      if (parseFloat(player.coins) < 500) { useUIStore.getState().addToast('次数不足，需500灵石', 'warning'); return; }
      usePlayerStore.getState().addCoins(-500);
    } else {
      freeRuns--;
    }

    const run = generateRun(difficulty);
    set({ state: { ...s, currentRun: run, dailyFreeRuns: freeRuns, lastResetDay: today, totalRuns: s.totalRuns + 1 } });
    useUIStore.getState().addToast(`进入${getDifficultyConfig(difficulty).name}`, 'info');
  },

  stepForward: () => {
    const s = get().state;
    if (!s.currentRun || s.currentRun.completed) return;

    const run = { ...s.currentRun, nodes: [...s.currentRun.nodes.map(n => ({ ...n }))] };
    const result = resolveNode(run);

    if (result.success && result.reward) {
      usePlayerStore.getState().addCoins(result.reward.coins);
      usePlayerStore.getState().addXiuwei(result.reward.xiuwei);
      useUIStore.getState().addToast(`+${result.reward.coins}灵石 +${result.reward.xiuwei}修为`, 'success');
    } else if (!result.success) {
      useUIStore.getState().addToast('遭遇陷阱，损失惨重！', 'error');
    }

    set({ state: { ...s, currentRun: run } });
    if (run.completed) {
      useUIStore.getState().addToast('秘境探索完成！', 'success');
    }
  },

  abandonRun: () => {
    const s = get().state;
    set({ state: { ...s, currentRun: null } });
    useUIStore.getState().addToast('放弃探索', 'warning');
  },

  tickReset: () => {
    const s = get().state;
    const today = new Date().toDateString();
    if (s.lastResetDay !== today) {
      set({ state: { ...s, dailyFreeRuns: 3, lastResetDay: today } });
    }
  },

  getState: () => get().state,
  loadState: (s: ExplorationState) => set({ state: s }),
}));
