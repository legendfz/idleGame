/**
 * v1.3 成就系统数据配置
 */

export type AchievementConditionType =
  | 'level' | 'kill_count' | 'equipment_count' | 'dungeon_clear'
  | 'dungeon_speed' | 'no_damage' | 'enhance_max' | 'online_time'
  | 'gold_total' | 'win_streak' | 'dodge_streak' | 'solo_boss'
  | 'hongmeng_obtain';

export type AchievementRewardType = 'stat_boost' | 'resource' | 'title' | 'unlock';

export interface AchievementDef {
  id: string;
  name: string;
  icon: string;
  description: string;
  category: 'milestone' | 'challenge';
  conditionType: AchievementConditionType;
  target: number;
  reward: {
    type: AchievementRewardType;
    stat?: 'attack' | 'defense' | 'speed' | 'all' | 'critRate' | 'critDmg';
    value: number;
    title?: string;
    description: string;
  };
}

export const ACHIEVEMENTS: AchievementDef[] = [
  // === Milestone ===
  {
    id: 'monkey_awaken', name: '灵猴初醒', icon: '🐒',
    description: '角色达到 Lv.10', category: 'milestone',
    conditionType: 'level', target: 10,
    reward: { type: 'stat_boost', stat: 'attack', value: 5, description: '攻击 +5%' },
  },
  {
    id: 'warrior_1000', name: '百战之师', icon: '⚔️',
    description: '累计击杀 1,000 怪物', category: 'milestone',
    conditionType: 'kill_count', target: 1000,
    reward: { type: 'resource', value: 10000, description: '灵石 ×10,000' },
  },
  {
    id: 'collector_50', name: '收藏家', icon: '💎',
    description: '累计获得 50 件装备', category: 'milestone',
    conditionType: 'equipment_count', target: 50,
    reward: { type: 'unlock', value: 10, description: '背包上限 +10' },
  },
  {
    id: 'first_dungeon', name: '取经启程', icon: '🏔️',
    description: '通关第一个副本', category: 'milestone',
    conditionType: 'dungeon_clear', target: 1,
    reward: { type: 'resource', value: 5, description: '蟠桃 ×5' },
  },
  {
    id: 'hongmeng_first', name: '鸿蒙之力', icon: '🔴',
    description: '获得第一件鸿蒙装备', category: 'milestone',
    conditionType: 'hongmeng_obtain', target: 1,
    reward: { type: 'stat_boost', stat: 'all', value: 3, description: '全属性 +3%' },
  },
  {
    id: 'online_24h', name: '坚持修炼', icon: '⏰',
    description: '累计在线 24 小时', category: 'milestone',
    conditionType: 'online_time', target: 86400,
    reward: { type: 'stat_boost', stat: 'all', value: 2, description: '离线收益 +20%' },
  },
  {
    id: 'rich_1m', name: '富可敌国', icon: '💰',
    description: '累计获得 1,000,000 灵石', category: 'milestone',
    conditionType: 'gold_total', target: 1000000,
    reward: { type: 'stat_boost', stat: 'attack', value: 5, description: '灵石获取 +5%' },
  },
  {
    id: 'level_100', name: '突破极限', icon: '📈',
    description: '达到 Lv.100', category: 'milestone',
    conditionType: 'level', target: 100,
    reward: { type: 'stat_boost', stat: 'all', value: 10, description: '经验获取 +10%' },
  },
  {
    id: 'all_dungeons', name: '功德圆满', icon: '🏛️',
    description: '通关灵山终章', category: 'milestone',
    conditionType: 'dungeon_clear', target: 10,
    reward: { type: 'title', value: 0, title: '斗战胜佛', description: '称号「斗战胜佛」' },
  },

  // === Challenge ===
  {
    id: 'speed_60', name: '速战速决', icon: '⚡',
    description: '60秒内通关任意副本', category: 'challenge',
    conditionType: 'dungeon_speed', target: 60,
    reward: { type: 'stat_boost', stat: 'attack', value: 3, description: '攻击 +3%' },
  },
  {
    id: 'no_damage', name: '无伤通关', icon: '🛡️',
    description: '不受任何伤害通关副本', category: 'challenge',
    conditionType: 'no_damage', target: 1,
    reward: { type: 'stat_boost', stat: 'defense', value: 5, description: '防御 +5%' },
  },
  {
    id: 'win_streak_5', name: '连胜之王', icon: '🔥',
    description: '连续通关 5 个副本不失败', category: 'challenge',
    conditionType: 'win_streak', target: 5,
    reward: { type: 'resource', value: 50000, description: '灵石 ×50,000' },
  },
  {
    id: 'enhance_15', name: '满强之路', icon: '✦',
    description: '拥有一件 +15 鸿蒙装备', category: 'challenge',
    conditionType: 'enhance_max', target: 15,
    reward: { type: 'title', value: 0, title: '锻造大师', description: '称号「锻造大师」' },
  },
  {
    id: 'dodge_10', name: '百发百中', icon: '🎯',
    description: '连续闪避 Boss 技能 10 次', category: 'challenge',
    conditionType: 'dodge_streak', target: 10,
    reward: { type: 'stat_boost', stat: 'speed', value: 5, description: '速度 +5%' },
  },
];

export function getAchievementDef(id: string): AchievementDef | undefined {
  return ACHIEVEMENTS.find(a => a.id === id);
}
