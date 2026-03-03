/**
 * StrategyEngine — 战斗策略: 3套预设
 */

export interface StrategyDef {
  id: string;
  name: string;
  icon: string;
  desc: string;
  unlockRealm: number; // 解锁境界order
  weights: {
    atkWeight: number;   // 攻击权重 (1=正常)
    defWeight: number;   // 防御权重
    critWeight: number;  // 暴击权重
    speedWeight: number; // 速度权重 (影响auto dps)
  };
  bonuses: Record<string, number>; // 额外百分比加成
}

export const STRATEGIES: StrategyDef[] = [
  {
    id: 'balanced', name: '均衡之道', icon: '☯️',
    desc: '攻守兼备，适合日常修炼',
    unlockRealm: 1,
    weights: { atkWeight: 1, defWeight: 1, critWeight: 1, speedWeight: 1 },
    bonuses: {},
  },
  {
    id: 'aggressive', name: '修罗战道', icon: '⚔️',
    desc: '全力进攻，适合Boss战',
    unlockRealm: 3,
    weights: { atkWeight: 1.5, defWeight: 0.6, critWeight: 1.3, speedWeight: 1.2 },
    bonuses: { atkPercent: 15, critRate: 3 },
  },
  {
    id: 'defensive', name: '金刚守道', icon: '🛡️',
    desc: '铜墙铁壁，适合高难秘境',
    unlockRealm: 4,
    weights: { atkWeight: 0.8, defWeight: 1.8, critWeight: 0.8, speedWeight: 0.9 },
    bonuses: { defPercent: 20, hpPercent: 10 },
  },
];

export function getStrategyDef(id: string): StrategyDef | undefined {
  return STRATEGIES.find(s => s.id === id);
}

export function canUnlockStrategy(def: StrategyDef, realmOrder: number): boolean {
  return realmOrder >= def.unlockRealm;
}

/** 获取策略加成(合并到buff体系) */
export function calcStrategyBuffs(strategyId: string): Record<string, number> {
  const def = getStrategyDef(strategyId);
  return def?.bonuses ?? {};
}
