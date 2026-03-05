// v52.0「神通广大」— 主动技能系统

export interface ActiveSkill {
  id: string;
  name: string;
  emoji: string;
  description: string;
  unlockLevel: number;
  cooldown: number;   // seconds
  duration: number;    // seconds (0 = instant)
  effect: SkillEffect;
}

export interface SkillEffect {
  type: 'shield' | 'attackBuff' | 'instantKill' | 'goldRain' | 'expSurge';
  value: number; // multiplier or flat amount
}

export const ACTIVE_SKILLS: ActiveSkill[] = [
  {
    id: 'jingang',
    name: '金刚不坏',
    emoji: '🛡️',
    description: '破防：8秒内无视敌人防御',
    unlockLevel: 20,
    cooldown: 45,
    duration: 8,
    effect: { type: 'shield', value: 1 },
  },
  {
    id: 'qishier',
    name: '七十二变',
    emoji: '🔥',
    description: '3倍攻击力持续12秒',
    unlockLevel: 50,
    cooldown: 60,
    duration: 12,
    effect: { type: 'attackBuff', value: 3 },
  },
  {
    id: 'jindouyun',
    name: '筋斗云',
    emoji: '☁️',
    description: '瞬杀当前敌人，获得双倍奖励',
    unlockLevel: 100,
    cooldown: 120,
    duration: 0,
    effect: { type: 'instantKill', value: 2 },
  },
];
