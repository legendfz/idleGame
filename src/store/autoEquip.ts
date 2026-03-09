/**
 * v189.0 — Auto-equipment actions (enhance/reforge/socket/synth/refine/decompose)
 * Extracted from tickAutoActions.ts
 */
import { EquipmentItem, Quality, QUALITY_INFO } from '../types';
import { getEnhanceCost, getMaxEnhanceLevel, EQUIPMENT_TEMPLATES, canRefine, getRefineCost, REFINE_MATERIAL_COUNT, REFINE_BASE_RATE, REFINE_TIANMING_BONUS, REFINE_SHARD_PITY } from '../data/equipment';
import { getReforgeCost } from './equipmentActions';
import { sfx } from '../engine/audio';
import type { TickContext } from './tickAutoActions';

/** Auto-enhance equipped gear every 30 ticks (+1~+10 only) */
export function autoEnhanceGear(ctx: TickContext) {
  if (ctx.totalPlayTime % 30 !== 0 || ctx.totalPlayTime === 0) return;
  const slots = ['equippedWeapon', 'equippedArmor', 'equippedTreasure'] as const;
  for (const slot of slots) {
    const item: EquipmentItem | null = ctx.state[slot];
    if (!item) continue;
    const maxLvl = Math.min(10, getMaxEnhanceLevel(item));
    if (item.level >= maxLvl) continue;
    const cost = getEnhanceCost(item);
    if (ctx.updatedPlayer.lingshi < cost) continue;
    ctx.updatedPlayer.lingshi -= cost;
    const newItem = { ...item, level: item.level + 1 };
    ctx.set({ [slot]: newItem } as any);
    ctx.log = ctx.addLog(ctx.log, `🔧 自动强化 ${item.name} → +${newItem.level}`, 'info');
    sfx('enhance');
    break;
  }
}

/** Auto-reforge equipped items every 60 ticks */
export function autoReforgeGear(ctx: TickContext) {
  if (ctx.totalPlayTime % 60 !== 0 || ctx.totalPlayTime === 0) return;
  const slots = ['equippedWeapon', 'equippedArmor', 'equippedTreasure'] as const;
  for (const slot of slots) {
    const item: EquipmentItem | null = ctx.state[slot];
    if (!item || !item.affixes || item.affixes.length === 0) continue;
    const cost = getReforgeCost(item);
    if (ctx.updatedPlayer.lingshi < cost) continue;
    const oldTotal = item.affixes.reduce((s, a) => s + a.value, 0);
    const newAffixes = item.affixes.map(a => ({
      ...a,
      value: Math.floor(a.value * (0.8 + Math.random() * 0.4)),
    }));
    const newTotal = newAffixes.reduce((s, a) => s + a.value, 0);
    if (newTotal <= oldTotal) continue;
    ctx.updatedPlayer.lingshi -= cost;
    const newItem = { ...item, affixes: newAffixes };
    ctx.set({ [slot]: newItem } as any);
    ctx.log = ctx.addLog(ctx.log, `🔄 自动洗练 ${item.name}（词条+${newTotal - oldTotal}）`, 'info');
    break;
  }
}

/** v155.0: Auto-socket gems into equipped items every 30 ticks */
export function autoSocketGems(ctx: TickContext) {
  if (ctx.totalPlayTime % 30 !== 0 || ctx.totalPlayTime === 0) return;
  const gems: Array<{ id: string; type: string; tier: number; count: number }> = (ctx.updatedPlayer as any).gems ?? [];
  if (gems.length === 0) return;
  const slots = ['equippedWeapon', 'equippedArmor', 'equippedTreasure'] as const;
  for (const slot of slots) {
    const item: EquipmentItem | null = ctx.state[slot];
    if (!item) continue;
    const sockets: Array<{ gemId: string | null }> = (item as any).sockets ?? [];
    const emptyIdx = sockets.findIndex(s => s.gemId === null);
    if (emptyIdx === -1) continue;
    const bestGem = gems
      .filter(g => g.count > 0)
      .sort((a, b) => b.tier - a.tier)[0];
    if (!bestGem) continue;
    bestGem.count--;
    if (bestGem.count <= 0) {
      const gIdx = gems.indexOf(bestGem);
      gems.splice(gIdx, 1);
    }
    const newSockets = [...sockets];
    newSockets[emptyIdx] = { gemId: bestGem.id };
    const newItem = { ...item, sockets: newSockets };
    ctx.set({ [slot]: newItem } as any);
    (ctx.updatedPlayer as any).gems = gems;
    ctx.log = ctx.addLog(ctx.log, `💎 自动镶嵌 ${bestGem.type} T${bestGem.tier} → ${item.name}`, 'info');
    break;
  }
}

