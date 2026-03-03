/**
 * CompanionStore — 伙伴收集、装备、升级
 */
import { create } from 'zustand';
import { CompanionInstance, calcCompanionBuffs, companionExpRequired, getCompanionDef } from '../engine/companion';
import { useUIStore } from './ui';

const MAX_EQUIPPED = 3;

interface CompanionStore {
  instances: Record<string, CompanionInstance>; // defId -> instance
  equipped: string[]; // defId[]，最多3个

  unlock: (defId: string) => void;
  addExp: (defId: string, exp: number) => void;
  equip: (defId: string) => boolean;
  unequip: (defId: string) => void;
  getBuffs: () => Record<string, number>;
  loadState: (instances: Record<string, CompanionInstance>, equipped: string[]) => void;
  getState: () => { instances: Record<string, CompanionInstance>; equipped: string[] };
}

export const useCompanionStore = create<CompanionStore>((set, get) => ({
  instances: {},
  equipped: [],

  unlock: (defId) => {
    const { instances } = get();
    if (instances[defId]) return;
    const def = getCompanionDef(defId);
    set({ instances: { ...instances, [defId]: { defId, level: 1, exp: 0 } } });
    if (def) useUIStore.getState().addToast(`🎉 获得伙伴：${def.name}`, 'success');
  },

  addExp: (defId, exp) => {
    const { instances } = get();
    const inst = instances[defId];
    if (!inst) return;
    let { level, exp: curExp } = inst;
    curExp += exp;
    while (curExp >= companionExpRequired(level) && level < 100) {
      curExp -= companionExpRequired(level);
      level++;
      const def = getCompanionDef(defId);
      if (def) useUIStore.getState().addToast(`${def.name} 升至 Lv.${level}`, 'info');
    }
    set({ instances: { ...instances, [defId]: { ...inst, level, exp: curExp } } });
  },

  equip: (defId) => {
    const { instances, equipped } = get();
    if (!instances[defId]) return false;
    if (equipped.includes(defId)) return false;
    if (equipped.length >= MAX_EQUIPPED) {
      useUIStore.getState().addToast(`最多装备${MAX_EQUIPPED}个伙伴`, 'warn');
      return false;
    }
    set({ equipped: [...equipped, defId] });
    return true;
  },

  unequip: (defId) => {
    set(s => ({ equipped: s.equipped.filter(id => id !== defId) }));
  },

  getBuffs: () => calcCompanionBuffs(get().equipped, get().instances),

  loadState: (instances, equipped) => set({ instances, equipped }),
  getState: () => ({ instances: get().instances, equipped: get().equipped }),
}));
