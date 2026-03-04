import { Chapter, EnemyTemplate } from '../types';

export const CHAPTERS: Chapter[] = [
  { id: 1, name: '花果山·石猴出世', stages: 50, levelRange: [1, 30], description: '从石头里蹦出来的猴子，称王花果山' },
  { id: 2, name: '龙宫·夺宝', stages: 60, levelRange: [30, 80], description: '闯入东海龙宫，夺取如意金箍棒' },
  { id: 3, name: '天庭·大闹天宫', stages: 100, levelRange: [80, 200], description: '上天入地，大闹天宫' },
  { id: 4, name: '五行山·劫难', stages: 80, levelRange: [200, 400], description: '被压五行山下五百年，等待取经人' },
  { id: 5, name: '西行·降妖伏魔', stages: 120, levelRange: [400, 700], description: '踏上西行之路，降妖除魔护唐僧' },
  { id: 6, name: '火焰山·芭蕉扇', stages: 100, levelRange: [700, 1000], description: '三借芭蕉扇，踏过火焰山' },
  { id: 7, name: '灵山·佛前试炼', stages: 150, levelRange: [1000, 1500], description: '灵山脚下，九九八十一难的最终考验' },
  { id: 8, name: '混沌·证道成仙', stages: 200, levelRange: [1500, 9999], description: '超脱三界，斗战胜佛证道混沌' },
];

