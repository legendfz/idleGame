/**
 * v1.3 成就系统状态管理
 */

import { create } from 'zustand';
import { ACHIEVEMENTS, AchievementDef } from '../data/achievements';

export interface AchievementState {
  progress: number;   // 0-1
  completed: boolean;
  completedAt?: number;
}

interface AchievementStore {
  states: Record<string, AchievementState>;
  selectedTitle: string;
  unlockedTitles: string[];
  // Cumulative counters for tracking
  counters: {
    totalKills: number;
    totalEquipObtained: number;
    totalDungeonClears: number;
    bestDungeonSpeed: number; // seconds, lower is better
    totalGoldEarned: number;
    winStreak: number;
    dodgeStreak: number;
    hasHongmeng: boolean;
    maxEnhanceLevel: number;
    noDamageClear: boolean;
  };
  // Toast queue
  pendingToasts: AchievementDef[];

  // Actions
  updateProgress: (type: string, value: number) => void;
  incrementCounter: (counter: keyof AchievementStore['counters'], amount?: number) => void;
  checkAchievements: () => void;
  consumeToast: () => AchievementDef | null;
  selectTitle: (title: string) => void;
  save: () => void;
  load: () => void;
}

function getInitialStates(): Record<string, AchievementState> {
  const states: Record<string, AchievementState> = {};
  for (const a of ACHIEVEMENTS) {
    states[a.id] = { progress: 0, completed: false };
  }
  return states;
}

export const useAchievementStore = create<AchievementStore>((set, get) => ({
  states: getInitialStates(),
  selectedTitle: '花果山猴王',
  unlockedTitles: ['花果山猴王'],
  counters: {
    totalKills: 0,
    totalEquipObtained: 0,
    totalDungeonClears: 0,
    bestDungeonSpeed: Infinity,
    totalGoldEarned: 0,
    winStreak: 0,
    dodgeStreak: 0,
    hasHongmeng: false,
    maxEnhanceLevel: 0,
    noDamageClear: false,
  },
  pendingToasts: [],

  updateProgress: (achievementId, value) => {
    const state = get();
    const current = state.states[achievementId];
    if (!current || current.completed) return;

    const def = ACHIEVEMENTS.find(a => a.id === achievementId);
    if (!def) return;

    const progress = Math.min(1, value / def.target);
    const completed = progress >= 1;

    const newStates = {
      ...state.states,
      [achievementId]: {
        progress,
        completed,
        completedAt: completed ? Date.now() : undefined,
      },
    };

    const updates: Partial<AchievementStore> = { states: newStates };

    if (completed) {
      updates.pendingToasts = [...state.pendingToasts, def];
      // Handle title rewards
      if (def.reward.type === 'title' && def.reward.title) {
        updates.unlockedTitles = [...state.unlockedTitles, def.reward.title];
      }
    }

    set(updates);
  },

  incrementCounter: (counter, amount = 1) => {
    const state = get();
    const counters = { ...state.counters };
    if (typeof counters[counter] === 'number') {
      (counters[counter] as number) += amount;
    } else if (typeof counters[counter] === 'boolean') {
      (counters[counter] as boolean) = true;
    }
    set({ counters });
  },

  checkAchievements: () => {
    const state = get();
    const c = state.counters;

    // Map condition types to counter values
    for (const def of ACHIEVEMENTS) {
      if (state.states[def.id]?.completed) continue;

      let currentValue = 0;
      switch (def.conditionType) {
        case 'kill_count': currentValue = c.totalKills; break;
        case 'equipment_count': currentValue = c.totalEquipObtained; break;
        case 'dungeon_clear': currentValue = c.totalDungeonClears; break;
        case 'dungeon_speed': currentValue = c.bestDungeonSpeed <= def.target ? def.target : 0; break;
        case 'gold_total': currentValue = c.totalGoldEarned; break;
        case 'win_streak': currentValue = c.winStreak; break;
        case 'dodge_streak': currentValue = c.dodgeStreak; break;
        case 'hongmeng_obtain': currentValue = c.hasHongmeng ? 1 : 0; break;
        case 'enhance_max': currentValue = c.maxEnhanceLevel; break;
        case 'no_damage': currentValue = c.noDamageClear ? 1 : 0; break;
        case 'level': continue; // checked externally via updateProgress
        case 'online_time': continue; // checked externally via updateProgress
        default: continue;
      }

      if (currentValue > 0) {
        state.updateProgress(def.id, currentValue);
      }
    }
  },

  consumeToast: () => {
    const state = get();
    if (state.pendingToasts.length === 0) return null;
    const [toast, ...rest] = state.pendingToasts;
    set({ pendingToasts: rest });
    return toast;
  },

  selectTitle: (title) => set({ selectedTitle: title }),

  save: () => {
    const { states, selectedTitle, unlockedTitles, counters } = get();
    localStorage.setItem('xiyou-achievement-save', JSON.stringify({ states, selectedTitle, unlockedTitles, counters }));
  },

  load: () => {
    const raw = localStorage.getItem('xiyou-achievement-save');
    if (!raw) return;
    try {
      const data = JSON.parse(raw);
      // Merge with defaults for new achievements
      const defaultStates = getInitialStates();
      const merged = { ...defaultStates, ...data.states };
      set({
        states: merged,
        selectedTitle: data.selectedTitle ?? '花果山猴王',
        unlockedTitles: data.unlockedTitles ?? ['花果山猴王'],
        counters: { ...get().counters, ...data.counters },
      });
    } catch { /* ignore */ }
  },
}));
