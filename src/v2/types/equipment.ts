/**
 * v2.0 Equipment Types
 */

import { EquipSlotV2, Quality } from './game';

export interface EquipPassiveV2 {
  type: 'critRate' | 'critDmg' | 'speed' | 'clickPower' | 'goldBonus' | 'xpBonus' | 'offlineEff';
  value: number;
  description: string;
}

export interface EquipTemplateV2 {
  id: string;
  name: string;
  icon: string;
  slot: EquipSlotV2;
  quality: Quality;
  baseStats: Partial<Record<'attack' | 'defense' | 'hp' | 'speed' | 'critRate' | 'critDmg', number>>;
  passive?: EquipPassiveV2;
  setId?: string;
  dropSource: { type: 'stage'; stageMin: number } | { type: 'alchemy' } | { type: 'boss'; bossId: string };
}

export interface EquipInstanceV2 {
  uid: string;
  templateId: string;
  enhanceLevel: number;
  refineLevel: number;
  quality: Quality;
}

export interface EquipSetV2 {
  id: string;
  name: string;
  pieces: string[];
  bonuses: { count: number; description: string; effects: Record<string, number> }[];
}