/** Auto-synthesize equipment every 45 ticks */
export function autoSynthEquip(ctx: TickContext) {
  if (ctx.totalPlayTime % 45 !== 0 || ctx.totalPlayTime === 0) return;
  const qualityOrder: Quality[] = ['common', 'spirit', 'immortal', 'divine'];
  for (const q of qualityOrder) {
    const candidates = ctx.updatedInventory.filter(i => i.quality === q);
    if (candidates.length < 3) continue;
    const mats = candidates.slice(0, 3);
    const nextQ = qualityOrder[qualityOrder.indexOf(q) + 1];
    if (!nextQ) continue;
    const templates = EQUIPMENT_TEMPLATES.filter(t => t.quality === nextQ);
    if (templates.length === 0) continue;
    const tmpl = templates[Math.floor(Math.random() * templates.length)];
    const matUids = new Set(mats.map(m => m.uid));
    ctx.updatedInventory = ctx.updatedInventory.filter(i => !matUids.has(i.uid));
    const newItem: EquipmentItem = {
      uid: `synth_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      name: tmpl.name,
      slot: tmpl.slot,
      quality: nextQ,
      baseStat: tmpl.baseStat,
      level: 0,
    };
    ctx.updatedInventory.push(newItem);
    ctx.log = ctx.addLog(ctx.log, `🔮 自动合成 ${QUALITY_INFO[nextQ].symbol}${newItem.name}`, 'info');
    break;
  }
}

/** Auto-decompose lowest quality items when inventory full, every 15 ticks */
export function autoDecompose(ctx: TickContext) {
  if (ctx.totalPlayTime % 15 !== 0 || ctx.totalPlayTime === 0) return;
  const MAX_INV = 50;
  if (ctx.updatedInventory.length <= MAX_INV - 5) return;
  const qualityOrder: Quality[] = ['common', 'spirit', 'immortal'];
  let decomposed = 0;
  for (const q of qualityOrder) {
    if (ctx.updatedInventory.length <= MAX_INV - 5) break;
    const toDecomp = ctx.updatedInventory
      .filter(i => i.quality === q)
      .sort((a, b) => a.baseStat - b.baseStat);
    for (const item of toDecomp) {
      if (ctx.updatedInventory.length <= MAX_INV - 5) break;
      ctx.updatedInventory = ctx.updatedInventory.filter(i => i.uid !== item.uid);
      ctx.updatedPlayer.lingshi += Math.floor(item.baseStat * 1.2 + (item.level + 1) * 30);
      decomposed++;
    }
  }
  if (decomposed > 0) {
    ctx.log = ctx.addLog(ctx.log, `♻️ 自动分解 ${decomposed} 件装备`, 'info');
  }
}

/** Auto-refine equipped legendary items every 90 ticks */
export function autoRefineEquipped(ctx: TickContext) {
  if (ctx.totalPlayTime % 90 !== 0 || ctx.totalPlayTime === 0) return;
  const slots = ['equippedWeapon', 'equippedArmor', 'equippedTreasure'] as const;
  for (const slot of slots) {
    const item: EquipmentItem | null = ctx.state[slot];
    if (!item || !canRefine(item)) continue;
    const cost = getRefineCost(item);
    if (ctx.updatedPlayer.lingshi < cost) continue;
    const materials = ctx.updatedInventory.filter(i => i.quality === 'legendary' && i.uid !== item.uid);
    if (materials.length < REFINE_MATERIAL_COUNT) continue;

    const usePity = (ctx.updatedPlayer.hongmengShards ?? 0) >= REFINE_SHARD_PITY;
    if (usePity) {
      ctx.updatedPlayer.hongmengShards = (ctx.updatedPlayer.hongmengShards ?? 0) - REFINE_SHARD_PITY;
      ctx.updatedPlayer.lingshi -= cost;
      const matUids = new Set(materials.slice(0, REFINE_MATERIAL_COUNT).map(m => m.uid));
      ctx.updatedInventory = ctx.updatedInventory.filter(i => !matUids.has(i.uid));
      const refined = { ...item, quality: 'mythic' as const };
      ctx.set({ [slot]: refined } as any);
      ctx.log = ctx.addLog(ctx.log, `✦ 碎片保底精炼 ${item.name} → 鸿蒙！`, 'levelup');
      sfx('refine');
      return;
    }

    let rate = REFINE_BASE_RATE;
    if (ctx.updatedPlayer.tianmingScrolls > 0) {
      ctx.updatedPlayer.tianmingScrolls--;
      rate += REFINE_TIANMING_BONUS;
    }
    const success = Math.random() * 100 < rate;
    if (success) {
      ctx.updatedPlayer.lingshi -= cost;
      const matUids = new Set(materials.slice(0, REFINE_MATERIAL_COUNT).map(m => m.uid));
      ctx.updatedInventory = ctx.updatedInventory.filter(i => !matUids.has(i.uid));
      const refined = { ...item, quality: 'mythic' as const };
      ctx.set({ [slot]: refined } as any);
      ctx.log = ctx.addLog(ctx.log, `✦ 自动精炼成功！${item.name} → 鸿蒙`, 'levelup');
      sfx('refine');
    } else {
      ctx.updatedPlayer.lingshi -= Math.floor(cost * 0.5);
      ctx.updatedPlayer.hongmengShards = (ctx.updatedPlayer.hongmengShards ?? 0) + 1;
      ctx.log = ctx.addLog(ctx.log, `精炼失败 碎片+1(${ctx.updatedPlayer.hongmengShards}/${REFINE_SHARD_PITY})`, 'info');
    }
    return;
  }
}
