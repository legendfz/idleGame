/**
 * FestivalStore — 活动增强状态
 */
import { create } from 'zustand';
import {
  FestivalState, createFestivalState, startFestival, checkFestivalEnd,
  FESTIVAL_DEFS, FestivalType,
} from '../engine/festival';
import { usePlayerStore } from './player';
import { useReincarnationStore } from './reincarnation';
import { useUIStore } from './ui';
import { bn } from '../engine/bignum';

interface FestivalStoreType {
  state: FestivalState;

  start: (type: FestivalType) => void;
  addScore: (trackType: string, amount?: number) => void;
  claimTier: (tierIndex: number) => void;
  tick: () => void;
  loadState: (s: FestivalState) => void;
  getState: () => FestivalState;
}

export const useFestivalStore = create<FestivalStoreType>((set, get) => ({
  state: createFestivalState(),

  start: (type) => {
    if (get().state.active) {
      useUIStore.getState().addToast('已有进行中的活动', 'warn');
      return;
    }
    const def = FESTIVAL_DEFS.find(d => d.type === type);
    if (!def) return;
    set({ state: { ...get().state, active: startFestival(def) } });
    useUIStore.getState().addToast(`🎊 ${def.name} 开始！`, 'success');
  },

  addScore: (trackType, amount = 1) => {
    const st = get().state;
    if (!st.active || st.active.trackType !== trackType) return;
    set({ state: { ...st, active: { ...st.active, score: st.active.score + amount } } });
  },

  claimTier: (tierIndex) => {
    const st = get().state;
    if (!st.active) return;
    const tier = st.active.rewardTiers[tierIndex];
    if (!tier || st.active.claimed[tierIndex] || st.active.score < tier.threshold) return;

    usePlayerStore.getState().addCoins(bn(tier.reward.coins));
    useReincarnationStore.getState().addMerit(tier.reward.merit);

    const claimed = [...st.active.claimed];
    claimed[tierIndex] = true;
    set({ state: { ...st, active: { ...st.active, claimed } } });
    useUIStore.getState().addToast(`🎁 活动奖励已领取！`, 'success');
  },

  tick: () => {
    const st = get().state;
    const newSt = checkFestivalEnd(st);
    if (newSt !== st) set({ state: newSt });
  },

  loadState: (s) => set({ state: s }),
  getState: () => get().state,
}));
