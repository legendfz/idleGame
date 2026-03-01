/**
 * 装备系统数据（MVP: 武器 + 护甲）
 */

export type EquipSlot = 'weapon' | 'armor';
export type Quality = 'common' | 'spirit' | 'immortal' | 'divine' | 'chaos';

export interface EquipmentTemplate {
  id: string;
  name: string;
  slot: EquipSlot;
  quality: Quality;
  /** 基础攻击加成（武器）或基础血量加成（护甲） */
  baseStat: number;
  /** 掉落起始关卡 */
  dropFromStage: number;
  /** 掉落概率（Boss击杀时） */
  dropRate: number;
}

export const QUALITY_MULTIPLIER: Record<Quality, number> = {
  common: 1,
  spirit: 2,
  immortal: 5,
  divine: 12,
  chaos: 30,
};

export const QUALITY_LABEL: Record<Quality, string> = {
  common: '⬜凡品',
  spirit: '🟢灵品',
  immortal: '🔵仙品',
  divine: '🟣神品',
  chaos: '🟡混沌',
};

/** MVP 装备模板 */
export const EQUIPMENT_TEMPLATES: EquipmentTemplate[] = [
  // 第1章武器
  { id: 'wooden_stick', name: '木棍', slot: 'weapon', quality: 'common', baseStat: 5, dropFromStage: 0, dropRate: 0.3 },
  { id: 'stone_club', name: '石锤', slot: 'weapon', quality: 'common', baseStat: 12, dropFromStage: 10, dropRate: 0.25 },
  { id: 'iron_rod', name: '铁棒', slot: 'weapon', quality: 'spirit', baseStat: 25, dropFromStage: 30, dropRate: 0.15 },
  // 第3章标志性武器
  { id: 'ruyi_jingu', name: '如意金箍棒', slot: 'weapon', quality: 'divine', baseStat: 100, dropFromStage: 130, dropRate: 1.0 },

  // 第1章护甲
  { id: 'monkey_fur', name: '猴皮甲', slot: 'armor', quality: 'common', baseStat: 20, dropFromStage: 0, dropRate: 0.3 },
  { id: 'leather_vest', name: '兽皮衣', slot: 'armor', quality: 'common', baseStat: 50, dropFromStage: 15, dropRate: 0.25 },
  { id: 'chain_mail', name: '锁子甲', slot: 'armor', quality: 'spirit', baseStat: 100, dropFromStage: 50, dropRate: 0.15 },
  { id: 'dragon_scale', name: '龙鳞铠', slot: 'armor', quality: 'immortal', baseStat: 250, dropFromStage: 130, dropRate: 0.1 },
];

/** 根据关卡获取可掉落装备列表 */
export function getDroppableEquipment(stageIndex: number): EquipmentTemplate[] {
  return EQUIPMENT_TEMPLATES.filter(e => stageIndex >= e.dropFromStage);
}

/** 尝试掉落装备（Boss 击杀时调用） */
export function rollEquipmentDrop(stageIndex: number): EquipmentTemplate | null {
  const pool = getDroppableEquipment(stageIndex);
  // 从高级到低级尝试掉落
  for (let i = pool.length - 1; i >= 0; i--) {
    if (Math.random() < pool[i].dropRate * 0.1) {
      return pool[i];
    }
  }
  return null;
}
