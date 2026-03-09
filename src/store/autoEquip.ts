/**
 * v189.0 — Auto-equipment actions (enhance/reforge/socket/synth/decompose/refine)
 * Extracted from tickAutoActions.ts
 */
import { EquipmentItem, Quality, QUALITY_INFO } from '../types';
import { getEnhanceCost, getMaxEnhanceLevel, EQUIPMENT_TEMPLATES, canRefine, getRefineCost, REFINE_MATERIAL_COUNT, REFINE_BASE_RATE, REFINE_TIANMING_BONUS, REFINE_SHARD_PITY } from '../data/equipment';
import { getReforgeCost } from './equipmentActions';
import { sfx } from '../engine/audio';
import type { TickContext } from './tickAutoActions';

export { autoEnhanceGear, autoReforgeGear, autoSocketGems, autoSynthEquip, autoDecompose, autoRefineEquipped };

function autoEnhanceGear(ctx: TickContext) {
  if (!ctx.state.autoEnhance || ctx.totalPlayTime % 30 !== 0 || ctx.totalPlayTime === 0) return;
  const slots: Array<{ item: EquipmentItem | null; key: 'equippedWeapon' | 'equippedArmor' | 'equippedTreasure' }> = [
    { item: ctx.state.equippedWeapon, key: 'equippedWeapon' },
    { item: ctx.state.equippedArmor, key: 'equippedArmor' },
    { item: ctx.state.equippedTreasure, key: 'equippedTreasure' },
  ];
  for (const { item, key } of slots) {
    if (!item) continue;
    const maxLv = getMaxEnhanceLevel(item);
    if (item.level >= maxLv || item.level >= 10) continue;
    const cost = getEnhanceCost(item);
    if (ctx.updatedPlayer.lingshi >= cost) {
      ctx.updatedPlayer.lingshi -= cost;
      const enhanced = { ...item, level: item.level + 1 };
      ctx.set({ [key]: enhanced } as any);
    }
  }
}

function autoReforgeGear(ctx: TickContext) {
  if (!ctx.state.autoReforge || ctx.totalPlayTime % 60 !== 0 || ctx.totalPlayTime === 0) return;
  const slots: Array<{ item: EquipmentItem | null; key: 'equippedWeapon' | 'equippedArmor' | 'equippedTreasure' }> = [
    { item: ctx.state.equippedWeapon, key: 'equippedWeapon' },
    { item: ctx.state.equippedArmor, key: 'equippedArmor' },
    { item: ctx.state.equippedTreasure, key: 'equippedTreasure' },
  ];
  for (const { item, key } of slots) {
    if (!item) continue;
    const template = EQUIPMENT_TEMPLATES.find(t => t.id === item.templateId);
    if (!template) continue;
    const maxPossible = Math.ceil(template.baseStat * 1.3);
    if (item.baseStat >= maxPossible) continue;
    const cost = getReforgeCost(item);
    if (ctx.updatedPlayer.lingshi < cost * 3) continue;
    const min = Math.max(1, Math.floor(template.baseStat * 0.7));
    const max = Math.ceil(template.baseStat * 1.3);
    const newBaseStat = min + Math.floor(Math.random() * (max - min + 1));
    if (newBaseStat <= item.baseStat) continue;
    ctx.updatedPlayer.lingshi -= cost;
    const enhanced = { ...item, baseStat: newBaseStat };
    ctx.set({ [key]: enhanced } as any);
    break;
  }
}

const QUALITY_GEM_SLOTS: Record<string, number> = {
  common: 0, spirit: 1, immortal: 1, divine: 2, legendary: 2, mythic: 3,
};

function autoSocketGems(ctx: TickContext) {
  if (ctx.totalPlayTime % 30 !== 0 || ctx.totalPlayTime === 0) return;
  const gemInv = ctx.updatedPlayer.gemInventory ?? [];
  if (gemInv.length === 0) return;
  const slots = [
    { item: ctx.state.equippedWeapon },
    { item: ctx.state.equippedArmor },
    { item: ctx.state.equippedTreasure },
  ];
  const equippedGems = { ...(ctx.updatedPlayer.equippedGems ?? {}) };
  const remaining = [...gemInv];
  let changed = false;
  for (const { item } of slots) {
    if (!item) continue;
    const maxSlots = QUALITY_GEM_SLOTS[item.quality] ?? 0;
    const current = [...(equippedGems[item.uid] ?? [])];
    while (current.length < maxSlots && remaining.length > 0) {
      let bestIdx = 0;
      for (let i = 1; i < remaining.length; i++) {
        if (remaining[i].level > remaining[bestIdx].level) bestIdx = i;
      }
      current.push(remaining.splice(bestIdx, 1)[0]);
      changed = true;
    }
    if (current.length > 0) equippedGems[item.uid] = current;
  }
  if (changed) {
    ctx.updatedPlayer.gemInventory = remaining;
    ctx.updatedPlayer.equippedGems = equippedGems;
  }
  // Auto-merge: combine 3 same-type same-level gems
  let inv = ctx.updatedPlayer.gemInventory ?? [];
  let merged = true;
  while (merged) {
    merged = false;
    const counts: Record<string, number> = {};
    for (const g of inv) { const k = `${g.typeId}_${g.level}`; counts[k] = (counts[k] ?? 0) + 1; }
    for (const [key, count] of Object.entries(counts)) {
      if (count < 3) continue;
      const [typeId, lvStr] = key.split('_');
      const lv = parseInt(lvStr);
      if (lv >= 10) continue;
      let removed = 0;
      inv = inv.filter((g: any) => {
        if (removed >= 3) return true;
        if (g.typeId === typeId && g.level === lv) { removed++; return false; }
        return true;
      });
      inv.push({ typeId, level: lv + 1 });
      merged = true;
      break;
    }
  }
  ctx.updatedPlayer.gemInventory = inv;
}