// Enemy templates per chapter
export const CHAPTER_ENEMIES: Record<number, { mobs: EnemyTemplate[]; boss: EnemyTemplate }> = {
  1: {
    mobs: [
      { name: '野狼', emoji: '🐺', baseHp: 50, baseDefense: 2, baseLingshi: 10, baseExp: 8, pantaoChance: 0 },
      { name: '石头精', emoji: '🪨', baseHp: 80, baseDefense: 5, baseLingshi: 15, baseExp: 12, pantaoChance: 0 },
      { name: '树妖', emoji: '🌲', baseHp: 60, baseDefense: 3, baseLingshi: 12, baseExp: 10, pantaoChance: 0 },
    ],
    boss: { name: '混世魔王', emoji: '👹', baseHp: 500, baseDefense: 10, baseLingshi: 100, baseExp: 80, pantaoChance: 0.1 },
  },
  2: {
    mobs: [
      { name: '虾兵', emoji: '🦐', baseHp: 200, baseDefense: 8, baseLingshi: 25, baseExp: 20, pantaoChance: 0 },
      { name: '蟹将', emoji: '🦀', baseHp: 280, baseDefense: 15, baseLingshi: 30, baseExp: 25, pantaoChance: 0 },
      { name: '巡海夜叉', emoji: '👺', baseHp: 350, baseDefense: 12, baseLingshi: 35, baseExp: 30, pantaoChance: 0 },
    ],
    boss: { name: '龙王三太子', emoji: '🐉', baseHp: 2000, baseDefense: 25, baseLingshi: 300, baseExp: 200, pantaoChance: 0.15 },
  },
  3: {
    mobs: [
      { name: '天兵', emoji: '⚔️', baseHp: 600, baseDefense: 20, baseLingshi: 50, baseExp: 40, pantaoChance: 0 },
      { name: '天将', emoji: '🛡️', baseHp: 800, baseDefense: 30, baseLingshi: 60, baseExp: 50, pantaoChance: 0 },
      { name: '巨灵神', emoji: '💪', baseHp: 1000, baseDefense: 25, baseLingshi: 70, baseExp: 60, pantaoChance: 0 },
    ],
    boss: { name: '二郎神', emoji: '👁️', baseHp: 8000, baseDefense: 50, baseLingshi: 800, baseExp: 500, pantaoChance: 0.2 },
  },
  4: {
    mobs: [
      { name: '山精', emoji: '⛰️', baseHp: 1500, baseDefense: 40, baseLingshi: 90, baseExp: 70, pantaoChance: 0 },
      { name: '土地公', emoji: '👴', baseHp: 1200, baseDefense: 35, baseLingshi: 80, baseExp: 65, pantaoChance: 0.02 },
      { name: '石魔', emoji: '🗿', baseHp: 2000, baseDefense: 55, baseLingshi: 100, baseExp: 80, pantaoChance: 0 },
    ],
    boss: { name: '黑风怪', emoji: '🌪️', baseHp: 15000, baseDefense: 80, baseLingshi: 1500, baseExp: 1000, pantaoChance: 0.2 },
  },
  5: {
    mobs: [
      { name: '白骨精', emoji: '💀', baseHp: 3000, baseDefense: 60, baseLingshi: 150, baseExp: 120, pantaoChance: 0.02 },
      { name: '黄袍怪', emoji: '👻', baseHp: 3500, baseDefense: 70, baseLingshi: 170, baseExp: 140, pantaoChance: 0 },
      { name: '蜘蛛精', emoji: '🕷️', baseHp: 2800, baseDefense: 50, baseLingshi: 140, baseExp: 110, pantaoChance: 0.03 },
      { name: '狮驼岭妖', emoji: '🦁', baseHp: 4000, baseDefense: 80, baseLingshi: 200, baseExp: 160, pantaoChance: 0 },
    ],
    boss: { name: '红孩儿', emoji: '🔥', baseHp: 30000, baseDefense: 120, baseLingshi: 3000, baseExp: 2000, pantaoChance: 0.25 },
  },
  6: {
    mobs: [
      { name: '火鸦', emoji: '🐦‍🔥', baseHp: 5000, baseDefense: 90, baseLingshi: 250, baseExp: 200, pantaoChance: 0 },
      { name: '火焰卫', emoji: '🔥', baseHp: 6000, baseDefense: 100, baseLingshi: 280, baseExp: 220, pantaoChance: 0.03 },
      { name: '炎魔', emoji: '😈', baseHp: 7000, baseDefense: 110, baseLingshi: 300, baseExp: 250, pantaoChance: 0 },
    ],
    boss: { name: '牛魔王', emoji: '🐂', baseHp: 60000, baseDefense: 180, baseLingshi: 6000, baseExp: 4000, pantaoChance: 0.3 },
  },
  7: {
    mobs: [
      { name: '金刚力士', emoji: '💎', baseHp: 10000, baseDefense: 150, baseLingshi: 400, baseExp: 350, pantaoChance: 0.03 },
      { name: '罗汉', emoji: '🧘', baseHp: 12000, baseDefense: 170, baseLingshi: 450, baseExp: 400, pantaoChance: 0.05 },
      { name: '护法天王', emoji: '👑', baseHp: 15000, baseDefense: 200, baseLingshi: 500, baseExp: 450, pantaoChance: 0.03 },
    ],
    boss: { name: '大鹏金翅鸟', emoji: '🦅', baseHp: 150000, baseDefense: 300, baseLingshi: 15000, baseExp: 10000, pantaoChance: 0.35 },
  },
  8: {
    mobs: [
      { name: '混沌兽', emoji: '🌀', baseHp: 25000, baseDefense: 250, baseLingshi: 800, baseExp: 700, pantaoChance: 0.05 },
      { name: '虚空魔', emoji: '🕳️', baseHp: 30000, baseDefense: 300, baseLingshi: 900, baseExp: 800, pantaoChance: 0.05 },
      { name: '天道化身', emoji: '☯️', baseHp: 35000, baseDefense: 350, baseLingshi: 1000, baseExp: 900, pantaoChance: 0.08 },
    ],
    boss: { name: '天道', emoji: '✨', baseHp: 500000, baseDefense: 500, baseLingshi: 50000, baseExp: 30000, pantaoChance: 0.5 },
  },
};

// Scale enemy stats by stage number within chapter
export function createEnemy(chapterId: number, stageNum: number, isBoss: boolean) {
  const chapter = CHAPTER_ENEMIES[chapterId];
  if (!chapter) return null;

  const template = isBoss
    ? chapter.boss
    : chapter.mobs[Math.floor(Math.random() * chapter.mobs.length)];

  const scale = Math.pow(1.12, stageNum - 1);

  return {
    name: template.name,
    emoji: template.emoji,
    hp: Math.floor(template.baseHp * scale),
    maxHp: Math.floor(template.baseHp * scale),
    defense: Math.floor(template.baseDefense * scale),
    lingshiDrop: Math.floor(template.baseLingshi * scale),
    expDrop: Math.floor(template.baseExp * scale),
    pantaoDrop: template.pantaoChance,
    isBoss,
  };
}
