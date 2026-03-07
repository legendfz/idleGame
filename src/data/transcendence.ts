// ═══════════════════════════════════════════
// v116.0 超越系统 — 第二层转世（超越轮回）
// ═══════════════════════════════════════════
// 10次转世后解锁，重置转世次数+道点换取「超越点」
// 超越加成远超普通转世，是终极endgame进阶

export interface TranscendPerk {
  id: string;
  name: string;
  icon: string;
  desc: string;
  maxLevel: number;
  costPerLevel: number; // 超越点/级
  effect: (level: number) => number;
}

export const TRANSCEND_PERKS: TranscendPerk[] = [
  {
    id: 'tr_atk', name: '混沌之力', icon: '💥',
    desc: '攻击力 +50%/级', maxLevel: 20, costPerLevel: 3,
    effect: (lv) => 1 + lv * 0.5,
  },
  {
    id: 'tr_hp', name: '不灭金身', icon: '🛡️',
    desc: '生命值 +50%/级', maxLevel: 20, costPerLevel: 3,
    effect: (lv) => 1 + lv * 0.5,
  },
  {
    id: 'tr_exp', name: '天道感悟', icon: '📜',
    desc: '经验获取 +30%/级', maxLevel: 20, costPerLevel: 4,
    effect: (lv) => 1 + lv * 0.3,
  },
  {
    id: 'tr_gold', name: '聚宝天尊', icon: '💰',
    desc: '灵石获取 +30%/级', maxLevel: 20, costPerLevel: 4,
    effect: (lv) => 1 + lv * 0.3,
  },
  {
    id: 'tr_crit', name: '天眼通', icon: '👁️',
    desc: '暴击率 +5%/级', maxLevel: 10, costPerLevel: 5,
    effect: (lv) => lv * 5,
  },
  {
    id: 'tr_critDmg', name: '雷霆万钧', icon: '⚡',
    desc: '暴击伤害 +25%/级', maxLevel: 10, costPerLevel: 5,
    effect: (lv) => lv * 0.25,
  },
  {
    id: 'tr_speed', name: '时光如梭', icon: '⏩',
    desc: '全局速度 +10%/级', maxLevel: 10, costPerLevel: 6,
    effect: (lv) => 1 + lv * 0.1,
  },
  {
    id: 'tr_drop', name: '天降神兵', icon: '🎁',
    desc: '装备掉率 +20%/级', maxLevel: 10, costPerLevel: 5,
    effect: (lv) => 1 + lv * 0.2,
  },
];

/** 超越最低要求：10次转世 */
export const TRANSCEND_MIN_REINC = 10;

/** 计算超越可获得的超越点 */
export function calcTranscendPoints(reincCount: number, totalDaoPoints: number): number {
  // 基于转世次数和累计道点
  const fromReinc = Math.floor((reincCount - TRANSCEND_MIN_REINC + 1) * 2);
  const fromDao = Math.floor(totalDaoPoints / 50);
  return Math.max(1, fromReinc + fromDao);
}

/** 获取超越加成 */
export function getTranscendBonuses(perkLevels: Record<string, number>) {
  const bonuses = {
    atkMul: 1, hpMul: 1, expMul: 1, goldMul: 1,
    critFlat: 0, critDmg: 0, speedMul: 1, dropMul: 1,
  };
  for (const perk of TRANSCEND_PERKS) {
    const lv = perkLevels[perk.id] || 0;
    if (lv === 0) continue;
    const val = perk.effect(lv);
    switch (perk.id) {
      case 'tr_atk': bonuses.atkMul = val; break;
      case 'tr_hp': bonuses.hpMul = val; break;
      case 'tr_exp': bonuses.expMul = val; break;
      case 'tr_gold': bonuses.goldMul = val; break;
      case 'tr_crit': bonuses.critFlat = val; break;
      case 'tr_critDmg': bonuses.critDmg = val; break;
      case 'tr_speed': bonuses.speedMul = val; break;
      case 'tr_drop': bonuses.dropMul = val; break;
    }
  }
  return bonuses;
}
