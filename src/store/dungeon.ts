/**
 * DungeonStore — 秘境状态持久化 (Bug #8: 次数持久化)
 */
import { create } from 'zustand';
import { checkDailyReset, DungeonState, createDungeonState } from '../engine/dungeon';

interface DungeonStore {
  state: DungeonState;

  getAttempts: (dungeonId: string) => number;
  addAttempt: (dungeonId: string) => void;
  checkReset: () => void;
  loadState: (state: DungeonState) => void;
  getState: () => DungeonState;
}

export const useDungeonStore = create<DungeonStore>((set, get) => ({
  state: createDungeonState(),

  getAttempts: (dungeonId) => get().state.dailyAttempts[dungeonId] ?? 0,

  addAttempt: (dungeonId) => {
    const s = get().state;
    set({ state: { ...s, dailyAttempts: { ...s.dailyAttempts, [dungeonId]: (s.dailyAttempts[dungeonId] ?? 0) + 1 } } });
  },

  checkReset: () => {
    set({ state: checkDailyReset(get().state) });
  },

  loadState: (state) => set({ state: checkDailyReset(state) }),
  getState: () => get().state,
}));
