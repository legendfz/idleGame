/**
 * ReincarnationEngine — 六道轮回系统
 */

export type DaoType = 'heaven' | 'human' | 'asura' | 'animal' | 'hungry_ghost' | 'hell';

export interface DaoDef {
  id: DaoType;
  name: string;
  icon: string;
  desc: string;
  costMultiplier: number; // 功德花费倍率
  buffs: Record<string, number>;
}

export interface DaoFruitDef {
  dao: DaoType;
  count: number; // 需轮回N次
  name: string;
  buff: { type: string; value: number };
}

// === 六道定义 ===
export const DAOS: DaoDef[] = [
  { id: 'heaven', name: '天道', icon: '☁️', desc: '修为大幅提升', costMultiplier: 1, buffs: { xiuweiPercent: 10 } },
  { id: 'human', name: '人道', icon: '🧑', desc: '全属性均衡提升', costMultiplier: 1, buffs: { atkPercent: 5, defPercent: 5, xiuweiPercent: 5, coinPercent: 5 } },
  { id: 'asura', name: '修罗道', icon: '👹', desc: '攻击与暴伤大幅提升', costMultiplier: 1, buffs: { atkPercent: 8, critDmg: 8 } },
  { id: 'animal', name: '畜生道', icon: '🐂', desc: '防御与生命大幅提升', costMultiplier: 1, buffs: { defPercent: 10, hpPercent: 10 } },
  { id: 'hungry_ghost', name: '饿鬼道', icon: '👻', desc: '金币与采集大幅提升', costMultiplier: 1, buffs: { coinPercent: 12, gatherSpeed: 12 } },
  { id: 'hell', name: '地狱道', icon: '🔥', desc: '全属性极大提升(高功德)', costMultiplier: 3, buffs: { atkPercent: 15, defPercent: 15, xiuweiPercent: 15, coinPercent: 15 } },
];

// === 道果 ===
export const DAO_FRUITS: DaoFruitDef[] = [
  { dao: 'heaven', count: 3, name: '天道初果', buff: { type: 'xiuweiPercent', value: 3 } },
  { dao: 'heaven', count: 6, name: '天道正果', buff: { type: 'xiuweiPercent', value: 5 } },
  { dao: 'human', count: 3, name: '人道初果', buff: { type: 'atkPercent', value: 2 } },
  { dao: 'human', count: 6, name: '人道正果', buff: { type: 'defPercent', value: 3 } },
  { dao: 'asura', count: 3, name: '修罗初果', buff: { type: 'atkPercent', value: 3 } },
  { dao: 'asura', count: 6, name: '修罗正果', buff: { type: 'critDmg', value: 5 } },
  { dao: 'animal', count: 3, name: '畜生初果', buff: { type: 'defPercent', value: 3 } },
  { dao: 'animal', count: 6, name: '畜生正果', buff: { type: 'hpPercent', value: 5 } },
  { dao: 'hungry_ghost', count: 3, name: '饿鬼初果', buff: { type: 'coinPercent', value: 4 } },
  { dao: 'hungry_ghost', count: 6, name: '饿鬼正果', buff: { type: 'gatherSpeed', value: 5 } },
  { dao: 'hell', count: 3, name: '地狱初果', buff: { type: 'atkPercent', value: 5 } },
  { dao: 'hell', count: 6, name: '地狱正果', buff: { type: 'xiuweiPercent', value: 8 } },
];

// === Engine ===

export interface ReincarnationState {
  totalReincarnations: number;
  merit: number; // 功德值
  daoCounts: Record<DaoType, number>; // 每道轮回次数
  lastDao: DaoType | null;
}

export function createReincarnationState(): ReincarnationState {
  return { totalReincarnations: 0, merit: 0, daoCounts: { heaven: 0, human: 0, asura: 0, animal: 0, hungry_ghost: 0, hell: 0 }, lastDao: null };
}

/** 轮回所需功德 (每次递增) */
export function reincarnationCost(dao: DaoDef, totalReincarnations: number): number {
  const base = 100 + totalReincarnations * 50;
  return Math.floor(base * dao.costMultiplier);
}

/** 能否轮回 */
export function canReincarnate(state: ReincarnationState, dao: DaoDef, realmOrder: number): { ok: boolean; reason?: string } {
  if (realmOrder < 5) return { ok: false, reason: '需达到元婴期(第5境界)' };
  const cost = reincarnationCost(dao, state.totalReincarnations);
  if (state.merit < cost) return { ok: false, reason: `功德不足(需${cost})` };
  return { ok: true };
}

/** 计算六道+道果总buff */
export function calcReincarnationBuffs(state: ReincarnationState): Record<string, number> {
  const buffs: Record<string, number> = {};

  // 每道的轮回次数 × 该道buff (每次轮回叠加)
  for (const dao of DAOS) {
    const count = state.daoCounts[dao.id] ?? 0;
    if (count > 0) {
      for (const [key, val] of Object.entries(dao.buffs)) {
        buffs[key] = (buffs[key] ?? 0) + val * count;
      }
    }
  }

  // 道果buff (永久)
  for (const fruit of DAO_FRUITS) {
    const count = state.daoCounts[fruit.dao] ?? 0;
    if (count >= fruit.count) {
      buffs[fruit.buff.type] = (buffs[fruit.buff.type] ?? 0) + fruit.buff.value;
    }
  }

  return buffs;
}

export function getDaoDef(id: DaoType): DaoDef | undefined {
  return DAOS.find(d => d.id === id);
}
