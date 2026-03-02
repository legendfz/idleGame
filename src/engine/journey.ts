/**
 * JourneyEngine — 取经进度、关卡推进、星级评定、扫荡
 * 基于 TECH-SPEC §5.1, CORE-LOOP-SPEC §2.4
 */
import { bn } from './bignum';
import { initBattle, BattleRuntimeState } from './battle';
import { generateStageLoot, generateSweepLoot } from './loot';
import { EquipmentInstance } from './equipment';

export interface StageRecord {
  stageId: number;
  stars: 0 | 1 | 2 | 3;
  bestTime: number | null;  // ms
  sweepUnlocked: boolean;
  clearCount: number;
}

export interface JourneyState {
  currentStage: number;     // 最高解锁关卡
  stages: Record<number, StageRecord>;
  dailyReset: number;       // 每日重置时间戳
}

export interface SweepResult {
  coins: number;
  exp: number;
  loot: EquipmentInstance[];
}

/**
 * 是否可以进入关卡
 */
export function canEnterStage(stageId: number, journey: JourneyState): boolean {
  return stageId <= journey.currentStage;
}

/**
 * 初始化关卡战斗
 */
export function startStageBattle(stageId: number): BattleRuntimeState {
  // 波次数：前 9 关 3 波，10-27 关 4 波，28+ 关 5 波
  const waves = stageId <= 9 ? 3 : stageId <= 27 ? 4 : 5;
  return initBattle(stageId, waves);
}

/**
 * 完成关卡
 */
export function completeStage(
  stageId: number,
  stars: 1 | 2 | 3,
  timeMs: number,
  journey: JourneyState,
): {
  journey: JourneyState;
  loot: EquipmentInstance[];
  coins: number;
  exp: number;
} {
  const existing = journey.stages[stageId];
  const isFirstClear = !existing || existing.stars === 0;

  const record: StageRecord = {
    stageId,
    stars: Math.max(stars, existing?.stars ?? 0) as 0 | 1 | 2 | 3,
    bestTime: existing?.bestTime != null ? Math.min(timeMs, existing.bestTime) : timeMs,
    sweepUnlocked: (existing?.sweepUnlocked || false) || stars >= 3,
    clearCount: (existing?.clearCount ?? 0) + 1,
  };

  const newJourney: JourneyState = {
    ...journey,
    currentStage: Math.max(journey.currentStage, stageId + 1),
    stages: { ...journey.stages, [stageId]: record },
  };

  // 掉落
  const loot = generateStageLoot(stageId, stars, isFirstClear);

  // 金币奖励（基于关卡级别）
  const baseCoins = stageId * 100 * (isFirstClear ? 5 : 1);
  const coins = Math.floor(baseCoins * (1 + (stars - 1) * 0.2));

  // 经验奖励
  const exp = Math.floor(stageId * 50 * (1 + (stars - 1) * 0.15));

  return { journey: newJourney, loot, coins, exp };
}

/**
 * 是否可以扫荡
 */
export function canSweep(stageId: number, journey: JourneyState): boolean {
  const record = journey.stages[stageId];
  return !!record && record.sweepUnlocked;
}

/**
 * 扫荡关卡
 */
export function doSweep(stageId: number): SweepResult {
  const loot = generateSweepLoot(stageId);
  const coins = stageId * 80;
  const exp = stageId * 40;
  return { coins, exp, loot };
}

/**
 * 创建初始 Journey 状态
 */
export function createInitialJourney(): JourneyState {
  return {
    currentStage: 1,
    stages: {},
    dailyReset: Date.now(),
  };
}
