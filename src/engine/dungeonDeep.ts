/**
 * DungeonDeep — 深层秘境: 100层 + 词缀 + 扫荡
 */
import Decimal from 'break_infinity.js';
import { bn } from './bignum';
import { bossHp } from './formulas';

// === 词缀系统 ===
export type AffixType = 'tough' | 'swift' | 'vampiric' | 'explosive' | 'shielded' | 'enraged';

export interface Affix {
  type: AffixType;
  name: string;
  icon: string;
  desc: string;
  hpMul: number;   // HP倍率
  dmgMul: number;  // 伤害倍率
  rewardMul: number; // 奖励倍率
}

export const AFFIXES: Record<AffixType, Affix> = {
  tough:     { type: 'tough',     name: '坚韧', icon: '🛡️', desc: 'HP+50%', hpMul: 1.5, dmgMul: 1, rewardMul: 1.2 },
  swift:     { type: 'swift',     name: '迅捷', icon: '⚡', desc: '伤害+30%', hpMul: 1, dmgMul: 1.3, rewardMul: 1.15 },
  vampiric:  { type: 'vampiric',  name: '嗜血', icon: '🩸', desc: 'HP+30%,伤害+20%', hpMul: 1.3, dmgMul: 1.2, rewardMul: 1.3 },
  explosive: { type: 'explosive', name: '狂暴', icon: '💥', desc: '伤害+60%,HP-20%', hpMul: 0.8, dmgMul: 1.6, rewardMul: 1.25 },
  shielded:  { type: 'shielded',  name: '护盾', icon: '🔰', desc: 'HP+80%', hpMul: 1.8, dmgMul: 1, rewardMul: 1.4 },
  enraged:   { type: 'enraged',   name: '暴怒', icon: '😡', desc: 'HP+40%,伤害+40%', hpMul: 1.4, dmgMul: 1.4, rewardMul: 1.5 },
};

const AFFIX_KEYS = Object.keys(AFFIXES) as AffixType[];

/**
 * 生成层词缀 (层10+开始有词缀, 层越高词缀越多)
 */
export function generateAffixes(layer: number): AffixType[] {
  if (layer < 10) return [];
  const count = layer >= 80 ? 3 : layer >= 50 ? 2 : 1;
  const shuffled = [...AFFIX_KEYS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

/**
 * 层HP = baseHP × 1.15^layer × 词缀HP倍率
 */
export function layerBossHp(layer: number, affixes: AffixType[]): Decimal {
  const base = bossHp(Math.min(layer, 81));
  const scaling = Math.pow(1.15, layer);
  let hpMul = 1;
  for (const a of affixes) hpMul *= AFFIXES[a].hpMul;
  return base.mul(scaling).mul(hpMul);
}

/**
 * 判定是否Boss层
 */
export function isBossLayer(layer: number): boolean {
  return layer % 10 === 0;
}

/**
 * 扫荡奖励 (已通关层的平均奖励)
 */
export function calcSweepRewards(layers: number): { coins: number; materials: number } {
  const coins = layers * 50;
  const materials = Math.floor(layers * 0.3);
  return { coins, materials };
}

export interface DeepDungeonState {
  highestLayer: number; // 最高通关层
  currentLayer: number;
}

export function createDeepDungeonState(): DeepDungeonState {
  return { highestLayer: 0, currentLayer: 1 };
}
