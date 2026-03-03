/**
 * AchievementEngine — 成就定义 + 检测
 * 30+ 成就，按类别分组
 */

export type AchievementCategory = 'combat' | 'cultivation' | 'forge' | 'gather' | 'journey' | 'misc';

export interface AchievementDef {
  id: string;
  name: string;
  desc: string;
  icon: string;
  category: AchievementCategory;
  condition: AchievementCondition;
  reward: AchievementReward;
  hidden?: boolean;
}

export type AchievementCondition =
  | { type: 'kills'; count: number }
  | { type: 'breakthroughs'; count: number }
  | { type: 'realmReached'; realmOrder: number }
  | { type: 'stageCleared'; stage: number }
  | { type: 'totalXiuwei'; amount: string }
  | { type: 'totalClicks'; count: number }
  | { type: 'forgeLevel'; level: number }
  | { type: 'forgeCount'; count: number }
  | { type: 'gatherCount'; count: number }
  | { type: 'materialTypes'; count: number }
  | { type: 'equipCount'; count: number }
  | { type: 'playTime'; seconds: number }
  | { type: 'prestigeCount'; count: number }
  | { type: 'dungeonClears'; count: number }
  | { type: 'comboHits'; count: number };

export interface AchievementReward {
  type: 'coins' | 'materials' | 'xiuwei' | 'title';
  amount?: number;
  materialId?: string;
  title?: string;
}

export interface AchievementProgress {
  unlocked: boolean;
  unlockedAt?: number;
}

// === 成就数据 (30+) ===

export const ACHIEVEMENTS: AchievementDef[] = [
  // -- combat --
  { id: 'first_blood', name: '初战告捷', desc: '击杀第一个妖怪', icon: '🗡️', category: 'combat', condition: { type: 'kills', count: 1 }, reward: { type: 'coins', amount: 100 } },
  { id: 'slayer_10', name: '小试牛刀', desc: '累计击杀10个妖怪', icon: '⚔️', category: 'combat', condition: { type: 'kills', count: 10 }, reward: { type: 'coins', amount: 500 } },
  { id: 'slayer_100', name: '妖怪克星', desc: '累计击杀100个妖怪', icon: '💀', category: 'combat', condition: { type: 'kills', count: 100 }, reward: { type: 'coins', amount: 2000 } },
  { id: 'slayer_1000', name: '除魔卫道', desc: '累计击杀1000个妖怪', icon: '☠️', category: 'combat', condition: { type: 'kills', count: 1000 }, reward: { type: 'coins', amount: 10000 } },
  { id: 'click_100', name: '勤修苦练', desc: '累计点击100次', icon: '👆', category: 'combat', condition: { type: 'totalClicks', count: 100 }, reward: { type: 'coins', amount: 200 } },
  { id: 'click_10000', name: '铁杵磨针', desc: '累计点击10000次', icon: '🔨', category: 'combat', condition: { type: 'totalClicks', count: 10000 }, reward: { type: 'coins', amount: 5000 } },
  { id: 'dungeon_1', name: '秘境探索者', desc: '通关1次秘境', icon: '🐉', category: 'combat', condition: { type: 'dungeonClears', count: 1 }, reward: { type: 'coins', amount: 1000 } },
  { id: 'dungeon_50', name: '秘境征服者', desc: '通关50次秘境', icon: '👑', category: 'combat', condition: { type: 'dungeonClears', count: 50 }, reward: { type: 'coins', amount: 20000 } },

  // -- cultivation --
  { id: 'break_1', name: '踏入仙途', desc: '完成第一次突破', icon: '⬆️', category: 'cultivation', condition: { type: 'breakthroughs', count: 1 }, reward: { type: 'coins', amount: 300 } },
  { id: 'break_10', name: '修仙有成', desc: '累计突破10次', icon: '🌟', category: 'cultivation', condition: { type: 'breakthroughs', count: 10 }, reward: { type: 'coins', amount: 3000 } },
  { id: 'realm_jindan', name: '金丹大道', desc: '达到金丹境界', icon: '🔮', category: 'cultivation', condition: { type: 'realmReached', realmOrder: 4 }, reward: { type: 'coins', amount: 5000 } },
  { id: 'realm_yuanying', name: '元婴出窍', desc: '达到元婴境界', icon: '👻', category: 'cultivation', condition: { type: 'realmReached', realmOrder: 5 }, reward: { type: 'coins', amount: 10000 } },
  { id: 'realm_dujie', name: '渡劫飞升', desc: '达到渡劫境界', icon: '⚡', category: 'cultivation', condition: { type: 'realmReached', realmOrder: 7 }, reward: { type: 'coins', amount: 50000 } },
  { id: 'realm_shengren', name: '证道圣人', desc: '达到圣人境界', icon: '🏆', category: 'cultivation', condition: { type: 'realmReached', realmOrder: 14 }, reward: { type: 'title', title: '圣人' }, hidden: true },
  { id: 'prestige_1', name: '轮回之始', desc: '完成第一次转世', icon: '🔄', category: 'cultivation', condition: { type: 'prestigeCount', count: 1 }, reward: { type: 'coins', amount: 100000 } },
  { id: 'playtime_1h', name: '初心不改', desc: '在线满1小时', icon: '⏱️', category: 'cultivation', condition: { type: 'playTime', seconds: 3600 }, reward: { type: 'coins', amount: 500 } },
  { id: 'playtime_24h', name: '日夜兼程', desc: '在线满24小时', icon: '🌙', category: 'cultivation', condition: { type: 'playTime', seconds: 86400 }, reward: { type: 'coins', amount: 10000 } },

  // -- forge --
  { id: 'forge_first', name: '初次锻造', desc: '完成第一次锻造', icon: '🔨', category: 'forge', condition: { type: 'forgeCount', count: 1 }, reward: { type: 'coins', amount: 500 } },
  { id: 'forge_10', name: '匠心独运', desc: '累计锻造10次', icon: '⚒️', category: 'forge', condition: { type: 'forgeCount', count: 10 }, reward: { type: 'coins', amount: 2000 } },
  { id: 'forge_lv10', name: '锻造师', desc: '锻造等级达到10', icon: '🛠️', category: 'forge', condition: { type: 'forgeLevel', level: 10 }, reward: { type: 'coins', amount: 5000 } },
  { id: 'forge_lv30', name: '大师锻造', desc: '锻造等级达到30', icon: '⚜️', category: 'forge', condition: { type: 'forgeLevel', level: 30 }, reward: { type: 'coins', amount: 30000 } },
  { id: 'forge_lv50', name: '传说铸匠', desc: '锻造等级达到50', icon: '🏅', category: 'forge', condition: { type: 'forgeLevel', level: 50 }, reward: { type: 'title', title: '传说铸匠' }, hidden: true },

  // -- gather --
  { id: 'gather_1', name: '初次采集', desc: '完成第一次采集', icon: '⛏️', category: 'gather', condition: { type: 'gatherCount', count: 1 }, reward: { type: 'coins', amount: 200 } },
  { id: 'gather_50', name: '勤劳采集', desc: '累计采集50次', icon: '💎', category: 'gather', condition: { type: 'gatherCount', count: 50 }, reward: { type: 'coins', amount: 5000 } },
  { id: 'mat_types_5', name: '收集达人', desc: '拥有5种不同材料', icon: '📦', category: 'gather', condition: { type: 'materialTypes', count: 5 }, reward: { type: 'coins', amount: 1000 } },
  { id: 'mat_types_10', name: '博物学家', desc: '拥有10种不同材料', icon: '🏛️', category: 'gather', condition: { type: 'materialTypes', count: 10 }, reward: { type: 'coins', amount: 5000 } },

  // -- journey --
  { id: 'stage_1', name: '踏上取经路', desc: '通关第1难', icon: '🚶', category: 'journey', condition: { type: 'stageCleared', stage: 1 }, reward: { type: 'coins', amount: 200 } },
  { id: 'stage_9', name: '九九归一', desc: '通关第9难', icon: '9️⃣', category: 'journey', condition: { type: 'stageCleared', stage: 9 }, reward: { type: 'coins', amount: 3000 } },
  { id: 'stage_27', name: '三灾已渡', desc: '通关第27难', icon: '🌊', category: 'journey', condition: { type: 'stageCleared', stage: 27 }, reward: { type: 'coins', amount: 15000 } },
  { id: 'stage_54', name: '半途已过', desc: '通关第54难', icon: '🏔️', category: 'journey', condition: { type: 'stageCleared', stage: 54 }, reward: { type: 'coins', amount: 50000 } },
  { id: 'stage_81', name: '功德圆满', desc: '通关第81难', icon: '📜', category: 'journey', condition: { type: 'stageCleared', stage: 81 }, reward: { type: 'title', title: '取经人' }, hidden: true },

  // -- misc --
  { id: 'equip_10', name: '装备收藏', desc: '拥有10件装备', icon: '🎒', category: 'misc', condition: { type: 'equipCount', count: 10 }, reward: { type: 'coins', amount: 1000 } },
  { id: 'equip_50', name: '军火库', desc: '拥有50件装备', icon: '🏰', category: 'misc', condition: { type: 'equipCount', count: 50 }, reward: { type: 'coins', amount: 10000 } },
];

