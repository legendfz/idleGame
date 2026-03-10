/**
 * v200.0「万道归一」— 成长回顾系统
 * Tracks and displays key milestones in the player's journey
 */

export interface JourneyMilestone {
  id: string;
  icon: string;
  title: string;
  desc: string;
  check: (s: any) => boolean;
  getValue?: (s: any) => string;
  category: 'combat' | 'growth' | 'collection' | 'mastery';
  order: number;
}

export const JOURNEY_MILESTONES: JourneyMilestone[] = [
  // === Combat ===
  { id: 'first_kill', icon: '⚔️', title: '初出茅庐', desc: '击杀第一个敌人', check: s => (s.allTimeKills ?? s.kills ?? 0) > 0, category: 'combat', order: 1 },
  { id: 'kill_100', icon: '🗡️', title: '百战百胜', desc: '累计击杀100个敌人', check: s => (s.allTimeKills ?? s.kills ?? 0) >= 100, getValue: s => `${s.allTimeKills ?? s.kills ?? 0}`, category: 'combat', order: 2 },
  { id: 'kill_1k', icon: '💀', title: '千人斩', desc: '累计击杀1,000个敌人', check: s => (s.allTimeKills ?? s.kills ?? 0) >= 1000, getValue: s => `${s.allTimeKills ?? s.kills ?? 0}`, category: 'combat', order: 3 },
  { id: 'kill_10k', icon: '☠️', title: '万夫不当', desc: '累计击杀10,000个敌人', check: s => (s.allTimeKills ?? s.kills ?? 0) >= 10000, getValue: s => `${s.allTimeKills ?? s.kills ?? 0}`, category: 'combat', order: 4 },
  { id: 'kill_100k', icon: '🔥', title: '修罗战神', desc: '累计击杀100,000个敌人', check: s => (s.allTimeKills ?? s.kills ?? 0) >= 100000, getValue: s => `${s.allTimeKills ?? s.kills ?? 0}`, category: 'combat', order: 5 },
  { id: 'streak_50', icon: '⚡', title: '连战连捷', desc: '连杀达到50', check: s => (s.bestKillStreak ?? 0) >= 50, getValue: s => `最高${s.bestKillStreak ?? 0}连杀`, category: 'combat', order: 6 },
  { id: 'streak_500', icon: '🌟', title: '无人可挡', desc: '连杀达到500', check: s => (s.bestKillStreak ?? 0) >= 500, getValue: s => `最高${s.bestKillStreak ?? 0}连杀`, category: 'combat', order: 7 },
  { id: 'abyss_10', icon: '🕳️', title: '深渊探索者', desc: '深渊达到第10层', check: s => (s.highestAbyssFloor ?? 0) >= 10, getValue: s => `第${s.highestAbyssFloor ?? 0}层`, category: 'combat', order: 8 },
  { id: 'abyss_50', icon: '🌀', title: '深渊征服者', desc: '深渊达到第50层', check: s => (s.highestAbyssFloor ?? 0) >= 50, getValue: s => `第${s.highestAbyssFloor ?? 0}层`, category: 'combat', order: 9 },

  // === Growth ===
  { id: 'lv_10', icon: '🌱', title: '踏入仙途', desc: '达到10级', check: s => (s.highestLevelEver ?? s.level ?? 0) >= 10, category: 'growth', order: 10 },
  { id: 'lv_50', icon: '🌿', title: '小有所成', desc: '达到50级', check: s => (s.highestLevelEver ?? s.level ?? 0) >= 50, category: 'growth', order: 11 },
  { id: 'lv_100', icon: '🌳', title: '百级大关', desc: '达到100级', check: s => (s.highestLevelEver ?? s.level ?? 0) >= 100, category: 'growth', order: 12 },
  { id: 'lv_500', icon: '🏔️', title: '大乘圆满', desc: '达到500级', check: s => (s.highestLevelEver ?? s.level ?? 0) >= 500, category: 'growth', order: 13 },
  { id: 'lv_1000', icon: '⛰️', title: '千级巅峰', desc: '达到1,000级', check: s => (s.highestLevelEver ?? s.level ?? 0) >= 1000, category: 'growth', order: 14 },
  { id: 'lv_5000', icon: '🌌', title: '五千境界', desc: '达到5,000级', check: s => (s.highestLevelEver ?? s.level ?? 0) >= 5000, category: 'growth', order: 15 },
  { id: 'reinc_1', icon: '🔄', title: '轮回初始', desc: '首次转世', check: s => (s.totalReincarnations ?? s.reincarnations ?? 0) >= 1, category: 'growth', order: 16 },
  { id: 'reinc_10', icon: '♻️', title: '十世轮回', desc: '累计转世10次', check: s => (s.totalReincarnations ?? s.reincarnations ?? 0) >= 10, getValue: s => `${s.totalReincarnations ?? s.reincarnations ?? 0}次`, category: 'growth', order: 17 },
  { id: 'reinc_50', icon: '🌀', title: '五十世修行', desc: '累计转世50次', check: s => (s.totalReincarnations ?? s.reincarnations ?? 0) >= 50, getValue: s => `${s.totalReincarnations ?? s.reincarnations ?? 0}次`, category: 'growth', order: 18 },
  { id: 'transcend_1', icon: '✨', title: '超越轮回', desc: '首次超越', check: s => (s.transcensions ?? 0) >= 1, category: 'growth', order: 19 },
  { id: 'transcend_5', icon: '💫', title: '五重超越', desc: '超越5次', check: s => (s.transcensions ?? 0) >= 5, getValue: s => `${s.transcensions ?? 0}次`, category: 'growth', order: 20 },

  // === Collection ===
  { id: 'equip_10', icon: '🎒', title: '装备初收', desc: '收集10种不同装备', check: s => (s.codexEquipIds?.length ?? 0) >= 10, getValue: s => `${s.codexEquipIds?.length ?? 0}种`, category: 'collection', order: 21 },
  { id: 'equip_50', icon: '🏛️', title: '装备大师', desc: '收集50种不同装备', check: s => (s.codexEquipIds?.length ?? 0) >= 50, getValue: s => `${s.codexEquipIds?.length ?? 0}种`, category: 'collection', order: 22 },
  { id: 'equip_100', icon: '👑', title: '装备收藏家', desc: '收集100种不同装备', check: s => (s.codexEquipIds?.length ?? 0) >= 100, getValue: s => `${s.codexEquipIds?.length ?? 0}种`, category: 'collection', order: 23 },
  { id: 'enemy_20', icon: '📖', title: '妖怪百科', desc: '遭遇20种不同敌人', check: s => (s.codexEnemyNames?.length ?? 0) >= 20, getValue: s => `${s.codexEnemyNames?.length ?? 0}种`, category: 'collection', order: 24 },
  { id: 'enemy_50', icon: '📚', title: '妖界大全', desc: '遭遇50种不同敌人', check: s => (s.codexEnemyNames?.length ?? 0) >= 50, getValue: s => `${s.codexEnemyNames?.length ?? 0}种`, category: 'collection', order: 25 },
  { id: 'lingshi_1m', icon: '💰', title: '百万灵石', desc: '累计获得100万灵石', check: s => (s.allTimeLingshi ?? 0) >= 1000000, getValue: s => `${Math.floor((s.allTimeLingshi ?? 0) / 10000)}万`, category: 'collection', order: 26 },
  { id: 'lingshi_100m', icon: '💎', title: '亿万富翁', desc: '累计获得1亿灵石', check: s => (s.allTimeLingshi ?? 0) >= 100000000, getValue: s => `${Math.floor((s.allTimeLingshi ?? 0) / 100000000)}亿`, category: 'collection', order: 27 },

  // === Mastery ===
  { id: 'online_1h', icon: '⏰', title: '修仙一时', desc: '累计在线1小时', check: s => (s.totalOnlineTime ?? 0) >= 3600, getValue: s => `${Math.floor((s.totalOnlineTime ?? 0) / 3600)}小时`, category: 'mastery', order: 28 },
  { id: 'online_24h', icon: '🕐', title: '日夜不休', desc: '累计在线24小时', check: s => (s.totalOnlineTime ?? 0) >= 86400, getValue: s => `${Math.floor((s.totalOnlineTime ?? 0) / 3600)}小时`, category: 'mastery', order: 29 },
  { id: 'online_168h', icon: '📅', title: '七日苦修', desc: '累计在线168小时', check: s => (s.totalOnlineTime ?? 0) >= 604800, getValue: s => `${Math.floor((s.totalOnlineTime ?? 0) / 3600)}小时`, category: 'mastery', order: 30 },
  { id: 'login_7', icon: '📆', title: '七日签到', desc: '累计签到7天', check: s => (s.loginDays ?? 0) >= 7, getValue: s => `${s.loginDays ?? 0}天`, category: 'mastery', order: 31 },
  { id: 'login_30', icon: '🗓️', title: '月度修仙', desc: '累计签到30天', check: s => (s.loginDays ?? 0) >= 30, getValue: s => `${s.loginDays ?? 0}天`, category: 'mastery', order: 32 },
  { id: 'fast_reinc', icon: '⚡', title: '极速轮回', desc: '5分钟内完成转世', check: s => (s.fastestReincTime ?? Infinity) > 0 && (s.fastestReincTime ?? Infinity) <= 300, getValue: s => `${Math.floor((s.fastestReincTime ?? 0) / 60)}分${(s.fastestReincTime ?? 0) % 60}秒`, category: 'mastery', order: 33 },
  { id: 'chapter_8', icon: '🏆', title: '通关混沌', desc: '通关第8章', check: s => (s.highestChapter ?? s.chapter ?? 1) >= 9, category: 'mastery', order: 34 },
  { id: 'power_1m', icon: '💪', title: '百万战力', desc: '最高战力达到100万', check: s => (s.highestPower ?? 0) >= 1000000, getValue: s => `${Math.floor((s.highestPower ?? 0) / 10000)}万`, category: 'mastery', order: 35 },
];

export const CATEGORY_NAMES: Record<string, { name: string; icon: string }> = {
  combat: { name: '战斗', icon: '⚔️' },
  growth: { name: '成长', icon: '🌱' },
  collection: { name: '收集', icon: '🎒' },
  mastery: { name: '精通', icon: '🏆' },
};
