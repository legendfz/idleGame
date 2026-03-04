/**
 * v1.3 排行榜配置
 * 数据来源：CPO v1.3 数据配置表
 */

export interface LeaderboardConfig {
  id: string;
  name: string;
  icon: string;
  description: string;
  sortBy: 'asc' | 'desc';
  scoreType: string;
  maxEntries: number;
  dungeonId?: string;
}

export const LEADERBOARD_CONFIGS: LeaderboardConfig[] = [
  { id: 'lb_combat_power', name: '战力排行', icon: '[剑]', description: '综合战斗力排名', sortBy: 'desc', scoreType: 'combat_power', maxEntries: 10 },
  { id: 'lb_level', name: '等级排行', icon: '[升]', description: '玩家等级排名', sortBy: 'desc', scoreType: 'level', maxEntries: 10 },
  { id: 'lb_kill_count', name: '杀敌排行', icon: '[骷]', description: '累计击杀数排名', sortBy: 'desc', scoreType: 'kill_count', maxEntries: 10 },
  { id: 'lb_speed_wuxingshan', name: '五行山速通', icon: '[电]', description: '五行山最快通关时间', sortBy: 'asc', scoreType: 'dungeon_time', maxEntries: 10, dungeonId: 'wuxingshan' },
  { id: 'lb_speed_lingshan', name: '灵山速通', icon: '[殿]', description: '灵山雷音寺最快通关时间', sortBy: 'asc', scoreType: 'dungeon_time', maxEntries: 10, dungeonId: 'lingshan' },
  { id: 'lb_collect', name: '收藏排行', icon: '[钻]', description: '不同装备收集数排名', sortBy: 'desc', scoreType: 'collect_count', maxEntries: 10 },
];
