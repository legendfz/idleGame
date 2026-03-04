/**
 * v2.0 Character Definitions
 */

import { CharacterDef } from '../types/character';

export const CHARACTERS: CharacterDef[] = [
  {
    id: 'tangseng',
    name: '唐僧',
    icon: '[僧]',
    role: 'leader',
    description: '取经团队领袖，诵经增益全队',
    passiveSkill: { name: '诵经祈福', description: '全队修炼速度 +15%', effect: { cultivationRate: 0.15 } },
    baseStats: { attack: 5, defense: 8, hp: 100, speed: 1, critRate: 2, critDmg: 1.2 },
    skillTreePaths: ['holy', 'wisdom', 'leader'],
  },
  {
    id: 'wukong',
    name: '孙悟空',
    icon: '[猴]',
    role: 'dps',
    description: '齐天大圣，七十二变，高爆发',
    passiveSkill: { name: '战斗本能', description: '暴击率 +10%，暴击伤害 +50%', effect: { critRate: 10, critDmg: 0.5 } },
    baseStats: { attack: 15, defense: 5, hp: 80, speed: 1.2, critRate: 10, critDmg: 1.5 },
    skillTreePaths: ['combat', 'transform', 'cultivate'],
  },
  {
    id: 'bajie',
    name: '猪八戒',
    icon: '[猪]',
    role: 'tank',
    description: '天蓬元帅，食量大，资源采集强',
    passiveSkill: { name: '贪吃鬼', description: '金币掉落 +25%', effect: { goldBonus: 0.25 } },
    baseStats: { attack: 8, defense: 12, hp: 150, speed: 0.8, critRate: 3, critDmg: 1.3 },
    skillTreePaths: ['strength', 'appetite', 'heavenly'],
  },
  {
    id: 'wujing',
    name: '沙悟净',
    icon: '[沙]',
    role: 'support',
    description: '卷帘大将，稳重可靠',
    passiveSkill: { name: '负重前行', description: '背包容量 +50%', effect: { inventoryBonus: 0.5 } },
    baseStats: { attack: 10, defense: 10, hp: 120, speed: 0.9, critRate: 5, critDmg: 1.3 },
    skillTreePaths: ['defense', 'support', 'river'],
  },
  {
    id: 'bailongma',
    name: '白龙马',
    icon: '[马]',
    role: 'mount',
    description: '西海龙太子，赶路加速',
    passiveSkill: { name: '龙行千里', description: '取经进度推进速度 +20%', effect: { journeySpeed: 0.2 } },
    baseStats: { attack: 7, defense: 7, hp: 90, speed: 1.5, critRate: 4, critDmg: 1.2 },
    skillTreePaths: ['dragon', 'speed', 'ocean'],
  },
];

export function getCharacterDef(id: string): CharacterDef | undefined {
  return CHARACTERS.find(c => c.id === id);
}
