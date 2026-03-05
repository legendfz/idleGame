/**
 * v71.0 装备共鸣系统
 * 三件同品质装备触发共鸣加成
 */

import { Quality, EquipmentItem } from '../types';

export interface ResonanceBonus {
  quality: Quality;
  name: string;
  atkPct: number;
  hpPct: number;
  critRate: number;
  critDmg: number;
  description: string;
}

export const RESONANCE_BONUSES: ResonanceBonus[] = [
  { quality: 'common', name: '凡品共鸣', atkPct: 5, hpPct: 5, critRate: 0, critDmg: 0, description: '攻击+5% 生命+5%' },
  { quality: 'spirit', name: '灵品共鸣', atkPct: 10, hpPct: 10, critRate: 2, critDmg: 0, description: '攻击+10% 生命+10% 暴击+2%' },
  { quality: 'immortal', name: '仙品共鸣', atkPct: 15, hpPct: 15, critRate: 5, critDmg: 0.2, description: '攻击+15% 生命+15% 暴击+5% 暴伤+20%' },
  { quality: 'divine', name: '神品共鸣', atkPct: 25, hpPct: 25, critRate: 8, critDmg: 0.5, description: '攻击+25% 生命+25% 暴击+8% 暴伤+50%' },
  { quality: 'legendary', name: '传说共鸣', atkPct: 40, hpPct: 40, critRate: 12, critDmg: 0.8, description: '攻击+40% 生命+40% 暴击+12% 暴伤+80%' },
  { quality: 'mythic', name: '鸿蒙共鸣', atkPct: 60, hpPct: 60, critRate: 15, critDmg: 1.0, description: '攻击+60% 生命+60% 暴击+15% 暴伤+100%' },
];

/**
 * Check if all 3 equipped items share the same quality
 * Returns the resonance bonus or null
 */
export function getResonanceBonus(
  weapon: EquipmentItem | null,
  armor: EquipmentItem | null,
  treasure: EquipmentItem | null,
): ResonanceBonus | null {
  if (!weapon || !armor || !treasure) return null;
  if (weapon.quality !== armor.quality || armor.quality !== treasure.quality) return null;
  return RESONANCE_BONUSES.find(r => r.quality === weapon.quality) || null;
}
