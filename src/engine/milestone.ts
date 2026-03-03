/**
 * MilestoneEngine — 里程碑定义 + 永久加成
 * 达成条件后解锁永久buff，影响修炼/战斗/锻造
 */

export interface MilestoneDef {
  id: string;
  name: string;
  desc: string;
  icon: string;
  condition: MilestoneCondition;
  buff: MilestoneBuff;
}

export type MilestoneCondition =
  | { type: 'totalXiuwei'; amount: string }
  | { type: 'totalKills'; count: number }
  | { type: 'stagesCleared'; count: number }
  | { type: 'forgeLevel'; level: number }
  | { type: 'realmOrder'; order: number }
  | { type: 'playTime'; seconds: number }
  | { type: 'prestigeCount'; count: number };

export interface MilestoneBuff {
  type: 'xiuweiPercent' | 'atkPercent' | 'defPercent' | 'forgeSuccessRate' | 'gatherSpeed' | 'coinPercent';
  value: number; // 百分比，如 5 = +5%
}

export interface MilestoneProgress {
  unlocked: boolean;
  unlockedAt?: number;
}

// === 里程碑数据 (15个) ===

export const MILESTONES: MilestoneDef[] = [
  { id: 'ms_xiuwei_1k', name: '修炼启程', desc: '总修为达到1,000', icon: '🌱', condition: { type: 'totalXiuwei', amount: '1000' }, buff: { type: 'xiuweiPercent', value: 2 } },
  { id: 'ms_xiuwei_1m', name: '修为百万', desc: '总修为达到1,000,000', icon: '🌿', condition: { type: 'totalXiuwei', amount: '1000000' }, buff: { type: 'xiuweiPercent', value: 5 } },
  { id: 'ms_xiuwei_1b', name: '修为亿万', desc: '总修为达到1,000,000,000', icon: '🌳', condition: { type: 'totalXiuwei', amount: '1e9' }, buff: { type: 'xiuweiPercent', value: 10 } },

  { id: 'ms_kills_100', name: '百战之师', desc: '累计击杀100', icon: '⚔️', condition: { type: 'totalKills', count: 100 }, buff: { type: 'atkPercent', value: 3 } },
  { id: 'ms_kills_1000', name: '千刀万剐', desc: '累计击杀1,000', icon: '🗡️', condition: { type: 'totalKills', count: 1000 }, buff: { type: 'atkPercent', value: 8 } },
  { id: 'ms_kills_10000', name: '万夫不当', desc: '累计击杀10,000', icon: '☠️', condition: { type: 'totalKills', count: 10000 }, buff: { type: 'atkPercent', value: 15 } },

  { id: 'ms_stages_9', name: '初入险境', desc: '通关9个关卡', icon: '🗺️', condition: { type: 'stagesCleared', count: 9 }, buff: { type: 'defPercent', value: 3 } },
  { id: 'ms_stages_27', name: '三灾渡尽', desc: '通关27个关卡', icon: '🏔️', condition: { type: 'stagesCleared', count: 27 }, buff: { type: 'defPercent', value: 8 } },
  { id: 'ms_stages_54', name: '半程已过', desc: '通关54个关卡', icon: '🌄', condition: { type: 'stagesCleared', count: 54 }, buff: { type: 'coinPercent', value: 15 } },

  { id: 'ms_forge_10', name: '匠心初成', desc: '锻造等级达到10', icon: '🔨', condition: { type: 'forgeLevel', level: 10 }, buff: { type: 'forgeSuccessRate', value: 3 } },
  { id: 'ms_forge_30', name: '大师之路', desc: '锻造等级达到30', icon: '⚒️', condition: { type: 'forgeLevel', level: 30 }, buff: { type: 'forgeSuccessRate', value: 8 } },

  { id: 'ms_realm_jindan', name: '金丹之路', desc: '达到金丹境界', icon: '🔮', condition: { type: 'realmOrder', order: 4 }, buff: { type: 'gatherSpeed', value: 10 } },
  { id: 'ms_realm_tianxian', name: '天仙下凡', desc: '达到天仙境界', icon: '✨', condition: { type: 'realmOrder', order: 9 }, buff: { type: 'xiuweiPercent', value: 20 } },

  { id: 'ms_playtime_10h', name: '十年磨一剑', desc: '在线10小时', icon: '⏱️', condition: { type: 'playTime', seconds: 36000 }, buff: { type: 'coinPercent', value: 5 } },
  { id: 'ms_prestige_1', name: '轮回永生', desc: '完成第一次转世', icon: '🔄', condition: { type: 'prestigeCount', count: 1 }, buff: { type: 'xiuweiPercent', value: 25 } },
];

// === Engine ===

import { GameStats } from './achievement';

export function checkMilestone(def: MilestoneDef, stats: GameStats): boolean {
  const c = def.condition;
  switch (c.type) {
    case 'totalXiuwei': return parseFloat(stats.totalXiuwei) >= parseFloat(c.amount);
    case 'totalKills': return stats.totalKills >= c.count;
    case 'stagesCleared': return stats.highestStage >= c.count;
    case 'forgeLevel': return stats.forgeLevel >= c.level;
    case 'realmOrder': return stats.realmOrder >= c.order;
    case 'playTime': return stats.playTime >= c.seconds;
    case 'prestigeCount': return stats.prestigeCount >= c.count;
    default: return false;
  }
}

/**
 * 计算已解锁里程碑的总buff
 */
export function calcMilestoneBuffs(unlockedIds: Set<string>): Record<MilestoneBuff['type'], number> {
  const buffs: Record<string, number> = {
    xiuweiPercent: 0, atkPercent: 0, defPercent: 0,
    forgeSuccessRate: 0, gatherSpeed: 0, coinPercent: 0,
  };
  for (const ms of MILESTONES) {
    if (unlockedIds.has(ms.id)) {
      buffs[ms.buff.type] = (buffs[ms.buff.type] ?? 0) + ms.buff.value;
    }
  }
  return buffs as Record<MilestoneBuff['type'], number>;
}
