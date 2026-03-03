/**
 * DailyQuestStore — 每日任务状态
 */
import { create } from 'zustand';
import {
  DailyQuestState, createDailyQuestState, checkDailyReset,
  addQuestProgress, getQuestDef, DailyTrackType,
} from '../engine/dailyQuest';
import { usePlayerStore } from './player';
import { useMaterialStore } from './material';
import { useUIStore } from './ui';
import { bn } from '../engine/bignum';

interface DailyQuestStore {
  state: DailyQuestState;

  checkReset: () => void;
  addProgress: (trackType: DailyTrackType, amount?: number) => void;
  claimReward: (index: number) => boolean;
  loadState: (state: DailyQuestState) => void;
  getState: () => DailyQuestState;
}

export const useDailyQuestStore = create<DailyQuestStore>((set, get) => ({
  state: createDailyQuestState(),

  checkReset: () => set({ state: checkDailyReset(get().state) }),

  addProgress: (trackType, amount = 1) => {
    set({ state: addQuestProgress(get().state, trackType, amount) });
  },

  claimReward: (index) => {
    const { state } = get();
    const quest = state.quests[index];
    if (!quest || quest.claimed) return false;
    const def = getQuestDef(quest.defId);
    if (!def || quest.progress < def.target) return false;

    // 发放奖励
    if (def.reward.coins) {
      usePlayerStore.getState().addCoins(bn(def.reward.coins));
    }
    if (def.reward.materials) {
      useMaterialStore.getState().addMaterial(def.reward.materials.id, def.reward.materials.count);
    }

    // 标记已领取
    const newQuests = [...state.quests];
    newQuests[index] = { ...quest, claimed: true };
    set({ state: { ...state, quests: newQuests } });
    useUIStore.getState().addToast(`✅ 领取任务奖励：${def.name}`, 'success');
    return true;
  },

  loadState: (state) => set({ state: checkDailyReset(state) }),
  getState: () => get().state,
}));
