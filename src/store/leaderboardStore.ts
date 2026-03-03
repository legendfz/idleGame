/**
 * v1.3 排行榜状态管理（本地实现）
 */

import { create } from 'zustand';

export interface LeaderboardEntry {
  playerId: string;
  playerName: string;
  score: number;
  timestamp: number;
  metadata?: Record<string, unknown>;
}

export type LeaderboardType =
  | 'combat_power'
  | 'total_kills'
  | 'max_level'
  | 'equip_collection'
  | `dungeon_speed_${string}`;

interface LeaderboardStore {
  rankings: Record<string, LeaderboardEntry[]>;

  submitScore: (type: string, entry: LeaderboardEntry) => boolean; // returns true if new record
  getRanking: (type: string) => LeaderboardEntry[];
  save: () => void;
  load: () => void;
}

export const useLeaderboardStore = create<LeaderboardStore>((set, get) => ({
  rankings: {},

  submitScore: (type, entry) => {
    const state = get();
    const existing = state.rankings[type] || [];
    const isSpeedRun = type.startsWith('dungeon_speed_');

    // Check if new record
    const best = existing[0];
    const isNewRecord = !best ||
      (isSpeedRun ? entry.score < best.score : entry.score > best.score);

    const updated = [...existing, entry]
      .sort((a, b) => isSpeedRun ? a.score - b.score : b.score - a.score)
      .slice(0, 10);

    set({ rankings: { ...state.rankings, [type]: updated } });
    return isNewRecord;
  },

  getRanking: (type) => get().rankings[type] || [],

  save: () => {
    localStorage.setItem('xiyou-leaderboard-save', JSON.stringify(get().rankings));
  },

  load: () => {
    const raw = localStorage.getItem('xiyou-leaderboard-save');
    if (!raw) return;
    try {
      set({ rankings: JSON.parse(raw) });
    } catch { /* ignore */ }
  },
}));
