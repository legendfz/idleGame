/**
 * v2.0 Realm (境界) Configuration — 14 realms × 9 sub-levels = 126 total levels
 */

export interface RealmConfig {
  id: string;
  name: string;
  order: number;
  subLevels: number;
  breakCost: { cultivation: string; materials?: { id: string; count: number }[]; trialStage?: number };
  multiplier: number;
  unlockAbility?: string;
}

export const REALMS_V2: RealmConfig[] = [
  { id: 'fanren',   name: '凡人', order: 0,  subLevels: 9, breakCost: { cultivation: '100' },    multiplier: 1 },
  { id: 'lianqi',   name: '练气', order: 1,  subLevels: 9, breakCost: { cultivation: '1000' },   multiplier: 1.5 },
  { id: 'zhuji',    name: '筑基', order: 2,  subLevels: 9, breakCost: { cultivation: '1e4' },    multiplier: 2 },
  { id: 'jindan',   name: '金丹', order: 3,  subLevels: 9, breakCost: { cultivation: '1e5' },    multiplier: 3 },
  { id: 'yuanying', name: '元婴', order: 4,  subLevels: 9, breakCost: { cultivation: '1e6' },    multiplier: 5 },
  { id: 'huashen',  name: '化神', order: 5,  subLevels: 9, breakCost: { cultivation: '1e8' },    multiplier: 8 },
  { id: 'dujie',    name: '渡劫', order: 6,  subLevels: 9, breakCost: { cultivation: '1e10' },   multiplier: 13 },
  { id: 'dixian',   name: '地仙', order: 7,  subLevels: 9, breakCost: { cultivation: '1e13' },   multiplier: 20 },
  { id: 'tianxian', name: '天仙', order: 8,  subLevels: 9, breakCost: { cultivation: '1e16' },   multiplier: 35 },
  { id: 'jinxian',  name: '金仙', order: 9,  subLevels: 9, breakCost: { cultivation: '1e20' },   multiplier: 60 },
  { id: 'taiyi',    name: '太乙', order: 10, subLevels: 9, breakCost: { cultivation: '1e25' },   multiplier: 100 },
  { id: 'daluo',    name: '大罗', order: 11, subLevels: 9, breakCost: { cultivation: '1e31' },   multiplier: 180 },
  { id: 'hunyuan',  name: '混元', order: 12, subLevels: 9, breakCost: { cultivation: '1e38' },   multiplier: 350 },
  { id: 'shengren', name: '圣人', order: 13, subLevels: 9, breakCost: { cultivation: '1e46' },   multiplier: 700 },
];

export function getRealmByOrder(order: number): RealmConfig | undefined {
  return REALMS_V2.find(r => r.order === order);
}

export function getRealmById(id: string): RealmConfig | undefined {
  return REALMS_V2.find(r => r.id === id);
}

/** Get total realm level (0-125) from realmId + subLevel */
export function getTotalRealmLevel(realmId: string, subLevel: number): number {
  const realm = getRealmById(realmId);
  if (!realm) return 0;
  return realm.order * 9 + (subLevel - 1);
}
