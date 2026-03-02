/**
 * DungeonEngine — 秘境/副本系统
 * 限时挑战，每日次数限制，材料奖励
 */
import Decimal from 'break_infinity.js';
import { bn, ZERO } from './bignum';
import { bossHp } from './formulas';
import { eventBus } from './events';

// === Types ===

export interface DungeonConfig {
  id: string;
  name: string;
  icon: string;
  tier: number;
  waves: number;
  bossId: string;
  rewards: { materialId: string; count: number; chance: number }[];
  dailyLimit: number;
  staminaCost: number;
  unlockStage: number;
}

export interface DungeonResult {
  success: boolean;
  rewards: { materialId: string; count: number }[];
  timeUsed: number;
  message: string;
}

export interface DungeonState {
  dailyAttempts: Record<string, number>; // dungeonId -> attempts today
  dailyResetTime: number;
}

// === Engine ===

/**
 * 检查是否可以进入秘境
 */
export function canEnterDungeon(
  dungeon: DungeonConfig,
  currentStage: number,
  dailyAttempts: number,
  stamina: number,
): { ok: boolean; reason?: string } {
  if (currentStage < dungeon.unlockStage) return { ok: false, reason: `需通关第 ${dungeon.unlockStage} 难` };
  if (dailyAttempts >= dungeon.dailyLimit) return { ok: false, reason: `今日次数已用完 (${dungeon.dailyLimit}/${dungeon.dailyLimit})` };
  if (stamina < dungeon.staminaCost) return { ok: false, reason: `体力不足 (需 ${dungeon.staminaCost})` };
  return { ok: true };
}

/**
 * 计算秘境 Boss HP (基于 tier)
 */
export function dungeonBossHp(dungeon: DungeonConfig): Decimal {
  // tier 1=关卡10级 Boss, tier 2=关卡25级, tier 3=关卡40级, tier 4=关卡60级
  const equivalentStage = [0, 10, 25, 40, 60][dungeon.tier] ?? 10;
  return bossHp(equivalentStage);
}

/**
 * 模拟秘境战斗 (简化版: 即时判定)
 * 实际战斗可复用 battle.ts 的 initBattle + tick
 */
export function simulateDungeon(
  dungeon: DungeonConfig,
  playerPower: Decimal,
): DungeonResult {
  const bossHpVal = dungeonBossHp(dungeon);
  const powerRatio = playerPower.div(bossHpVal.div(10)).toNumber();
  const success = powerRatio >= 0.5; // 战力 >= Boss HP/20 即可通关

  if (!success) {
    return { success: false, rewards: [], timeUsed: 0, message: `挑战失败，战力不足` };
  }

  // 结算奖励
  const rewards: { materialId: string; count: number }[] = [];
  for (const r of dungeon.rewards) {
    if (Math.random() < r.chance) {
      rewards.push({ materialId: r.materialId, count: r.count });
    }
  }

  const timeUsed = Math.floor(30 + Math.random() * 60); // 30-90s 模拟

  return {
    success: true,
    rewards,
    timeUsed,
    message: `通关 ${dungeon.name}！`,
  };
}

/**
 * 创建初始秘境状态
 */
export function createDungeonState(): DungeonState {
  return { dailyAttempts: {}, dailyResetTime: Date.now() };
}

/**
 * 检查并重置每日次数
 */
export function checkDailyReset(state: DungeonState): DungeonState {
  const now = Date.now();
  const oneDay = 24 * 3600 * 1000;
  if (now - state.dailyResetTime >= oneDay) {
    return { dailyAttempts: {}, dailyResetTime: now };
  }
  return state;
}
