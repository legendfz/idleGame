import { create } from 'zustand';
import { AffinityState, createAffinityState, addAffinity, calcAffinityBuffs, getGiftCost, getGiftAmount } from '../engine/affinity';

interface AffinityStore {
  affinity: AffinityState;
  gift: (npcId: string, lingshi: number, tier?: number) => { cost: number; gain: number } | null;
  addPoints: (npcId: string, amount: number) => void;
  getBuffs: () => Record<string, number>;
  load: (s: AffinityState) => void;
}

export const useAffinityStore = create<AffinityStore>((set, get) => ({
  affinity: createAffinityState(),

  gift: (npcId, lingshi, tier = 0) => {
    const cost = getGiftCost(tier);
    if (lingshi < cost) return null;
    const gain = getGiftAmount(tier);
    set({ affinity: addAffinity(get().affinity, npcId, gain) });
    return { cost, gain };
  },

  addPoints: (npcId, amount) => {
    set({ affinity: addAffinity(get().affinity, npcId, amount) });
  },

  getBuffs: () => calcAffinityBuffs(get().affinity),
  load: (s) => set({ affinity: s }),
}));
