/**
 * EquipStore — 装备背包、穿戴状态
 */
import { create } from 'zustand';
import { EquipmentInstance, EquipSlot, tryEnhance, getEnhanceCost } from '../engine/equipment';
import { bn } from '../engine/bignum';
import { usePlayerStore } from './player';
import { eventBus } from '../engine/events';

export interface EquippedSlots {
  weapon: string | null;
  headgear: string | null;
  armor: string | null;
  accessory: string | null;
  mount: string | null;
  treasure: string | null;
}

interface EquipStore {
  items: EquipmentInstance[];
  equipped: Record<string, EquippedSlots>; // charId -> slots
  maxSlots: number;

  addItem: (item: EquipmentInstance) => void;
  addItems: (items: EquipmentInstance[]) => void;
  removeItem: (uid: string) => void;
  equip: (charId: string, slot: EquipSlot, uid: string) => void;
  unequip: (charId: string, slot: EquipSlot) => void;
  enhance: (uid: string) => { success: boolean; message: string };
  sellItem: (uid: string) => number;
  getEquippedItems: (charId: string) => (EquipmentInstance | null)[];
  getItem: (uid: string) => EquipmentInstance | undefined;
  loadState: (items: EquipmentInstance[], equipped: Record<string, EquippedSlots>) => void;
}

const EMPTY_SLOTS: EquippedSlots = {
  weapon: null, headgear: null, armor: null,
  accessory: null, mount: null, treasure: null,
};

export const useEquipStore = create<EquipStore>((set, get) => ({
  items: [],
  equipped: {},
  maxSlots: 50,

  addItem: (item) => {
    const { items, maxSlots } = get();
    if (items.length >= maxSlots) return; // full
    set({ items: [...items, item] });
  },

  addItems: (newItems) => {
    const { items, maxSlots } = get();
    const space = maxSlots - items.length;
    const toAdd = newItems.slice(0, space);
    set({ items: [...items, ...toAdd] });
  },

  removeItem: (uid) => {
    set(s => ({ items: s.items.filter(i => i.uid !== uid) }));
  },

  equip: (charId, slot, uid) => {
    const { equipped } = get();
    const charSlots = equipped[charId] || { ...EMPTY_SLOTS };
    // Unequip current
    const prevUid = charSlots[slot];
    charSlots[slot] = uid;
    set({ equipped: { ...equipped, [charId]: { ...charSlots } } });
    eventBus.emit({ type: 'EQUIP_EQUIPPED', charId, slot, itemUid: uid });
  },

  unequip: (charId, slot) => {
    const { equipped } = get();
    const charSlots = equipped[charId] || { ...EMPTY_SLOTS };
    charSlots[slot] = null;
    set({ equipped: { ...equipped, [charId]: { ...charSlots } } });
  },

  enhance: (uid) => {
    const { items } = get();
    const item = items.find(i => i.uid === uid);
    if (!item) return { success: false, message: '装备不存在' };
    if (item.enhanceLevel >= 15) return { success: false, message: '已达最高强化等级' };

    const cost = getEnhanceCost(item);
    if (!usePlayerStore.getState().spendCoins(cost)) {
      return { success: false, message: '金币不足' };
    }

    const { success, result } = tryEnhance(item);
    set({ items: items.map(i => i.uid === uid ? result : i) });
    return {
      success,
      message: success ? `强化成功！+${result.enhanceLevel}` : '强化失败…',
    };
  },

  sellItem: (uid) => {
    const { items } = get();
    const item = items.find(i => i.uid === uid);
    if (!item) return 0;
    const value = (item.baseAtk + item.baseDef + item.baseHp) * 5;
    usePlayerStore.getState().addCoins(bn(value));
    set({ items: items.filter(i => i.uid !== uid) });
    return value;
  },

  getEquippedItems: (charId) => {
    const { equipped, items } = get();
    const slots = equipped[charId] || EMPTY_SLOTS;
    return (['weapon', 'headgear', 'armor', 'accessory', 'mount', 'treasure'] as EquipSlot[]).map(
      slot => items.find(i => i.uid === slots[slot]) || null
    );
  },

  getItem: (uid) => get().items.find(i => i.uid === uid),

  loadState: (items, equipped) => set({ items, equipped }),
}));
