import { EquipmentTemplate, EquipSet, EquipmentItem, Quality, QUALITY_INFO } from '../types';

// === Equipment Templates ===

export const EQUIPMENT_TEMPLATES: EquipmentTemplate[] = [
  // ─── Chapter 1: 花果山 Weapons ───
  { id: 'wooden_stick', name: '木棍', emoji: '[木]', slot: 'weapon', quality: 'common', baseStat: 8, dropFromStage: 1, dropWeight: 30 },
  { id: 'stone_club', name: '石锤', emoji: '[石]', slot: 'weapon', quality: 'common', baseStat: 15, dropFromStage: 10, dropWeight: 25 },
  { id: 'iron_rod', name: '铁棒', emoji: '[铁]', slot: 'weapon', quality: 'spirit', baseStat: 30, dropFromStage: 25, dropWeight: 15,
    passive: { type: 'critRate', value: 3, description: '暴击+3%' } },
  { id: 'wolf_fang', name: '狼牙棒', emoji: '[骨]', slot: 'weapon', quality: 'spirit', baseStat: 45, dropFromStage: 35, dropWeight: 12,
    setId: 'huaguoshan', passive: { type: 'critDmg', value: 0.2, description: '暴伤+20%' } },

  // ─── Chapter 2: 龙宫 Weapons ───
  { id: 'coral_blade', name: '珊瑚刃', emoji: '[珊]', slot: 'weapon', quality: 'spirit', baseStat: 60, dropFromStage: 51, dropWeight: 15 },
  { id: 'trident', name: '三叉戟', emoji: '[叉]', slot: 'weapon', quality: 'immortal', baseStat: 100, dropFromStage: 70, dropWeight: 8,
    passive: { type: 'speed', value: 0.1, description: '攻速+10%' } },
  { id: 'ruyi_jingu', name: '如意金箍棒', emoji: '[灯]', slot: 'weapon', quality: 'divine', baseStat: 200, dropFromStage: 110, dropWeight: 3,
    setId: 'wukong', passive: { type: 'critDmg', value: 0.5, description: '暴伤+50%' } },

  // ─── Chapter 3: 天庭 Weapons ───
  { id: 'heavenly_halberd', name: '天兵戟', emoji: '[战]', slot: 'weapon', quality: 'immortal', baseStat: 180, dropFromStage: 131, dropWeight: 10 },
  { id: 'erlang_blade', name: '三尖两刃刀', emoji: '[刃]', slot: 'weapon', quality: 'divine', baseStat: 350, dropFromStage: 180, dropWeight: 3,
    passive: { type: 'critRate', value: 8, description: '暴击+8%' } },

  // ─── Armor ───
  { id: 'monkey_fur', name: '猴皮甲', emoji: '[猴]', slot: 'armor', quality: 'common', baseStat: 30, dropFromStage: 1, dropWeight: 30 },
  { id: 'leather_vest', name: '兽皮衣', emoji: '[狐]', slot: 'armor', quality: 'common', baseStat: 60, dropFromStage: 15, dropWeight: 25 },
  { id: 'stone_armor', name: '石甲', emoji: '[石]', slot: 'armor', quality: 'spirit', baseStat: 120, dropFromStage: 30, dropWeight: 15,
    setId: 'huaguoshan' },
  { id: 'chain_mail', name: '锁子甲', emoji: '[链]', slot: 'armor', quality: 'spirit', baseStat: 200, dropFromStage: 51, dropWeight: 12 },
  { id: 'dragon_scale', name: '龙鳞铠', emoji: '[龙]', slot: 'armor', quality: 'immortal', baseStat: 400, dropFromStage: 80, dropWeight: 8,
    passive: { type: 'critRate', value: 5, description: '暴击+5%' } },
  { id: 'golden_mail', name: '锁子黄金甲', emoji: '[星]', slot: 'armor', quality: 'divine', baseStat: 800, dropFromStage: 150, dropWeight: 3,
    setId: 'wukong', passive: { type: 'speed', value: 0.15, description: '攻速+15%' } },

  // ─── Treasures (法宝) ───
  { id: 'fire_eyes', name: '火眼金睛', emoji: '[目]', slot: 'treasure', quality: 'immortal', baseStat: 0, dropFromStage: 40, dropWeight: 5,
    setId: 'wukong', passive: { type: 'critRate', value: 15, description: '暴击+15%' } },
  { id: 'cloud', name: '筋斗云', emoji: '[云]', slot: 'treasure', quality: 'immortal', baseStat: 0, dropFromStage: 60, dropWeight: 5,
    passive: { type: 'speed', value: 0.3, description: '攻速+30%' } },
  { id: 'purple_gold_gourd', name: '紫金红葫芦', emoji: '[壶]', slot: 'treasure', quality: 'divine', baseStat: 0, dropFromStage: 90, dropWeight: 3,
    passive: { type: 'lingshiBonus', value: 0.5, description: '灵石+50%' } },
  { id: 'banana_fan', name: '芭蕉扇', emoji: '[扇]', slot: 'treasure', quality: 'divine', baseStat: 0, dropFromStage: 130, dropWeight: 3,
    passive: { type: 'clickPower', value: 50, description: '点击力+50' } },
  { id: 'jingu_needle', name: '定海神针', emoji: '[针]', slot: 'treasure', quality: 'divine', baseStat: 0, dropFromStage: 180, dropWeight: 2,
    passive: { type: 'critDmg', value: 1.0, description: '暴伤+100%' } },

  // ─── v1.1: Legendary (仙品) ───
  { id: 'pangu_axe', name: '盘古斧', emoji: '[斧]', slot: 'weapon', quality: 'legendary', baseStat: 500, dropFromStage: 200, dropWeight: 1,
    setId: 'primordial', passive: { type: 'critRate', value: 20, description: '暴击+20%' } },
  { id: 'nuwa_armor', name: '女娲石甲', emoji: '[钻]', slot: 'armor', quality: 'legendary', baseStat: 1200, dropFromStage: 200, dropWeight: 1,
    setId: 'primordial', passive: { type: 'speed', value: 0.25, description: '攻速+25%' } },
  { id: 'chaos_clock', name: '混沌钟', emoji: '[铃]', slot: 'treasure', quality: 'legendary', baseStat: 0, dropFromStage: 190, dropWeight: 1,
    passive: { type: 'offlineEfficiency', value: 0.3, description: '离线效率+30%' } },

  // ─── v1.1: Mythic (鸿蒙) ───
  { id: 'heavenly_rod', name: '天道之棒', emoji: '[电]', slot: 'weapon', quality: 'mythic', baseStat: 1000, dropFromStage: 210, dropWeight: 0.5,
    setId: 'heavenly', passive: { type: 'critDmg', value: 1.5, description: '暴伤+150%' } },
  { id: 'hongmeng_armor', name: '鸿蒙铠', emoji: '[天]', slot: 'armor', quality: 'mythic', baseStat: 2500, dropFromStage: 210, dropWeight: 0.5,
    setId: 'heavenly', passive: { type: 'critRate', value: 25, description: '暴击+25%' } },
  { id: 'dao_fruit', name: '道果', emoji: '[果]', slot: 'treasure', quality: 'mythic', baseStat: 0, dropFromStage: 210, dropWeight: 0.3,
    passive: { type: 'offlineEfficiency', value: 0.5, description: '离线效率+50%' } },

  // ─── v1.3: Dungeon First-Clear Rewards ───
  { id: 'stone_chain_armor', name: '石中锁链', emoji: '[链]', slot: 'armor', quality: 'common', baseStat: 50, dropFromStage: 999, dropWeight: 0,
    passive: { type: 'critRate', value: 2, description: '防御+20%' } },
  { id: 'white_dragon_scale', name: '白龙之鳞', emoji: '[龙]', slot: 'treasure', quality: 'spirit', baseStat: 0, dropFromStage: 999, dropWeight: 0,
    passive: { type: 'speed', value: 0.15, description: '速度+15%' } },
  { id: 'broken_rake', name: '九齿钉耙·残', emoji: '[叉]', slot: 'weapon', quality: 'spirit', baseStat: 55, dropFromStage: 999, dropWeight: 0,
    passive: { type: 'critDmg', value: 0.25, description: '暴伤+25%' } },
  { id: 'shadow_staff', name: '降妖宝杖·影', emoji: '[杖]', slot: 'weapon', quality: 'immortal', baseStat: 120, dropFromStage: 999, dropWeight: 0,
    passive: { type: 'speed', value: 0.1, description: '攻速+10%' } },
  { id: 'snake_skin_armor', name: '蛇皮甲', emoji: '[蛇]', slot: 'armor', quality: 'spirit', baseStat: 150, dropFromStage: 999, dropWeight: 0 },
  { id: 'wind_eye_amulet', name: '风眼护符', emoji: '[目]', slot: 'treasure', quality: 'immortal', baseStat: 0, dropFromStage: 999, dropWeight: 0,
    passive: { type: 'critRate', value: 8, description: '暴击+8%' } },
  { id: 'banana_fan_shard', name: '芭蕉扇·碎片', emoji: '[扇]', slot: 'treasure', quality: 'divine', baseStat: 0, dropFromStage: 999, dropWeight: 0,
    passive: { type: 'clickPower', value: 30, description: '点击力+30' } },
  { id: 'spider_silk_robe', name: '蛛丝仙衣', emoji: '[网]', slot: 'armor', quality: 'divine', baseStat: 600, dropFromStage: 999, dropWeight: 0,
    passive: { type: 'speed', value: 0.2, description: '攻速+20%' } },
  { id: 'chaos_yinyang_bottle', name: '阴阳瓶', emoji: '[瓶]', slot: 'treasure', quality: 'legendary', baseStat: 0, dropFromStage: 999, dropWeight: 0,
    passive: { type: 'critDmg', value: 0.8, description: '暴伤+80%' } },
  { id: 'hongmeng_diamond_sutra', name: '金刚经', emoji: '[符]', slot: 'treasure', quality: 'mythic', baseStat: 0, dropFromStage: 999, dropWeight: 0,
    passive: { type: 'offlineEfficiency', value: 0.15, description: '全属性+15%' } },
];

