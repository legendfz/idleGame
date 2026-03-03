/**
 * AffinityStore — 仙缘系统状态管理
 */
import { create } from 'zustand';
import { AffinityState, createAffinityState, NPCS, giftNpc, getGiftCost, getAffinityTier, calcAffinityBuffs } from '../engine/affinity';
import { usePlayerStore } from './player';
import { useUIStore } from './ui';

interface AffinityStoreType {
  state: AffinityState;
  gift: (npcId: string) => void;
  getBuffs: () => Record<string, number>;
  getState: () => AffinityState;
  loadState: (s: AffinityState) => void;
}

export const useAffinityStore = create<AffinityStoreType>((set, get) => ({
  state: createAffinityState(),

  gift: (npcId: string) => {
    const s = get().state;
    const npc = NPCS.find(n => n.id === npcId);
    if (!npc) return;
    if ((s.levels[npcId] ?? 0) >= 100) { useUIStore.getState().addToast('好感已满', 'warning'); return; }
    const cost = getGiftCost();
    const player = usePlayerStore.getState().player;
    if (parseFloat(player.coins) < cost) { useUIStore.getState().addToast('灵石不足', 'warning'); return; }
    usePlayerStore.getState().addCoins(-cost);
    const newState = { ...s, levels: { ...s.levels } };
    const result = giftNpc(newState, npcId);
    set({ state: newState });
    useUIStore.getState().addToast(`${npc.name} 好感+${result.gain} (${result.newLevel}/100)`, 'success');
  },

  getBuffs: () => calcAffinityBuffs(get().state),

  getState: () => get().state,
  loadState: (s: AffinityState) => set({ state: s }),
}));
