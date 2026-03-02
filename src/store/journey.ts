/**
 * JourneyStore — 取经进度状态
 */
import { StateCreator } from 'zustand';

export interface JourneySlice {
  currentStage: number;
  maxStage: number;
  totalStages: number;
  stars: Record<string, number>;
  advance: () => void;
  setStar: (stageId: string, stars: number) => void;
}

export const createJourneySlice: StateCreator<JourneySlice> = (set) => ({
  currentStage: 0,
  maxStage: 0,
  totalStages: 81,
  stars: {},
  advance: () => set((s) => {
    const next = Math.min(s.currentStage + 1, s.totalStages - 1);
    return { currentStage: next, maxStage: Math.max(s.maxStage, next) };
  }),
  setStar: (stageId, stars) => set((s) => ({
    stars: { ...s.stars, [stageId]: Math.max(s.stars[stageId] || 0, stars) }
  })),
});