// === Equipment Sets ===

export const EQUIP_SETS: EquipSet[] = [
  {
    id: 'huaguoshan',
    name: '花果山套装',
    pieces: ['wolf_fang', 'stone_armor'],
    bonuses: [
      { count: 2, description: '攻击+20%, 血量+20%', effect: { attack: 0.2, maxHp: 0.2 } },
    ],
  },
  {
    id: 'wukong',
    name: '齐天大圣套装',
    pieces: ['ruyi_jingu', 'golden_mail', 'fire_eyes'],
    bonuses: [
      { count: 2, description: '攻击+30%, 暴击+10%', effect: { attack: 0.3, critRate: 10 } },
      { count: 3, description: '全属性+50%', effect: { attack: 0.5, maxHp: 0.5, critRate: 15, critDmg: 0.5 } },
    ],
  },
  {
    id: 'primordial',
    name: '太古套装',
    pieces: ['pangu_axe', 'nuwa_armor'],
    bonuses: [
      { count: 2, description: '全属性+80%, 暴击+15%', effect: { attack: 0.8, maxHp: 0.8, critRate: 15 } },
    ],
  },
  {
    id: 'heavenly',
    name: '天道套装',
    pieces: ['heavenly_rod', 'hongmeng_armor'],
    bonuses: [
      { count: 2, description: '全属性+150%, 暴伤+100%', effect: { attack: 1.5, maxHp: 1.5, critDmg: 1.0 } },
    ],
  },
];

