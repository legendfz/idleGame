import { create } from 'zustand';
import { AffinityState, createAffinityState, addAffinity, calcAffinityBuffs, getGiftCost, getGiftAmount } from '../engine/affinity';

interface AffinityStore {
  affinity: AffinityState;
  gift: (npcId: string, lingshi: number) => { cost: number; gain: number } | null;
  addPoints: (npcId: string, amount: number) => void;
  getBuffs: () => Record<string, number>;
  load: (s: AffinityState) => void;
}

export const useAffinityStore = create<AffinityStore>((set, get) => ({
  affinity: createAffinityState(),

  gift: (npcId, lingshi) => {
    const cost = getGiftCost();
    if (lingshi < cost) return null;
    const gain = getGiftAmount();
    set({ affinity: addAffinity(get().affinity, npcId, gain) });
    return { cost, gain };
  },

  addPoints: (npcId, amount) => {
    set({ affinity: addAffinity(get().affinity, npcId, amount) });
  },

  getBuffs: () => calcAffinityBuffs(get().affinity),
  load: (s) => set({ affinity: s }),
}));
