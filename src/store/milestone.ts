/**
 * MilestoneStore — 里程碑状态
 */
import { create } from 'zustand';
import {
  MILESTONES, MilestoneProgress, MilestoneBuff, checkMilestone, calcMilestoneBuffs,
} from '../engine/milestone';
import { GameStats } from '../engine/achievement';
import { useUIStore } from './ui';

interface MilestoneStore {
  progress: Record<string, MilestoneProgress>;

  checkAll: (stats: GameStats) => void;
  getBuffs: () => Record<MilestoneBuff['type'], number>;
  getUnlockedCount: () => number;
  loadState: (progress: Record<string, MilestoneProgress>) => void;
  getState: () => Record<string, MilestoneProgress>;
}

export const useMilestoneStore = create<MilestoneStore>((set, get) => ({
  progress: {},

  checkAll: (stats) => {
    const { progress } = get();
    const newProgress = { ...progress };
    let changed = false;

    for (const def of MILESTONES) {
      if (newProgress[def.id]?.unlocked) continue;
      if (checkMilestone(def, stats)) {
        newProgress[def.id] = { unlocked: true, unlockedAt: Date.now() };
        changed = true;
        useUIStore.getState().addToast(`🎯 里程碑：${def.name} — ${def.buff.type} +${def.buff.value}%`, 'success');
      }
    }

    if (changed) set({ progress: newProgress });
  },

  getBuffs: () => {
    const unlocked = new Set(
      Object.entries(get().progress).filter(([, p]) => p.unlocked).map(([id]) => id)
    );
    return calcMilestoneBuffs(unlocked);
  },

  getUnlockedCount: () => Object.values(get().progress).filter(p => p.unlocked).length,

  loadState: (progress) => set({ progress }),
  getState: () => get().progress,
}));
