/**
 * ReincarnationStore — 轮回状态管理
 */
import { create } from 'zustand';
import {
  ReincarnationState, createReincarnationState, DaoType,
  canReincarnate, reincarnationCost, calcReincarnationBuffs, getDaoDef,
} from '../engine/reincarnation';
import { useUIStore } from './ui';
import { usePlayerStore } from './player';
import { useTalentStore } from './talent';
import { getRealmConfig } from '../data/config';

interface ReincarnationStore {
  state: ReincarnationState;

  addMerit: (amount: number) => void;
  reincarnate: (dao: DaoType) => boolean;
  getBuffs: () => Record<string, number>;
  loadState: (s: ReincarnationState) => void;
  getState: () => ReincarnationState;
}

export const useReincarnationStore = create<ReincarnationStore>((set, get) => ({
  state: createReincarnationState(),

  addMerit: (amount) => set(s => ({ state: { ...s.state, merit: s.state.merit + amount } })),

  reincarnate: (daoId) => {
    const st = get().state;
    const dao = getDaoDef(daoId);
    if (!dao) return false;

    const player = usePlayerStore.getState().player;
    const realm = getRealmConfig(player.realmId);
    const check = canReincarnate(st, dao, realm?.order ?? 1);
    if (!check.ok) {
      useUIStore.getState().addToast(check.reason ?? '无法轮回', 'warn');
      return false;
    }

    const cost = reincarnationCost(dao, st.totalReincarnations);

    // 执行轮回
    set({
      state: {
        ...st,
        merit: st.merit - cost,
        totalReincarnations: st.totalReincarnations + 1,
        daoCounts: { ...st.daoCounts, [daoId]: (st.daoCounts[daoId] ?? 0) + 1 },
        lastDao: daoId,
      },
    });

    // 重置玩家进度 (保留天赋点+转世次数+功德)
    usePlayerStore.getState().prestige();
    // 转世获得3天赋点
    useTalentStore.getState().addPoints(3);

    useUIStore.getState().addToast(`🔄 ${dao.name}轮回成功！获得3天赋点`, 'success');
    return true;
  },

  getBuffs: () => calcReincarnationBuffs(get().state),

  loadState: (s) => set({ state: s }),
  getState: () => get().state,
}));
