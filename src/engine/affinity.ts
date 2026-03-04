/**
 * AffinityEngine — 仙缘系统: 6 NPC好感度
 */

export interface AffinityNPC {
  id: string;
  name: string;
  icon: string;
  title: string;
  giftPreference: string; // 喜欢的礼物类型
  buffs: { threshold: number; type: string; value: number; desc: string }[];
  ultimateSkill: string; // 100好感解锁
}

export const AFFINITY_NPCS: AffinityNPC[] = [
  {
    id: 'guanyin', name: '观音', icon: '[佛]', title: '慈悲仙人', giftPreference: '法器',
    buffs: [
      { threshold: 20, type: 'maxHp', value: 10, desc: '生命+10%' },
      { threshold: 40, type: 'healRate', value: 5, desc: '回复+5%' },
      { threshold: 60, type: 'maxHp', value: 15, desc: '生命+15%' },
      { threshold: 80, type: 'defense', value: 10, desc: '防御+10%' },
    ],
    ultimateSkill: '甘露普降 — 战斗中每10秒恢复5%生命',
  },
  {
    id: 'laojun', name: '太上老君', icon: '[仙]', title: '炼丹宗师', giftPreference: '丹药',
    buffs: [
      { threshold: 20, type: 'expMul', value: 5, desc: '经验+5%' },
      { threshold: 40, type: 'forgeRate', value: 3, desc: '锻造+3%' },
      { threshold: 60, type: 'expMul', value: 10, desc: '经验+10%' },
      { threshold: 80, type: 'forgeRate', value: 5, desc: '锻造+5%' },
    ],
    ultimateSkill: '八卦炉火 — 锻造永不失败',
  },
  {
    id: 'erlang', name: '二郎神', icon: '[剑]', title: '战神', giftPreference: '兵器',
    buffs: [
      { threshold: 20, type: 'attack', value: 8, desc: '攻击+8%' },
      { threshold: 40, type: 'critRate', value: 3, desc: '暴击+3%' },
      { threshold: 60, type: 'attack', value: 12, desc: '攻击+12%' },
      { threshold: 80, type: 'critDmg', value: 10, desc: '暴伤+10%' },
    ],
    ultimateSkill: '三尖两刃 — 暴击时额外造成50%伤害',
  },
  {
    id: 'nezha', name: '哪吒', icon: '[火]', title: '莲花化身', giftPreference: '灵石',
    buffs: [
      { threshold: 20, type: 'speed', value: 5, desc: '速度+5%' },
      { threshold: 40, type: 'attack', value: 5, desc: '攻击+5%' },
      { threshold: 60, type: 'speed', value: 10, desc: '速度+10%' },
      { threshold: 80, type: 'critRate', value: 5, desc: '暴击+5%' },
    ],
    ultimateSkill: '风火轮 — 攻击速度翻倍持续10秒',
  },
  {
    id: 'yutu', name: '玉兔', icon: '[兔]', title: '月宫仙子', giftPreference: '灵草',
    buffs: [
      { threshold: 20, type: 'lingshiMul', value: 5, desc: '灵石+5%' },
      { threshold: 40, type: 'expMul', value: 3, desc: '经验+3%' },
      { threshold: 60, type: 'lingshiMul', value: 10, desc: '灵石+10%' },
      { threshold: 80, type: 'pantaoChance', value: 5, desc: '蟠桃掉率+5%' },
    ],
    ultimateSkill: '月华清辉 — 离线收益翻倍',
  },
  {
    id: 'longnv', name: '龙女', icon: '[龙]', title: '龙宫公主', giftPreference: '珍珠',
    buffs: [
      { threshold: 20, type: 'defense', value: 5, desc: '防御+5%' },
      { threshold: 40, type: 'maxHp', value: 8, desc: '生命+8%' },
      { threshold: 60, type: 'defense', value: 10, desc: '防御+10%' },
      { threshold: 80, type: 'dropRate', value: 5, desc: '掉落+5%' },
    ],
    ultimateSkill: '龙宫护佑 — 受到致命伤害时免死一次',
  },
];

export interface AffinityState {
  levels: Record<string, number>; // npcId -> 0~100
}

export function createAffinityState(): AffinityState {
  const levels: Record<string, number> = {};
  AFFINITY_NPCS.forEach(n => levels[n.id] = 0);
  return { levels };
}

export function addAffinity(state: AffinityState, npcId: string, amount: number): AffinityState {
  const current = state.levels[npcId] ?? 0;
  return { levels: { ...state.levels, [npcId]: Math.min(100, current + amount) } };
}

export function calcAffinityBuffs(state: AffinityState): Record<string, number> {
  const buffs: Record<string, number> = {};
  for (const npc of AFFINITY_NPCS) {
    const lv = state.levels[npc.id] ?? 0;
    for (const b of npc.buffs) {
      if (lv >= b.threshold) buffs[b.type] = (buffs[b.type] ?? 0) + b.value;
    }
  }
  return buffs;
}

export function getGiftCost(): number { return 100; } // lingshi per gift
export function getGiftAmount(): number { return 5 + Math.floor(Math.random() * 6); } // 5-10 affinity
