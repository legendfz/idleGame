/**
 * 怪物数据 — 由公式动态生成
 */

import { bossHp, minionHp, enemyDefense, goldPerWave, expPerWave } from '../engine/formulas';

export interface Monster {
  name: string;
  hp: number;
  maxHp: number;
  defense: number;
  isBoss: boolean;
  goldReward: number;
  expReward: number;
}

/** Boss 名称池（按章节） */
const BOSS_NAMES: string[][] = [
  // 第1章 花果山
  ['灰狼精', '独角鬼王', '混世魔王', '虎先锋', '黑风怪'],
  // 第2章 方寸山
  ['蛇盘山妖', '黄风大王', '白毛鼠精', '金角大仙', '银角大仙'],
  // 第3章 龙宫
  ['虾兵', '蟹将', '龙太子', '鼍龙怪', '龙王三太子'],
];

/** 小怪名称池 */
const MINION_NAMES = [
  '小妖', '妖卒', '鬼兵', '狼妖', '蛇妖',
  '蝎精', '蜈蚣精', '蝙蝠精', '树妖', '石怪',
];

/** 生成 Boss */
export function createBoss(stageIndex: number): Monster {
  const chapterIdx = stageIndex < 50 ? 0 : stageIndex < 130 ? 1 : 2;
  const names = BOSS_NAMES[chapterIdx] || BOSS_NAMES[0];
  const name = names[stageIndex % names.length];
  const hp = bossHp(stageIndex);
  return {
    name,
    hp,
    maxHp: hp,
    defense: enemyDefense(stageIndex),
    isBoss: true,
    goldReward: goldPerWave(stageIndex) * 5,
    expReward: expPerWave(stageIndex) * 5,
  };
}

/** 生成小怪 */
export function createMinion(stageIndex: number, waveIndex: number): Monster {
  const name = MINION_NAMES[(stageIndex + waveIndex) % MINION_NAMES.length];
  const hp = minionHp(stageIndex);
  return {
    name,
    hp,
    maxHp: hp,
    defense: Math.floor(enemyDefense(stageIndex) * 0.5),
    isBoss: false,
    goldReward: goldPerWave(stageIndex),
    expReward: expPerWave(stageIndex),
  };
}
