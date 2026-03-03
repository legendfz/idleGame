/**
 * PetEngine — 灵兽系统: 5种灵兽 + 被动加成 + 升级
 */

export interface PetDef {
  id: string;
  name: string;
  icon: string;
  desc: string;
  element: string;
  baseEffect: { type: string; value: number };
  levelScale: number;
}

export interface PetInstance {
  defId: string;
  level: number;
  exp: number;
}

export const MAX_PET_LEVEL = 10;

export const PETS: PetDef[] = [
  { id: 'qinglong', name: '青龙', icon: '🐲', desc: '东方神兽，攻击加成', element: '木', baseEffect: { type: 'atkPercent', value: 5 }, levelScale: 2 },
  { id: 'baihu', name: '白虎', icon: '🐯', desc: '西方神兽，防御加成', element: '金', baseEffect: { type: 'defPercent', value: 5 }, levelScale: 2 },
  { id: 'zhuque', name: '朱雀', icon: '🦅', desc: '南方神兽，修炼加速', element: '火', baseEffect: { type: 'xiuweiPercent', value: 5 }, levelScale: 2 },
  { id: 'xuanwu', name: '玄武', icon: '🐢', desc: '北方神兽，掉落加成', element: '水', baseEffect: { type: 'dropRate', value: 8 }, levelScale: 3 },
  { id: 'qilin', name: '麒麟', icon: '🦄', desc: '祥瑞神兽，灵石加成', element: '土', baseEffect: { type: 'lingshiPercent', value: 10 }, levelScale: 3 },
];

export function getPetDef(id: string): PetDef | undefined {
  return PETS.find(p => p.id === id);
}

/** 升级所需灵兽丹 */
export function petExpRequired(level: number): number {
  return Math.floor(10 * Math.pow(level, 2));
}

/** 计算灵兽效果 */
export function calcPetEffect(def: PetDef, level: number): { type: string; value: number } {
  const value = def.baseEffect.value + def.levelScale * (level - 1);
  return { type: def.baseEffect.type, value: Math.round(value * 10) / 10 };
}

/** 计算所有已装备灵兽的总buff */
export function calcPetBuffs(activePetId: string | null, instances: Record<string, PetInstance>): Record<string, number> {
  const buffs: Record<string, number> = {};
  if (!activePetId) return buffs;
  const inst = instances[activePetId];
  const def = getPetDef(activePetId);
  if (!inst || !def) return buffs;
  const eff = calcPetEffect(def, inst.level);
  buffs[eff.type] = (buffs[eff.type] ?? 0) + eff.value;
  return buffs;
}
