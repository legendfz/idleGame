/**
 * v2.0 Skill Tree Data — placeholder
 */

import { SkillDef } from '../types/character';

export const SKILLS: SkillDef[] = [
  // Wukong — Combat path
  { id: 'wk_combat_1', name: '棒法精通', icon: '[灯]', path: 'combat', tier: 1, maxLevel: 5,
    effects: { attack: 0.05 }, description: '攻击力每级+5%' },
  { id: 'wk_combat_2', name: '火眼金睛', icon: '[目]', path: 'combat', tier: 2, maxLevel: 5,
    prerequisite: 'wk_combat_1', effects: { critRate: 2 }, description: '暴击率每级+2%' },
  { id: 'wk_combat_3', name: '大闹天宫', icon: '[电]', path: 'combat', tier: 3, maxLevel: 3,
    prerequisite: 'wk_combat_2', effects: { attack: 0.15 }, description: '攻击力每级+15%' },

  // Wukong — Transform path
  { id: 'wk_transform_1', name: '七十二变', icon: '[变]', path: 'transform', tier: 1, maxLevel: 5,
    effects: { speed: 0.05 }, description: '攻速每级+5%' },

  // Wukong — Cultivate path
  { id: 'wk_cultivate_1', name: '仙丹体质', icon: '[丹]', path: 'cultivate', tier: 1, maxLevel: 5,
    effects: { hp: 0.08 }, description: '生命每级+8%' },
];

export function getSkillsByPath(path: string): SkillDef[] {
  return SKILLS.filter(s => s.path === path);
}