// === Equipment Functions ===

let uidCounter = Date.now();

/** Create an equipment instance from template */
export function createEquipFromTemplate(template: EquipmentTemplate): EquipmentItem {
  return {
    uid: `eq_${uidCounter++}`,
    templateId: template.id,
    name: template.name,
    emoji: template.emoji,
    slot: template.slot,
    quality: template.quality,
    baseStat: template.baseStat,
    level: 0,
    passive: template.passive,
    setId: template.setId,
  };
}

/** Get effective stat: baseStat * qualityMul * (1 + level*0.15) */
export function getEquipEffectiveStat(item: EquipmentItem): number {
  const qMul = QUALITY_INFO[item.quality].multiplier;
  return Math.floor(item.baseStat * qMul * (1 + item.level * 0.15));
}

// ─── Enhancement System ───

/** Max enhance level: mythic(鸿蒙) can go to +15, others +10 */
export const MAX_ENHANCE_LEVEL = 10;
export const MAX_ENHANCE_LEVEL_MYTHIC = 15;

export function getMaxEnhanceLevel(item: EquipmentItem): number {
  return item.quality === 'mythic' ? MAX_ENHANCE_LEVEL_MYTHIC : MAX_ENHANCE_LEVEL;
}

/** Standard enhancement cost (+1~+10): (level+1)^2 * 100 * qualityMul */
export function getEnhanceCost(item: EquipmentItem): number {
  if (item.level >= 10) {
    return getHighEnhanceCost(item);
  }
  const qMul = QUALITY_INFO[item.quality].multiplier;
  return Math.floor(Math.pow(item.level + 1, 2) * 100 * qMul);
}

/** High-tier enhance cost (+11~+15): (level+1)^3 * 200 * qualityMul */
export function getHighEnhanceCost(item: EquipmentItem): number {
  const qMul = QUALITY_INFO[item.quality].multiplier;
  return Math.floor(Math.pow(item.level + 1, 3) * 200 * qMul);
}

/** High-tier success rates */
const HIGH_ENHANCE_RATES: Record<number, number> = {
  11: 50, 12: 40, 13: 30, 14: 20, 15: 10,
};

