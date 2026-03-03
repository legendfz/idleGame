import { create } from 'zustand';
import { ExplorationState, createExplorationState, generateRun, DAILY_FREE, EXTRA_COST } from '../engine/exploration';

interface ExplorationStore {
  exploration: ExplorationState;
  startRun: (difficulty: number, lingshi: number) => { cost: number } | null;
  resolveNode: () => { reward?: Record<string, number>; damage?: number } | null;
  tickReset: () => void;
  load: (s: ExplorationState) => void;
}

export const useExplorationStore = create<ExplorationStore>((set, get) => ({
  exploration: createExplorationState(),

  startRun: (difficulty, lingshi) => {
    const st = get().exploration;
    if (st.currentRun && !st.currentRun.completed) return null;
    let cost = 0;
    let newFree = st.dailyFree;
    if (st.dailyFree > 0) {
      newFree--;
    } else {
      if (lingshi < EXTRA_COST) return null;
      cost = EXTRA_COST;
    }
    const run = generateRun(difficulty);
    set({ exploration: { ...st, dailyFree: newFree, currentRun: run, totalRuns: st.totalRuns + 1 } });
    return { cost };
  },

  resolveNode: () => {
    const st = get().exploration;
    if (!st.currentRun || st.currentRun.completed) return null;
    const run = { ...st.currentRun, nodes: [...st.currentRun.nodes] };
    const node = { ...run.nodes[run.currentIndex] };
    node.resolved = true;
    run.nodes[run.currentIndex] = node;
    run.currentIndex++;
    if (run.currentIndex >= run.nodes.length) run.completed = true;
    set({ exploration: { ...st, currentRun: run } });
    return { reward: node.reward as Record<string, number> | undefined, damage: node.damage };
  },

  tickReset: () => {
    const st = get().exploration;
    if (Date.now() >= st.dailyResetTime) {
      set({ exploration: { ...st, dailyFree: DAILY_FREE, dailyResetTime: Date.now() + 86400000 } });
    }
  },

  load: (s) => set({ exploration: s }),
}));
