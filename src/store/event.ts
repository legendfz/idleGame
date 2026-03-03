/**
 * EventStore — 活动状态管理
 */
import { create } from 'zustand';
import { EventState, EventType, createEventState, checkEventTick, getEventMultiplier } from '../engine/event';
import { useUIStore } from './ui';

interface EventStoreType {
  state: EventState;

  tick: () => void;
  getMultiplier: (type: EventType) => number;
  loadState: (s: EventState) => void;
  getState: () => EventState;
}

export const useEventStore = create<EventStoreType>((set, get) => ({
  state: createEventState(),

  tick: () => {
    const { state } = get();
    const now = Date.now();
    const newState = checkEventTick(state, now);
    if (newState !== state) {
      if (newState.current && !state.current) {
        useUIStore.getState().addToast(`🎉 活动开启：${newState.current.name}`, 'success');
      }
      set({ state: newState });
    }
  },

  getMultiplier: (type) => getEventMultiplier(get().state, type),

  loadState: (s) => set({ state: s }),
  getState: () => get().state,
}));
