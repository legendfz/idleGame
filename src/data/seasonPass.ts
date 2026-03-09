/**
 * v180.0「赛季挑战」— 30天赛季通行证
 * 30级赛季等级，每级需要赛季经验，完成赛季任务获取
 */

export interface SeasonReward {
  level: number;
  name: string;
  icon: string;
  type: 'lingshi' | 'pantao' | 'shards' | 'scrolls' | 'tokens' | 'daoPoints' | 'title';
  amount: number;
}

export interface SeasonQuest {
  id: string;
  name: string;
  icon: string;
  description: string;
  target: number;
  expReward: number;
  trackKey: 'kills' | 'gold' | 'equips' | 'enhance' | 'boss' | 'crit' | 'reincarnate' | 'levelUp';
}

// 30 levels, each needs progressively more XP
export function getSeasonLevelXP(level: number): number {
  return 100 + level * 50; // 150, 200, 250... 1600 at lv30
}

export const SEASON_REWARDS: SeasonReward[] = [
  { level: 1, name: '灵石袋', icon: '💎', type: 'lingshi', amount: 10000 },
  { level: 2, name: '蟠桃篮', icon: '🍑', type: 'pantao', amount: 20 },
  { level: 3, name: '碎片盒', icon: '🔮', type: 'shards', amount: 10 },
  { level: 4, name: '天命符×3', icon: '📜', type: 'scrolls', amount: 3 },
  { level: 5, name: '灵石宝箱', icon: '💰', type: 'lingshi', amount: 50000 },
  { level: 6, name: '蟠桃盛宴', icon: '🍑', type: 'pantao', amount: 50 },
  { level: 7, name: '试炼令牌×10', icon: '🎫', type: 'tokens', amount: 10 },
  { level: 8, name: '碎片箱', icon: '🔮', type: 'shards', amount: 25 },
  { level: 9, name: '天命符×5', icon: '📜', type: 'scrolls', amount: 5 },
  { level: 10, name: '道点×50', icon: '☯', type: 'daoPoints', amount: 50 },
  { level: 11, name: '灵石山', icon: '💎', type: 'lingshi', amount: 100000 },
  { level: 12, name: '蟠桃园', icon: '🍑', type: 'pantao', amount: 100 },
  { level: 13, name: '碎片库', icon: '🔮', type: 'shards', amount: 50 },
  { level: 14, name: '令牌×20', icon: '🎫', type: 'tokens', amount: 20 },
  { level: 15, name: '道点×100', icon: '☯', type: 'daoPoints', amount: 100 },
  { level: 16, name: '灵石海', icon: '💎', type: 'lingshi', amount: 200000 },
  { level: 17, name: '蟠桃仙境', icon: '🍑', type: 'pantao', amount: 200 },
  { level: 18, name: '天命符×10', icon: '📜', type: 'scrolls', amount: 10 },
  { level: 19, name: '碎片宝库', icon: '🔮', type: 'shards', amount: 100 },
  { level: 20, name: '道点×200', icon: '☯', type: 'daoPoints', amount: 200 },
  { level: 21, name: '灵石洪流', icon: '💎', type: 'lingshi', amount: 500000 },
  { level: 22, name: '令牌×50', icon: '🎫', type: 'tokens', amount: 50 },
  { level: 23, name: '蟠桃无尽', icon: '🍑', type: 'pantao', amount: 500 },
  { level: 24, name: '碎片无穷', icon: '🔮', type: 'shards', amount: 200 },
  { level: 25, name: '道点×500', icon: '☯', type: 'daoPoints', amount: 500 },
  { level: 26, name: '灵石亿万', icon: '💎', type: 'lingshi', amount: 1000000 },
  { level: 27, name: '天命符×20', icon: '📜', type: 'scrolls', amount: 20 },
  { level: 28, name: '蟠桃永生', icon: '🍑', type: 'pantao', amount: 1000 },
  { level: 29, name: '碎片混沌', icon: '🔮', type: 'shards', amount: 500 },
  { level: 30, name: '道点×1000', icon: '☯', type: 'daoPoints', amount: 1000 },
];

// 10 quests per season cycle, daily-refreshing subset
const SEASON_QUEST_POOL: SeasonQuest[] = [
  { id: 'sq_kill_100', name: '斩妖百', icon: '⚔️', description: '击杀100敌人', target: 100, expReward: 30, trackKey: 'kills' },
  { id: 'sq_kill_500', name: '斩妖伍佰', icon: '🗡️', description: '击杀500敌人', target: 500, expReward: 60, trackKey: 'kills' },
  { id: 'sq_kill_2000', name: '万夫不当', icon: '💀', description: '击杀2000敌人', target: 2000, expReward: 120, trackKey: 'kills' },
  { id: 'sq_gold_10k', name: '纳财万金', icon: '💎', description: '获得10000灵石', target: 10000, expReward: 40, trackKey: 'gold' },
  { id: 'sq_gold_100k', name: '富甲天下', icon: '💰', description: '获得100000灵石', target: 100000, expReward: 100, trackKey: 'gold' },
  { id: 'sq_equip_10', name: '兵满仓', icon: '🛡️', description: '获得10件装备', target: 10, expReward: 35, trackKey: 'equips' },
  { id: 'sq_enhance_10', name: '百炼', icon: '🔨', description: '强化10次', target: 10, expReward: 35, trackKey: 'enhance' },
  { id: 'sq_boss_3', name: '屠龙', icon: '🐉', description: '击败3个Boss', target: 3, expReward: 50, trackKey: 'boss' },
  { id: 'sq_crit_50', name: '暴击狂', icon: '💥', description: '触发50次暴击', target: 50, expReward: 30, trackKey: 'crit' },
  { id: 'sq_level_5', name: '连升五级', icon: '📈', description: '升级5次', target: 5, expReward: 45, trackKey: 'levelUp' },
];

/** Get 5 quests for today (seeded by day) */
export function getSeasonQuests(): SeasonQuest[] {
  const day = Math.floor(Date.now() / 86400000);
  const shuffled = [...SEASON_QUEST_POOL];
  // Simple seeded shuffle
  let seed = day;
  for (let i = shuffled.length - 1; i > 0; i--) {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    const j = seed % (i + 1);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, 5);
}

/** Get current season number (30-day cycles from epoch) */
export function getCurrentSeason(): number {
  return Math.floor(Date.now() / (30 * 86400000));
}

/** Days remaining in current season */
export function getSeasonDaysLeft(): number {
  const msPerSeason = 30 * 86400000;
  const elapsed = Date.now() % msPerSeason;
  return Math.ceil((msPerSeason - elapsed) / 86400000);
}
