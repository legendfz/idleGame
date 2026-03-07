/**
 * v127.0「断骨重塑」— Equipment actions extracted from gameStore
 * All functions take (get, set) from zustand store closure.
 */
import { PlayerState, BattleLogEntry, EquipmentItem, EquipSlot, Quality, QUALITY_INFO } from '../types';
import { CHAPTERS, createEnemy } from '../data/chapters';
import { expForLevel } from '../utils/format';
import {
  rollEquipDrop, createEquipFromTemplate, getEquipEffectiveStat,
  getEnhanceCost, getMaxEnhanceLevel,
  isHighEnhance, getHighEnhanceRate, getHighEnhanceDrop,
  canRefine, getRefineCost, REFINE_MATERIAL_COUNT, REFINE_BASE_RATE,
  REFINE_TIANMING_BONUS, REFINE_SHARD_PITY, hasHiddenPassive,
  SCROLL_PRICES, EQUIPMENT_TEMPLATES,
} from '../data/equipment';
import { PETS as PETS_DATA } from '../data/pets';
import { getInventoryMax } from './gameStore';

type GetFn = () => any;
type SetFn = (partial: any) => void;

let logIdCounter = 1000000; // offset to avoid collision with gameStore's counter
function addLog(log: BattleLogEntry[], text: string, type: BattleLogEntry['type']): BattleLogEntry[] {
  return [{ id: logIdCounter++, text, type, timestamp: Date.now() }, ...log].slice(0, 30);
}

function applyEnhanceResult(
  set: SetFn, state: any, location: string, invIdx: number,
  newItem: EquipmentItem, updatedPlayer: PlayerState, log: BattleLogEntry[],
) {
  updatedPlayer.totalEnhances = (updatedPlayer.totalEnhances || 0) + 1;
  if (location === 'inventory') {
    const newInv = [...state.inventory];
    newInv[invIdx] = newItem;
    set({ player: updatedPlayer, inventory: newInv, battle: { ...state.battle, log } });
  } else {
    set({ player: updatedPlayer, [location]: newItem, battle: { ...state.battle, log } } as any);
  }
}

export function equipItemAction(get: GetFn, set: SetFn, item: EquipmentItem) {
  const state = get();
  const key = item.slot === 'weapon' ? 'equippedWeapon' : item.slot === 'armor' ? 'equippedArmor' : 'equippedTreasure';
  const current = state[key];
  let newInv = state.inventory.filter((i: EquipmentItem) => i.uid !== item.uid);
  if (current) newInv.push(current);
  set({
    [key]: item, inventory: newInv,
    battle: { ...state.battle, log: addLog(state.battle.log, `装备 ${QUALITY_INFO[item.quality].symbol}${item.name}`, 'info') },
  } as any);
}

export function unequipSlotAction(get: GetFn, set: SetFn, slot: EquipSlot) {
  const state = get();
  const key = slot === 'weapon' ? 'equippedWeapon' : slot === 'armor' ? 'equippedArmor' : 'equippedTreasure';
  const item = state[key];
  if (!item) return;
  if (state.inventory.length >= getInventoryMax(state.player.reincarnations)) return;
  set({ [key]: null, inventory: [...state.inventory, item] } as any);
}

