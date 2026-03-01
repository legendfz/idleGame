/**
 * 数值公式集中管理
 * 基于 CPO PRD 数值表
 */

/** 升级所需经验 = floor(10 * level^1.5) */
export function expToNextLevel(level: number): number {
  return Math.floor(10 * Math.pow(level, 1.5));
}

/** 关卡 n 的 Boss HP = floor(100 * 1.15^n) */
export function bossHp(stageIndex: number): number {
  return Math.floor(100 * Math.pow(1.15, stageIndex));
}

/** 小怪 HP = Boss HP × 0.2 */
export function minionHp(stageIndex: number): number {
  return Math.floor(bossHp(stageIndex) * 0.2);
}

/** 关卡 n 每波灵石掉落 = floor(10 * 1.12^n) */
export function goldPerWave(stageIndex: number): number {
  return Math.floor(10 * Math.pow(1.12, stageIndex));
}

/** 每波经验 ≈ 灵石 × 0.7 */
export function expPerWave(stageIndex: number): number {
  return Math.floor(goldPerWave(stageIndex) * 0.7);
}

/** 基础伤害 = 攻击 - 敌人防御（最低 1） */
export function calcDamage(attack: number, defense: number): number {
  return Math.max(1, attack - defense);
}

/** 暴击判定 */
export function rollCrit(critRate: number): boolean {
  return Math.random() * 100 < critRate;
}

/** 暴击伤害 */
export function critDamage(baseDmg: number, critMultiplier: number): number {
  return Math.floor(baseDmg * critMultiplier);
}

/** 敌人防御 ≈ 关卡 × 2 */
export function enemyDefense(stageIndex: number): number {
  return Math.floor(stageIndex * 2);
}

/** 每级获得的基础攻击增长 */
export function attackPerLevel(): number {
  return 3;
}

/** 每级获得的基础血量增长 */
export function hpPerLevel(): number {
  return 10;
}

/** 离线收益计算 */
export function offlineGold(
  offlineSeconds: number,
  goldPerSec: number,
  efficiency: number = 0.5,
  maxOfflineHours: number = 24
): number {
  const cappedSeconds = Math.min(offlineSeconds, maxOfflineHours * 3600);
  return Math.floor(cappedSeconds * goldPerSec * efficiency);
}

export function offlineExp(
  offlineSeconds: number,
  expPerSec: number,
  efficiency: number = 0.5,
  maxOfflineHours: number = 24
): number {
  const cappedSeconds = Math.min(offlineSeconds, maxOfflineHours * 3600);
  return Math.floor(cappedSeconds * expPerSec * efficiency);
}
