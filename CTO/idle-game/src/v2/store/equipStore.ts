/**
 * v2.0 Equipment Store — placeholder
 */

import { create } from 'zustand';
import { EquipInstanceV2 } from '../types/equipment';

interface EquipStore {
  instances: EquipInstanceV2[];
  inventory: string[]; // uid list
  addEquip: (e: EquipInstanceV2) => void;
}

export const useEquipStore = create<EquipStore>((set, get) => ({
  instances: [],
  inventory: [],
  addEquip: (e) => set({ instances: [...get().instances, e], inventory: [...get().inventory, e.uid] }),
}));
