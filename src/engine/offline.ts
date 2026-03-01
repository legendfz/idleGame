/**
 * 离线收益计算
 */

import { useGameStore } from '../store/gameStore';
import { offlineGold, offlineExp, goldPerWave, expPerWave } from './formulas';
import { REALMS } from '../data/realms';

const MAX_OFFLINE_HOURS = 24;

/** 获取离线效率（基础50%，境界提升） */
function getOfflineEfficiency(): number {
  const s = useGameStore.getState();
  let eff = 0.5;
  // 元婴境界（index 5）离线收益×2，但 MVP 只到金丹（index 4）
  // 预留逻辑
  if (s.realmIndex >= 5) eff = 1.0;
  return eff;
}

/** 计算每秒灵石产出（基于最高通关关卡） */
function getGoldPerSecond(): number {
  const s = useGameStore.getState();
  const stage = s.maxStage > 0 ? s.maxStage - 1 : 0;
  // 离线刷最高关的小怪，假设每秒约1波
  return goldPerWave(stage);
}

/** 计算每秒经验产出 */
function getExpPerSecond(): number {
  const s = useGameStore.getState();
  const stage = s.maxStage > 0 ? s.maxStage - 1 : 0;
  return expPerWave(stage);
}

/** 主入口：计算并应用离线收益，显示报告 */
export function processOfflineEarnings(): void {
  const s = useGameStore.getState();
  const now = Date.now();
  const offlineMs = now - s.lastSaveTime;
  const offlineSec = Math.floor(offlineMs / 1000);

  // 少于 60 秒不算离线
  if (offlineSec < 60) {
    s.updateSaveTime();
    return;
  }

  const eff = getOfflineEfficiency();
  const gps = getGoldPerSecond();
  const eps = getExpPerSecond();

  const earnedGold = offlineGold(offlineSec, gps, eff, MAX_OFFLINE_HOURS);
  const earnedExp = offlineExp(offlineSec, eps, eff, MAX_OFFLINE_HOURS);
  const estimatedKills = Math.floor(offlineSec * eff * 0.5); // 粗估

  // 应用收益
  s.addGold(earnedGold);
  s.addExp(earnedExp);
  s.updateSaveTime();

  // 设置离线报告
  s.setOfflineReport({
    show: true,
    duration: Math.min(offlineSec, MAX_OFFLINE_HOURS * 3600),
    gold: earnedGold,
    exp: earnedExp,
    kills: estimatedKills,
  });

  s.addBattleLog(`🌙 离线修炼完成！💰+${earnedGold} ✨+${earnedExp}`);
}
