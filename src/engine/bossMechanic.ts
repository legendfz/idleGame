/**
 * BossMechanic — Boss 特殊机制引擎
 * 免疫/反击/多阶段/狂暴/召唤/回复/护盾
 */
import Decimal from 'break_infinity.js';
import { bn, ZERO } from './bignum';
import { EnemyRuntime, BattleRuntimeState } from './battle';
import bossMechanicsData from '../data/configs/boss-mechanics.json';

// === Types ===

export type BossMechanic =
  | { type: 'immune'; element: string; duration: number }
  | { type: 'reflect'; percent: number; duration: number }
  | { type: 'enrage'; hpThreshold: number; atkBoost: number }
  | { type: 'phase'; phases: BossPhaseConfig[] }
  | { type: 'summon'; minionId: string; count: number; interval: number }
  | { type: 'heal'; percent: number; cooldown: number }
  | { type: 'shield'; amount: string; breakCondition: string };

export interface BossPhaseConfig {
  hpPercent: number;
  atkMultiplier: number;
  defMultiplier: number;
  announcement: string;
  mechanic?: BossMechanic;
}

export interface ActiveBossMechanics {
  enraged: boolean;
  enrageBoost: number;
  currentPhase: number;
  immuneTimer: number;        // remaining seconds
  reflectTimer: number;
  reflectPercent: number;
  shieldHp: Decimal;
  healCooldownTimer: number;
  summonTimer: number;
  announcements: string[];    // pending announcements
}

// === Engine ===

/**
 * 获取关卡的 Boss 机制配置
 */
export function getStageMechanics(stageId: number): BossMechanic[] {
  const data = (bossMechanicsData as any).stageMechanics;
  return data[String(stageId)] || [];
}

/**
 * 创建初始 Boss 机制状态
 */
export function createMechanicState(): ActiveBossMechanics {
  return {
    enraged: false, enrageBoost: 1,
    currentPhase: 0,
    immuneTimer: 0, reflectTimer: 0, reflectPercent: 0,
    shieldHp: ZERO,
    healCooldownTimer: 0, summonTimer: 0,
    announcements: [],
  };
}

/**
 * 处理 Boss 机制 tick
 */
export function tickBossMechanics(
  mechanics: BossMechanic[],
  state: ActiveBossMechanics,
  boss: EnemyRuntime,
  dt: number,
): ActiveBossMechanics {
  const newState = { ...state, announcements: [] as string[] };
  const hpPercent = boss.currentHp.div(boss.maxHp).toNumber();

  for (const mech of mechanics) {
    switch (mech.type) {
      case 'enrage': {
        if (!newState.enraged && hpPercent <= mech.hpThreshold) {
          newState.enraged = true;
          newState.enrageBoost = mech.atkBoost;
          newState.announcements.push(`Boss 狂暴！攻击力 ×${mech.atkBoost}`);
        }
        break;
      }
      case 'phase': {
        for (let i = mech.phases.length - 1; i >= 0; i--) {
          if (hpPercent <= mech.phases[i].hpPercent && newState.currentPhase <= i) {
            newState.currentPhase = i + 1;
            newState.announcements.push(mech.phases[i].announcement);
            break;
          }
        }
        break;
      }
      case 'immune': {
        // 周期性免疫
        if (newState.immuneTimer <= 0 && hpPercent < 0.7) {
          newState.immuneTimer = mech.duration;
          newState.announcements.push(`Boss 免疫物理伤害 ${mech.duration}秒！`);
        } else {
          newState.immuneTimer = Math.max(0, newState.immuneTimer - dt);
        }
        break;
      }
      case 'reflect': {
        if (newState.reflectTimer <= 0 && hpPercent < 0.6) {
          newState.reflectTimer = mech.duration;
          newState.reflectPercent = mech.percent;
          newState.announcements.push(`Boss 开启反击！反弹 ${mech.percent * 100}% 伤害`);
        } else {
          newState.reflectTimer = Math.max(0, newState.reflectTimer - dt);
        }
        break;
      }
      case 'heal': {
        newState.healCooldownTimer -= dt;
        if (newState.healCooldownTimer <= 0 && hpPercent < 0.8) {
          // 回复在外部处理（返回标记）
          newState.healCooldownTimer = mech.cooldown;
          newState.announcements.push(`Boss 恢复 ${mech.percent * 100}% 生命！`);
        }
        break;
      }
      case 'shield': {
        if (newState.shieldHp.lte(0) && hpPercent < 0.5) {
          newState.shieldHp = bn(mech.amount);
          newState.announcements.push(`Boss 展开护盾！${mech.breakCondition}`);
        }
        break;
      }
      case 'summon': {
        newState.summonTimer -= dt;
        if (newState.summonTimer <= 0 && hpPercent < 0.6) {
          newState.summonTimer = mech.interval;
          newState.announcements.push(`Boss 召唤了 ${mech.count} 个小怪！`);
        }
        break;
      }
    }
  }

  return newState;
}

/**
 * 计算伤害修正（考虑免疫、护盾、反击）
 */
export function modifyDamage(
  damage: Decimal,
  state: ActiveBossMechanics,
): { finalDamage: Decimal; reflected: Decimal; blocked: boolean } {
  // 免疫
  if (state.immuneTimer > 0) {
    return { finalDamage: ZERO, reflected: ZERO, blocked: true };
  }

  // 护盾
  if (state.shieldHp.gt(0)) {
    const absorbed = Decimal.min(damage, state.shieldHp);
    state.shieldHp = state.shieldHp.sub(absorbed);
    const remaining = damage.sub(absorbed);
    return { finalDamage: remaining, reflected: ZERO, blocked: false };
  }

  // 反击
  const reflected = state.reflectTimer > 0
    ? damage.mul(state.reflectPercent)
    : ZERO;

  return { finalDamage: damage, reflected, blocked: false };
}

/**
 * 获取 Boss 攻击倍率（含狂暴+阶段）
 */
export function getBossAtkMultiplier(
  mechanics: BossMechanic[],
  state: ActiveBossMechanics,
): number {
  let mult = 1;
  if (state.enraged) mult *= state.enrageBoost;

  for (const mech of mechanics) {
    if (mech.type === 'phase' && state.currentPhase > 0) {
      const phase = mech.phases[state.currentPhase - 1];
      if (phase) mult *= phase.atkMultiplier;
    }
  }

  return mult;
}