// === 检测逻辑 ===

export interface GameStats {
  totalKills: number;
  totalBreakthroughs: number;
  realmOrder: number;
  highestStage: number;
  totalXiuwei: string;
  totalClicks: number;
  forgeLevel: number;
  forgeCount: number;
  gatherCount: number;
  materialTypes: number;
  equipCount: number;
  playTime: number;
  prestigeCount: number;
  dungeonClears: number;
}

export function checkAchievement(def: AchievementDef, stats: GameStats): boolean {
  const c = def.condition;
  switch (c.type) {
    case 'kills': return stats.totalKills >= c.count;
    case 'breakthroughs': return stats.totalBreakthroughs >= c.count;
    case 'realmReached': return stats.realmOrder >= c.realmOrder;
    case 'stageCleared': return stats.highestStage >= c.stage;
    case 'totalXiuwei': return parseFloat(stats.totalXiuwei) >= parseFloat(c.amount);
    case 'totalClicks': return stats.totalClicks >= c.count;
    case 'forgeLevel': return stats.forgeLevel >= c.level;
    case 'forgeCount': return stats.forgeCount >= c.count;
    case 'gatherCount': return stats.gatherCount >= c.count;
    case 'materialTypes': return stats.materialTypes >= c.count;
    case 'equipCount': return stats.equipCount >= c.count;
    case 'playTime': return stats.playTime >= c.seconds;
    case 'prestigeCount': return stats.prestigeCount >= c.count;
    case 'dungeonClears': return stats.dungeonClears >= c.count;
    case 'comboHits': return false; // TODO: track combo
    default: return false;
  }
}
