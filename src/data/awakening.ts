// ═══════════════════════════════════════════
// v59.0「天道轮回·觉醒」— 觉醒系统
// 3次转世后解锁，选择觉醒路线获得独特能力
// ═══════════════════════════════════════════

export interface AwakeningPath {
  id: string;
  name: string;
  icon: string;
  desc: string;
  color: string;
  nodes: AwakeningNode[];
}

export interface AwakeningNode {
  id: string;
  name: string;
  desc: string;
  cost: number; // 觉醒点
  requires?: string; // prerequisite node id
  effect: {
    type: 'atk_pct' | 'hp_pct' | 'crit_rate' | 'crit_dmg' | 'gold_pct' | 'exp_pct' | 'drop_pct' | 'auto_heal' | 'boss_dmg' | 'abyss_dmg' | 'skill_cd' | 'pantao_pct';
    value: number;
  };
}

/** 觉醒路线：战/法/运 三路 */
export const AWAKENING_PATHS: AwakeningPath[] = [
  {
    id: 'warrior', name: '战道觉醒', icon: '⚔️', color: '#ef4444',
    desc: '极致战斗力，碾压一切敌人',
    nodes: [
      { id: 'w1', name: '斗战圣体', desc: '攻击力+30%', cost: 3, effect: { type: 'atk_pct', value: 30 } },
      { id: 'w2', name: '不灭金身', desc: '生命值+30%', cost: 3, requires: 'w1', effect: { type: 'hp_pct', value: 30 } },
      { id: 'w3', name: '破魔神眼', desc: '暴击率+15%', cost: 5, requires: 'w1', effect: { type: 'crit_rate', value: 15 } },
      { id: 'w4', name: '天崩地裂', desc: '暴击伤害+50%', cost: 5, requires: 'w3', effect: { type: 'crit_dmg', value: 50 } },
      { id: 'w5', name: '弑神之力', desc: 'Boss伤害+100%', cost: 8, requires: 'w4', effect: { type: 'boss_dmg', value: 100 } },
      { id: 'w6', name: '无极战体', desc: '攻击力+50%', cost: 10, requires: 'w5', effect: { type: 'atk_pct', value: 50 } },
    ],
  },
  {
    id: 'mystic', name: '法道觉醒', icon: '🔮', color: '#8b5cf6',
    desc: '神通加持，技能强化',
    nodes: [
      { id: 'm1', name: '灵台方寸', desc: '经验获取+40%', cost: 3, effect: { type: 'exp_pct', value: 40 } },
      { id: 'm2', name: '三花聚顶', desc: '技能冷却-20%', cost: 4, requires: 'm1', effect: { type: 'skill_cd', value: 20 } },
      { id: 'm3', name: '五气朝元', desc: '暴击伤害+40%', cost: 5, requires: 'm1', effect: { type: 'crit_dmg', value: 40 } },
      { id: 'm4', name: '紫府神雷', desc: '深渊伤害+80%', cost: 6, requires: 'm2', effect: { type: 'abyss_dmg', value: 80 } },
      { id: 'm5', name: '元神出窍', desc: '自动回血1%/秒', cost: 8, requires: 'm3', effect: { type: 'auto_heal', value: 1 } },
      { id: 'm6', name: '道法自然', desc: '经验获取+80%', cost: 10, requires: 'm4', effect: { type: 'exp_pct', value: 80 } },
    ],
  },
  {
    id: 'fortune', name: '运道觉醒', icon: '🍀', color: '#22c55e',
    desc: '财运亨通，掉落倍增',
    nodes: [
      { id: 'f1', name: '财神庇佑', desc: '灵石获取+40%', cost: 3, effect: { type: 'gold_pct', value: 40 } },
      { id: 'f2', name: '天降横财', desc: '装备掉率+30%', cost: 4, requires: 'f1', effect: { type: 'drop_pct', value: 30 } },
      { id: 'f3', name: '蟠桃仙露', desc: '蟠桃获取+50%', cost: 5, requires: 'f1', effect: { type: 'pantao_pct', value: 50 } },
      { id: 'f4', name: '聚宝盆', desc: '灵石获取+80%', cost: 6, requires: 'f2', effect: { type: 'gold_pct', value: 80 } },
      { id: 'f5', name: '鸿运当头', desc: '暴击率+20%', cost: 8, requires: 'f2', effect: { type: 'crit_rate', value: 20 } },
      { id: 'f6', name: '造化钟灵', desc: '装备掉率+60%', cost: 10, requires: 'f4', effect: { type: 'drop_pct', value: 60 } },
    ],
  },
];

/** 觉醒点计算：每次转世获得的觉醒点 */
export function calcAwakeningPoints(reincCount: number): number {
  if (reincCount < 3) return 0;
  return Math.floor((reincCount - 2) * 2); // 3次=2点, 4次=4点, ...
}

/** 总觉醒点 = 累计所有转世获得的觉醒点 */
export function totalAwakeningPoints(reincCount: number): number {
  if (reincCount < 3) return 0;
  let total = 0;
  for (let i = 3; i <= reincCount; i++) {
    total += Math.floor((i - 2) * 2);
  }
  return total;
}

/** 解锁条件 */
export const AWAKENING_UNLOCK_REINC = 3;
