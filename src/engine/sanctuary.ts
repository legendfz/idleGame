/**
 * SanctuaryEngine — 洞天福地: 5建筑×10级
 */

export interface BuildingDef {
  id: string;
  name: string;
  icon: string;
  desc: string;
  produceType: string; // lingshi/exp/attack/forgeRate/expMul
  baseOutput: number;
  growthPerLevel: number;
  baseCost: number;
  costGrowth: number;
}

export const BUILDINGS: BuildingDef[] = [
  { id: 'field', name: '灵田', icon: '[田]', desc: '每秒产出灵石', produceType: 'lingshi', baseOutput: 5, growthPerLevel: 8, baseCost: 500, costGrowth: 1.8 },
  { id: 'alchemy', name: '丹房', icon: '[丹]', desc: '每秒增加经验', produceType: 'exp', baseOutput: 3, growthPerLevel: 5, baseCost: 800, costGrowth: 2.0 },
  { id: 'library', name: '藏经阁', icon: '[经]', desc: '经验倍率加成', produceType: 'expMul', baseOutput: 2, growthPerLevel: 2, baseCost: 1000, costGrowth: 2.2 },
  { id: 'forge', name: '锻造炉', icon: '[火]', desc: '锻造成功率加成', produceType: 'forgeRate', baseOutput: 1, growthPerLevel: 1, baseCost: 1200, costGrowth: 2.0 },
  { id: 'array', name: '聚灵阵', icon: '[阵]', desc: '攻击力永久加成', produceType: 'attack', baseOutput: 10, growthPerLevel: 15, baseCost: 600, costGrowth: 1.9 },
];

export interface SanctuaryState {
  levels: Record<string, number>; // buildingId -> level (0-10)
}

export function createSanctuaryState(): SanctuaryState {
  const levels: Record<string, number> = {};
  BUILDINGS.forEach(b => levels[b.id] = 0);
  return { levels };
}

export function getBuildingOutput(def: BuildingDef, level: number): number {
  if (level <= 0) return 0;
  return def.baseOutput + def.growthPerLevel * (level - 1);
}

export function getUpgradeCost(def: BuildingDef, currentLevel: number): number {
  return Math.floor(def.baseCost * Math.pow(def.costGrowth, currentLevel));
}

export function calcSanctuaryBuffs(state: SanctuaryState): Record<string, number> {
  const buffs: Record<string, number> = {};
  for (const def of BUILDINGS) {
    const lv = state.levels[def.id] ?? 0;
    if (lv > 0) buffs[def.produceType] = (buffs[def.produceType] ?? 0) + getBuildingOutput(def, lv);
  }
  return buffs;
}
