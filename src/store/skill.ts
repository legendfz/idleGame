/**
 * SkillStore — 神通技能状态管理
 */
import { create } from 'zustand';
import {
  SkillInstance, ActiveBuff, calcSkillPassiveBuffs, calcActiveBuffs,
  getSkillDef, SKILLS,
} from '../engine/skill';
import { useUIStore } from './ui';

interface SkillStoreType {
  instances: Record<string, SkillInstance>;
  wudao: number;
  activeBuffs: ActiveBuff[];

  addWudao: (amount: number) => void;
  upgrade: (skillId: string) => boolean;
  activate: (skillId: string) => boolean;
  getPassiveBuffs: () => Record<string, number>;
  getActiveBuffs: () => Record<string, number>;
  getAllBuffs: () => Record<string, number>;
  cleanExpired: () => void;
  loadState: (s: { instances: Record<string, SkillInstance>; wudao: number; activeBuffs: ActiveBuff[] }) => void;
  getState: () => { instances: Record<string, SkillInstance>; wudao: number; activeBuffs: ActiveBuff[] };
}

export const useSkillStore = create<SkillStoreType>((set, get) => ({
  instances: {},
  wudao: 0,
  activeBuffs: [],

  addWudao: (amount) => set(s => ({ wudao: s.wudao + amount })),

  upgrade: (skillId) => {
    const { instances, wudao } = get();
    const def = getSkillDef(skillId);
    if (!def) return false;
    const inst = instances[skillId] ?? { level: 0, cooldownEnd: 0 };
    if (inst.level >= def.maxLevel) {
      useUIStore.getState().addToast('已满级', 'warn');
      return false;
    }
    const cost = def.wudaoCost[inst.level] ?? 9999;
    if (wudao < cost) {
      useUIStore.getState().addToast(`悟道值不足(需${cost})`, 'warn');
      return false;
    }
    set({
      wudao: wudao - cost,
      instances: { ...instances, [skillId]: { ...inst, level: inst.level + 1, cooldownEnd: inst.cooldownEnd } },
    });
    useUIStore.getState().addToast(`✨ ${def.name} 升至 Lv.${inst.level + 1}`, 'success');
    return true;
  },

  activate: (skillId) => {
    const { instances, activeBuffs } = get();
    const def = getSkillDef(skillId);
    const inst = instances[skillId];
    if (!def?.active || !inst || inst.level < 1) return false;
    const now = Date.now();
    if (inst.cooldownEnd > now) {
      const cd = Math.ceil((inst.cooldownEnd - now) / 1000);
      useUIStore.getState().addToast(`冷却中(${cd}s)`, 'warn');
      return false;
    }
    const buff: ActiveBuff = {
      type: def.active.buffType,
      value: def.active.buffValue * inst.level,
      expiresAt: now + def.active.durationSec * 1000,
    };
    set({
      activeBuffs: [...activeBuffs, buff],
      instances: { ...instances, [skillId]: { ...inst, cooldownEnd: now + def.active.cooldownSec * 1000 } },
    });
    useUIStore.getState().addToast(`🔥 ${def.name} 发动！`, 'success');
    return true;
  },

  getPassiveBuffs: () => calcSkillPassiveBuffs(get().instances),
  getActiveBuffs: () => calcActiveBuffs(get().activeBuffs, Date.now()),
  getAllBuffs: () => {
    const passive = calcSkillPassiveBuffs(get().instances);
    const active = calcActiveBuffs(get().activeBuffs, Date.now());
    const merged: Record<string, number> = { ...passive };
    for (const [k, v] of Object.entries(active)) merged[k] = (merged[k] ?? 0) + v;
    return merged;
  },

  cleanExpired: () => {
    const now = Date.now();
    set(s => ({ activeBuffs: s.activeBuffs.filter(b => b.expiresAt > now) }));
  },

  loadState: (s) => set({ instances: s.instances ?? {}, wudao: s.wudao ?? 0, activeBuffs: s.activeBuffs ?? [] }),
  getState: () => ({ instances: get().instances, wudao: get().wudao, activeBuffs: get().activeBuffs }),
}));
