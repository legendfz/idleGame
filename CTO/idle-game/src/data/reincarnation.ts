// ═══════════════════════════════════════════
// v22.0 转世系统 — 道点计算 + 永久加成
// ═══════════════════════════════════════════

export interface ReincPerk {
  id: string;
  name: string;
  icon: string;
  desc: string;         // 每级描述
  maxLevel: number;
  costPerLevel: number; // 道点/级
  effect: (level: number) => number; // 返回倍率或加值
}

/** 转世可购买的永久加成 */
export const REINC_PERKS: ReincPerk[] = [
  {
    id: 'atk_mult', name: '悟空之力', icon: '💪',
    desc: '攻击力 +20%/级', maxLevel: 10, costPerLevel: 5,
    effect: (lv) => 1 + lv * 0.2,
  },
  {
    id: 'hp_mult', name: '金刚不坏', icon: '🛡️',
    desc: '生命值 +20%/级', maxLevel: 10, costPerLevel: 5,
    effect: (lv) => 1 + lv * 0.2,
  },
  {
    id: 'exp_mult', name: '悟道加速', icon: '📖',
    desc: '经验获取 +15%/级', maxLevel: 10, costPerLevel: 8,
    effect: (lv) => 1 + lv * 0.15,
  },
  {
    id: 'gold_mult', name: '点石成金', icon: '💰',
    desc: '灵石获取 +15%/级', maxLevel: 10, costPerLevel: 8,
    effect: (lv) => 1 + lv * 0.15,
  },
  {
    id: 'crit_flat', name: '慧眼金睛', icon: '👁️',
    desc: '暴击率 +3%/级', maxLevel: 10, costPerLevel: 6,
    effect: (lv) => lv * 3,
  },
  {
    id: 'drop_mult', name: '天降宝物', icon: '🎁',
    desc: '装备掉率 +10%/级', maxLevel: 10, costPerLevel: 10,
    effect: (lv) => 1 + lv * 0.1,
  },
  {
    id: 'start_level', name: '宿慧觉醒', icon: '⚡',
    desc: '转世后初始等级 +5/级', maxLevel: 10, costPerLevel: 12,
    effect: (lv) => lv * 5,
  },
  {
    id: 'pantao_mult', name: '蟠桃盛宴', icon: '🍑',
    desc: '蟠桃掉率 +10%/级', maxLevel: 10, costPerLevel: 8,
    effect: (lv) => 1 + lv * 0.1,
  },
];

/** 计算转世可获得的道点 (基于等级+境界) */
export function calcDaoPoints(level: number, realmIndex: number, reincCount: number): number {
  const base = Math.floor(level / 10) + realmIndex * 3;
  // 递减收益：每次转世后需要更高等级才能获得同样道点
  const diminishing = Math.max(0.5, 1 - reincCount * 0.05);
  return Math.max(1, Math.floor(base * diminishing));
}

/** 转世最低要求 */
export const REINC_MIN_REALM = 7;  // 大乘 (index 7)
export const REINC_MIN_LEVEL = 500;
