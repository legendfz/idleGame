/**
 * TowerEngine — 通天塔: 无限层挑战
 */
import Decimal from 'break_infinity.js';
import { bn } from './bignum';
import { bossHp } from './formulas';

export interface TowerEnemy {
  name: string;
  hp: Decimal;
  atk: Decimal;
  isElite: boolean;
  isBoss: boolean;
}

export interface TowerReward {
  coins: number;
  lingshi: number;
  materials: { id: string; count: number }[];
}

const ENEMY_NAMES = ['塔卫', '石魔', '影兵', '铁甲傀儡', '元素精灵'];
const ELITE_NAMES = ['精英守卫', '暗影将领', '雷霆魔将'];
const BOSS_NAMES = ['塔主·青面兽', '塔主·赤髯龙', '塔主·金翅鹏', '塔主·九幽王', '塔主·混沌兽'];

/**
 * 生成层敌人
 */
export function generateTowerEnemy(floor: number): TowerEnemy {
  const isBoss = floor % 10 === 0;
  const isElite = !isBoss && floor % 5 === 0;

  const baseHp = bossHp(Math.min(floor, 81));
  const scaling = Math.pow(1.08, floor);
  const hp = baseHp.mul(scaling).mul(isBoss ? 3 : isElite ? 1.5 : 1);
  const atk = bn(floor * 10).mul(scaling).mul(isBoss ? 2 : isElite ? 1.3 : 1);

  let name: string;
  if (isBoss) name = BOSS_NAMES[Math.floor((floor / 10 - 1) % BOSS_NAMES.length)];
  else if (isElite) name = ELITE_NAMES[Math.floor(Math.random() * ELITE_NAMES.length)];
  else name = ENEMY_NAMES[Math.floor(Math.random() * ENEMY_NAMES.length)];

  return { name, hp, atk, isElite, isBoss };
}

/**
 * 模拟塔层战斗 (简化判定)
 */
export function simulateTowerBattle(floor: number, playerPower: Decimal): { success: boolean; enemy: TowerEnemy } {
  const enemy = generateTowerEnemy(floor);
  const ratio = playerPower.div(enemy.hp.div(10)).toNumber();
  const success = ratio >= (enemy.isBoss ? 0.8 : enemy.isElite ? 0.6 : 0.4);
  return { success, enemy };
}

/**
 * 层奖励
 */
export function calcTowerReward(floor: number, isBoss: boolean): TowerReward {
  const baseCoins = floor >= 100 ? 150 : 100; // v16.0 fix: Gap 10 — 100+层金币提升50%
  const coins = Math.floor(baseCoins * floor * (isBoss ? 3 : 1));
  const lingshi = isBoss ? Math.floor(floor / 10) : 0;
  const materials: { id: string; count: number }[] = [];

  if (isBoss && floor >= 20) {
    materials.push({ id: 'star_stone', count: Math.floor(floor / 20) });
  }
  if (floor % 5 === 0) {
    materials.push({ id: 'iron', count: Math.floor(floor / 5) });
  }

  return { coins, lingshi, materials };
}

/**
 * 扫荡: 批量结算已通关层奖励
 */
export function calcTowerSweep(highestFloor: number, sweepFloors: number): TowerReward {
  const floors = Math.min(sweepFloors, highestFloor);
  let coins = 0, lingshi = 0;
  const matMap: Record<string, number> = {};

  for (let f = 1; f <= floors; f++) {
    const r = calcTowerReward(f, f % 10 === 0);
    coins += r.coins;
    lingshi += r.lingshi;
    r.materials.forEach(m => { matMap[m.id] = (matMap[m.id] ?? 0) + m.count; });
  }

  return { coins, lingshi, materials: Object.entries(matMap).map(([id, count]) => ({ id, count })) };
}

export interface TowerState {
  highestFloor: number;
  currentFloor: number;
  dailyAttempts: number;
  dailyResetTime: number;
}

export const TOWER_DAILY_LIMIT = 20;

export function createTowerState(): TowerState {
  return { highestFloor: 0, currentFloor: 1, dailyAttempts: 0, dailyResetTime: Date.now() };
}

export function checkTowerDailyReset(state: TowerState): TowerState {
  const now = Date.now();
  if (now - state.dailyResetTime >= 24 * 3600 * 1000) {
    return { ...state, dailyAttempts: 0, dailyResetTime: now };
  }
  return state;
}
