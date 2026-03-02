/**
 * BattleCalc — 战斗伤害、点击、自动攻击、Boss 限时
 * 基于 CORE-LOOP-SPEC §2
 */
import Decimal from 'break_infinity.js';
import { bn, ZERO } from './bignum';
import {
  clickDamage, autoDps, bossHp, minionHp, bossTimeLimit,
  COMBO_THRESHOLD, COMBO_WINDOW_MS, COMBO_BUFF_DURATION_MS, COMBO_MULTIPLIER,
} from './formulas';
import { eventBus } from './events';

// === 战斗运行时状态类型 ===

export interface EnemyRuntime {
  id: string;
  templateId: string;
  name: string;
  currentHp: Decimal;
  maxHp: Decimal;
  attack: Decimal;
  isBoss: boolean;
}

export interface BattleRuntimeState {
  active: boolean;
  stageId: number;
  wave: number;
  totalWaves: number;
  enemies: EnemyRuntime[];
  currentEnemyIdx: number;
  bossTimer: number;          // Boss 倒计时 ms
  bossTimeLimit: number;      // Boss 总时限 ms
  clickTimestamps: number[];  // 连击追踪
  comboBuff: number;          // 连击 buff 剩余时间 ms
  lootQueue: LootQueueItem[];
  status: 'fighting' | 'victory' | 'defeat' | 'idle';
  elapsed: number;            // 总战斗时间 ms
  totalDamageDealt: Decimal;
  killCount: number;
}

export interface LootQueueItem {
  templateId: string;
  quality: string;
  uid: string;
}

/**
 * 计算点击伤害
 */
export function calcClickDamage(
  attack: Decimal,
  clickBonusPercent: number,
  critRate: number,
  critMultiplier: number = 2.0,
  comboActive: boolean = false,
): { damage: Decimal; isCrit: boolean } {
  const isCrit = Math.random() < critRate;
  let dmg = clickDamage(attack, clickBonusPercent, isCrit, critMultiplier);
  if (comboActive) dmg = dmg.mul(COMBO_MULTIPLIER);
  return { damage: dmg, isCrit };
}

/**
 * 计算自动 DPS
 */
export function calcAutoDps(
  attack: Decimal,
  autoSpeed: number,
  autoBonusPercent: number,
  critRate: number,
  critMultiplier: number = 2.0,
): Decimal {
  return autoDps(attack, autoSpeed, autoBonusPercent, critRate, critMultiplier);
}

/**
 * 处理点击（连击判定）
 */
export function processClick(
  battle: BattleRuntimeState,
  damage: Decimal,
  isCrit: boolean,
  now: number,
): BattleRuntimeState {
  if (!battle.active || battle.status !== 'fighting') return battle;

  const newState = { ...battle };
  const enemy = newState.enemies[newState.currentEnemyIdx];
  if (!enemy) return battle;

  // 扣血
  enemy.currentHp = Decimal.max(ZERO, enemy.currentHp.sub(damage));
  newState.totalDamageDealt = newState.totalDamageDealt.add(damage);

  eventBus.emit({ type: 'CLICK', damage, isCrit });

  // 连击追踪
  newState.clickTimestamps = [...newState.clickTimestamps.filter(t => now - t < COMBO_WINDOW_MS), now];
  if (newState.clickTimestamps.length >= COMBO_THRESHOLD && newState.comboBuff <= 0) {
    newState.comboBuff = COMBO_BUFF_DURATION_MS;
    eventBus.emit({ type: 'COMBO_ACTIVATED', multiplier: COMBO_MULTIPLIER });
  }

  // 敌人死亡
  if (enemy.currentHp.lte(0)) {
    newState.killCount++;
    eventBus.emit({ type: enemy.isBoss ? 'BOSS_KILLED' : 'ENEMY_KILLED', monsterId: enemy.templateId, timeUsed: newState.elapsed / 1000 } as any);

    // 下一个敌人或下一波
    if (newState.currentEnemyIdx < newState.enemies.length - 1) {
      newState.currentEnemyIdx++;
    } else {
      newState.status = 'victory';
      eventBus.emit({ type: 'STAGE_COMPLETE', stageId: newState.stageId, stars: calcStars(newState) });
    }
  }

  return newState;
}

