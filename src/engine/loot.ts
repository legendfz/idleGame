/**
 * LootSystem — 战利品生成、概率表
 */
import { Decimal, bn } from './bignum';
import { Quality } from './equipment';
import { eventBus } from './events';

export interface LootTableEntry {
  templateId: string;
  weight: number;
  minQuality: Quality;
  maxQuality: Quality;
}

export interface LootTable {
  stageId: string;
  entries: LootTableEntry[];
  dropRate: number; // 0-1
}

export class LootSystem {
  private tables: Map<string, LootTable> = new Map();

  registerTable(table: LootTable): void {
    this.tables.set(table.stageId, table);
  }

  roll(stageId: string): LootTableEntry | null {
    const table = this.tables.get(stageId);
    if (!table) return null;

    if (Math.random() > table.dropRate) return null;

    const totalWeight = table.entries.reduce((sum, e) => sum + e.weight, 0);
    let roll = Math.random() * totalWeight;
    for (const entry of table.entries) {
      roll -= entry.weight;
      if (roll <= 0) {
        const quality = this.rollQuality(entry.minQuality, entry.maxQuality);
        eventBus.emit('loot:drop', { itemId: entry.templateId, quality });
        return entry;
      }
    }
    return null;
  }

  private rollQuality(min: Quality, max: Quality): Quality {
    return (min + Math.floor(Math.random() * (max - min + 1))) as Quality;
  }
}
