import { create } from 'zustand';
import { SanctuaryState, createSanctuaryState, BUILDINGS, getUpgradeCost, calcSanctuaryBuffs } from '../engine/sanctuary';

interface SanctuaryStore {
  sanctuary: SanctuaryState;
  upgrade: (buildingId: string, lingshi: number) => { cost: number } | null;
  getBuffs: () => Record<string, number>;
  load: (s: SanctuaryState) => void;
}

export const useSanctuaryStore = create<SanctuaryStore>((set, get) => ({
  sanctuary: createSanctuaryState(),

  upgrade: (buildingId, lingshi) => {
    const st = get().sanctuary;
    const def = BUILDINGS.find(b => b.id === buildingId);
    if (!def) return null;
    const lv = st.levels[buildingId] ?? 0;
    if (lv >= 10) return null;
    const cost = getUpgradeCost(def, lv);
    if (lingshi < cost) return null;
    set({ sanctuary: { levels: { ...st.levels, [buildingId]: lv + 1 } } });
    return { cost };
  },

  getBuffs: () => calcSanctuaryBuffs(get().sanctuary),
  load: (s) => set({ sanctuary: s }),
}));
