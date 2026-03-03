/**
 * AffinityEngine — 仙缘系统：6NPC好感度+buff
 */

export interface NpcDef {
  id: string;
  name: string;
  icon: string;
  desc: string;
  buffs: { stat: string; perTier: number }[];
  ultimateSkill: string;
  ultimateDesc: string;
}

export const NPCS: NpcDef[] = [
  { id: 'guanyin', name: '观音', icon: '🙏', desc: '慈悲为怀', buffs: [{ stat: 'hpPercent', perTier: 3 }, { stat: 'defPercent', perTier: 2 }], ultimateSkill: '甘露普降', ultimateDesc: '全属性+5%' },
  { id: 'laojun', name: '太上老君', icon: '👴', desc: '炼丹大师', buffs: [{ stat: 'xiuweiPercent', perTier: 3 }, { stat: 'forgeRate', perTier: 1 }], ultimateSkill: '八卦炉火', ultimateDesc: '锻造成功率+10%' },
  { id: 'erlang', name: '二郎神', icon: '⚔️', desc: '战神无双', buffs: [{ stat: 'atkPercent', perTier: 4 }, { stat: 'critRate', perTier: 1 }], ultimateSkill: '三尖两刃', ultimateDesc: '暴击伤害+20%' },
  { id: 'nezha', name: '哪吒', icon: '🔥', desc: '三头六臂', buffs: [{ stat: 'spdPercent', perTier: 3 }, { stat: 'atkPercent', perTier: 2 }], ultimateSkill: '风火轮', ultimateDesc: '攻速+15%' },
  { id: 'yutu', name: '玉兔', icon: '🐰', desc: '月宫仙子', buffs: [{ stat: 'lingshiPercent', perTier: 3 }, { stat: 'xiuweiPercent', perTier: 2 }], ultimateSkill: '月华清辉', ultimateDesc: '灵石获取+10%' },
  { id: 'longnv', name: '龙女', icon: '🐲', desc: '龙宫公主', buffs: [{ stat: 'defPercent', perTier: 3 }, { stat: 'hpPercent', perTier: 2 }], ultimateSkill: '龙宫护佑', ultimateDesc: '掉落率+10%' },
];

export interface AffinityState {
  levels: Record<string, number>; // npcId -> affinity (0-100)
  giftCooldowns: Record<string, number>; // npcId -> timestamp
}

export function createAffinityState(): AffinityState {
  const levels: Record<string, number> = {};
  NPCS.forEach(n => levels[n.id] = 0);
  return { levels, giftCooldowns: {} };
}

export function getAffinityTier(level: number): number {
  return Math.floor(level / 20); // 0,1,2,3,4,5 tiers at 0,20,40,60,80,100
}

export function getGiftCost(): number { return 100; } // 灵石

export function giftNpc(state: AffinityState, npcId: string): { gain: number; newLevel: number } {
  const gain = 5 + Math.floor(Math.random() * 6); // 5-10
  const current = state.levels[npcId] ?? 0;
  const newLevel = Math.min(100, current + gain);
  state.levels[npcId] = newLevel;
  return { gain, newLevel };
}

/** 汇总所有NPC的buff */
export function calcAffinityBuffs(state: AffinityState): Record<string, number> {
  const buffs: Record<string, number> = {};
  for (const npc of NPCS) {
    const tier = getAffinityTier(state.levels[npc.id] ?? 0);
    for (const b of npc.buffs) {
      buffs[b.stat] = (buffs[b.stat] ?? 0) + b.perTier * tier;
    }
    // Ultimate at level 100
    if ((state.levels[npc.id] ?? 0) >= 100) {
      buffs[`ultimate_${npc.id}`] = 1;
    }
  }
  return buffs;
}
