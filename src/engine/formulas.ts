/**
 * FormulaLib — 所有数值公式集中管理
 * 基于 CORE-LOOP-SPEC-V2.0 附录 A
 */
import Decimal from 'break_infinity.js';
import { bn, ZERO, ONE } from './bignum';

// ========== 修炼系统 ==========

/**
 * 大境界突破修为需求
 * xiuwei_required(r, s) = floor(base(r) × sub_scale(s))
 * base(r) = 100 × 10^(r-1) × 1.2^(r-1)
 * sub_scale(s) = 1.0 + (s-1) × 0.4 + (s-1)^2 × 0.05
 */
export function xiuweiRequired(realmOrder: number, subLevel: number): Decimal {
  const r = realmOrder; // 1-based (凡人=1, 练气=2, ...)
  const s = subLevel;   // 1-9
  const base = bn(100).mul(Decimal.pow(10, r - 1)).mul(Decimal.pow(1.2, r - 1));
  const subScale = 1.0 + (s - 1) * 0.4 + Math.pow(s - 1, 2) * 0.05;
  return base.mul(subScale).floor();
}

/**
 * 修炼速度
 * xiuwei_per_sec = base_speed × realm_multiplier × equipment_bonus × team_bonus × buff_bonus
 */
export function xiuweiPerSecond(
  realmMultiplier: number,
  equipBonus: number,
  teamBonus: number,
  buffBonus: number,
): Decimal {
  const base = 1;
  return bn(base)
    .mul(realmMultiplier)
    .mul(1 + equipBonus)
    .mul(1 + teamBonus)
    .mul(1 + buffBonus);
}

/**
 * 离线修为收益
 * offline_xiuwei = min(seconds, 86400) × xiuwei_per_sec × offline_efficiency
 * offline_efficiency = 0.5 base, up to 1.0
 */
export function offlineXiuwei(
  seconds: number,
  xps: Decimal,
  offlineEfficiency: number = 0.5,
): Decimal {
  const capped = Math.min(seconds, 86400);
  return xps.mul(capped).mul(offlineEfficiency);
}

/**
 * 离线回归奖励 (>8h bonus: +10%)
 */
export function offlineBonusXiuwei(offlineXiuwei: Decimal, offlineSeconds: number): Decimal {
  if (offlineSeconds > 8 * 3600) {
    return offlineXiuwei.mul(0.1);
  }
  return ZERO;
}

// ========== 战斗系统 ==========

/**
 * 角色属性公式
 * attack(level, realm) = floor((10 + level × 3) × realm_multiplier × (1 + equip_atk%))
 * defense(level, realm) = floor((5 + level × 1.5) × realm_multiplier × (1 + equip_def%))
 * hp(level, realm) = floor((100 + level × 20) × realm_multiplier × (1 + equip_hp%))
 */
export function calcAttack(level: number, realmMult: number, equipPercent: number): Decimal {
  return bn(10 + level * 3).mul(realmMult).mul(1 + equipPercent).floor();
}

export function calcDefense(level: number, realmMult: number, equipPercent: number): Decimal {
  return bn(5 + level * 1.5).mul(realmMult).mul(1 + equipPercent).floor();
}

export function calcHp(level: number, realmMult: number, equipPercent: number): Decimal {
  return bn(100 + level * 20).mul(realmMult).mul(1 + equipPercent).floor();
}

/**
 * 点击伤害
 * click_damage = attack × 0.5 × (1 + click_bonus%)
 * 暴击: × crit_multiplier (default 2.0)
 */
export function clickDamage(
  attack: Decimal,
  clickBonusPercent: number,
  isCrit: boolean,
  critMultiplier: number = 2.0,
): Decimal {
  let dmg = attack.mul(0.5).mul(1 + clickBonusPercent);
  if (isCrit) dmg = dmg.mul(critMultiplier);
  return dmg.floor();
}

/**
 * 自动 DPS
 * auto_dps = attack × auto_speed × (1 + auto_bonus%)
 * effective_dps = auto_dps × (1 + crit_rate × (crit_multiplier - 1))
 */
