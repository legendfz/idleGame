// v55.0 万劫轮回 - Roguelike Trial System

export interface TrialModifier {
  id: string;
  name: string;
  emoji: string;
  description: string;
  effect: {
    atkMult?: number;      // multiply player atk
    hpMult?: number;       // multiply player hp
    enemyAtkMult?: number; // multiply enemy atk
    enemyHpMult?: number;  // multiply enemy hp
    goldMult?: number;     // multiply gold gain
    expMult?: number;      // multiply exp gain
    critBonus?: number;    // add crit rate
    dropBonus?: number;    // add drop rate mult
  };
  rarity: 'blessing' | 'curse' | 'neutral';
}

export const TRIAL_MODIFIERS: TrialModifier[] = [
  // Blessings (positive)
  { id: 'iron_body', name: '金刚体', emoji: '🛡️', description: '生命+50%', effect: { hpMult: 1.5 }, rarity: 'blessing' },
  { id: 'rage', name: '狂怒', emoji: '🔥', description: '攻击+40%', effect: { atkMult: 1.4 }, rarity: 'blessing' },
  { id: 'fortune', name: '财运亨通', emoji: '💰', description: '灵石+100%', effect: { goldMult: 2.0 }, rarity: 'blessing' },
  { id: 'insight', name: '顿悟', emoji: '📖', description: '经验+80%', effect: { expMult: 1.8 }, rarity: 'blessing' },
  { id: 'eagle_eye', name: '鹰眼', emoji: '🦅', description: '暴击+15%', effect: { critBonus: 15 }, rarity: 'blessing' },
  { id: 'treasure_hunt', name: '寻宝', emoji: '🗝️', description: '掉率+50%', effect: { dropBonus: 0.5 }, rarity: 'blessing' },
  // Curses (negative but more rewards)
  { id: 'fragile', name: '脆弱', emoji: '💔', description: '生命-30%，灵石+60%', effect: { hpMult: 0.7, goldMult: 1.6 }, rarity: 'curse' },
  { id: 'weak', name: '虚弱', emoji: '😵', description: '攻击-25%，经验+50%', effect: { atkMult: 0.75, expMult: 1.5 }, rarity: 'curse' },
  { id: 'berserk_enemy', name: '敌方狂暴', emoji: '👹', description: '敌人攻击+60%，掉率+80%', effect: { enemyAtkMult: 1.6, dropBonus: 0.8 }, rarity: 'curse' },
  { id: 'tank_enemy', name: '敌方坚韧', emoji: '🪨', description: '敌人血量+80%，灵石+100%', effect: { enemyHpMult: 1.8, goldMult: 2.0 }, rarity: 'curse' },
  // Neutral (tradeoffs)
  { id: 'glass_cannon', name: '玻璃大炮', emoji: '💎', description: '攻击+80%，生命-50%', effect: { atkMult: 1.8, hpMult: 0.5 }, rarity: 'neutral' },
  { id: 'slow_steady', name: '稳扎稳打', emoji: '🐢', description: '生命+100%，攻击-30%', effect: { hpMult: 2.0, atkMult: 0.7 }, rarity: 'neutral' },
];

export interface TrialFloor {
  floor: number;
  enemyCount: number;      // enemies to defeat
  bossFloor: boolean;       // every 5th floor
  modifierChoices: number;  // how many modifiers to choose from
}

export function generateFloor(floor: number): TrialFloor {
  return {
    floor,
    enemyCount: 3 + Math.floor(floor * 0.5),
    bossFloor: floor % 5 === 0,
    modifierChoices: floor === 1 ? 0 : 3, // first floor no choice, then pick 1 of 3
  };
}

// Rewards scale with floor reached
export function calcTrialRewards(maxFloor: number, playerLevel: number) {
  const base = Math.max(500, playerLevel * 100);
  return {
    lingshi: Math.floor(base * maxFloor * 0.5),
    exp: Math.floor(base * maxFloor * 0.3),
    pantao: Math.floor(maxFloor / 3),
    hongmengShards: Math.floor(maxFloor / 5),
    trialTokens: maxFloor, // new currency for trial shop
  };
}

// Trial Shop items bought with trialTokens
export interface TrialShopItem {
  id: string;
  name: string;
  emoji: string;
  description: string;
  cost: number;
  effect: { type: string; value: number };
}

export const TRIAL_SHOP: TrialShopItem[] = [
  { id: 'trial_atk', name: '试炼·攻击', emoji: '⚔️', description: '永久攻击+2%', cost: 10, effect: { type: 'atkPercent', value: 0.02 } },
  { id: 'trial_hp', name: '试炼·生命', emoji: '❤️', description: '永久生命+2%', cost: 10, effect: { type: 'hpPercent', value: 0.02 } },
  { id: 'trial_crit', name: '试炼·暴击', emoji: '💥', description: '永久暴击+1%', cost: 15, effect: { type: 'critRate', value: 1 } },
  { id: 'trial_gold', name: '试炼·聚财', emoji: '💰', description: '永久灵石+5%', cost: 20, effect: { type: 'goldPercent', value: 0.05 } },
  { id: 'trial_exp', name: '试炼·悟道', emoji: '📖', description: '永久经验+5%', cost: 20, effect: { type: 'expPercent', value: 0.05 } },
  { id: 'trial_drop', name: '试炼·寻宝', emoji: '🗝️', description: '永久掉率+3%', cost: 25, effect: { type: 'dropPercent', value: 0.03 } },
];
