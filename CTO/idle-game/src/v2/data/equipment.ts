/**
 * v2.0 Equipment Data — placeholder templates
 */

import { EquipTemplateV2, EquipSetV2 } from '../types/equipment';

export const EQUIPMENT_TEMPLATES_V2: EquipTemplateV2[] = [
  // Weapons
  { id: 'wooden_staff', name: '木杖', icon: '🪵', slot: 'weapon', quality: 'common',
    baseStats: { attack: 10 }, dropSource: { type: 'stage', stageMin: 1 } },
  { id: 'iron_rod', name: '铁棒', icon: '🔩', slot: 'weapon', quality: 'spirit',
    baseStats: { attack: 30, critRate: 3 }, dropSource: { type: 'stage', stageMin: 3 } },
  { id: 'jingu_bang', name: '如意金箍棒', icon: '🏮', slot: 'weapon', quality: 'divine',
    baseStats: { attack: 200, critDmg: 0.5 }, setId: 'wukong', dropSource: { type: 'boss', bossId: 'lingshan' } },

  // Headgear
  { id: 'cloth_hat', name: '布帽', icon: '🧢', slot: 'headgear', quality: 'common',
    baseStats: { defense: 5, hp: 20 }, dropSource: { type: 'stage', stageMin: 1 } },
  { id: 'jingu_quan', name: '紧箍咒', icon: '👑', slot: 'headgear', quality: 'immortal',
    baseStats: { defense: 30, hp: 100 }, setId: 'wukong', dropSource: { type: 'stage', stageMin: 5 } },

  // Armor
  { id: 'cloth_robe', name: '布衣', icon: '👘', slot: 'armor', quality: 'common',
    baseStats: { defense: 8, hp: 30 }, dropSource: { type: 'stage', stageMin: 1 } },
  { id: 'golden_mail', name: '锁子黄金甲', icon: '✨', slot: 'armor', quality: 'divine',
    baseStats: { defense: 80, hp: 500 }, setId: 'wukong', dropSource: { type: 'stage', stageMin: 7 } },

  // Accessory
  { id: 'wooden_beads', name: '木珠', icon: '📿', slot: 'accessory', quality: 'common',
    baseStats: { hp: 15 }, dropSource: { type: 'stage', stageMin: 1 } },

  // Mount
  { id: 'old_horse', name: '老马', icon: '🐎', slot: 'mount', quality: 'common',
    baseStats: { speed: 0.1 }, dropSource: { type: 'stage', stageMin: 1 } },
  { id: 'bailong', name: '白龙马', icon: '🐴', slot: 'mount', quality: 'immortal',
    baseStats: { speed: 0.3 }, dropSource: { type: 'boss', bossId: 'yingchoujian' } },

  // Treasure
  { id: 'copper_mirror', name: '铜镜', icon: '🪞', slot: 'treasure', quality: 'common',
    baseStats: { critRate: 2 }, dropSource: { type: 'stage', stageMin: 2 } },
  { id: 'fire_eyes', name: '火眼金睛', icon: '👁️', slot: 'treasure', quality: 'immortal',
    baseStats: { critRate: 15 }, setId: 'wukong', dropSource: { type: 'stage', stageMin: 5 } },
];

export const EQUIP_SETS_V2: EquipSetV2[] = [
  {
    id: 'wukong', name: '齐天大圣套装', pieces: ['jingu_bang', 'jingu_quan', 'golden_mail', 'fire_eyes'],
    bonuses: [
      { count: 2, description: '攻击+30%，暴击+10%', effects: { attack: 0.3, critRate: 10 } },
      { count: 4, description: '全属性+80%', effects: { attack: 0.8, defense: 0.8, hp: 0.8 } },
    ],
  },
];

export function getEquipTemplate(id: string): EquipTemplateV2 | undefined {
  return EQUIPMENT_TEMPLATES_V2.find(e => e.id === id);
}
