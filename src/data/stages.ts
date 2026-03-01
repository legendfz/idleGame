/**
 * 章节/关卡数据（MVP: 前3章）
 */

export interface Chapter {
  id: number;
  name: string;
  subtitle: string;
  stageCount: number;
  levelRange: [number, number];
  /** 该章节第一关的全局关卡索引 */
  startIndex: number;
}

export const CHAPTERS: Chapter[] = [
  {
    id: 1,
    name: '花果山',
    subtitle: '石猴出世',
    stageCount: 50,
    levelRange: [1, 30],
    startIndex: 0,
  },
  {
    id: 2,
    name: '方寸山',
    subtitle: '拜师学艺',
    stageCount: 80,
    levelRange: [30, 80],
    startIndex: 50,
  },
  {
    id: 3,
    name: '龙宫',
    subtitle: '夺宝',
    stageCount: 60,
    levelRange: [80, 130],
    startIndex: 130,
  },
];

/** 总关卡数 */
export const TOTAL_STAGES = CHAPTERS.reduce((sum, ch) => sum + ch.stageCount, 0);

/** 每关 10 波小怪 + 1 Boss */
export const WAVES_PER_STAGE = 10;

/** 根据全局关卡索引获取章节信息 */
export function getChapterForStage(stageIndex: number): Chapter | undefined {
  for (let i = CHAPTERS.length - 1; i >= 0; i--) {
    if (stageIndex >= CHAPTERS[i].startIndex) {
      return CHAPTERS[i];
    }
  }
  return CHAPTERS[0];
}

/** 获取关卡在章节内的编号（从1开始） */
export function getStageInChapter(stageIndex: number): number {
  const chapter = getChapterForStage(stageIndex);
  if (!chapter) return 1;
  return stageIndex - chapter.startIndex + 1;
}
