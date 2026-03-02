/**
 * JourneyStore — 取经进度状态
 */
import { create } from 'zustand';
import {
  JourneyState, createInitialJourney,
  canEnterStage, canSweep, completeStage, doSweep,
} from '../engine/journey';
import { useEquipStore } from './equipment';
import { usePlayerStore } from './player';
import { bn } from '../engine/bignum';

interface JourneyStore {
  journey: JourneyState;

  canEnter: (stageId: number) => boolean;
  canSweepStage: (stageId: number) => boolean;
  complete: (stageId: number, stars: 1 | 2 | 3, timeMs: number) => void;
  sweep: (stageId: number) => { coins: number; exp: number; lootCount: number };
  loadState: (journey: JourneyState) => void;
  getState: () => JourneyState;
  reset: () => void;
}

export const useJourneyStore = create<JourneyStore>((set, get) => ({
  journey: createInitialJourney(),

  canEnter: (stageId) => canEnterStage(stageId, get().journey),
  canSweepStage: (stageId) => canSweep(stageId, get().journey),

  complete: (stageId, stars, timeMs) => {
    const result = completeStage(stageId, stars, timeMs, get().journey);
    set({ journey: result.journey });

    // Apply rewards
    usePlayerStore.getState().addCoins(bn(result.coins));
    usePlayerStore.getState().addXiuwei(bn(result.exp));
    if (result.loot.length > 0) {
      useEquipStore.getState().addItems(result.loot);
    }
  },

  sweep: (stageId) => {
    const result = doSweep(stageId);
    usePlayerStore.getState().addCoins(bn(result.coins));
    usePlayerStore.getState().addXiuwei(bn(result.exp));
    if (result.loot.length > 0) {
      useEquipStore.getState().addItems(result.loot);
    }
    return { coins: result.coins, exp: result.exp, lootCount: result.loot.length };
  },

  loadState: (journey) => set({ journey }),
  getState: () => get().journey,
  reset: () => set({ journey: createInitialJourney() }),
}));
