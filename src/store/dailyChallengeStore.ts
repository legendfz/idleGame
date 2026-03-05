import { create } from 'zustand';
import {
  DailyChallengeState, createFreshState, ensureToday,
  getDailyChallenges, getRewardAmount
} from '../data/dailyChallenge';

interface DailyChallengeStore extends DailyChallengeState {
  /** Increment a tracking counter */
  track: (key: string, amount?: number) => void;
  /** Claim reward for a challenge, returns { type, amount } or null */
  claim: (challengeId: string, level: number) => { type: string; amount: number } | null;
  /** Check if all claimed */
  allClaimed: () => boolean;
  /** Has unclaimed completed challenges */
  hasUnclaimed: () => boolean;
  /** Load from localStorage */
  load: () => void;
  /** Save to localStorage */
  save: () => void;
}

export const useDailyChallengeStore = create<DailyChallengeStore>((set, get) => ({
  ...createFreshState(),

  track: (key, amount = 1) => {
    const state = ensureToday(get());
    const counters = { ...state.counters, [key]: (state.counters[key] || 0) + amount };
    // Update progress for matching challenges
    const challenges = getDailyChallenges();
    const progress = { ...state.progress };
    for (const ch of challenges) {
      if (ch.trackKey === key) {
        progress[ch.id] = counters[key] || 0;
      }
    }
    set({ ...state, counters, progress });
  },

  claim: (challengeId, level) => {
    const state = ensureToday(get());
    if (state.claimed[challengeId]) return null;
    const challenges = getDailyChallenges();
    const ch = challenges.find(c => c.id === challengeId);
    if (!ch) return null;
    const current = state.progress[challengeId] || 0;
    if (current < ch.target) return null;
    const amount = getRewardAmount(ch, level);
    set({ claimed: { ...state.claimed, [challengeId]: true } });
    return { type: ch.rewardType, amount };
  },

  allClaimed: () => {
    const state = ensureToday(get());
    const challenges = getDailyChallenges();
    return challenges.every(ch => state.claimed[ch.id]);
  },

  hasUnclaimed: () => {
    const state = ensureToday(get());
    const challenges = getDailyChallenges();
    return challenges.some(ch => {
      const current = state.progress[ch.id] || 0;
      return current >= ch.target && !state.claimed[ch.id];
    });
  },

  load: () => {
    try {
      const raw = localStorage.getItem('dailyChallenge');
      if (raw) {
        const data = JSON.parse(raw);
        set(ensureToday(data));
      }
    } catch {}
  },

  save: () => {
    try {
      const { track, claim, allClaimed, hasUnclaimed, load, save, ...data } = get();
      localStorage.setItem('dailyChallenge', JSON.stringify(data));
    } catch {}
  },
}));
