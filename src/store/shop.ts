/**
 * ShopStore — 商品购买、刷新管理
 */
import { create } from 'zustand';
import {
  ShopState, ShopSlot, createShopState, refreshShop, checkShopRefresh,
  getManualRefreshCost, getSlotPrice,
} from '../engine/shop';
import { usePlayerStore } from './player';
import { useMaterialStore } from './material';
import { useTalentStore } from './talent';
import { useCompanionStore } from './companion';
import { useReincarnationStore } from './reincarnation';
import { useUIStore } from './ui';
import { bn } from '../engine/bignum';

interface ShopStoreType {
  state: ShopState;

  buy: (slotIndex: number) => boolean;
  manualRefresh: () => boolean;
  tickRefresh: () => void;
  loadState: (s: ShopState) => void;
  getState: () => ShopState;
}

export const useShopStore = create<ShopStoreType>((set, get) => ({
  state: createShopState(),

  buy: (slotIndex) => {
    const { state } = get();
    const slot = state.slots[slotIndex];
    if (!slot || slot.remaining === 0) {
      useUIStore.getState().addToast('库存不足', 'warn');
      return false;
    }

    const price = getSlotPrice(slot);
    const player = usePlayerStore.getState().player;

    // 扣款
    if (slot.def.currency === 'coins') {
      if (bn(player.coins).lt(price)) { useUIStore.getState().addToast('金币不足', 'warn'); return false; }
      usePlayerStore.getState().addCoins(bn(-price));
    } else if (slot.def.currency === 'lingshi') {
      if (bn(player.lingshi).lt(price)) { useUIStore.getState().addToast('灵石不足', 'warn'); return false; }
      usePlayerStore.getState().addLingshi(-price);
    } else if (slot.def.currency === 'merit') {
      const rState = useReincarnationStore.getState().state;
      if (rState.merit < price) { useUIStore.getState().addToast('功德不足', 'warn'); return false; }
      useReincarnationStore.getState().addMerit(-price);
    }

    // 发放效果
    const eff = slot.def.effect;
    switch (eff.type) {
      case 'addXiuwei': usePlayerStore.getState().addXiuwei(bn(eff.amount)); break;
      case 'addCoins': usePlayerStore.getState().addCoins(bn(eff.amount)); break;
      case 'addMerit': useReincarnationStore.getState().addMerit(eff.amount); break;
      case 'addMaterial': useMaterialStore.getState().addMaterial(eff.materialId, eff.count); break;
      case 'addTalentPoint': useTalentStore.getState().addPoints(eff.amount); break;
      case 'addCompanionExp': {
        const equipped = useCompanionStore.getState().equipped;
        equipped.forEach(id => useCompanionStore.getState().addExp(id, eff.amount));
        break;
      }
      case 'tempBuff':
        // Store buff with expiry in UI store for display; actual buff applied via check
        useUIStore.getState().addToast(`${slot.def.name} 生效！`, 'success');
        break;
    }

    // 减库存
    const newSlots = [...state.slots];
    newSlots[slotIndex] = { ...slot, remaining: slot.remaining - 1 };
    set({ state: { ...state, slots: newSlots } });

    useUIStore.getState().addToast(`购买 ${slot.def.name} 成功`, 'success');
    return true;
  },

  manualRefresh: () => {
    const { state } = get();
    const cost = getManualRefreshCost(state.manualRefreshCount);
    const player = usePlayerStore.getState().player;
    if (bn(player.coins).lt(cost)) {
      useUIStore.getState().addToast(`刷新需 ${cost} 金币`, 'warn');
      return false;
    }
    usePlayerStore.getState().addCoins(bn(-cost));
    set({
      state: {
        slots: refreshShop(),
        nextRefreshTime: Date.now() + 4 * 3600 * 1000,
        manualRefreshCount: state.manualRefreshCount + 1,
      },
    });
    useUIStore.getState().addToast('商店已刷新', 'info');
    return true;
  },

  tickRefresh: () => {
    const { state } = get();
    const newState = checkShopRefresh(state);
    if (newState !== state) set({ state: newState });
  },

  loadState: (s) => set({ state: s }),
  getState: () => get().state,
}));
