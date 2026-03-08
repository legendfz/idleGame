// v157.0: Power milestone rewards — permanent buffs when combat power reaches thresholds

export interface PowerMilestone {
  threshold: number;
  label: string;
  rewards: {
    atkMul?: number;    // multiplicative attack bonus
    hpMul?: number;     // multiplicative hp bonus
    critRate?: number;  // additive crit rate
    critDmg?: number;   // additive crit damage
    expMul?: number;    // multiplicative exp bonus
    goldMul?: number;   // multiplicative gold bonus
  };
}

export const POWER_MILESTONES: PowerMilestone[] = [
  { threshold: 1_000, label: '初窥门径', rewards: { atkMul: 0.05, hpMul: 0.05 } },
  { threshold: 5_000, label: '小有所成', rewards: { atkMul: 0.08, hpMul: 0.08, expMul: 0.05 } },
  { threshold: 20_000, label: '崭露头角', rewards: { atkMul: 0.12, hpMul: 0.12, critRate: 0.02 } },
  { threshold: 100_000, label: '名震一方', rewards: { atkMul: 0.15, hpMul: 0.15, critRate: 0.03, goldMul: 0.1 } },
  { threshold: 500_000, label: '威震四海', rewards: { atkMul: 0.20, hpMul: 0.20, critDmg: 0.2, expMul: 0.1 } },
  { threshold: 2_000_000, label: '天下无双', rewards: { atkMul: 0.25, hpMul: 0.25, critRate: 0.05, critDmg: 0.3 } },
  { threshold: 10_000_000, label: '举世无敌', rewards: { atkMul: 0.30, hpMul: 0.30, critRate: 0.05, critDmg: 0.5, expMul: 0.15, goldMul: 0.15 } },
  { threshold: 100_000_000, label: '混沌主宰', rewards: { atkMul: 0.50, hpMul: 0.50, critRate: 0.08, critDmg: 0.8, expMul: 0.25, goldMul: 0.25 } },
];

export function getUnlockedPowerMilestones(highestPower: number): PowerMilestone[] {
  return POWER_MILESTONES.filter(m => highestPower >= m.threshold);
}

export function getPowerMilestoneBonuses(highestPower: number) {
  const unlocked = getUnlockedPowerMilestones(highestPower);
  let atkMul = 0, hpMul = 0, critRate = 0, critDmg = 0, expMul = 0, goldMul = 0;
  for (const m of unlocked) {
    atkMul += m.rewards.atkMul ?? 0;
    hpMul += m.rewards.hpMul ?? 0;
    critRate += m.rewards.critRate ?? 0;
    critDmg += m.rewards.critDmg ?? 0;
    expMul += m.rewards.expMul ?? 0;
    goldMul += m.rewards.goldMul ?? 0;
  }
  return { atkMul, hpMul, critRate, critDmg, expMul, goldMul };
}
