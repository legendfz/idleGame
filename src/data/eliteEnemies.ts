/**
 * v151.0「精英降临」— Elite Enemy System
 * 
 * 2% chance per enemy spawn to become Elite with:
 * - Random prefix modifier (8 types)
 * - 3x HP, 1.5x ATK, 2x rewards
 * - Guaranteed equipment drop on kill
 * - Special visual indicator in battle
 */

export interface EliteModifier {
  id: string;
  name: string;
  emoji: string;
  hpMul: number;
  atkMul: number;
  rewardMul: number;
  color: string;
}

export const ELITE_MODIFIERS: EliteModifier[] = [
  { id: 'iron', name: '铁壁', emoji: '🛡️', hpMul: 5, atkMul: 1.2, rewardMul: 2.5, color: '#8B8B8B' },
  { id: 'fury', name: '狂暴', emoji: '🔥', hpMul: 2, atkMul: 2.5, rewardMul: 3, color: '#FF4444' },
  { id: 'swift', name: '疾风', emoji: '💨', hpMul: 2.5, atkMul: 1.8, rewardMul: 2.5, color: '#44FF88' },
  { id: 'venom', name: '剧毒', emoji: '☠️', hpMul: 3, atkMul: 2, rewardMul: 3, color: '#88FF44' },
  { id: 'frost', name: '寒冰', emoji: '❄️', hpMul: 3.5, atkMul: 1.5, rewardMul: 2.5, color: '#44CCFF' },
  { id: 'shadow', name: '暗影', emoji: '🌑', hpMul: 2.5, atkMul: 2.2, rewardMul: 3.5, color: '#9944FF' },
  { id: 'holy', name: '圣光', emoji: '✨', hpMul: 4, atkMul: 1.8, rewardMul: 4, color: '#FFD700' },
  { id: 'chaos', name: '混沌', emoji: '🌀', hpMul: 6, atkMul: 2.5, rewardMul: 5, color: '#FF44FF' },
];

/** Roll whether an enemy becomes elite. Returns modifier or null. */
export function rollElite(playerLevel: number): EliteModifier | null {
  // Base 2% chance, increases slightly with level
  const chance = Math.min(0.05, 0.02 + playerLevel * 0.00002);
  if (Math.random() >= chance) return null;
  
  // Higher level = can encounter rarer elites
  let pool = ELITE_MODIFIERS.slice(0, 4); // first 4 always available
  if (playerLevel >= 100) pool = ELITE_MODIFIERS.slice(0, 6);
  if (playerLevel >= 300) pool = ELITE_MODIFIERS.slice(0, 7);
  if (playerLevel >= 500) pool = ELITE_MODIFIERS;
  
  return pool[Math.floor(Math.random() * pool.length)];
}
