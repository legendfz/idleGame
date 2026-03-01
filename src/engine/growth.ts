/**
 * 成长系统
 * 经验→升级、属性增长、境界突破
 */

import { useGameStore } from '../store/gameStore';
import { expToNextLevel, attackPerLevel, hpPerLevel } from './formulas';
import { REALMS } from '../data/realms';

/** 检查并执行升级（可能连续升多级） */
export function checkLevelUp(): void {
  const s = useGameStore.getState();
  let { level, exp } = s;
  let totalAtkGain = 0;
  let totalHpGain = 0;
  let leveled = false;

  while (exp >= expToNextLevel(level)) {
    exp -= expToNextLevel(level);
    level++;
    totalAtkGain += attackPerLevel();
    totalHpGain += hpPerLevel();
    leveled = true;
  }

  if (leveled) {
    // 先更新 exp（因为 levelUp 不改 exp）
    useGameStore.setState({ exp });
    s.levelUp(level, totalAtkGain, totalHpGain);
    s.addBattleLog(`⬆️ 升级！Lv.${level} 攻击+${totalAtkGain} 血量+${totalHpGain}`);
  }
}

/** 检查境界突破条件，返回是否可以突破 */
export function canBreakthrough(): boolean {
  const s = useGameStore.getState();
  const nextIdx = s.realmIndex + 1;
  if (nextIdx >= REALMS.length) return false;

  const next = REALMS[nextIdx];
  return s.level >= next.levelReq && s.peaches >= next.peachCost;
}

/** 执行境界突破 */
export function doBreakthrough(): boolean {
  const s = useGameStore.getState();
  const nextIdx = s.realmIndex + 1;
  if (nextIdx >= REALMS.length) return false;

  const next = REALMS[nextIdx];
  if (s.level < next.levelReq || s.peaches < next.peachCost) return false;

  // 消耗蟠桃
  useGameStore.setState({ peaches: s.peaches - next.peachCost });
  s.setRealmIndex(nextIdx);
  s.addBattleLog(`🌟 境界突破！${REALMS[s.realmIndex].name} → ${next.name}`);
  s.addBattleLog(`✨ ${next.unlock} 已解锁！`);

  return true;
}

/** 获取当前境界的属性倍率 */
export function getRealmMultiplier(): number {
  const s = useGameStore.getState();
  return REALMS[s.realmIndex]?.statMultiplier ?? 1;
}

/** 升级属性花费灵石（手动加点） */
export function upgradeAttack(): boolean {
  const s = useGameStore.getState();
  const cost = s.level * 10;
  if (s.gold < cost) return false;

  useGameStore.setState({
    gold: s.gold - cost,
    baseAttack: s.baseAttack + 2,
  });
  s.addBattleLog(`💪 攻击强化 +2（花费 ${cost} 灵石）`);
  return true;
}

export function upgradeHp(): boolean {
  const s = useGameStore.getState();
  const cost = s.level * 8;
  if (s.gold < cost) return false;

  useGameStore.setState({
    gold: s.gold - cost,
    baseHp: s.baseHp + 8,
    maxHp: s.maxHp + 8,
    currentHp: s.currentHp + 8,
  });
  s.addBattleLog(`❤️ 血量强化 +8（花费 ${cost} 灵石）`);
  return true;
}

export function upgradeClickPower(): boolean {
  const s = useGameStore.getState();
  const cost = s.level * 15;
  if (s.gold < cost) return false;

  useGameStore.setState({
    gold: s.gold - cost,
    clickPower: s.clickPower + 1,
  });
  s.addBattleLog(`👆 点击力强化 +1（花费 ${cost} 灵石）`);
  return true;
}
