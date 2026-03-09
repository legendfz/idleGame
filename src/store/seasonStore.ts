/**
 * v180.0 赛季通行证 Store
 */
import { create } from 'zustand';
import { getSeasonQuests, getSeasonLevelXP, SEASON_REWARDS, getCurrentSeason, SeasonQuest } from '../data/seasonPass';

interface SeasonState {
  season: number;
  level: number;
  exp: number;
  claimedRewards: number[]; // levels claimed
  questProgress: Record<string, number>; // questId → progress
  questClaimed: string[]; // claimed quest ids
  lastQuestDay: number; // day number for quest refresh

  load: () => void;
  save: () => void;
  trackQuest: (trackKey: string, amount: number) => void;
  claimQuest: (questId: string) => void;
  claimReward: (level: number) => Promise<void>;
  addExp: (amount: number) => void;
}

const SAVE_KEY = 'idlegame-season';
const getDay = () => Math.floor(Date.now() / 86400000);

export const useSeasonStore = create<SeasonState>((set, get) => ({
  season: getCurrentSeason(),
  level: 0,
  exp: 0,
  claimedRewards: [],
  questProgress: {},
  questClaimed: [],
  lastQuestDay: 0,

  load: () => {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (raw) {
        const data = JSON.parse(raw);
        const currentSeason = getCurrentSeason();
        // Reset if new season
        if (data.season !== currentSeason) {
          set({ season: currentSeason, level: 0, exp: 0, claimedRewards: [], questProgress: {}, questClaimed: [], lastQuestDay: 0 });
        } else {
          set({
            season: data.season ?? currentSeason,
            level: data.level ?? 0,
            exp: data.exp ?? 0,
            claimedRewards: data.claimedRewards ?? [],
            questProgress: data.questProgress ?? {},
            questClaimed: data.questClaimed ?? [],
            lastQuestDay: data.lastQuestDay ?? 0,
          });
        }
      }
    } catch { /* ignore */ }
    // Check daily quest refresh
    const today = getDay();
    if (get().lastQuestDay !== today) {
      set({ questProgress: {}, questClaimed: [], lastQuestDay: today });
      get().save();
    }
  },

  save: () => {
    const { season, level, exp, claimedRewards, questProgress, questClaimed, lastQuestDay } = get();
    localStorage.setItem(SAVE_KEY, JSON.stringify({ season, level, exp, claimedRewards, questProgress, questClaimed, lastQuestDay }));
  },

  trackQuest: (trackKey: string, amount: number) => {
    const quests = getSeasonQuests();
    const { questProgress, questClaimed } = get();
    let changed = false;
    const newProgress = { ...questProgress };
    for (const q of quests) {
      if (q.trackKey === trackKey && !questClaimed.includes(q.id)) {
        newProgress[q.id] = (newProgress[q.id] ?? 0) + amount;
        changed = true;
      }
    }
    if (changed) {
      set({ questProgress: newProgress });
      get().save();
    }
  },

  claimQuest: (questId: string) => {
    const { questProgress, questClaimed } = get();
    const quests = getSeasonQuests();
    const quest = quests.find(q => q.id === questId);
    if (!quest || questClaimed.includes(questId)) return;
    if ((questProgress[questId] ?? 0) < quest.target) return;
    set({ questClaimed: [...questClaimed, questId] });
    get().addExp(quest.expReward);
    get().save();
  },

  claimReward: async (level: number) => {
    const state = get();
    if (state.level < level || state.claimedRewards.includes(level)) return;
    const reward = SEASON_REWARDS.find(r => r.level === level);
    if (!reward) return;

    // Apply reward (dynamic import to avoid circular dep)
    const { useGameStore } = await import('./gameStore');
    const gs = useGameStore.getState();
    const p = gs.player;
    const updates: any = {};
    switch (reward.type) {
      case 'lingshi': updates.lingshi = p.lingshi + reward.amount; break;
      case 'pantao': updates.pantao = p.pantao + reward.amount; break;
      case 'shards': updates.hongmengShards = p.hongmengShards + reward.amount; break;
      case 'scrolls': updates.tianmingScrolls = p.tianmingScrolls + reward.amount; break;
      case 'tokens': updates.trialTokens = (p.trialTokens ?? 0) + reward.amount; break;
      case 'daoPoints': updates.daoPoints = p.daoPoints + reward.amount; break;
    }
    if (Object.keys(updates).length) gs.updatePlayer(updates);

    set({ claimedRewards: [...state.claimedRewards, level] });
    get().save();
  },

  addExp: (amount: number) => {
    let { level, exp } = get();
    exp += amount;
    while (level < 30) {
      const need = getSeasonLevelXP(level + 1);
      if (exp >= need) {
        exp -= need;
        level++;
      } else break;
    }
    if (level >= 30) exp = 0;
    set({ level, exp });
    get().save();
  },
}));
