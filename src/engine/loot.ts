/**
 * LootSystem — 战利品生成、概率表
 * 基于 CORE-LOOP-SPEC §3.1
 */
import { Quality, generateEquip, EquipmentInstance } from './equipment';
import { eventBus, LootDropItem } from './events';

// === 掉落概率表 ===

interface QualityDistribution {
  common: number;
  spirit: number;
  immortal: number;
  divine: number;
  chaos: number;
  hongmeng: number;
}

const LOOT_TABLES: Record<string, QualityDistribution> = {
  minion: { common: 0.70, spirit: 0.24, immortal: 0.05, divine: 0.009, chaos: 0.001, hongmeng: 0 },
  boss: { common: 0.35, spirit: 0.35, immortal: 0.20, divine: 0.08, chaos: 0.018, hongmeng: 0.002 },
  bossFirstClear: { common: 0.15, spirit: 0.30, immortal: 0.30, divine: 0.18, chaos: 0.06, hongmeng: 0.01 },
  chapterBoss: { common: 0.05, spirit: 0.20, immortal: 0.35, divine: 0.25, chaos: 0.12, hongmeng: 0.03 },
};

/**
 * 根据概率分布随机选择品质
 */
function rollQuality(dist: QualityDistribution): Quality {
  const r = Math.random();
  let acc = 0;
  for (const [q, prob] of Object.entries(dist) as [Quality, number][]) {
    acc += prob;
    if (r < acc) return q;
  }
  return 'common';
}

/**
 * 获取掉落表类型
 */
function getLootTableType(stageId: number, isBoss: boolean, isFirstClear: boolean): string {
  if (!isBoss) return 'minion';
  if (stageId % 9 === 0) return 'chapterBoss';
  if (isFirstClear) return 'bossFirstClear';
  return 'boss';
}

// 装备模板映射（简化：按 slot 循环）
const SLOT_TEMPLATES = [
  { id: 'weapon', name: '兵器', slot: 'weapon', baseAtk: 15, baseDef: 0, baseHp: 0 },
  { id: 'headgear', name: '头盔', slot: 'headgear', baseAtk: 0, baseDef: 8, baseHp: 30 },
  { id: 'armor', name: '铠甲', slot: 'armor', baseAtk: 0, baseDef: 12, baseHp: 50 },
  { id: 'accessory', name: '饰品', slot: 'accessory', baseAtk: 5, baseDef: 5, baseHp: 20 },
  { id: 'mount', name: '坐骑', slot: 'mount', baseAtk: 3, baseDef: 3, baseHp: 10 },
  { id: 'treasure', name: '法宝', slot: 'treasure', baseAtk: 10, baseDef: 2, baseHp: 10 },
];

/**
 * 生成关卡掉落
 */
export function generateStageLoot(
  stageId: number,
  stars: number,
  isFirstClear: boolean,
): EquipmentInstance[] {
  const results: EquipmentInstance[] = [];

  // 小怪掉落：5% × waves (简化 3 波)
  for (let w = 0; w < 3; w++) {
    if (Math.random() < 0.05) {
      const dist = LOOT_TABLES['minion'];
      const quality = rollQuality(dist);
      const template = SLOT_TEMPLATES[Math.floor(Math.random() * SLOT_TEMPLATES.length)];
      // 装备等级 = stageId ± 2
      const lvlMult = Math.max(1, stageId + Math.floor(Math.random() * 5) - 2);
      results.push(generateEquip(
        `${template.id}_s${stageId}`,
        template.baseAtk * lvlMult,
        template.baseDef * lvlMult,
        template.baseHp * lvlMult,
        quality,
      ));
    }
  }

  // Boss 必掉 1 件
  const bossTableType = getLootTableType(stageId, true, isFirstClear);
  const bossDist = LOOT_TABLES[bossTableType];
  const bossQuality = rollQuality(bossDist);
  const bossTemplate = SLOT_TEMPLATES[Math.floor(Math.random() * SLOT_TEMPLATES.length)];
  const bossLvlMult = Math.max(1, stageId);
  results.push(generateEquip(
    `${bossTemplate.id}_s${stageId}_boss`,
    bossTemplate.baseAtk * bossLvlMult,
    bossTemplate.baseDef * bossLvlMult,
    bossTemplate.baseHp * bossLvlMult,
    bossQuality,
  ));

  // Boss 额外掉落 30%
  if (Math.random() < 0.30) {
    const extraQuality = rollQuality(bossDist);
    const extraTemplate = SLOT_TEMPLATES[Math.floor(Math.random() * SLOT_TEMPLATES.length)];
    results.push(generateEquip(
      `${extraTemplate.id}_s${stageId}_extra`,
      extraTemplate.baseAtk * bossLvlMult,
      extraTemplate.baseDef * bossLvlMult,
      extraTemplate.baseHp * bossLvlMult,
      extraQuality,
    ));
  }

  // 发布掉落事件
  if (results.length > 0) {
    eventBus.emit({
      type: 'LOOT_DROP',
      items: results.map(r => ({ templateId: r.templateId, quality: r.quality, uid: r.uid })),
    });
  }

  return results;
}

/**
 * 扫荡掉落（简化版，概率降低）
 */
export function generateSweepLoot(stageId: number): EquipmentInstance[] {
  const results: EquipmentInstance[] = [];
  // 扫荡只有 20% 概率掉装备
  if (Math.random() < 0.20) {
    const quality = rollQuality(LOOT_TABLES['boss']);
    const template = SLOT_TEMPLATES[Math.floor(Math.random() * SLOT_TEMPLATES.length)];
    results.push(generateEquip(
      `${template.id}_sweep_${stageId}`,
      template.baseAtk * stageId,
      template.baseDef * stageId,
      template.baseHp * stageId,
      quality,
    ));
  }
  return results;
}