export function enhanceEquipAction(get: GetFn, set: SetFn, uid: string, useProtect = false, useLucky = false) {
  const state = get();
  let eq: EquipmentItem | null = null;
  let location: 'equippedWeapon' | 'equippedArmor' | 'equippedTreasure' | 'inventory' = 'inventory';
  let invIdx = -1;
  for (const key of ['equippedWeapon', 'equippedArmor', 'equippedTreasure'] as const) {
    if (state[key]?.uid === uid) { eq = state[key]; location = key; break; }
  }
  if (!eq) {
    invIdx = state.inventory.findIndex((i: EquipmentItem) => i.uid === uid);
    if (invIdx === -1) return;
    eq = state.inventory[invIdx];
  }
  const item = eq!;
  const maxLvl = getMaxEnhanceLevel(item);
  if (item.level >= maxLvl) return;
  const cost = getEnhanceCost(item);
  if (state.player.lingshi < cost) return;
  const targetLevel = item.level + 1;
  const isHigh = isHighEnhance(item);
  let updatedPlayer = { ...state.player, lingshi: state.player.lingshi };
  if (isHigh && useProtect && updatedPlayer.protectScrolls > 0) { updatedPlayer.protectScrolls--; } else { useProtect = false; }
  if (isHigh && useLucky && updatedPlayer.luckyScrolls > 0) { updatedPlayer.luckyScrolls--; } else { useLucky = false; }
  let log = [...state.battle.log];
  if (isHigh) {
    let rate = getHighEnhanceRate(targetLevel);
    if (useLucky) rate = Math.min(90, rate + 10);
    const success = Math.random() * 100 < rate;
    if (success) {
      updatedPlayer.lingshi -= cost;
      const newItem = { ...item, level: targetLevel } as EquipmentItem;
      log = addLog(log, `高阶强化成功！${item.name} → +${targetLevel}`, 'levelup');
      const hidden = hasHiddenPassive(newItem);
      if (hidden) log = addLog(log, `觉醒隐藏被动「${hidden.name}」：${hidden.description}`, 'levelup');
      applyEnhanceResult(set, state, location, invIdx, newItem, updatedPlayer, log);
    } else {
      updatedPlayer.lingshi -= Math.floor(cost * 0.6);
      const dropLevels = useProtect ? 0 : getHighEnhanceDrop(targetLevel);
      const newLevel = Math.max(10, item.level - dropLevels);
      const newItem = { ...item, level: newLevel } as EquipmentItem;
      if (useProtect) { log = addLog(log, `强化失败！护级符生效，等级保持 +${item.level}`, 'info'); }
      else { log = addLog(log, `强化失败！${item.name} +${item.level} → +${newLevel}`, 'info'); }
      applyEnhanceResult(set, state, location, invIdx, newItem, updatedPlayer, log);
    }
  } else {
    updatedPlayer.lingshi -= cost;
    const newItem = { ...item, level: targetLevel } as EquipmentItem;
    log = addLog(log, `强化 ${item.name} → +${targetLevel}（灵石-${cost}）`, 'info');
    applyEnhanceResult(set, state, location, invIdx, newItem, updatedPlayer, log);
  }
}