/**
 * 战斗 tick（自动攻击 + Boss 倒计时）
 */
export function tickBattle(battle: BattleRuntimeState, dtMs: number, dps: Decimal): BattleRuntimeState {
  if (!battle.active || battle.status !== 'fighting') return battle;

  const newState = { ...battle };
  newState.elapsed += dtMs;

  // 连击 buff 消退
  if (newState.comboBuff > 0) {
    newState.comboBuff = Math.max(0, newState.comboBuff - dtMs);
  }

  // 自动攻击伤害
  const autoDmg = dps.mul(dtMs / 1000);
  const enemy = newState.enemies[newState.currentEnemyIdx];
  if (enemy) {
    enemy.currentHp = Decimal.max(ZERO, enemy.currentHp.sub(autoDmg));
    newState.totalDamageDealt = newState.totalDamageDealt.add(autoDmg);

    if (enemy.currentHp.lte(0)) {
      newState.killCount++;
      eventBus.emit({ type: enemy.isBoss ? 'BOSS_KILLED' : 'ENEMY_KILLED', monsterId: enemy.templateId, timeUsed: newState.elapsed / 1000 } as any);

      if (newState.currentEnemyIdx < newState.enemies.length - 1) {
        newState.currentEnemyIdx++;
      } else {
        newState.status = 'victory';
        eventBus.emit({ type: 'STAGE_COMPLETE', stageId: newState.stageId, stars: calcStars(newState) });
      }
    }
  }

  // Boss 倒计时
  const currentEnemy = newState.enemies[newState.currentEnemyIdx];
  if (currentEnemy?.isBoss && newState.bossTimer > 0) {
    newState.bossTimer -= dtMs;
    if (newState.bossTimer <= 0) {
      newState.status = 'defeat';
      eventBus.emit({ type: 'BOSS_TIMEOUT', stageId: newState.stageId });
    }
  }

  return newState;
}

/**
 * 初始化战斗（根据关卡配置生成敌人）
 */
export function initBattle(stageId: number, waves: number = 3): BattleRuntimeState {
  const enemies: EnemyRuntime[] = [];
  const hp = minionHp(stageId);
  const bHp = bossHp(stageId);
  const mAtk = hp.div(10).floor();
  const bAtk = bHp.div(10).floor();

  // 小怪波次
  for (let w = 0; w < waves; w++) {
    const count = 2 + Math.floor(Math.random() * 2); // 2-3 per wave
    for (let i = 0; i < count; i++) {
      enemies.push({
        id: `m_${w}_${i}`,
        templateId: `minion_${stageId}`,
        name: `妖怪`,
        currentHp: hp,
        maxHp: hp,
        attack: mAtk,
        isBoss: false,
      });
    }
  }

  // Boss
  enemies.push({
    id: `boss_${stageId}`,
    templateId: `boss_${stageId}`,
    name: `Boss`,
    currentHp: bHp,
    maxHp: bHp,
    attack: bAtk,
    isBoss: true,
  });

  return {
    active: true,
    stageId,
    wave: 0,
    totalWaves: waves + 1,
    enemies,
    currentEnemyIdx: 0,
    bossTimer: bossTimeLimit(stageId) * 1000,
    bossTimeLimit: bossTimeLimit(stageId) * 1000,
    clickTimestamps: [],
    comboBuff: 0,
    lootQueue: [],
    status: 'fighting',
    elapsed: 0,
    totalDamageDealt: ZERO,
    killCount: 0,
  };
}

/**
 * 星级评定：1 star=通关, 2 stars=时间<80%, 3 stars=时间<50%
 */
function calcStars(battle: BattleRuntimeState): number {
  const ratio = battle.elapsed / battle.bossTimeLimit;
  if (ratio < 0.5) return 3;
  if (ratio < 0.8) return 2;
  return 1;
}
