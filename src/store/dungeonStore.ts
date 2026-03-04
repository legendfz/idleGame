/**
 * v1.3 副本状态管理
 */

import { create } from 'zustand';
import { DungeonConfig, getDungeon } from '../data/dungeons';
import {
  DungeonBattleState,
  initDungeonBattle,
  tickDungeonBattle,
  doDodge,
  calculateDungeonRewards,
} from '../engine/dungeonEngine';
import { Stats } from '../types';

export interface DungeonProgress {
  cleared: boolean;
  clearCount: number;
  bestTime: number | null;
  firstClearClaimed: boolean;
}

interface DungeonStore {
  progress: Record<string, DungeonProgress>;
  dailyAttempts: Record<string, number>;
  dailyResetDate: string;
  // Active battle
  activeBattle: DungeonBattleState | null;
  activeDungeon: DungeonConfig | null;
  // Last reward (for display)
  lastReward: {
    lingshi: number;
    exp: number;
    pantao: number;
    firstClearLingshi: number;
    firstClearPantao: number;
    clearTime: number;
  } | null;

  // Actions
  checkDailyReset: () => void;
  canEnterDungeon: (id: string, playerLevel: number, realmIndex: number) => boolean;
  startDungeon: (id: string, playerMaxHp: number) => void;
  tickBattle: (dt: number, playerStats: Stats) => void;
  dodge: () => void;
  endBattle: () => { lingshi: number; exp: number; pantao: number } | null;
  dismissReward: () => void;
  getDungeonStatus: (id: string) => 'locked' | 'available' | 'cleared';
  save: () => void;
  load: () => void;
}

function getToday(): string {
  return new Date().toISOString().slice(0, 10);
}

export const useDungeonStore = create<DungeonStore>((set, get) => ({
  progress: {},
  dailyAttempts: {},
  dailyResetDate: getToday(),
  activeBattle: null,
  activeDungeon: null,
  lastReward: null,

  checkDailyReset: () => {
    const today = getToday();
    if (get().dailyResetDate !== today) {
      set({ dailyAttempts: {}, dailyResetDate: today });
    }
  },

  canEnterDungeon: (id, playerLevel, realmIndex) => {
    const state = get();
    state.checkDailyReset();
    const dungeon = getDungeon(id);
    if (!dungeon) return false;

    // Level & realm check
    if (playerLevel < dungeon.requiredLevel) return false;
    if (realmIndex < dungeon.requiredRealmIndex) return false;

    // Prerequisite check
    if (dungeon.prerequisite) {
      const preProgress = state.progress[dungeon.prerequisite];
      if (!preProgress?.cleared) return false;
    }

    // Daily limit check
    const attempts = state.dailyAttempts[id] ?? 0;
    const progress = state.progress[id];
    if (progress?.cleared && attempts >= dungeon.dailyLimit) return false;

    return true;
  },

  startDungeon: (id, playerMaxHp) => {
    const dungeon = getDungeon(id);
    if (!dungeon) return;

    const battle = initDungeonBattle(dungeon);
    battle.playerHp = playerMaxHp;
    battle.playerMaxHp = playerMaxHp;
    battle.lastTick = performance.now();

    set({ activeBattle: battle, activeDungeon: dungeon });
  },

  tickBattle: (dt, playerStats) => {
    const { activeBattle, activeDungeon } = get();
    if (!activeBattle || !activeDungeon || activeBattle.status !== 'fighting') return;

    const updated = tickDungeonBattle(activeBattle, dt, playerStats, activeDungeon);
    set({ activeBattle: updated });
  },

  dodge: () => {
    const { activeBattle } = get();
    if (!activeBattle) return;
    set({ activeBattle: doDodge(activeBattle) });
  },

  endBattle: () => {
    const { activeBattle, activeDungeon, progress, dailyAttempts } = get();
    if (!activeBattle || !activeDungeon) return null;

    if (activeBattle.status === 'victory') {
      const isFirstClear = !progress[activeDungeon.id]?.cleared;
      const rewards = calculateDungeonRewards(activeDungeon, activeBattle, isFirstClear);

      const newProgress = { ...progress };
      const existing = newProgress[activeDungeon.id] ?? {
        cleared: false, clearCount: 0, bestTime: null, firstClearClaimed: false,
      };
      newProgress[activeDungeon.id] = {
        cleared: true,
        clearCount: existing.clearCount + 1,
        bestTime: existing.bestTime === null
          ? rewards.clearTime
          : Math.min(existing.bestTime, rewards.clearTime),
        firstClearClaimed: true,
      };

      const newAttempts = { ...dailyAttempts };
      newAttempts[activeDungeon.id] = (newAttempts[activeDungeon.id] ?? 0) + 1;

      set({
        progress: newProgress,
        dailyAttempts: newAttempts,
        activeBattle: null,
        activeDungeon: null,
        lastReward: rewards,
      });

      return {
        lingshi: rewards.lingshi + rewards.firstClearLingshi,
        exp: rewards.exp,
        pantao: rewards.pantao + rewards.firstClearPantao,
      };
    }

    // Defeat
    const newAttempts = { ...dailyAttempts };
    newAttempts[activeDungeon.id] = (newAttempts[activeDungeon.id] ?? 0) + 1;

    set({
      dailyAttempts: newAttempts,
      activeBattle: null,
      activeDungeon: null,
      lastReward: null,
    });
    return null;
  },

  dismissReward: () => set({ lastReward: null }),

  getDungeonStatus: (id) => {
    const state = get();
    const dungeon = getDungeon(id);
    if (!dungeon) return 'locked';

    if (state.progress[id]?.cleared) return 'cleared';

    // Check prerequisites only (level/realm checked separately)
    if (dungeon.prerequisite && !state.progress[dungeon.prerequisite]?.cleared) return 'locked';

    return 'available';
  },

  save: () => {
    const { progress, dailyAttempts, dailyResetDate } = get();
    localStorage.setItem('xiyou-dungeon-save', JSON.stringify({ progress, dailyAttempts, dailyResetDate }));
  },

  load: () => {
    const raw = localStorage.getItem('xiyou-dungeon-save');
    if (!raw) return;
    try {
      const data = JSON.parse(raw);
      set({
        progress: data.progress ?? {},
        dailyAttempts: data.dailyAttempts ?? {},
        dailyResetDate: data.dailyResetDate ?? getToday(),
      });
    } catch { /* ignore */ }
  },
}));
