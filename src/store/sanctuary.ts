/**
 * SanctuaryStore — 洞天福地状态管理
 */
import { create } from 'zustand';
import { SanctuaryState, createSanctuaryState, BUILDINGS, getUpgradeCost, calcSanctuaryBuffs } from '../engine/sanctuary';
import { usePlayerStore } from './player';
import { useUIStore } from './ui';
import { bn } from '../engine/bignum';

interface SanctuaryStoreType {
  state: SanctuaryState;
  upgrade: (buildingId: string) => void;
  getBuffs: () => Record<string, number>;
  tickProduce: (dt: number) => void;
  getState: () => SanctuaryState;
  loadState: (s: SanctuaryState) => void;
}

export const useSanctuaryStore = create<SanctuaryStoreType>((set, get) => ({
  state: createSanctuaryState(),

  upgrade: (buildingId: string) => {
    const s = get().state;
    const def = BUILDINGS.find(b => b.id === buildingId);
    if (!def) return;
    const lv = s.levels[buildingId] ?? 0;
    if (lv >= 10) { useUIStore.getState().addToast('已达最高等级', 'warning'); return; }
    const cost = getUpgradeCost(def, lv);
    const player = usePlayerStore.getState().player;
    if (parseFloat(player.coins) < cost) { useUIStore.getState().addToast('灵石不足', 'warning'); return; }
    usePlayerStore.getState().addCoins(-cost);
    set({ state: { ...s, levels: { ...s.levels, [buildingId]: lv + 1 } } });
    useUIStore.getState().addToast(`${def.name} 升至 ${lv + 1} 级`, 'success');
  },

  getBuffs: () => calcSanctuaryBuffs(get().state),

  tickProduce: (dt: number) => {
    const buffs = calcSanctuaryBuffs(get().state);
    if (buffs.lingshi) usePlayerStore.getState().addCoins(buffs.lingshi * dt);
    if (buffs.xiuwei) usePlayerStore.getState().addXiuwei(buffs.xiuwei * dt);
  },

  getState: () => get().state,
  loadState: (s: SanctuaryState) => set({ state: s }),
}));