export function refineItemAction(get: GetFn, set: SetFn, targetUid: string, materialUids: string[], useTianming = false, usePity = false) {
  const state = get();
  let target: EquipmentItem | null = null;
  let targetLoc: 'equippedWeapon' | 'equippedArmor' | 'equippedTreasure' | 'inventory' = 'inventory';
  let targetInvIdx = -1;
  for (const key of ['equippedWeapon', 'equippedArmor', 'equippedTreasure'] as const) {
    if (state[key]?.uid === targetUid) { target = state[key]; targetLoc = key; break; }
  }
  if (!target) {
    targetInvIdx = state.inventory.findIndex((i: EquipmentItem) => i.uid === targetUid);
    if (targetInvIdx === -1) return;
    target = state.inventory[targetInvIdx];
  }
  if (!canRefine(target!)) return;
  const tgt = target as EquipmentItem;
  const materials = materialUids
    .map(uid => state.inventory.find((i: EquipmentItem) => i.uid === uid))
    .filter((i: any): i is EquipmentItem => !!i && i.quality === 'legendary' && i.uid !== targetUid);
  if (materials.length < REFINE_MATERIAL_COUNT) return;
  const cost = getRefineCost(target!);
  let updatedPlayer = { ...state.player };

  if (usePity) {
    if (updatedPlayer.hongmengShards < REFINE_SHARD_PITY) return;
    if (updatedPlayer.lingshi < cost) return;
    updatedPlayer.hongmengShards -= REFINE_SHARD_PITY;
    updatedPlayer.lingshi -= cost;
    const matUids = new Set(materials.slice(0, REFINE_MATERIAL_COUNT).map(m => m.uid));
    const newInv = state.inventory.filter((i: EquipmentItem) => !matUids.has(i.uid));
    const refined = { ...target!, quality: 'mythic' as const } as EquipmentItem;
    let log = addLog(state.battle.log, `碎片保底精炼成功！${target!.name} → 鸿蒙`, 'levelup');
    if (targetLoc === 'inventory') {
      const idx = newInv.findIndex((i: EquipmentItem) => i.uid === targetUid);
      if (idx >= 0) newInv[idx] = refined;
      set({ player: updatedPlayer, inventory: newInv, battle: { ...state.battle, log } });
    } else {
      set({ player: updatedPlayer, [targetLoc]: refined, inventory: newInv, battle: { ...state.battle, log } } as any);
    }
    return;
  }

  if (updatedPlayer.lingshi < cost) return;
  let rate = REFINE_BASE_RATE;
  if (useTianming && updatedPlayer.tianmingScrolls > 0) { updatedPlayer.tianmingScrolls--; rate += REFINE_TIANMING_BONUS; }
  const success = Math.random() * 100 < rate;
  let log = [...state.battle.log];
  if (success) {
    updatedPlayer.lingshi -= cost;
    const matUids = new Set(materials.slice(0, REFINE_MATERIAL_COUNT).map(m => m.uid));
    const newInv = state.inventory.filter((i: EquipmentItem) => !matUids.has(i.uid));
    const refined = { ...target!, quality: 'mythic' as const } as EquipmentItem;
    log = addLog(log, `精炼成功！${target!.name} → 鸿蒙`, 'levelup');
    if (targetLoc === 'inventory') {
      const idx = newInv.findIndex((i: EquipmentItem) => i.uid === targetUid);
      if (idx >= 0) newInv[idx] = refined;
      set({ player: updatedPlayer, inventory: newInv, battle: { ...state.battle, log } });
    } else {
      set({ player: updatedPlayer, [targetLoc]: refined, inventory: newInv, battle: { ...state.battle, log } } as any);
    }
  } else {
    updatedPlayer.lingshi -= Math.floor(cost * 0.5);
    updatedPlayer.hongmengShards += 1;
    log = addLog(log, `精炼失败！鸿蒙碎片+1 (${updatedPlayer.hongmengShards}/${REFINE_SHARD_PITY})`, 'info');
    log = addLog(log, `消耗灵石 ${Math.floor(cost * 0.5)}，材料已返还`, 'info');
    set({ player: updatedPlayer, battle: { ...state.battle, log } });
  }
}

export function buyScrollAction(get: GetFn, set: SetFn, type: 'tianming' | 'protect' | 'lucky') {
  const state = get();
  const price = SCROLL_PRICES[type];
  if (state.player.pantao < price) return;
  const updatedPlayer = { ...state.player, pantao: state.player.pantao - price };
  switch (type) {
    case 'tianming': updatedPlayer.tianmingScrolls++; break;
    case 'protect': updatedPlayer.protectScrolls++; break;
    case 'lucky': updatedPlayer.luckyScrolls++; break;
  }
  const scrollName = type === 'tianming' ? '天命符' : type === 'protect' ? '护级符' : '幸运符';
  const log = addLog(state.battle.log, `购买 ${scrollName} x1（蟠桃-${price}）`, 'info');
  set({ player: updatedPlayer, battle: { ...state.battle, log } });
}

export function sellEquipAction(get: GetFn, set: SetFn, uid: string) {
  const state = get();
  const idx = state.inventory.findIndex((i: EquipmentItem) => i.uid === uid);
  if (idx === -1) return;
  const eq = state.inventory[idx];
  const sellPrice = Math.floor(getEquipEffectiveStat(eq) * 2 + (eq.level + 1) * 50);
  set({
    player: { ...state.player, lingshi: state.player.lingshi + sellPrice },
    inventory: state.inventory.filter((i: EquipmentItem) => i.uid !== uid),
    battle: { ...state.battle, log: addLog(state.battle.log, `卖出 ${eq.name} → 灵石+${sellPrice}`, 'info') },
  });
}

export function toggleLockAction(get: GetFn, set: SetFn, uid: string) {
  const state = get();
  set({ inventory: state.inventory.map((i: EquipmentItem) => i.uid === uid ? { ...i, locked: !i.locked } : i) });
}

