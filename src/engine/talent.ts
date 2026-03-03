/**
 * TalentEngine — 天赋树：3条路线 + 依赖 + 效果计算
 */

export type TalentPath = 'combat' | 'cultivation' | 'craft';

export interface TalentDef {
  id: string;
  name: string;
  desc: string;
  icon: string;
  path: TalentPath;
  tier: number;        // 层级 1-5（越高越深）
  cost: number;        // 天赋点
  maxRank: number;     // 最大等级
  requires?: string[]; // 前置天赋 id
  effect: TalentEffect;
}

export type TalentEffect =
  | { type: 'atkPercent'; perRank: number }
  | { type: 'defPercent'; perRank: number }
  | { type: 'critRate'; perRank: number }
  | { type: 'critDmg'; perRank: number }
  | { type: 'xiuweiPercent'; perRank: number }
  | { type: 'offlinePercent'; perRank: number }
  | { type: 'forgeRate'; perRank: number }
  | { type: 'gatherSpeed'; perRank: number }
  | { type: 'coinPercent'; perRank: number }
  | { type: 'bossTimer'; perRank: number }     // +秒
  | { type: 'comboWindow'; perRank: number };   // +ms

// === 天赋数据 (27个, 3路线×5层+额外) ===

export const TALENTS: TalentDef[] = [
  // -- combat 战斗之道 --
  { id: 'c_atk1', name: '力量强化', desc: '攻击+3%/级', icon: '💪', path: 'combat', tier: 1, cost: 1, maxRank: 5, effect: { type: 'atkPercent', perRank: 3 } },
  { id: 'c_crit1', name: '致命一击', desc: '暴击率+1%/级', icon: '🎯', path: 'combat', tier: 1, cost: 1, maxRank: 5, effect: { type: 'critRate', perRank: 1 } },
  { id: 'c_def1', name: '铜皮铁骨', desc: '防御+3%/级', icon: '🛡️', path: 'combat', tier: 2, cost: 1, maxRank: 5, requires: ['c_atk1'], effect: { type: 'defPercent', perRank: 3 } },
  { id: 'c_critdmg', name: '暴击伤害', desc: '暴伤+8%/级', icon: '💥', path: 'combat', tier: 2, cost: 1, maxRank: 5, requires: ['c_crit1'], effect: { type: 'critDmg', perRank: 8 } },
  { id: 'c_combo', name: '连击延长', desc: '连击窗口+200ms/级', icon: '🔥', path: 'combat', tier: 3, cost: 2, maxRank: 3, requires: ['c_critdmg'], effect: { type: 'comboWindow', perRank: 200 } },
  { id: 'c_atk2', name: '战意昂扬', desc: '攻击+5%/级', icon: '⚔️', path: 'combat', tier: 3, cost: 2, maxRank: 3, requires: ['c_def1'], effect: { type: 'atkPercent', perRank: 5 } },
  { id: 'c_boss', name: '弑神者', desc: 'Boss限时+5s/级', icon: '👹', path: 'combat', tier: 4, cost: 3, maxRank: 3, requires: ['c_atk2', 'c_combo'], effect: { type: 'bossTimer', perRank: 5 } },
  { id: 'c_atk3', name: '破军之力', desc: '攻击+10%/级', icon: '🗡️', path: 'combat', tier: 5, cost: 5, maxRank: 2, requires: ['c_boss'], effect: { type: 'atkPercent', perRank: 10 } },

  // -- cultivation 修炼之道 --
  { id: 'v_xiuwei1', name: '勤修苦练', desc: '修为+3%/级', icon: '🧘', path: 'cultivation', tier: 1, cost: 1, maxRank: 5, effect: { type: 'xiuweiPercent', perRank: 3 } },
  { id: 'v_coin1', name: '点石成金', desc: '金币+3%/级', icon: '💰', path: 'cultivation', tier: 1, cost: 1, maxRank: 5, effect: { type: 'coinPercent', perRank: 3 } },
  { id: 'v_xiuwei2', name: '心无旁骛', desc: '修为+5%/级', icon: '📿', path: 'cultivation', tier: 2, cost: 1, maxRank: 5, requires: ['v_xiuwei1'], effect: { type: 'xiuweiPercent', perRank: 5 } },
  { id: 'v_offline', name: '梦中修炼', desc: '离线效率+5%/级', icon: '🌙', path: 'cultivation', tier: 2, cost: 1, maxRank: 5, requires: ['v_xiuwei1'], effect: { type: 'offlinePercent', perRank: 5 } },
  { id: 'v_coin2', name: '财运亨通', desc: '金币+5%/级', icon: '🪙', path: 'cultivation', tier: 3, cost: 2, maxRank: 3, requires: ['v_coin1'], effect: { type: 'coinPercent', perRank: 5 } },
  { id: 'v_xiuwei3', name: '大道至简', desc: '修为+8%/级', icon: '☯️', path: 'cultivation', tier: 4, cost: 3, maxRank: 3, requires: ['v_xiuwei2', 'v_offline'], effect: { type: 'xiuweiPercent', perRank: 8 } },
  { id: 'v_offline2', name: '闭关顿悟', desc: '离线效率+10%/级', icon: '💤', path: 'cultivation', tier: 5, cost: 5, maxRank: 2, requires: ['v_xiuwei3'], effect: { type: 'offlinePercent', perRank: 10 } },

  // -- craft 匠心之道 --
  { id: 'f_forge1', name: '匠心初成', desc: '锻造成功+2%/级', icon: '🔨', path: 'craft', tier: 1, cost: 1, maxRank: 5, effect: { type: 'forgeRate', perRank: 2 } },
  { id: 'f_gather1', name: '采集之手', desc: '采集速度+3%/级', icon: '⛏️', path: 'craft', tier: 1, cost: 1, maxRank: 5, effect: { type: 'gatherSpeed', perRank: 3 } },
  { id: 'f_forge2', name: '精工细作', desc: '锻造成功+3%/级', icon: '⚒️', path: 'craft', tier: 2, cost: 1, maxRank: 5, requires: ['f_forge1'], effect: { type: 'forgeRate', perRank: 3 } },
  { id: 'f_gather2', name: '地脉感知', desc: '采集速度+5%/级', icon: '🌍', path: 'craft', tier: 2, cost: 1, maxRank: 5, requires: ['f_gather1'], effect: { type: 'gatherSpeed', perRank: 5 } },
  { id: 'f_coin', name: '商贾之术', desc: '金币+5%/级', icon: '💎', path: 'craft', tier: 3, cost: 2, maxRank: 3, requires: ['f_forge2'], effect: { type: 'coinPercent', perRank: 5 } },
  { id: 'f_forge3', name: '神匠之手', desc: '锻造成功+5%/级', icon: '🏅', path: 'craft', tier: 4, cost: 3, maxRank: 3, requires: ['f_forge2', 'f_gather2'], effect: { type: 'forgeRate', perRank: 5 } },
  { id: 'f_gather3', name: '万物归心', desc: '采集速度+10%/级', icon: '🌿', path: 'craft', tier: 5, cost: 5, maxRank: 2, requires: ['f_forge3'], effect: { type: 'gatherSpeed', perRank: 10 } },
];

