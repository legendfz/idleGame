/**
 * SkillEngine — 神通技能: 6个神通, 5级升级, 被动+主动
 */

export interface SkillDef {
  id: string;
  name: string;
  icon: string;
  desc: string;
  maxLevel: number;
  wudaoCost: number[]; // 每级升级所需悟道值 [Lv1→2, Lv2→3, ...]
  passive: { type: string; perLevel: number }; // 被动加成
  active?: {
    desc: string;
    buffType: string;
    buffValue: number; // 每级叠加
    durationSec: number;
    cooldownSec: number;
  };
}

export const SKILLS: SkillDef[] = [
  {
    id: 'tianyan', name: '天眼通', icon: '👁️', desc: '洞察万物，暴击率提升',
    maxLevel: 5, wudaoCost: [50, 100, 200, 400, 800],
    passive: { type: 'critRate', perLevel: 1 },
    active: { desc: '暴击率大幅提升', buffType: 'critRate', buffValue: 10, durationSec: 120, cooldownSec: 600 },
  },
  {
    id: 'jingang', name: '金刚不坏', icon: '🛡️', desc: '坚不可摧，防御提升',
    maxLevel: 5, wudaoCost: [50, 100, 200, 400, 800],
    passive: { type: 'defPercent', perLevel: 3 },
    active: { desc: '防御大幅提升', buffType: 'defPercent', buffValue: 30, durationSec: 120, cooldownSec: 600 },
  },
  {
    id: 'fandi', name: '翻地术', icon: '⛏️', desc: '采集之道，采集速度提升',
    maxLevel: 5, wudaoCost: [40, 80, 160, 320, 640],
    passive: { type: 'gatherSpeed', perLevel: 4 },
    active: { desc: '采集速度翻倍', buffType: 'gatherSpeed', buffValue: 50, durationSec: 600, cooldownSec: 1800 },
  },
  {
    id: 'dianshi', name: '点石成金', icon: '💰', desc: '财运亨通，金币大幅增加',
    maxLevel: 5, wudaoCost: [40, 80, 160, 320, 640],
    passive: { type: 'coinPercent', perLevel: 5 },
    active: { desc: '金币获取翻倍', buffType: 'coinPercent', buffValue: 100, durationSec: 300, cooldownSec: 1200 },
  },
  {
    id: 'fashen', name: '法天象地', icon: '🗡️', desc: '巨灵之力，攻击大幅提升',
    maxLevel: 5, wudaoCost: [60, 120, 240, 480, 960],
    passive: { type: 'atkPercent', perLevel: 4 },
    active: { desc: '攻击力暴增', buffType: 'atkPercent', buffValue: 40, durationSec: 120, cooldownSec: 600 },
  },
  {
    id: 'dunguang', name: '遁光术', icon: '✨', desc: '修炼有道，修为速度提升',
    maxLevel: 5, wudaoCost: [60, 120, 240, 480, 960],
    passive: { type: 'xiuweiPercent', perLevel: 5 },
    active: { desc: '修为获取翻倍', buffType: 'xiuweiPercent', buffValue: 100, durationSec: 300, cooldownSec: 1200 },
  },
];

export function getSkillDef(id: string): SkillDef | undefined {
  return SKILLS.find(s => s.id === id);
}

export interface SkillInstance {
  level: number;
  cooldownEnd: number; // timestamp, 0=可用
}

/** 计算所有神通被动buff */
export function calcSkillPassiveBuffs(instances: Record<string, SkillInstance>): Record<string, number> {
  const buffs: Record<string, number> = {};
  for (const def of SKILLS) {
    const inst = instances[def.id];
    if (!inst || inst.level < 1) continue;
    const key = def.passive.type;
    buffs[key] = (buffs[key] ?? 0) + def.passive.perLevel * inst.level;
  }
  return buffs;
}

/** 计算当前激活的主动buff (检查时间) */
export interface ActiveBuff {
  type: string;
  value: number;
  expiresAt: number;
}

export function calcActiveBuffs(activeBuffs: ActiveBuff[], now: number): Record<string, number> {
  const buffs: Record<string, number> = {};
  for (const ab of activeBuffs) {
    if (now < ab.expiresAt) {
      buffs[ab.type] = (buffs[ab.type] ?? 0) + ab.value;
    }
  }
  return buffs;
}
