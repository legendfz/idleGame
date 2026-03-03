import { Chapter, EnemyTemplate } from '../types';

export const CHAPTERS: Chapter[] = [
  { id: 1, name: '花果山·石猴出世', stages: 50, levelRange: [1, 30], description: '从石头里蹦出来的猴子，称王花果山' },
  { id: 2, name: '龙宫·夺宝', stages: 60, levelRange: [30, 80], description: '闯入东海龙宫，夺取如意金箍棒' },
  { id: 3, name: '天庭·大闹天宫', stages: 100, levelRange: [80, 200], description: '上天入地，大闹天宫' },
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
