// v107.0: 灵兽系统 — 5 mythical beast companions
export interface PetDef {
  id: string;
  name: string;
  emoji: string;
  desc: string;
  unlockLevel: number;
  maxLevel: number;
  feedCost: (level: number) => number; // lingshi cost to level up
  bonuses: (level: number) => PetBonus;
}

export interface PetBonus {
  atkPct?: number;   // % attack bonus
  hpPct?: number;    // % hp bonus
  expPct?: number;   // % exp bonus
  goldPct?: number;  // % lingshi bonus
  critRate?: number; // flat crit rate bonus
  critDmg?: number;  // % crit damage bonus
  dropRate?: number; // % drop rate bonus
}

export const PETS: PetDef[] = [
  {
    id: 'dragon', name: '青龙', emoji: '🐉',
    desc: '东方神龙，攻击之源',
    unlockLevel: 10,
    maxLevel: 50,
    feedCost: (lv) => Math.floor(500 * Math.pow(1.15, lv)),
    bonuses: (lv) => ({ atkPct: lv * 3, critDmg: lv * 2 }),
  },
  {
    id: 'phoenix', name: '凤凰', emoji: '🦅',
    desc: '浴火涅槃，生命守护',
    unlockLevel: 30,
    maxLevel: 50,
    feedCost: (lv) => Math.floor(800 * Math.pow(1.15, lv)),
    bonuses: (lv) => ({ hpPct: lv * 4, critRate: lv * 0.2 }),
  },
  {
    id: 'turtle', name: '玄武', emoji: '🐢',
    desc: '不动如山，灵石聚宝',
    unlockLevel: 60,
    maxLevel: 50,
    feedCost: (lv) => Math.floor(1200 * Math.pow(1.15, lv)),
    bonuses: (lv) => ({ goldPct: lv * 5, hpPct: lv * 2 }),
  },
  {
    id: 'tiger', name: '白虎', emoji: '🐅',
    desc: '西方煞星，暴击之王',
    unlockLevel: 100,
    maxLevel: 50,
    feedCost: (lv) => Math.floor(2000 * Math.pow(1.15, lv)),
    bonuses: (lv) => ({ critRate: lv * 0.4, critDmg: lv * 3, atkPct: lv * 1 }),
  },
  {
    id: 'qilin', name: '麒麟', emoji: '🦌',
    desc: '祥瑞神兽，万法加持',
    unlockLevel: 200,
    maxLevel: 50,
    feedCost: (lv) => Math.floor(5000 * Math.pow(1.15, lv)),
    bonuses: (lv) => ({ expPct: lv * 4, dropRate: lv * 2, goldPct: lv * 2, atkPct: lv * 1 }),
  },
];

// v158.0: 灵兽进化系统
export interface PetEvolution {
  stage: number;      // 0=base, 1=觉醒, 2=化形, 3=通灵
  name: string;
  emoji: string;
  bonusMul: number;   // multiplier on base bonuses
  cost: { lingshi: number; pantao: number; hongmengShards: number };
}

export const EVOLUTION_STAGES: PetEvolution[] = [
  { stage: 0, name: '幼生', emoji: '🥚', bonusMul: 1, cost: { lingshi: 0, pantao: 0, hongmengShards: 0 } },
  { stage: 1, name: '觉醒', emoji: '✨', bonusMul: 2, cost: { lingshi: 500000, pantao: 200, hongmengShards: 50 } },
  { stage: 2, name: '化形', emoji: '🌟', bonusMul: 4, cost: { lingshi: 5000000, pantao: 1000, hongmengShards: 200 } },
  { stage: 3, name: '通灵', emoji: '👑', bonusMul: 8, cost: { lingshi: 50000000, pantao: 5000, hongmengShards: 1000 } },
];

export function getEvolutionStage(petEvolutions: Record<string, number> | undefined, petId: string): number {
  return petEvolutions?.[petId] ?? 0;
}

export function canEvolvePet(
  petId: string, petLevels: Record<string, number> | undefined,
  petEvolutions: Record<string, number> | undefined,
  lingshi: number, pantao: number, hongmengShards: number
): boolean {
  const lv = petLevels?.[petId] ?? 0;
  const stage = getEvolutionStage(petEvolutions, petId);
  if (lv < 50 || stage >= 3) return false; // must be max level, max evolution = 3
  const next = EVOLUTION_STAGES[stage + 1];
  return lingshi >= next.cost.lingshi && pantao >= next.cost.pantao && hongmengShards >= next.cost.hongmengShards;
}

export function getPetTotalBonus(petLevels: Record<string, number> | undefined, activePetId: string | null, petEvolutions?: Record<string, number>): PetBonus {
  const total: PetBonus = {};
  if (!petLevels) return total;
  // Active pet gets full bonus, others get 30%; evolution multiplies all bonuses
  for (const pet of PETS) {
    const lv = petLevels[pet.id] ?? 0;
    if (lv <= 0) continue;
    const b = pet.bonuses(lv);
    const evoStage = getEvolutionStage(petEvolutions, pet.id);
    const evoMul = EVOLUTION_STAGES[evoStage]?.bonusMul ?? 1;
    const mult = (pet.id === activePetId ? 1 : 0.3) * evoMul;
    total.atkPct = (total.atkPct ?? 0) + (b.atkPct ?? 0) * mult;
    total.hpPct = (total.hpPct ?? 0) + (b.hpPct ?? 0) * mult;
    total.expPct = (total.expPct ?? 0) + (b.expPct ?? 0) * mult;
    total.goldPct = (total.goldPct ?? 0) + (b.goldPct ?? 0) * mult;
    total.critRate = (total.critRate ?? 0) + (b.critRate ?? 0) * mult;
    total.critDmg = (total.critDmg ?? 0) + (b.critDmg ?? 0) * mult;
    total.dropRate = (total.dropRate ?? 0) + (b.dropRate ?? 0) * mult;
  }
  return total;
}
