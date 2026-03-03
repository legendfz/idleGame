/**
 * SanctuaryStore — 洞天状态管理
 */
import { create } from 'zustand';
import { SanctuaryState, createSanctuaryState, BUILDINGS, getUpgradeCost, calcSanctuaryBuffs } from '../engine/sanctuary';
import { usePlayerStore } from './player';
import { useUIStore } from './ui';
import { bn } from '../engine/bignum';

interface SanctuaryStoreType {
  state: SanctuaryState;

  upgrade: (buildingId: string) => boolean;
  getBuffs: () => Record<string, number>;
  tickProduce: (dt: number) => void;
  loadState: (s: SanctuaryState) => void;
  getState: () => SanctuaryState;
}

export const useSanctuaryStore = create<SanctuaryStoreType>((set, get) => ({
  state: createSanctuaryState(),

  upgrade: (buildingId) => {
    const st = get().state;
    const def = BUILDINGS.find(b => b.id === buildingId);
    if (!def) return false;
    const lv = st.levels[buildingId] ?? 0;
    if (lv >= 10) { useUIStore.getState().addToast('已满级', 'warn'); return false; }
    const cost = getUpgradeCost(def, lv);
    const player = usePlayerStore.getState().player;
    if (Number(player.coins) < cost) { useUIStore.getState().addToast('灵石不足', 'warn'); return false; }
    usePlayerStore.setState(s => ({ player: { ...s.player, coins: bn(s.player.coins).sub(cost).toString() } }));
    set({ state: { levels: { ...st.levels, [buildingId]: lv + 1 } } });
    useUIStore.getState().addToast(`🏗️ ${def.name} 升至 Lv.${lv + 1}`, 'success');
    return true;
  },

  getBuffs: () => calcSanctuaryBuffs(get().state),

  tickProduce: (dt) => {
    const buffs = calcSanctuaryBuffs(get().state);
    if (buffs.lingshi) usePlayerStore.getState().addCoins(bn(Math.floor(buffs.lingshi * dt)));
    if (buffs.xiuwei) usePlayerStore.getState().addXiuwei(bn(Math.floor(buffs.xiuwei * dt)));
  },

  loadState: (s) => set({ state: s }),
  getState: () => get().state,
}));
