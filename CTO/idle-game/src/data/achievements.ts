/**
 * v1.3 成就系统数据配置
 * 数据来源：CPO v1.3 数据配置表 + CTO 类型定义
 */

export type AchievementConditionType =
  | 'level' | 'kill_count' | 'equipment_count' | 'dungeon_clear'
  | 'dungeon_speed' | 'no_damage' | 'enhance_max' | 'online_time'
  | 'gold_total' | 'win_streak' | 'dodge_streak' | 'solo_boss'
  | 'hongmeng_obtain' | 'realm_reach' | 'collect_unique';

export type AchievementRewardType = 'stat_boost' | 'resource' | 'title' | 'unlock';

export interface AchievementDef {
  id: string;
  name: string;
  icon: string;
  description: string;
  category: 'milestone' | 'challenge';
  conditionType: AchievementConditionType;
  target: number;
  hidden?: boolean;
  dungeonId?: string;
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
    id: 'ach_first_dungeon', name: '初入江湖', icon: '⚔️',
    description: '通关第一个副本', category: 'milestone',
    conditionType: 'dungeon_clear', target: 1, dungeonId: 'wuxingshan',
    reward: { type: 'resource', value: 5000, description: '灵石 ×5,000' },
  },
  {
    id: 'ach_level_50', name: '修行有成', icon: '📈',
    description: '达到等级 50', category: 'milestone',
    conditionType: 'level', target: 50,
    reward: { type: 'stat_boost', stat: 'all', value: 5, description: '全属性 +5%' },
  },
  {
    id: 'ach_level_100', name: '登峰造极', icon: '🏔️',
    description: '达到等级 100', category: 'milestone',
    conditionType: 'level', target: 100,
    reward: { type: 'stat_boost', stat: 'all', value: 10, description: '全属性 +10%' },
  },
  {
    id: 'ach_kill_1000', name: '千妖斩', icon: '💀',
    description: '累计击杀 1,000 只妖怪', category: 'milestone',
    conditionType: 'kill_count', target: 1000,
    reward: { type: 'title', value: 0, title: '千妖斩', description: '称号「千妖斩」' },
  },
  {
    id: 'ach_equip_50', name: '装备收藏家', icon: '🎒',
    description: '累计获得 50 件装备', category: 'milestone',
    conditionType: 'equipment_count', target: 50,
    reward: { type: 'unlock', value: 5, description: '背包上限 +5' },
  },
  {
    id: 'ach_realm_dacheng', name: '大乘期', icon: '☸️',
    description: '达到大乘境界', category: 'milestone',
    conditionType: 'realm_reach', target: 1,
    reward: { type: 'title', value: 0, title: '大乘高僧', description: '称号「大乘高僧」' },
  },
  {
    id: 'ach_all_dungeons', name: '取经归来', icon: '🏛️',
    description: '通关全部 10 个副本', category: 'milestone',
    conditionType: 'dungeon_clear', target: 10, hidden: true,
    reward: { type: 'title', value: 0, title: '斗战胜佛', description: '称号「斗战胜佛」' },
  },
  {
    id: 'ach_collect_20_unique', name: '百宝鉴赏', icon: '💎',
    description: '收集 20 种不同装备', category: 'milestone',
    conditionType: 'collect_unique', target: 20,
    reward: { type: 'resource', value: 10, description: '蟠桃 ×10' },
  },
  {
    id: 'ach_gold_1m', name: '富甲一方', icon: '💰',
    description: '累计获得 1,000,000 灵石', category: 'milestone',
    conditionType: 'gold_total', target: 1000000,
    reward: { type: 'resource', value: 50000, description: '灵石 ×50,000' },
  },
  {
    id: 'ach_online_24h', name: '日夜修行', icon: '⏰',
    description: '在线总时长达 24 小时', category: 'milestone',
    conditionType: 'online_time', target: 86400,
    reward: { type: 'unlock', value: 1, description: '离线收益增强' },
  },

  // === Challenge ===
  {
    id: 'ach_speed_wuxingshan', name: '疾风破山', icon: '⚡',
    description: '60 秒内通关五行山', category: 'challenge',
    conditionType: 'dungeon_speed', target: 60, dungeonId: 'wuxingshan',
    reward: { type: 'stat_boost', stat: 'speed', value: 10, description: '速度 +10%' },
  },
  {
    id: 'ach_no_damage_boss', name: '毫发无伤', icon: '🛡️',
    description: '无伤通关任意 Boss 战', category: 'challenge', hidden: true,
    conditionType: 'no_damage', target: 1,
    reward: { type: 'title', value: 0, title: '无伤大圣', description: '称号「无伤大圣」' },
  },
  {
    id: 'ach_enhance_15', name: '鸿蒙之力', icon: '✨',
    description: '强化任意装备至 +15', category: 'challenge',
    conditionType: 'enhance_max', target: 15,
    reward: { type: 'stat_boost', stat: 'attack', value: 15, description: '攻击 +15%' },
  },
  {
    id: 'ach_dodge_10', name: '身法如风', icon: '💨',
    description: '连续闪避 Boss 技能 10 次', category: 'challenge', hidden: true,
    conditionType: 'dodge_streak', target: 10,
    reward: { type: 'stat_boost', stat: 'speed', value: 15, description: '速度 +15%' },
  },
  {
    id: 'ach_solo_lingshan', name: '孤胆英雄', icon: '🦸',
    description: '独自通关灵山雷音寺', category: 'challenge', hidden: true,
    conditionType: 'solo_boss', target: 1, dungeonId: 'lingshan',
    reward: { type: 'title', value: 0, title: '齐天大圣', description: '称号「齐天大圣」' },
  },
];

export function getAchievementDef(id: string): AchievementDef | undefined {
  return ACHIEVEMENTS.find(a => a.id === id);
}