export function decomposeEquipAction(get: GetFn, set: SetFn, uid: string) {
  const state = get();
  const idx = state.inventory.findIndex((i: EquipmentItem) => i.uid === uid);
  if (idx === -1) return;
  const eq = state.inventory[idx];
  if (eq.locked) return;
  const sellPrice = Math.floor(getEquipEffectiveStat(eq) * 2 + (eq.level + 1) * 50);
  const decompLingshi = Math.floor(sellPrice * 0.6);
  const updatedPlayer = { ...state.player, lingshi: state.player.lingshi + decompLingshi };
  let shardMsg = '';
  if (eq.quality === 'legendary' || eq.quality === 'mythic') { updatedPlayer.hongmengShards += 1; shardMsg = ' 碎片+1'; }
  set({
    player: updatedPlayer,
    inventory: state.inventory.filter((i: EquipmentItem) => i.uid !== uid),
    battle: { ...state.battle, log: addLog(state.battle.log, `分解 ${eq.name} → 灵石+${decompLingshi}${shardMsg}`, 'info') },
  });
}

export function batchDecomposeAction(get: GetFn, set: SetFn, uids: string[]) {
  const state = get();
  let totalLingshi = 0, totalShards = 0, count = 0;
  const uidSet = new Set(uids);
  const remaining: EquipmentItem[] = [];
  for (const item of state.inventory) {
    if (uidSet.has(item.uid) && !item.locked) {
      const sellPrice = Math.floor(getEquipEffectiveStat(item) * 2 + (item.level + 1) * 50);
      totalLingshi += Math.floor(sellPrice * 0.6);
      if (item.quality === 'legendary' || item.quality === 'mythic') totalShards++;
      count++;
    } else { remaining.push(item); }
  }
  if (count === 0) return;
  const updatedPlayer = { ...state.player, lingshi: state.player.lingshi + totalLingshi, hongmengShards: state.player.hongmengShards + totalShards };
  const shardMsg = totalShards > 0 ? ` 碎片+${totalShards}` : '';
  set({
    player: updatedPlayer, inventory: remaining,
    battle: { ...state.battle, log: addLog(state.battle.log, `批量分解 ${count}件 → 灵石+${totalLingshi}${shardMsg}`, 'info') },
  });
}

export function autoEquipBestAction(get: GetFn, set: SetFn): number {
  const state = get();
  let equipped = 0;
  for (const slot of ['weapon', 'armor', 'treasure'] as EquipSlot[]) {
    const key = slot === 'weapon' ? 'equippedWeapon' : slot === 'armor' ? 'equippedArmor' : 'equippedTreasure';
    const current = state[key as keyof typeof state] as EquipmentItem | null;
    const currentStat = current ? getEquipEffectiveStat(current) : 0;
    const candidates = (get().inventory as EquipmentItem[]).filter((i: EquipmentItem) => i.slot === slot);
    let best: EquipmentItem | null = null;
    let bestStat = currentStat;
    for (const c of candidates) {
      const s = getEquipEffectiveStat(c);
      if (s > bestStat) { best = c; bestStat = s; }
    }
    if (best) { equipItemAction(get, set, best); equipped++; }
  }
  if (equipped > 0) {
    set({ battle: { ...get().battle, log: addLog(get().battle.log, `一键装备：更换了 ${equipped} 件最优装备`, 'info') } });
  }
  return equipped;
}

export function quickDecomposeAction(get: GetFn, set: SetFn, maxQuality: number): number {
  const state = get();
  const qualityOrder = Object.keys(QUALITY_INFO);
  const toDecompose = state.inventory.filter((i: EquipmentItem) => qualityOrder.indexOf(i.quality) <= maxQuality);
  if (toDecompose.length === 0) return 0;
  batchDecomposeAction(get, set, toDecompose.map((i: EquipmentItem) => i.uid));
  return toDecompose.length;
}

