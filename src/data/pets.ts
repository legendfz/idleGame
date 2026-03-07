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

export function getPetTotalBonus(petLevels: Record<string, number> | undefined, activePetId: string | null): PetBonus {
  const total: PetBonus = {};
  if (!petLevels) return total;
  // Active pet gets full bonus, others get 30%
  for (const pet of PETS) {
    const lv = petLevels[pet.id] ?? 0;
    if (lv <= 0) continue;
    const b = pet.bonuses(lv);
    const mult = pet.id === activePetId ? 1 : 0.3;
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
