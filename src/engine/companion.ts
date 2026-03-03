/**
 * CompanionEngine — 伙伴定义、升级、被动效果
 */

export interface CompanionDef {
  id: string;
  name: string;
  icon: string;
  desc: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  source: string;
  baseEffect: CompanionEffect;
  levelScale: number; // 每级效果倍率
}

export type CompanionEffect =
  | { type: 'atkPercent'; value: number }
  | { type: 'defPercent'; value: number }
  | { type: 'xiuweiPercent'; value: number }
  | { type: 'coinPercent'; value: number }
  | { type: 'critRate'; value: number }
  | { type: 'forgeRate'; value: number }
  | { type: 'gatherSpeed'; value: number }
  | { type: 'allPercent'; value: number };

export interface CompanionInstance {
  defId: string;
  level: number;
  exp: number;
}

// === 伙伴数据 (12个) ===

export const COMPANIONS: CompanionDef[] = [
  // 初始伙伴
  { id: 'baimalongjun', name: '白马龙君', icon: '🐴', desc: '忠诚坐骑，加速修行', rarity: 'common', source: '初始', baseEffect: { type: 'xiuweiPercent', value: 2 }, levelScale: 0.5 },
  { id: 'tudijin', name: '土地金仙', icon: '👴', desc: '指路明灯，金币加成', rarity: 'common', source: '初始', baseEffect: { type: 'coinPercent', value: 3 }, levelScale: 0.5 },

  // 稀有
  { id: 'red_boy', name: '红孩儿', icon: '👦', desc: '三昧真火，攻击加成', rarity: 'rare', source: '秘境·凤凰台', baseEffect: { type: 'atkPercent', value: 5 }, levelScale: 1 },
  { id: 'spider_spirit', name: '蜘蛛精', icon: '🕷️', desc: '丝线束缚，防御加成', rarity: 'rare', source: '关卡27', baseEffect: { type: 'defPercent', value: 5 }, levelScale: 1 },
  { id: 'jade_rabbit', name: '玉兔精', icon: '🐰', desc: '月宫捣药，锻造加成', rarity: 'rare', source: '关卡36', baseEffect: { type: 'forgeRate', value: 3 }, levelScale: 0.8 },
  { id: 'gold_fish', name: '金鱼精', icon: '🐟', desc: '通灵鱼鳞，采集加成', rarity: 'rare', source: '秘境·龙宫', baseEffect: { type: 'gatherSpeed', value: 5 }, levelScale: 1 },

  // 史诗
  { id: 'nezha', name: '哪吒三太子', icon: '🔥', desc: '风火轮，暴击提升', rarity: 'epic', source: '关卡54', baseEffect: { type: 'critRate', value: 3 }, levelScale: 0.5 },
  { id: 'erlang', name: '二郎真君', icon: '👁️', desc: '天眼通，全属性加成', rarity: 'epic', source: '关卡63', baseEffect: { type: 'allPercent', value: 2 }, levelScale: 0.3 },
  { id: 'taibaijinxing', name: '太白金星', icon: '⭐', desc: '天庭使者，金币大幅加成', rarity: 'epic', source: '成就·证道圣人', baseEffect: { type: 'coinPercent', value: 8 }, levelScale: 1.5 },

  // 传说
  { id: 'guanyin', name: '观音菩萨', icon: '🙏', desc: '大慈大悲，修为大幅加成', rarity: 'legendary', source: '关卡72', baseEffect: { type: 'xiuweiPercent', value: 10 }, levelScale: 2 },
  { id: 'rulai', name: '如来佛祖', icon: '☸️', desc: '万法归宗，全属性大幅加成', rarity: 'legendary', source: '关卡81', baseEffect: { type: 'allPercent', value: 5 }, levelScale: 1 },
  { id: 'laojun', name: '太上老君', icon: '🧙', desc: '炼丹大师，锻造大幅加成', rarity: 'legendary', source: '锻造Lv50', baseEffect: { type: 'forgeRate', value: 8 }, levelScale: 2 },
];

// === Engine ===

export function getCompanionDef(id: string): CompanionDef | undefined {
  return COMPANIONS.find(c => c.id === id);
}

/**
 * 升级所需经验
 */
export function companionExpRequired(level: number): number {
  return Math.floor(50 * Math.pow(level, 1.8));
}

/**
 * 计算伙伴当前效果值
 */
export function calcCompanionEffect(def: CompanionDef, level: number): { type: string; value: number } {
  const value = def.baseEffect.value + def.levelScale * (level - 1);
  return { type: def.baseEffect.type, value: Math.round(value * 10) / 10 };
}

/**
 * 计算所有已装备伙伴的总buff
 */
export function calcCompanionBuffs(
  equipped: string[],
  instances: Record<string, CompanionInstance>,
): Record<string, number> {
  const buffs: Record<string, number> = {};
  for (const defId of equipped) {
    const inst = instances[defId];
    const def = getCompanionDef(defId);
    if (!inst || !def) continue;
    const eff = calcCompanionEffect(def, inst.level);
    if (eff.type === 'allPercent') {
      for (const k of ['atkPercent', 'defPercent', 'xiuweiPercent', 'coinPercent']) {
        buffs[k] = (buffs[k] ?? 0) + eff.value;
      }
    } else {
      buffs[eff.type] = (buffs[eff.type] ?? 0) + eff.value;
    }
  }
  return buffs;
}