export function goToChapterAction(get: GetFn, set: SetFn, chapterId: number) {
  const state = get();
  if (chapterId > state.highestChapter) return;
  if (chapterId === state.battle.chapterId) return;
  const ch = CHAPTERS.find(c => c.id === chapterId);
  if (!ch) return;
  const enemy = createEnemy(chapterId, 1, false)!;
  const log = addLog(state.battle.log, `传送至第${chapterId}章「${ch.name}」`, 'info');
  set({ battle: { ...state.battle, chapterId, stageNum: 1, wave: 1, isBossWave: false, maxWaves: 3, currentEnemy: enemy, log, tribulation: undefined } });
}

export function sweepChapterAction(get: GetFn, set: SetFn, chapterId: number, count: number): { gold: number; exp: number; items: string[] } {
  const state = get();
  if (chapterId >= state.highestChapter) return { gold: 0, exp: 0, items: [] };
  const ch = CHAPTERS.find(c => c.id === chapterId);
  if (!ch) return { gold: 0, exp: 0, items: [] };
  const avgLv = Math.floor((ch.levelRange[0] + ch.levelRange[1]) / 2);
  const sweepCount = Math.min(count, 10);
  let totalGold = 0, totalExp = 0;
  const droppedItems: string[] = [];
  const reincMults = {
    gold: state.player.reincPerks?.gold_mult ? (1 + state.player.reincPerks.gold_mult * 0.1) : 1,
    exp: state.player.reincPerks?.exp_mult ? (1 + state.player.reincPerks.exp_mult * 0.1) : 1,
  };
  for (let i = 0; i < sweepCount; i++) {
    const gold = Math.floor((avgLv * 5 + 10) * (1 + Math.random() * 0.5) * reincMults.gold);
    const exp = Math.floor((avgLv * 3 + 5) * (1 + Math.random() * 0.5) * reincMults.exp);
    totalGold += gold;
    totalExp += exp;
    if (Math.random() < 0.25 && state.inventory.length < getInventoryMax(state.player.reincarnations)) {
      const midStage = Math.floor((ch.stages || 50) / 2) + (chapterId - 1) * 50;
      const drop = rollEquipDrop(midStage, false);
      if (drop) {
        const item = createEquipFromTemplate(drop);
        state.inventory.push(item);
        if (!state.player.codexEquipIds.includes(drop.id)) {
          state.player.codexEquipIds = [...state.player.codexEquipIds, drop.id];
        }
        droppedItems.push(`${QUALITY_INFO[item.quality].label}${item.name}`);
      }
    }
  }
  const updatedPlayer = { ...state.player };
  updatedPlayer.lingshi += totalGold;
  updatedPlayer.exp += totalExp;
  while (updatedPlayer.exp >= expForLevel(updatedPlayer.level)) {
    updatedPlayer.exp -= expForLevel(updatedPlayer.level);
    updatedPlayer.level++;
  }
  const log = addLog(state.battle.log, `⚡ 扫荡「${ch.name}」×${sweepCount}：+${totalGold}灵石 +${totalExp}经验${droppedItems.length ? ' +' + droppedItems.length + '件装备' : ''}`, 'drop');
  set({ player: updatedPlayer, inventory: [...state.inventory], battle: { ...state.battle, log } });
  return { gold: totalGold, exp: totalExp, items: droppedItems };
}

export function sweepAllAction(get: GetFn, set: SetFn): { gold: number; exp: number; items: string[]; chapters: number } {
  const state = get();
  let totalGold = 0, totalExp = 0;
  const allItems: string[] = [];
  let chapCount = 0;
  for (const ch of CHAPTERS) {
    if (ch.id >= state.highestChapter) continue;
    const r = sweepChapterAction(get, set, ch.id, 10);
    totalGold += r.gold;
    totalExp += r.exp;
    allItems.push(...r.items);
    chapCount++;
  }
  return { gold: totalGold, exp: totalExp, items: allItems, chapters: chapCount };
}

