/**
 * EquipStore — 装备背包、穿戴状态
 */
import { StateCreator } from 'zustand';

export interface EquipItem {
  id: string;
  templateId: string;
  name: string;
  quality: number;
  level: number;
  attack: string;
  defense: string;
}

export interface EquipmentSlice {
  inventory: EquipItem[];
  equipped: Record<string, EquipItem | null>; // slot -> item
  addItem: (item: EquipItem) => void;
  removeItem: (id: string) => void;
  equip: (slot: string, item: EquipItem) => void;
  unequip: (slot: string) => void;
}

export const createEquipmentSlice: StateCreator<EquipmentSlice> = (set) => ({
  inventory: [],
  equipped: { weapon: null, armor: null, accessory: null, mount: null },
  addItem: (item) => set((s) => ({ inventory: [...s.inventory, item] })),
  removeItem: (id) => set((s) => ({ inventory: s.inventory.filter(i => i.id !== id) })),
  equip: (slot, item) => set((s) => ({ equipped: { ...s.equipped, [slot]: item } })),
  unequip: (slot) => set((s) => ({ equipped: { ...s.equipped, [slot]: null } })),
});
