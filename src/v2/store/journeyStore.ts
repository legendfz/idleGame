/**
 * v2.0 Journey Store — placeholder
 */

import { create } from 'zustand';
import { JourneyState, StageResult } from '../types';

interface JourneyStore {
  journey: JourneyState;
  clearStage: (stage: number, stars: number, time: number) => void;
}

export const useJourneyStore = create<JourneyStore>((set, get) => ({
  journey: { currentStage: 1, stageProgress: {}, dailySweepCount: {}, dailyResetDate: '' },
  clearStage: (stage, stars, time) => {
    const j = get().journey;
    const existing = j.stageProgress[stage];
    const result: StageResult = {
      cleared: true,
      stars: Math.max(stars, existing?.stars ?? 0),
      bestTime: existing?.bestTime != null ? Math.min(time, existing.bestTime) : time,
      clearCount: (existing?.clearCount ?? 0) + 1,
    };
    set({
      journey: {
        ...j,
        stageProgress: { ...j.stageProgress, [stage]: result },
        currentStage: Math.max(j.currentStage, stage + 1),
      },
    });
  },
}));
