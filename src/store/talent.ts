/**
 * TalentStore — 天赋点管理、学习/重置
 */
import { create } from 'zustand';
import { TalentRanks, canLearnTalent, calcTalentBuffs, calcUsedPoints, getTalentDef } from '../engine/talent';
import { useUIStore } from './ui';

interface TalentStore {
  points: number;
  ranks: TalentRanks;

  learn: (talentId: string) => boolean;
  reset: () => void;
  addPoints: (n: number) => void;
  getBuffs: () => Record<string, number>;
  getUsedPoints: () => number;
  loadState: (points: number, ranks: TalentRanks) => void;
  getState: () => { points: number; ranks: TalentRanks };
}

export const useTalentStore = create<TalentStore>((set, get) => ({
  points: 0,
  ranks: {},

  learn: (talentId) => {
    const { points, ranks } = get();
    const def = getTalentDef(talentId);
    if (!def) return false;
    const check = canLearnTalent(def, ranks, points);
    if (!check.ok) {
      useUIStore.getState().addToast(check.reason ?? '无法学习', 'warn');
      return false;
    }
    set({
      points: points - def.cost,
      ranks: { ...ranks, [talentId]: (ranks[talentId] ?? 0) + 1 },
    });
    const newRank = (ranks[talentId] ?? 0) + 1;
    useUIStore.getState().addToast(`✨ 学习 ${def.name} Lv.${newRank}`, 'success');
    return true;
  },

  reset: () => {
    const { ranks } = get();
    const refund = calcUsedPoints(ranks);
    set({ points: get().points + refund, ranks: {} });
    useUIStore.getState().addToast(`🔄 天赋已重置，返还 ${refund} 天赋点`, 'info');
  },

  addPoints: (n) => set(s => ({ points: s.points + n })),

  getBuffs: () => calcTalentBuffs(get().ranks),
  getUsedPoints: () => calcUsedPoints(get().ranks),

  loadState: (points, ranks) => set({ points, ranks }),
  getState: () => ({ points: get().points, ranks: get().ranks }),
}));
