/**
 * 战斗系统
 * 处理自动攻击、击杀判定、掉落结算、关卡推进
 */

import { useGameStore } from '../store/gameStore';
import { calcDamage, rollCrit, critDamage } from './formulas';
import { createMinion, createBoss } from '../data/monsters';
import { rollEquipmentDrop, QUALITY_LABEL } from '../data/equipment';
import { WAVES_PER_STAGE } from '../data/stages';
import type { EquipmentItem } from '../store/gameStore';

let nextEquipId = Date.now();

/** 确保当前有敌人，没有则生成 */
export function ensureEnemy(): void {
  const s = useGameStore.getState();
  if (s.currentEnemy && s.currentEnemy.hp > 0) return;

  const isBossWave = s.currentWave >= WAVES_PER_STAGE;
  const enemy = isBossWave
    ? createBoss(s.currentStage)
    : createMinion(s.currentStage, s.currentWave);

  useGameStore.getState().setEnemy(enemy);

  if (isBossWave) {
    useGameStore.getState().addBattleLog(`🔥 BOSS 出现：${enemy.name} HP:${enemy.maxHp}`);
  }
}

/** 计算玩家总攻击力（含装备 + 境界） */
export function getTotalAttack(): number {
  const s = useGameStore.getState();
  let atk = s.baseAttack;
  if (s.equippedWeapon) {
    atk += s.equippedWeapon.baseStat * (1 + s.equippedWeapon.level * 0.1);
  }
  return Math.floor(atk);
}

/** 计算玩家总血量（含装备） */
export function getTotalMaxHp(): number {
  const s = useGameStore.getState();
  let hp = s.baseHp;
  if (s.equippedArmor) {
    hp += s.equippedArmor.baseStat * (1 + s.equippedArmor.level * 0.1);
  }
  return Math.floor(hp);
}

/** 执行一次自动攻击 */
export function autoAttack(): void {
  const s = useGameStore.getState();
  if (!s.currentEnemy || s.currentEnemy.hp <= 0) return;

  const atk = getTotalAttack();
  let dmg = calcDamage(atk, s.currentEnemy.defense);

  // 暴击判定
  const isCrit = rollCrit(s.critRate);
  if (isCrit) {
    dmg = critDamage(dmg, s.critDamage);
    s.addBattleLog(`💥 暴击！-${dmg}`);
  } else {
    s.addBattleLog(`⚔️ 攻击 ${s.currentEnemy.name} -${dmg}`);
  }

  s.damageEnemy(dmg);
}

/** 处理敌人死亡：结算奖励 + 推进 */
export function handleEnemyDeath(): boolean {
  const s = useGameStore.getState();
  if (!s.currentEnemy || s.currentEnemy.hp > 0) return false;

  const enemy = s.currentEnemy;

  // 结算奖励
  s.addGold(enemy.goldReward);
  s.addExp(enemy.expReward);
  s.addBattleLog(`💀 击败 ${enemy.name}！💰+${enemy.goldReward} ✨+${enemy.expReward}`);

  // Boss 掉落蟠桃
  if (enemy.isBoss) {
    const peachDrop = Math.random() < 0.3 ? Math.ceil(Math.random() * 3) : 0;
    if (peachDrop > 0) {
      s.addPeaches(peachDrop);
      s.addBattleLog(`🍑 获得蟠桃 ×${peachDrop}！`);
    }

    // 装备掉落
    const eqDrop = rollEquipmentDrop(s.currentStage);
    if (eqDrop) {
      const item: EquipmentItem = {
        id: `eq_${nextEquipId++}`,
        templateId: eqDrop.id,
        name: eqDrop.name,
        slot: eqDrop.slot,
        quality: eqDrop.quality,
        baseStat: eqDrop.baseStat,
        level: 0,
      };
      s.addToInventory(item);
      s.addBattleLog(`📦 获得装备：${QUALITY_LABEL[eqDrop.quality]} ${eqDrop.name}`);
    }
  }

  // 推进波次/关卡
  if (enemy.isBoss) {
    s.advanceStage();
    s.addBattleLog(`✅ 通关！进入第 ${s.currentStage + 2} 关`);
  } else {
    s.advanceWave();
  }

  s.resetEnemy();
  return true;
}

/** 计算当前 DPS（用于离线收益） */
export function getCurrentDps(): number {
  const s = useGameStore.getState();
  const atk = getTotalAttack();
  const enemyDef = s.currentStage * 2 * 0.5; // 平均小怪防御
  const baseDmg = Math.max(1, atk - enemyDef);
  const avgDmg = baseDmg * (1 + s.critRate / 100 * (s.critDamage - 1));
  return avgDmg * s.speed;
}

/** 计算每秒灵石收入（基于当前关卡） */
export function getGoldPerSecond(): number {
  const s = useGameStore.getState();
  const { goldPerWave } = require('./formulas');
  const gpw = goldPerWave(s.currentStage);
  // 假设平均每秒击杀产出
  return gpw * s.speed * 0.5;
}