export function batchEnhanceEquippedAction(get: GetFn, set: SetFn): { count: number; cost: number } {
  const state = get();
  const slots = ['equippedWeapon', 'equippedArmor', 'equippedTreasure'] as const;
  let totalCount = 0, totalCost = 0;
  for (const slot of slots) {
    const eq = state[slot];
    if (!eq) continue;
    for (let i = 0; i < 10; i++) {
      const s = get();
      const currentEq = s[slot];
      if (!currentEq || currentEq.level >= 10) break;
      const cost = (currentEq.level + 1) * 100;
      if (s.player.lingshi < cost) break;
      enhanceEquipAction(get, set, currentEq.uid);
      totalCount++;
      totalCost += cost;
    }
  }
  return { count: totalCount, cost: totalCost };
}

export function synthesizeEquipAction(get: GetFn, set: SetFn, uids: string[]): { success: boolean; result?: EquipmentItem; message: string } {
  const state = get();
  if (uids.length !== 3) return { success: false, message: '需要选择3件装备' };
  const items = uids.map(uid => state.inventory.find((i: EquipmentItem) => i.uid === uid)).filter(Boolean) as EquipmentItem[];
  if (items.length !== 3) return { success: false, message: '装备不存在' };
  if (items.some(i => i.locked)) return { success: false, message: '不能合成已锁定装备' };
  const quality = items[0].quality;
  if (!items.every(i => i.quality === quality)) return { success: false, message: '3件装备品质必须相同' };
  const qualityOrder: Quality[] = ['common', 'spirit', 'immortal', 'divine', 'legendary', 'mythic'];
  const qIdx = qualityOrder.indexOf(quality);
  if (qIdx >= qualityOrder.length - 1) return { success: false, message: '鸿蒙品质已是最高，无法合成' };
  const nextQuality = qualityOrder[qIdx + 1];
  const slotCounts: Record<string, number> = {};
  items.forEach(i => { slotCounts[i.slot] = (slotCounts[i.slot] || 0) + 1; });
  const preferredSlot = Object.entries(slotCounts).sort((a, b) => b[1] - a[1])[0][0] as EquipSlot;
  let pool = EQUIPMENT_TEMPLATES.filter(t => t.quality === nextQuality && t.slot === preferredSlot);
  if (pool.length === 0) pool = EQUIPMENT_TEMPLATES.filter(t => t.quality === nextQuality);
  if (pool.length === 0) return { success: false, message: '没有可合成的目标装备' };
  const template = pool[Math.floor(Math.random() * pool.length)];
  const newItem = createEquipFromTemplate(template);
  const uidSet = new Set(uids);
  const newInventory = state.inventory.filter((i: EquipmentItem) => !uidSet.has(i.uid));
  newInventory.push(newItem);
  const codexEquipIds = [...state.player.codexEquipIds];
  if (!codexEquipIds.includes(newItem.templateId)) codexEquipIds.push(newItem.templateId);
  set({
    inventory: newInventory,
    player: { ...state.player, codexEquipIds },
    battle: { ...state.battle, log: addLog(state.battle.log, `合成成功！${QUALITY_INFO[quality].symbol}×3 → ${QUALITY_INFO[nextQuality].symbol}${newItem.name}`, 'levelup') },
  });
  return { success: true, result: newItem, message: `合成成功！获得 ${QUALITY_INFO[nextQuality].symbol}${newItem.name}` };
}

export function feedPetAction(get: GetFn, set: SetFn, petId: string) {
  const state = get();
  const pet = PETS_DATA.find(p => p.id === petId);
  if (!pet) return;
  const currentLevel = state.player.petLevels?.[petId] ?? 0;
  if (currentLevel >= pet.maxLevel) return;
  if (state.player.level < pet.unlockLevel) return;
  const cost = pet.feedCost(currentLevel);
  if (state.player.lingshi < cost) return;
  set({
    player: {
      ...state.player, lingshi: state.player.lingshi - cost,
      petLevels: { ...state.player.petLevels, [petId]: currentLevel + 1 },
    },
    battle: { ...state.battle, log: addLog(state.battle.log, `${pet.emoji}${pet.name} 升至 Lv.${currentLevel + 1}！`, 'levelup') },
  });
}

export function setActivePetAction(get: GetFn, set: SetFn, petId: string | null) {
  set({ player: { ...get().player, activePetId: petId } });
}