// === Engine ===

export interface TalentRanks {
  [talentId: string]: number; // 当前等级 0=未学
}

export function getTalentDef(id: string): TalentDef | undefined {
  return TALENTS.find(t => t.id === id);
}

/**
 * 检查天赋是否可学习
 */
export function canLearnTalent(def: TalentDef, ranks: TalentRanks, points: number): { ok: boolean; reason?: string } {
  const currentRank = ranks[def.id] ?? 0;
  if (currentRank >= def.maxRank) return { ok: false, reason: '已满级' };
  if (points < def.cost) return { ok: false, reason: `天赋点不足（需${def.cost}）` };
  if (def.requires) {
    for (const req of def.requires) {
      if ((ranks[req] ?? 0) < 1) {
        const reqDef = getTalentDef(req);
        return { ok: false, reason: `需先学习「${reqDef?.name ?? req}」` };
      }
    }
  }
  return { ok: true };
}

/**
 * 计算天赋总buff
 */
export function calcTalentBuffs(ranks: TalentRanks): Record<string, number> {
  const buffs: Record<string, number> = {};
  for (const def of TALENTS) {
    const rank = ranks[def.id] ?? 0;
    if (rank > 0) {
      const key = def.effect.type;
      buffs[key] = (buffs[key] ?? 0) + def.effect.perRank * rank;
    }
  }
  return buffs;
}

/**
 * 计算已用天赋点总数
 */
export function calcUsedPoints(ranks: TalentRanks): number {
  let total = 0;
  for (const def of TALENTS) {
    const rank = ranks[def.id] ?? 0;
    total += def.cost * rank;
  }
  return total;
}
