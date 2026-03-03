/**
 * v2.0 Character Types
 */

export interface CharacterDef {
  id: string;
  name: string;
  icon: string;
  role: 'leader' | 'dps' | 'tank' | 'support' | 'mount';
  description: string;
  passiveSkill: { name: string; description: string; effect: Record<string, number> };
  baseStats: {
    attack: number;
    defense: number;
    hp: number;
    speed: number;
    critRate: number;
    critDmg: number;
  };
  skillTreePaths: string[]; // 3 paths per character
}

export interface SkillDef {
  id: string;
  name: string;
  icon: string;
  path: string;
  tier: number; // 1-5
  maxLevel: number;
  prerequisite?: string;
  effects: Record<string, number>; // per level
  description: string;
}