function autoSynthEquip(ctx: TickContext) {
  if (!ctx.state.autoSynth || ctx.totalPlayTime % 45 !== 0 || ctx.totalPlayTime === 0) return;
  const qualityOrder: Quality[] = ['common', 'spirit', 'immortal', 'divine', 'legendary'];
  let didSynth = true;
  while (didSynth) {
    didSynth = false;
    const currentInv = ctx.get().inventory;
    for (const q of qualityOrder) {
      const candidates = currentInv.filter((i: EquipmentItem) => i.quality === q && !i.locked);
      if (candidates.length >= 3) {
        const uids = candidates.slice(0, 3).map((i: EquipmentItem) => i.uid);
        const result = ctx.get().synthesizeEquip(uids);
        if (result.success) { didSynth = true; break; }
      }
    }
  }
}

function autoDecompose(ctx: TickContext) {
  const adq = ctx.state.autoDecomposeQuality;
  if (adq <= 0) return;
  const qualityOrder = ['common', 'spirit', 'immortal', 'divine', 'legendary', 'mythic'];
  const equipped = [ctx.state.equippedWeapon?.uid, ctx.state.equippedArmor?.uid, ctx.state.equippedTreasure?.uid];
  const toDecomp = ctx.updatedInventory.filter((i: EquipmentItem) => {
    const qi = qualityOrder.indexOf(i.quality);
    return qi < adq && !equipped.includes(i.uid) && !i.locked;
  });
  if (toDecomp.length > 0) {
    for (const item of toDecomp) {
      const qm = QUALITY_INFO[item.quality].multiplier;
      ctx.updatedPlayer.hongmengShards += Math.ceil(qm * (1 + item.level * 0.5));
    }
    ctx.updatedInventory = ctx.updatedInventory.filter((i: EquipmentItem) => !toDecomp.some((d: EquipmentItem) => d.uid === i.uid));
  }
}

function autoRefineEquipped(ctx: TickContext) {
  if (!ctx.state.autoRefine || ctx.totalPlayTime % 90 !== 0 || ctx.totalPlayTime === 0) return;
  const slots = ['equippedWeapon', 'equippedArmor', 'equippedTreasure'] as const;
  for (const slotKey of slots) {
    const eq = ctx.state[slotKey] as EquipmentItem | null;
    if (!eq || !canRefine(eq)) continue;
    const cost = getRefineCost(eq);
    const legendaryMats = ctx.updatedInventory.filter(
      (i: EquipmentItem) => i.quality === 'legendary' && !i.locked && i.uid !== eq.uid
    );
    if (legendaryMats.length < REFINE_MATERIAL_COUNT) continue;
    if (ctx.updatedPlayer.lingshi < cost) continue;
    if ((ctx.updatedPlayer.hongmengShards ?? 0) >= REFINE_SHARD_PITY) {
      ctx.updatedPlayer.hongmengShards -= REFINE_SHARD_PITY;
      ctx.updatedPlayer.lingshi -= cost;
      const matUids = new Set(legendaryMats.slice(0, REFINE_MATERIAL_COUNT).map((m: EquipmentItem) => m.uid));
      ctx.updatedInventory = ctx.updatedInventory.filter((i: EquipmentItem) => !matUids.has(i.uid));
      const refined = { ...eq, quality: 'mythic' as Quality };
      ctx.set({ [slotKey]: refined } as any);
      ctx.log = ctx.addLog(ctx.log, `🔥 自动精炼成功！${eq.name} → 鸿蒙（碎片保底）`, 'levelup');
      return;
    }
    let rate = REFINE_BASE_RATE;
    if ((ctx.updatedPlayer.tianmingScrolls ?? 0) > 0) {
      (ctx.updatedPlayer as any).tianmingScrolls--;
      rate += REFINE_TIANMING_BONUS;
    }
    if (Math.random() * 100 < rate) {
      ctx.updatedPlayer.lingshi -= cost;
      const matUids = new Set(legendaryMats.slice(0, REFINE_MATERIAL_COUNT).map((m: EquipmentItem) => m.uid));
      ctx.updatedInventory = ctx.updatedInventory.filter((i: EquipmentItem) => !matUids.has(i.uid));
      const refined = { ...eq, quality: 'mythic' as Quality };
      ctx.set({ [slotKey]: refined } as any);
      ctx.log = ctx.addLog(ctx.log, `🔥 自动精炼成功！${eq.name} → 鸿蒙`, 'levelup');
      return;
    } else {
      ctx.updatedPlayer.lingshi -= cost;
      const matUids = new Set(legendaryMats.slice(0, REFINE_MATERIAL_COUNT).map((m: EquipmentItem) => m.uid));
      ctx.updatedInventory = ctx.updatedInventory.filter((i: EquipmentItem) => !matUids.has(i.uid));
      ctx.log = ctx.addLog(ctx.log, `💔 自动精炼失败...${eq.name} 材料已消耗`, 'info');
      return;
    }
  }
}
