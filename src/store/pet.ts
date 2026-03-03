/**
 * PetStore — 灵兽收集、装备、升级
 */
import { create } from 'zustand';
import { PetInstance, calcPetBuffs, petExpRequired, getPetDef, MAX_PET_LEVEL } from '../engine/pet';
import { useUIStore } from './ui';

interface PetStoreType {
  instances: Record<string, PetInstance>;
  activePetId: string | null;

  unlock: (defId: string) => void;
  feed: (defId: string, pills: number) => void;
  setActive: (defId: string | null) => void;
  getBuffs: () => Record<string, number>;
  loadState: (instances: Record<string, PetInstance>, activePetId: string | null) => void;
  getState: () => { instances: Record<string, PetInstance>; activePetId: string | null };
}

export const usePetStore = create<PetStoreType>((set, get) => ({
  instances: {},
  activePetId: null,

  unlock: (defId) => {
    const { instances } = get();
    if (instances[defId]) return;
    const def = getPetDef(defId);
    set({ instances: { ...instances, [defId]: { defId, level: 1, exp: 0 } } });
    if (def) useUIStore.getState().addToast(`🎉 获得灵兽：${def.name}`, 'success');
  },

  feed: (defId, pills) => {
    const { instances } = get();
    const inst = instances[defId];
    if (!inst) return;
    let { level, exp } = inst;
    exp += pills;
    while (exp >= petExpRequired(level) && level < MAX_PET_LEVEL) {
      exp -= petExpRequired(level);
      level++;
      const def = getPetDef(defId);
      if (def) useUIStore.getState().addToast(`${def.name} 升至 Lv.${level}`, 'info');
    }
    set({ instances: { ...instances, [defId]: { ...inst, level, exp } } });
  },

  setActive: (defId) => {
    if (defId && !get().instances[defId]) return;
    set({ activePetId: defId });
    if (defId) {
      const def = getPetDef(defId);
      useUIStore.getState().addToast(`${def?.name ?? '灵兽'} 已出战`, 'info');
    }
  },

  getBuffs: () => calcPetBuffs(get().activePetId, get().instances),

  loadState: (instances, activePetId) => set({ instances, activePetId }),
  getState: () => ({ instances: get().instances, activePetId: get().activePetId }),
}));