/** High-tier downgrade levels on failure */
const HIGH_ENHANCE_DROP: Record<number, number> = {
  11: 1, 12: 1, 13: 1, 14: 1, 15: 2,
};

export function getHighEnhanceRate(targetLevel: number): number {
  return HIGH_ENHANCE_RATES[targetLevel] ?? 0;
}

export function getHighEnhanceDrop(targetLevel: number): number {
  return HIGH_ENHANCE_DROP[targetLevel] ?? 1;
}

/** Check if item is in high-enhance territory */
export function isHighEnhance(item: EquipmentItem): boolean {
  return item.quality === 'mythic' && item.level >= 10;
}

// ─── Refine System (legendary→mythic) ───

export const REFINE_MATERIAL_COUNT = 5;
export const REFINE_BASE_RATE = 10; // 10%
export const REFINE_TIANMING_BONUS = 5; // +5%
export const REFINE_SHARD_PITY = 10; // 10 shards = guaranteed

/** Refine cost in lingshi */
export function getRefineCost(item: EquipmentItem): number {
  if (item.baseStat === 0) return 500_000; // 法宝 baseStat=0 floor
  return Math.floor(item.baseStat * 80 * 500);
}

/** Check if item can be refined (must be legendary) */
export function canRefine(item: EquipmentItem): boolean {
  return item.quality === 'legendary';
}

// ─── Hidden Passives for +15 Mythic ───

export interface HiddenPassive {
  slot: 'weapon' | 'armor' | 'treasure';
  name: string;
  description: string;
  /** For weapon: chance of 3x dmg; armor: chance dodge; treasure: cooldown reduction */
  procChance?: number;
  multiplier?: number;
}

export const HIDDEN_PASSIVES: HiddenPassive[] = [
  { slot: 'weapon', name: '鸿蒙一击', description: '攻击有5%概率造成3倍伤害', procChance: 5, multiplier: 3 },
  { slot: 'armor', name: '混沌护盾', description: '受击有10%概率免疫伤害', procChance: 10 },
  { slot: 'treasure', name: '鸿蒙之力', description: '所有技能冷却-25%' },
];

/** Check if item has +15 mythic hidden passive */
export function hasHiddenPassive(item: EquipmentItem): HiddenPassive | null {
  if (item.quality !== 'mythic' || item.level < 15) return null;
  return HIDDEN_PASSIVES.find(p => p.slot === item.slot) ?? null;
}

/** Check if all 3 equipped items are +15 mythic */
export function hasFullMythic15(
  weapon: EquipmentItem | null,
  armor: EquipmentItem | null,
  treasure: EquipmentItem | null,
): boolean {
  return [weapon, armor, treasure].every(
    e => e && e.quality === 'mythic' && e.level >= 15
  );
}

// ─── Scroll Shop Prices ───
export const SCROLL_PRICES = {
  tianming: 50,   // 天命符: 50 蟠桃
  protect: 100,   // 护级符: 100 蟠桃
  lucky: 80,      // 幸运符: 80 蟠桃
};

/** Roll equipment drop from a boss kill at given stage */
export function rollEquipDrop(stageIndex: number, isBoss: boolean): EquipmentTemplate | null {
  // Only bosses drop equipment (with a base chance)
  if (!isBoss) {
    // Small chance for mobs
    if (Math.random() > 0.02) return null;
  }

  const pool = EQUIPMENT_TEMPLATES.filter(e => stageIndex >= e.dropFromStage);
  if (pool.length === 0) return null;

  // Weighted random from pool, biased toward items closer to current stage
  const totalWeight = pool.reduce((sum, e) => sum + e.dropWeight, 0);
  let roll = Math.random() * totalWeight;
  for (const tmpl of pool) {
    roll -= tmpl.dropWeight;
    if (roll <= 0) return tmpl;
  }
  return pool[pool.length - 1];
}

/** Get active set bonuses based on equipped items */
export function getActiveSetBonuses(
  weapon: EquipmentItem | null,
  armor: EquipmentItem | null,
  treasure: EquipmentItem | null
): { set: EquipSet; activeCount: number; bonuses: EquipSet['bonuses'][number][] }[] {
  const equipped = [weapon, armor, treasure].filter(Boolean) as EquipmentItem[];
  const result: { set: EquipSet; activeCount: number; bonuses: EquipSet['bonuses'][number][] }[] = [];

  for (const eqSet of EQUIP_SETS) {
    const count = equipped.filter(e => e.setId === eqSet.id).length;
    if (count >= 2) {
      const activeBonuses = eqSet.bonuses.filter(b => count >= b.count);
      if (activeBonuses.length > 0) {
        result.push({ set: eqSet, activeCount: count, bonuses: activeBonuses });
      }
    }
  }

  return result;
}
