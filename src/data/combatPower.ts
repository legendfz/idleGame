/**
 * v1.3 战力计算公式配置
 * 数据来源：CPO v1.3 数据配置表
 */

export const COMBAT_POWER_WEIGHTS = {
  attack: 1.0,
  defense: 0.8,
  speed: 0.5,
  hp: 0.3,
} as const;

export const REALM_COEFFICIENTS: Record<string, number> = {
  '灵猴初醒': 1.0,
  '通灵': 1.1,
  '炼气': 1.3,
  '筑基': 1.6,
  '金丹': 2.0,
  '元婴': 2.5,
  '化神': 3.0,
  '大乘': 4.0,
  '齐天大圣': 6.0,
  '斗战胜佛': 10.0,
};

export interface CombatPowerInput {
  attack: number;
  defense: number;
  speed: number;
  maxHp: number;
  realmName: string;
}

export function calculateCombatPower(input: CombatPowerInput): number {
  const base =
    input.attack * COMBAT_POWER_WEIGHTS.attack +
    input.defense * COMBAT_POWER_WEIGHTS.defense +
    input.speed * COMBAT_POWER_WEIGHTS.speed +
    input.maxHp * COMBAT_POWER_WEIGHTS.hp;

  const coeff = REALM_COEFFICIENTS[input.realmName] ?? 1.0;
  return Math.floor(base * coeff);
}
