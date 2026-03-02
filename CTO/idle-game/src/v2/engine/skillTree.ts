/**
 * v2.0 Skill Tree Engine — placeholder
 */

import { CharacterState } from '../types';
import { SkillDef } from '../types/character';
import { getSkillsByPath } from '../data/skills';

export function canLearnSkill(char: CharacterState, skill: SkillDef): boolean {
  if (char.skillPoints <= 0) return false;
  const currentLevel = char.skills[skill.id] ?? 0;
  if (currentLevel >= skill.maxLevel) return false;
  if (skill.prerequisite && (char.skills[skill.prerequisite] ?? 0) < 1) return false;
  return true;
}

export function learnSkill(char: CharacterState, skillId: string): CharacterState {
  // TODO: validate and apply
  return {
    ...char,
    skillPoints: char.skillPoints - 1,
    skills: { ...char.skills, [skillId]: (char.skills[skillId] ?? 0) + 1 },
  };
}
