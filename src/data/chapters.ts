import { Chapter, EnemyTemplate } from '../types';

export const CHAPTERS: Chapter[] = [
  { id: 1, name: '花果山·石猴出世', stages: 50, levelRange: [1, 30], description: '从石头里蹦出来的猴子，称王花果山' },
  { id: 2, name: '龙宫·夺宝', stages: 60, levelRange: [30, 80], description: '闯入东海龙宫，夺取如意金箍棒' },
  { id: 3, name: '天庭·大闹天宫', stages: 100, levelRange: [80, 200], description: '上天入地，大闹天宫' },
  { id: 4, name: '五行山·劫难', stages: 80, levelRange: [200, 350], description: '五百年镇压，等待取经人' },
  { id: 5, name: '西行·降妖伏魔', stages: 120, levelRange: [350, 500], description: '师徒四人，西天取经路' },
  { id: 6, name: '火焰山·芭蕉扇', stages: 100, levelRange: [500, 800], description: '三借芭蕉扇，火焰山前斗牛魔' },
  { id: 7, name: '灵山·佛前试炼', stages: 150, levelRange: [800, 1500], description: '灵山脚下，最后的考验' },
  { id: 8, name: '混沌·证道成仙', stages: 200, levelRange: [1500, 9999], description: '超脱三界，证道成仙' },
];

// Enemy templates per chapter
export const CHAPTER_ENEMIES: Record<number, { mobs: EnemyTemplate[]; boss: EnemyTemplate }> = {
  1: {
    mobs: [
      { name: '野狼', emoji: '[狼]', baseHp: 50, baseDefense: 2, baseLingshi: 10, baseExp: 8, pantaoChance: 0 },
      { name: '石头精', emoji: '[石]', baseHp: 80, baseDefense: 5, baseLingshi: 15, baseExp: 12, pantaoChance: 0 },
      { name: '树妖', emoji: '[树]', baseHp: 60, baseDefense: 3, baseLingshi: 12, baseExp: 10, pantaoChance: 0 },
    ],
    boss: { name: '混世魔王', emoji: '[妖]', baseHp: 500, baseDefense: 10, baseLingshi: 100, baseExp: 80, pantaoChance: 0.1 },
  },
  2: {
    mobs: [
      { name: '虾兵', emoji: '[虾]', baseHp: 200, baseDefense: 8, baseLingshi: 25, baseExp: 20, pantaoChance: 0 },
      { name: '蟹将', emoji: '[蟹]', baseHp: 280, baseDefense: 15, baseLingshi: 30, baseExp: 25, pantaoChance: 0 },
      { name: '巡海夜叉', emoji: '[鬼]', baseHp: 350, baseDefense: 12, baseLingshi: 35, baseExp: 30, pantaoChance: 0 },
    ],
    boss: { name: '龙王三太子', emoji: '[龙]', baseHp: 2000, baseDefense: 25, baseLingshi: 300, baseExp: 200, pantaoChance: 0.15 },
  },
  3: {
    mobs: [
      { name: '天兵', emoji: '[战]', baseHp: 600, baseDefense: 20, baseLingshi: 50, baseExp: 40, pantaoChance: 0 },
      { name: '天将', emoji: '[盾]', baseHp: 800, baseDefense: 30, baseLingshi: 60, baseExp: 50, pantaoChance: 0 },
      { name: '巨灵神', emoji: '[力]', baseHp: 1000, baseDefense: 25, baseLingshi: 70, baseExp: 60, pantaoChance: 0 },
    ],
    boss: { name: '二郎神', emoji: '[目]', baseHp: 8000, baseDefense: 50, baseLingshi: 800, baseExp: 500, pantaoChance: 0.2 },
  },
  4: {
    mobs: [
      { name: '山精', emoji: '[山]', baseHp: 1500, baseDefense: 40, baseLingshi: 90, baseExp: 75, pantaoChance: 0 },
      { name: '石魔', emoji: '[岩]', baseHp: 2000, baseDefense: 55, baseLingshi: 110, baseExp: 90, pantaoChance: 0 },
      { name: '地煞鬼', emoji: '[煞]', baseHp: 1800, baseDefense: 45, baseLingshi: 100, baseExp: 80, pantaoChance: 0 },
    ],
    boss: { name: '五行大王', emoji: '[王]', baseHp: 15000, baseDefense: 80, baseLingshi: 1500, baseExp: 1000, pantaoChance: 0.2 },
  },
  5: {
    mobs: [
      { name: '白骨精', emoji: '[骨]', baseHp: 4000, baseDefense: 80, baseLingshi: 200, baseExp: 150, pantaoChance: 0 },
      { name: '蜘蛛精', emoji: '[蛛]', baseHp: 3500, baseDefense: 70, baseLingshi: 180, baseExp: 140, pantaoChance: 0 },
      { name: '黄风怪', emoji: '[风]', baseHp: 5000, baseDefense: 90, baseLingshi: 220, baseExp: 170, pantaoChance: 0 },
    ],
    boss: { name: '牛魔王', emoji: '[牛]', baseHp: 50000, baseDefense: 150, baseLingshi: 3000, baseExp: 2000, pantaoChance: 0.25 },
  },
  6: {
    mobs: [
      { name: '火焰兵', emoji: '[火]', baseHp: 8000, baseDefense: 120, baseLingshi: 400, baseExp: 300, pantaoChance: 0 },
      { name: '铁扇侍卫', emoji: '[扇]', baseHp: 10000, baseDefense: 150, baseLingshi: 450, baseExp: 350, pantaoChance: 0 },
      { name: '红孩儿', emoji: '[焰]', baseHp: 12000, baseDefense: 130, baseLingshi: 500, baseExp: 400, pantaoChance: 0.05 },
    ],
    boss: { name: '铁扇公主', emoji: '[仙]', baseHp: 120000, baseDefense: 250, baseLingshi: 8000, baseExp: 5000, pantaoChance: 0.3 },
  },
  7: {
    mobs: [
      { name: '金刚护法', emoji: '[金]', baseHp: 25000, baseDefense: 200, baseLingshi: 800, baseExp: 600, pantaoChance: 0.05 },
      { name: '罗汉', emoji: '[佛]', baseHp: 30000, baseDefense: 250, baseLingshi: 900, baseExp: 700, pantaoChance: 0.05 },
      { name: '菩萨使者', emoji: '[莲]', baseHp: 35000, baseDefense: 220, baseLingshi: 1000, baseExp: 800, pantaoChance: 0.1 },
    ],
    boss: { name: '如来佛祖', emoji: '[卍]', baseHp: 500000, baseDefense: 500, baseLingshi: 20000, baseExp: 12000, pantaoChance: 0.35 },
  },
  8: {
    mobs: [
      { name: '混沌兽', emoji: '[混]', baseHp: 80000, baseDefense: 400, baseLingshi: 2000, baseExp: 1500, pantaoChance: 0.1 },
      { name: '天道使者', emoji: '[道]', baseHp: 100000, baseDefense: 500, baseLingshi: 2500, baseExp: 2000, pantaoChance: 0.1 },
      { name: '劫雷化身', emoji: '[雷]', baseHp: 120000, baseDefense: 450, baseLingshi: 3000, baseExp: 2500, pantaoChance: 0.15 },
    ],
    boss: { name: '天道化身', emoji: '[天]', baseHp: 2000000, baseDefense: 1000, baseLingshi: 50000, baseExp: 30000, pantaoChance: 0.4 },
  },
};

