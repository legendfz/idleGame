/**
 * 境界系统数据（MVP: 前5个境界）
 */

export interface Realm {
  id: string;
  name: string;
  levelReq: number;
  peachCost: number;
  description: string;
  /** 全属性倍率 */
  statMultiplier: number;
  /** 解锁内容描述 */
  unlock: string;
}

export const REALMS: Realm[] = [
  {
    id: 'linghou',
    name: '灵猴初醒',
    levelReq: 1,
    peachCost: 0,
    statMultiplier: 1,
    description: '混沌初开，灵石孕育',
    unlock: '基础攻击',
  },
  {
    id: 'tongling',
    name: '通灵',
    levelReq: 10,
    peachCost: 5,
    statMultiplier: 1.5,
    description: '初通灵智，感悟天地',
    unlock: '自动战斗',
  },
  {
    id: 'lianqi',
    name: '炼气',
    levelReq: 30,
    peachCost: 20,
    statMultiplier: 2.5,
    description: '吐纳天地灵气',
    unlock: '技能栏×1',
  },
  {
    id: 'zhuji',
    name: '筑基',
    levelReq: 60,
    peachCost: 80,
    statMultiplier: 4,
    description: '筑道之基，脱胎换骨',
    unlock: '队友栏×1',
  },
  {
    id: 'jindan',
    name: '金丹',
    levelReq: 100,
    peachCost: 200,
    statMultiplier: 7,
    description: '金丹大成，法力大增',
    unlock: '法宝栏×1',
  },
];

/** 根据等级获取当前可达到的最高境界索引 */
export function getMaxRealmIndex(level: number, peaches: number): number {
  let maxIdx = 0;
  for (let i = 1; i < REALMS.length; i++) {
    if (level >= REALMS[i].levelReq && peaches >= REALMS[i].peachCost) {
      maxIdx = i;
    }
  }
  return maxIdx;
}
