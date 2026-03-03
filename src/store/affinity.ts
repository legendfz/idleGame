/**
 * AffinityStore — 仙缘状态管理
 */
import { create } from 'zustand';
import { AffinityState, createAffinityState, giftNpc, calcAffinityBuffs, getGiftCost, NPCS } from '../engine/affinity';
import { usePlayerStore } from './player';
import { useUIStore } from './ui';
import { bn } from '../engine/bignum';

interface AffinityStoreType {
  state: AffinityState;

  gift: (npcId: string) => boolean;
  getBuffs: () => Record<string, number>;
  loadState: (s: AffinityState) => void;
  getState: () => AffinityState;
}

export const useAffinityStore = create<AffinityStoreType>((set, get) => ({
  state: createAffinityState(),

  gift: (npcId) => {
    const cost = getGiftCost();
    const coins = Number(usePlayerStore.getState().player.coins);
    if (coins < cost) { useUIStore.getState().addToast('灵石不足', 'warn'); return false; }
    const lv = get().state.levels[npcId] ?? 0;
    if (lv >= 100) { useUIStore.getState().addToast('好感已满', 'warn'); return false; }
    usePlayerStore.setState(s => ({ player: { ...s.player, coins: bn(s.player.coins).sub(cost).toString() } }));
    const newState: AffinityState = { levels: { ...get().state.levels }, giftCooldowns: { ...get().state.giftCooldowns } };
    const result = giftNpc(newState, npcId);
    set({ state: newState });
    const npc = NPCS.find(n => n.id === npcId);
    useUIStore.getState().addToast(`💕 ${npc?.name ?? ''} 好感+${result.gain} (${result.newLevel}/100)`, 'success');
    return true;
  },

  getBuffs: () => calcAffinityBuffs(get().state),
  loadState: (s) => set({ state: s }),
  getState: () => get().state,
}));
