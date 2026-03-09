// v175.0 五行之力 — Wuxing Elemental System
// 五行相克：金克木，木克土，土克水，水克火，火克金

export type ElementType = 'metal' | 'wood' | 'water' | 'fire' | 'earth';

export interface ElementInfo {
  id: ElementType;
  name: string;
  emoji: string;
  color: string;
  beats: ElementType;   // this element beats (克)
  losesTo: ElementType;  // this element loses to (被克)
}

export const ELEMENTS: Record<ElementType, ElementInfo> = {
  metal: { id: 'metal', name: '金', emoji: '⚔️', color: '#FFD700', beats: 'wood', losesTo: 'fire' },
  wood:  { id: 'wood',  name: '木', emoji: '🌿', color: '#4CAF50', beats: 'earth', losesTo: 'metal' },
  water: { id: 'water', name: '水', emoji: '💧', color: '#42A5F5', beats: 'fire', losesTo: 'earth' },
  fire:  { id: 'fire',  name: '火', emoji: '🔥', color: '#FF5722', beats: 'metal', losesTo: 'water' },
  earth: { id: 'earth', name: '土', emoji: '🪨', color: '#8D6E63', beats: 'water', losesTo: 'wood' },
};

export const ELEMENT_LIST: ElementType[] = ['metal', 'wood', 'water', 'fire', 'earth'];

// Damage multipliers
export const ELEMENT_ADVANTAGE = 1.3;    // 克制 +30% damage
export const ELEMENT_DISADVANTAGE = 0.75; // 被克 -25% damage

// Assign element to enemy based on chapter + name hash
export function getEnemyElement(chapterId: number, enemyName: string): ElementType {
  // Deterministic: hash name + chapter
  let hash = chapterId * 31;
  for (let i = 0; i < enemyName.length; i++) {
    hash = ((hash << 5) - hash + enemyName.charCodeAt(i)) | 0;
  }
  return ELEMENT_LIST[((hash % 5) + 5) % 5];
}

// Get element damage multiplier: attacker element vs defender element
export function getElementMultiplier(attackerElement: ElementType | undefined, defenderElement: ElementType | undefined): number {
  if (!attackerElement || !defenderElement) return 1;
  const info = ELEMENTS[attackerElement];
  if (info.beats === defenderElement) return ELEMENT_ADVANTAGE;
  if (info.losesTo === defenderElement) return ELEMENT_DISADVANTAGE;
  return 1;
}

// Random element for equipment drops, weighted by chapter
export function rollEquipmentElement(chapterId: number): ElementType | undefined {
  // 40% chance to have an element (higher chapters = higher chance)
  const chance = Math.min(0.6, 0.2 + chapterId * 0.05);
  if (Math.random() > chance) return undefined;
  return ELEMENT_LIST[Math.floor(Math.random() * 5)];
}
