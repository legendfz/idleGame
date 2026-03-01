/**
 * 游戏主循环 — 每秒 tick
 * 驱动自动战斗、资源累积、自动存档
 */

import { useGameStore } from '../store/gameStore';
import { ensureEnemy, autoAttack, handleEnemyDeath } from './battle';
import { checkLevelUp } from './growth';

let tickCount = 0;
let intervalId: ReturnType<typeof setInterval> | null = null;

/** 单次 tick */
export function gameTick(): void {
  tickCount++;
  const s = useGameStore.getState();

  // 1. 确保有敌人
  ensureEnemy();

  // 2. 自动攻击
  autoAttack();

  // 3. 检查敌人死亡 → 结算 + 推进
  handleEnemyDeath();

  // 4. 再次确保有敌人（死亡后立刻生成下一个）
  ensureEnemy();

  // 5. 检查升级
  checkLevelUp();

  // 6. 每 30 秒自动存档
  if (tickCount % 30 === 0) {
    useGameStore.getState().updateSaveTime();
  }
}

/** 启动游戏循环 */
export function startGameLoop(): void {
  if (intervalId) return;
  intervalId = setInterval(gameTick, 1000);
}

/** 停止游戏循环 */
export function stopGameLoop(): void {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
}

/** 获取 tick 计数 */
export function getTickCount(): number {
  return tickCount;
}
