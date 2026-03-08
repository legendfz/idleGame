/**
 * v162.0「词缀降世」— 装备副属性系统
 * 掉落时随机附带副属性，品质越高词缀越多越强
 */

export interface Substat {
  type: SubstatType;
  value: number;
}

export type SubstatType =
  | 'atk_pct'     // 攻击%
  | 'hp_pct'      // 生命%
  | 'crit_rate'   // 暴击率
  | 'crit_dmg'    // 暴伤
  | 'exp_pct'     // 经验%
  | 'gold_pct'    // 灵石%
  | 'speed'       // 攻速
  | 'drop_rate';  // 掉率%

export const SUBSTAT_INFO: Record<SubstatType, { name: string; emoji: string; format: (v: number) => string }> = {
  atk_pct:   { name: '攻击', emoji: '⚔️', format: v => `+${v.toFixed(1)}%` },
  hp_pct:    { name: '生命', emoji: '❤️', format: v => `+${v.toFixed(1)}%` },
  crit_rate: { name: '暴击率', emoji: '🎯', format: v => `+${v.toFixed(1)}%` },
  crit_dmg:  { name: '暴伤', emoji: '💥', format: v => `+${v.toFixed(1)}%` },
  exp_pct:   { name: '经验', emoji: '📖', format: v => `+${v.toFixed(1)}%` },
  gold_pct:  { name: '灵石', emoji: '💰', format: v => `+${v.toFixed(1)}%` },
  speed:     { name: '攻速', emoji: '⚡', format: v => `+${v.toFixed(1)}%` },
  drop_rate: { name: '掉率', emoji: '🎁', format: v => `+${v.toFixed(1)}%` },
};

const ALL_SUBSTATS: SubstatType[] = ['atk_pct', 'hp_pct', 'crit_rate', 'crit_dmg', 'exp_pct', 'gold_pct', 'speed', 'drop_rate'];

/** Max substats by quality */
const SUBSTAT_COUNT: Record<string, [number, number]> = {
  common:    [0, 0],  // 凡品：无副属性
  spirit:    [0, 1],  // 灵品：0-1
  immortal:  [1, 1],  // 仙品：1
  divine:    [1, 2],  // 神品：1-2
  legendary: [2, 2],  // 混沌：2
  mythic:    [2, 3],  // 鸿蒙：2-3
};

/** Value ranges by quality [min, max] */
const VALUE_RANGE: Record<string, [number, number]> = {
  common:    [0, 0],
  spirit:    [1, 3],
  immortal:  [2, 5],
  divine:    [3, 8],
  legendary: [5, 12],
  mythic:    [8, 18],
};

/** Roll random substats for an equipment item */
export function rollSubstats(quality: string): Substat[] {
  const countRange = SUBSTAT_COUNT[quality] ?? [0, 0];
  const count = countRange[0] + Math.floor(Math.random() * (countRange[1] - countRange[0] + 1));
  if (count === 0) return [];

  const valRange = VALUE_RANGE[quality] ?? [0, 0];
  const available = [...ALL_SUBSTATS];
  const result: Substat[] = [];

  for (let i = 0; i < count && available.length > 0; i++) {
    const idx = Math.floor(Math.random() * available.length);
    const type = available.splice(idx, 1)[0];
    // crit_rate and speed get lower values
    const scale = (type === 'crit_rate' || type === 'speed') ? 0.5 : (type === 'crit_dmg') ? 0.8 : 1;
    const value = Math.round((valRange[0] + Math.random() * (valRange[1] - valRange[0])) * scale * 10) / 10;
    if (value > 0) result.push({ type, value });
  }

  return result;
}

/** Get aggregate substat bonuses from all equipped items */
export function getSubstatBonuses(substats: { type: string; value: number }[][]): {
  atkPct: number; hpPct: number; critRate: number; critDmg: number;
  expPct: number; goldPct: number; speedPct: number; dropRate: number;
} {
  const r = { atkPct: 0, hpPct: 0, critRate: 0, critDmg: 0, expPct: 0, goldPct: 0, speedPct: 0, dropRate: 0 };
  for (const subs of substats) {
    for (const s of subs) {
      switch (s.type) {
        case 'atk_pct': r.atkPct += s.value; break;
        case 'hp_pct': r.hpPct += s.value; break;
        case 'crit_rate': r.critRate += s.value; break;
        case 'crit_dmg': r.critDmg += s.value; break;
        case 'exp_pct': r.expPct += s.value; break;
        case 'gold_pct': r.goldPct += s.value; break;
        case 'speed': r.speedPct += s.value; break;
        case 'drop_rate': r.dropRate += s.value; break;
      }
    }
  }
  return r;
}
