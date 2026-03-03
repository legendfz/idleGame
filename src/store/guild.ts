/**
 * GuildStore — 仙盟状态管理
 */
import { create } from 'zustand';
import {
  GuildState, createGuildState, createGuildWithNPCs,
  calcGuildBuffs, generateGuildQuests, guildLevelExp,
} from '../engine/guild';
import { usePlayerStore } from './player';
import { useMaterialStore } from './material';
import { useUIStore } from './ui';
import { bn } from '../engine/bignum';

interface GuildStoreType {
  state: GuildState;

  createGuild: (name: string) => void;
  leaveGuild: () => void;
  donate: (materialId: string, count: number) => void;
  addQuestProgress: (trackType: string, amount?: number) => void;
  claimQuest: (questId: string) => void;
  addContribution: (amount: number) => void;
  tickReset: () => void;
  getBuffs: () => Record<string, number>;
  loadState: (s: GuildState) => void;
  getState: () => GuildState;
}

export const useGuildStore = create<GuildStoreType>((set, get) => ({
  state: createGuildState(),

  createGuild: (name) => {
    const patch = createGuildWithNPCs(name);
    set({ state: { ...get().state, ...patch } });
    useUIStore.getState().addToast(`🏯 仙盟「${name}」创建成功！`, 'success');
  },

  leaveGuild: () => {
    set({ state: createGuildState() });
    useUIStore.getState().addToast('已离开仙盟', 'info');
  },

  donate: (materialId, count) => {
    const mats = useMaterialStore.getState().materials;
    if ((mats[materialId] ?? 0) < count) {
      useUIStore.getState().addToast('材料不足', 'warn');
      return;
    }
    useMaterialStore.getState().removeMaterial(materialId, count);
    const st = get().state;
    const warehouse = { ...st.warehouse, [materialId]: (st.warehouse[materialId] ?? 0) + count };
    const contribGain = count * 10;
    const newExp = st.exp + contribGain;
    let newLevel = st.level;
    while (newExp >= guildLevelExp(newLevel) && newLevel < 10) newLevel++;
    set({ state: { ...st, warehouse, contribution: st.contribution + contribGain, exp: newExp, level: newLevel } });
    useUIStore.getState().addToast(`捐献成功，获得${contribGain}贡献`, 'success');
  },

  addQuestProgress: (trackType, amount = 1) => {
    const st = get().state;
    if (!st.joined) return;
    const quests = st.quests.map(q =>
      q.trackType === trackType && !q.claimed ? { ...q, progress: q.progress + amount } : q
    );
    set({ state: { ...st, quests } });
  },

  claimQuest: (questId) => {
    const st = get().state;
    const quest = st.quests.find(q => q.id === questId);
    if (!quest || quest.claimed || quest.progress < quest.target) return;
    usePlayerStore.getState().addCoins(bn(quest.reward.coins));
    const quests = st.quests.map(q => q.id === questId ? { ...q, claimed: true } : q);
    set({ state: { ...st, quests, contribution: st.contribution + quest.reward.contribution } });
    useUIStore.getState().addToast(`仙盟任务完成！+${quest.reward.contribution}贡献`, 'success');
  },

  addContribution: (amount) => set(s => ({ state: { ...s.state, contribution: s.state.contribution + amount } })),

  tickReset: () => {
    const st = get().state;
    if (!st.joined || Date.now() < st.questResetTime) return;
    set({ state: { ...st, quests: generateGuildQuests(), questResetTime: Date.now() + 24 * 3600 * 1000 } });
  },

  getBuffs: () => calcGuildBuffs(get().state.level, get().state.joined),

  loadState: (s) => set({ state: s }),
  getState: () => get().state,
}));
