/**
 * AchievementStore — 成就状态管理
 */
import { create } from 'zustand';
import {
  ACHIEVEMENTS, AchievementProgress, GameStats, checkAchievement,
} from '../engine/achievement';
import { useUIStore } from './ui';
import { vibrateSuccess } from '../utils/feedback';

interface AchievementStore {
  progress: Record<string, AchievementProgress>; // achievementId -> progress
  stats: Partial<GameStats>; // 额外追踪 (forgeCount, gatherCount, dungeonClears等)

  /** 全量检测一遍，传入最新 GameStats */
  checkAll: (stats: GameStats) => void;
  /** 增量更新统计字段 */
  trackStat: (key: keyof GameStats, value: number) => void;
  /** 增量 +delta */
  addStat: (key: keyof GameStats, delta?: number) => void;

  getUnlockedCount: () => number;
  loadState: (progress: Record<string, AchievementProgress>, stats: Partial<GameStats>) => void;
  getState: () => { progress: Record<string, AchievementProgress>; stats: Partial<GameStats> };
}

export const useAchievementStore = create<AchievementStore>((set, get) => ({
  progress: {},
  stats: { forgeCount: 0, gatherCount: 0, dungeonClears: 0 },

  checkAll: (gameStats) => {
    const { progress } = get();
    const newProgress = { ...progress };
    let newUnlocks = 0;

    for (const def of ACHIEVEMENTS) {
      if (newProgress[def.id]?.unlocked) continue;
      if (checkAchievement(def, gameStats)) {
        newProgress[def.id] = { unlocked: true, unlockedAt: Date.now() };
        newUnlocks++;
        useUIStore.getState().addToast(`🏆 成就解锁：${def.name}`, 'success');
        vibrateSuccess();
      }
    }

    if (newUnlocks > 0) set({ progress: newProgress });
  },

  trackStat: (key, value) => set(s => ({ stats: { ...s.stats, [key]: value } })),
  addStat: (key, delta = 1) => set(s => ({ stats: { ...s.stats, [key]: ((s.stats[key] as number) ?? 0) + delta } })),

  getUnlockedCount: () => Object.values(get().progress).filter(p => p.unlocked).length,

  loadState: (progress, stats) => set({ progress, stats }),
  getState: () => ({ progress: get().progress, stats: get().stats }),
}));
