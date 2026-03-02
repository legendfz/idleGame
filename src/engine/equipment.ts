/**
 * EquipmentEngine — 装备穿戴、强化、掉落生成
 */
import { Decimal, bn, ZERO } from './bignum';
import { enhanceCost } from './formulas';
import { eventBus } from './events';

export type Quality = 0 | 1 | 2 | 3 | 4 | 5; // 凡/灵/仙/神/混沌/鸿蒙
export const QUALITY_NAMES = ['凡品', '灵品', '仙品', '神品', '混沌', '鸿蒙'] as const;

export interface Equipment {
  id: string;
  templateId: string;
  name: string;
  quality: Quality;
  level: number;
  attack: Decimal;
  defense: Decimal;
  bonus: Record<string, Decimal>;
}

export interface EquipSlots {
  weapon: Equipment | null;
  armor: Equipment | null;
  accessory: Equipment | null;
  mount: Equipment | null;
}

export class EquipmentEngine {
  enhance(item: Equipment): { success: boolean; cost: Decimal } {
    const cost = enhanceCost(bn(100), item.level);
    item.level++;
    item.attack = item.attack.mul(1.1);
    item.defense = item.defense.mul(1.1);
    eventBus.emit('equip:enhance', { slotId: item.id, level: item.level });
    return { success: true, cost };
  }

  getTotalBonus(slots: EquipSlots): { attack: Decimal; defense: Decimal } {
    let attack = ZERO;
    let defense = ZERO;
    for (const item of Object.values(slots)) {
      if (item) {
        attack = attack.add(item.attack);
        defense = defense.add(item.defense);
      }
    }
    return { attack, defense };
  }
}