export function autoDps(
  attack: Decimal,
  autoSpeed: number,
  autoBonusPercent: number,
  critRate: number,
  critMultiplier: number = 2.0,
): Decimal {
  const raw = attack.mul(autoSpeed).mul(1 + autoBonusPercent);
  return raw.mul(1 + critRate * (critMultiplier - 1));
}

/**
 * Boss 血量曲线（81难）
 * boss_hp(n) = floor(500 × 2.2^(n-1) × tier_bonus(n))
 */
export function bossHp(stageNum: number): Decimal {
  const tier = tierBonus(stageNum);
  return bn(500).mul(Decimal.pow(2.2, stageNum - 1)).mul(tier).floor();
}

function tierBonus(n: number): number {
  if (n % 9 === 0) return 3.0; // 章节Boss
  if (n % 3 === 0) return 1.5; // 小节点
  return 1.0;
}

/**
 * Boss 时间限制
 */
export function bossTimeLimit(stageNum: number): number {
  if (stageNum <= 9) return 120;
  if (stageNum <= 27) return 90;
  if (stageNum <= 54) return 60;
  return 45;
}

/**
 * 小怪血量 = boss_hp(n) / 10
 */
export function minionHp(stageNum: number): Decimal {
  return bossHp(stageNum).div(10).floor();
}

/**
 * 小怪攻击 = boss_atk / 3
 */
export function minionAttack(stageNum: number, bossAtk: Decimal): Decimal {
  return bossAtk.div(3).floor();
}

// ========== 装备系统 ==========

/**
 * 强化费用 = baseCost × 2^level
 */
export function enhanceCost(baseCost: number, level: number): Decimal {
  return bn(baseCost).mul(Decimal.pow(2, level)).floor();
}

/**
 * 强化成功率
 * +1~+5: 90%/85%/80%/75%/70%
 * +6~+10: 60%/50%/40%/30%/20%
 * +11~+15: 15%/12%/10%/8%/5%
 */
export function enhanceSuccessRate(level: number): number {
  const rates: Record<number, number> = {
    0: 0.90, 1: 0.85, 2: 0.80, 3: 0.75, 4: 0.70,
    5: 0.60, 6: 0.50, 7: 0.40, 8: 0.30, 9: 0.20,
    10: 0.15, 11: 0.12, 12: 0.10, 13: 0.08, 14: 0.05,
  };
  return rates[level] ?? 0.05;
}

/**
 * 装备属性倍率（基于强化等级）
 * 每级 +10% 基础属性
 */
export function enhanceMultiplier(level: number): number {
  return 1 + level * 0.1;
}

// ========== 转世系统 ==========

/**
 * 佛缘计算
 * foyuan = floor(total_xiuwei^0.4 × (1 + prestige_count × 0.1))
 */
export function calcFoyuan(totalXiuwei: Decimal, prestigeCount: number): number {
  if (totalXiuwei.lte(0)) return 0;
  const logVal = totalXiuwei.log10() * 0.4; // x^0.4 = 10^(log10(x)*0.4)
  const base = Math.pow(10, logVal);
  const bonus = 1 + prestigeCount * 0.1;
  return Math.floor(base * bonus);
}

// ========== 连击系统 ==========

/**
 * 连击判定：10 次点击 in 3 秒 → ×2 伤害 5 秒
 */
export const COMBO_THRESHOLD = 10;
export const COMBO_WINDOW_MS = 3000;
export const COMBO_BUFF_DURATION_MS = 5000;
export const COMBO_MULTIPLIER = 2.0;

// ========== 掉落系统 ==========

/**
 * 妖怪招降概率
 * capture_chance = 0.05 × (1 + charisma_bonus) × weakness_multiplier
 */
export function captureChance(
  charismaBonus: number,
  weaknessMet: boolean,
  defeatedCount: number,
): number {
  const base = 0.05;
  const weaknessMult = weaknessMet ? 3.0 : (defeatedCount >= 3 ? 1.5 : 1.0);
  return base * (1 + charismaBonus) * weaknessMult;
}
