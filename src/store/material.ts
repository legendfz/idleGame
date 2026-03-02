/**
 * MaterialStore — 材料背包（与装备背包并行）
 */
import { create } from 'zustand';

interface MaterialStore {
  materials: Record<string, number>; // materialId -> count

  addMaterial: (id: string, count: number) => void;
  addMaterials: (items: { materialId: string; count: number }[]) => void;
  removeMaterial: (id: string, count: number) => boolean;
  removeMaterials: (items: { materialId: string; count: number }[]) => boolean;
  getMaterialCount: (id: string) => number;
  loadState: (materials: Record<string, number>) => void;
  getState: () => Record<string, number>;
}

export const useMaterialStore = create<MaterialStore>((set, get) => ({
  materials: {},

  addMaterial: (id, count) => {
    set(s => ({ materials: { ...s.materials, [id]: (s.materials[id] ?? 0) + count } }));
  },

  addMaterials: (items) => {
    const { materials } = get();
    const newMats = { ...materials };
    for (const item of items) {
      newMats[item.materialId] = (newMats[item.materialId] ?? 0) + item.count;
    }
    set({ materials: newMats });
  },

  removeMaterial: (id, count) => {
    const { materials } = get();
    if ((materials[id] ?? 0) < count) return false;
    const newMats = { ...materials, [id]: materials[id] - count };
    if (newMats[id] <= 0) delete newMats[id];
    set({ materials: newMats });
    return true;
  },

  removeMaterials: (items) => {
    const { materials } = get();
    // Check all first
    for (const item of items) {
      if ((materials[item.materialId] ?? 0) < item.count) return false;
    }
    const newMats = { ...materials };
    for (const item of items) {
      newMats[item.materialId] -= item.count;
      if (newMats[item.materialId] <= 0) delete newMats[item.materialId];
    }
    set({ materials: newMats });
    return true;
  },

  getMaterialCount: (id) => get().materials[id] ?? 0,
  loadState: (materials) => set({ materials }),
  getState: () => get().materials,
}));