// Scale enemy stats by stage number within chapter
// Abyss enemy templates (infinite scaling post-ch8)
const ABYSS_MOBS: EnemyTemplate[] = [
  { name: '混沌兽', emoji: '[兽]', baseHp: 800000, baseDefense: 2000, baseLingshi: 5000, baseExp: 4000, pantaoChance: 0.02 },
  { name: '虚空蚀者', emoji: '[蚀]', baseHp: 1000000, baseDefense: 2500, baseLingshi: 6000, baseExp: 5000, pantaoChance: 0.02 },
  { name: '天道傀儡', emoji: '[傀]', baseHp: 900000, baseDefense: 2200, baseLingshi: 5500, baseExp: 4500, pantaoChance: 0.02 },
  { name: '太古残魂', emoji: '[魂]', baseHp: 1100000, baseDefense: 2800, baseLingshi: 7000, baseExp: 5500, pantaoChance: 0.03 },
];
const ABYSS_BOSS: EnemyTemplate = { name: '深渊之主', emoji: '[渊]', baseHp: 5000000, baseDefense: 5000, baseLingshi: 50000, baseExp: 30000, pantaoChance: 0.2 };

export const ABYSS_CHAPTER_ID = 9; // virtual chapter id for abyss

export function createEnemy(chapterId: number, stageNum: number, isBoss: boolean) {
  // Abyss mode: infinite scaling
  if (chapterId >= ABYSS_CHAPTER_ID) {
    const abyssFloor = stageNum;
    const template = isBoss ? ABYSS_BOSS : ABYSS_MOBS[Math.floor(Math.random() * ABYSS_MOBS.length)];
    const scale = Math.pow(1.08, abyssFloor - 1); // slightly slower scaling for longevity

    return {
      name: `${template.name}·${abyssFloor}层`,
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

  const chapter = CHAPTER_ENEMIES[chapterId];
  if (!chapter) return null;

  const template = isBoss
    ? chapter.boss
    : chapter.mobs[Math.floor(Math.random() * chapter.mobs.length)];

  // Gentler scaling: linear base + mild exponential
  const scale = (1 + (stageNum - 1) * 0.15) * Math.pow(1.02, stageNum - 1);

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
