/**
 * ShopEngine — 商店系统：商品定义、刷新、购买
 */

export type CurrencyType = 'coins' | 'lingshi' | 'merit';

export interface ShopItemDef {
  id: string;
  name: string;
  icon: string;
  desc: string;
  price: number;
  currency: CurrencyType;
  category: 'consumable' | 'material' | 'buff';
  effect: ShopEffect;
  stock: number; // -1=无限
}

export type ShopEffect =
  | { type: 'addXiuwei'; amount: number }
  | { type: 'addCoins'; amount: number }
  | { type: 'addMerit'; amount: number }
  | { type: 'addMaterial'; materialId: string; count: number }
  | { type: 'tempBuff'; buffType: string; value: number; durationSec: number }
  | { type: 'addTalentPoint'; amount: number }
  | { type: 'addCompanionExp'; amount: number };

// === 商品池 ===
export const SHOP_POOL: ShopItemDef[] = [
  { id: 'exp_pill_s', name: '小经验丹', icon: '💊', desc: '获得1000修为', price: 500, currency: 'coins', category: 'consumable', effect: { type: 'addXiuwei', amount: 1000 }, stock: 5 },
  { id: 'exp_pill_m', name: '中经验丹', icon: '💊', desc: '获得10000修为', price: 3000, currency: 'coins', category: 'consumable', effect: { type: 'addXiuwei', amount: 10000 }, stock: 3 },
  { id: 'exp_pill_l', name: '大经验丹', icon: '🧪', desc: '获得100000修为', price: 20000, currency: 'coins', category: 'consumable', effect: { type: 'addXiuwei', amount: 100000 }, stock: 1 },
  { id: 'coin_bag_s', name: '小聚宝盆', icon: '💰', desc: '获得2000金币', price: 5, currency: 'lingshi', category: 'consumable', effect: { type: 'addCoins', amount: 2000 }, stock: 5 },
  { id: 'coin_bag_l', name: '大聚宝盆', icon: '💎', desc: '获得20000金币', price: 30, currency: 'lingshi', category: 'consumable', effect: { type: 'addCoins', amount: 20000 }, stock: 2 },
  { id: 'merit_incense', name: '功德香', icon: '🪔', desc: '获得50功德', price: 5000, currency: 'coins', category: 'consumable', effect: { type: 'addMerit', amount: 50 }, stock: 3 },
  { id: 'mat_iron', name: '精铁礼包', icon: '🔩', desc: '获得10精铁', price: 1000, currency: 'coins', category: 'material', effect: { type: 'addMaterial', materialId: 'iron', count: 10 }, stock: 5 },
  { id: 'mat_jade', name: '灵玉礼包', icon: '🟢', desc: '获得5灵玉', price: 3000, currency: 'coins', category: 'material', effect: { type: 'addMaterial', materialId: 'jade', count: 5 }, stock: 3 },
  { id: 'mat_star', name: '星辰石礼包', icon: '⭐', desc: '获得3星辰石', price: 8000, currency: 'coins', category: 'material', effect: { type: 'addMaterial', materialId: 'star_stone', count: 3 }, stock: 2 },
  { id: 'buff_xiuwei', name: '修炼加速符', icon: '📜', desc: '修为+50% 5分钟', price: 2000, currency: 'coins', category: 'buff', effect: { type: 'tempBuff', buffType: 'xiuweiPercent', value: 50, durationSec: 300 }, stock: 2 },
  { id: 'buff_atk', name: '力量符', icon: '📜', desc: '攻击+30% 5分钟', price: 2000, currency: 'coins', category: 'buff', effect: { type: 'tempBuff', buffType: 'atkPercent', value: 30, durationSec: 300 }, stock: 2 },
  { id: 'buff_coin', name: '财神符', icon: '📜', desc: '金币+80% 5分钟', price: 3000, currency: 'coins', category: 'buff', effect: { type: 'tempBuff', buffType: 'coinPercent', value: 80, durationSec: 300 }, stock: 2 },
  { id: 'talent_book', name: '天赋秘籍', icon: '📕', desc: '获得1天赋点', price: 100, currency: 'merit', category: 'consumable', effect: { type: 'addTalentPoint', amount: 1 }, stock: 1 },
  { id: 'comp_exp', name: '伙伴丹', icon: '🍬', desc: '出战伙伴获得500经验', price: 5000, currency: 'coins', category: 'consumable', effect: { type: 'addCompanionExp', amount: 500 }, stock: 3 },
];

// === Engine ===

export interface ShopSlot {
  def: ShopItemDef;
  remaining: number; // 剩余库存
  discount: number;  // 1=原价, 0.5=五折
}

export interface ShopState {
  slots: ShopSlot[];
  nextRefreshTime: number; // timestamp
  manualRefreshCount: number;
}

const REFRESH_INTERVAL = 4 * 3600 * 1000; // 4小时
const SLOT_COUNT_MIN = 6;
const SLOT_COUNT_MAX = 8;
const DISCOUNT_CHANCE = 0.1;
const MANUAL_REFRESH_COST = 1000;

/**
 * 刷新商品 (随机选6-8件)
 */
export function refreshShop(): ShopSlot[] {
  const count = SLOT_COUNT_MIN + Math.floor(Math.random() * (SLOT_COUNT_MAX - SLOT_COUNT_MIN + 1));
  const shuffled = [...SHOP_POOL].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, count);

  return selected.map(def => ({
    def,
    remaining: def.stock,
    discount: Math.random() < DISCOUNT_CHANCE ? 0.5 : 1,
  }));
}

export function createShopState(): ShopState {
  return {
    slots: refreshShop(),
    nextRefreshTime: Date.now() + REFRESH_INTERVAL,
    manualRefreshCount: 0,
  };
}

/**
 * 检查是否需要自动刷新
 */
export function checkShopRefresh(state: ShopState): ShopState {
  if (Date.now() >= state.nextRefreshTime) {
    return {
      slots: refreshShop(),
      nextRefreshTime: Date.now() + REFRESH_INTERVAL,
      manualRefreshCount: state.manualRefreshCount,
    };
  }
  return state;
}

export function getManualRefreshCost(count: number): number {
  return MANUAL_REFRESH_COST * (count + 1); // 递增
}

export function getSlotPrice(slot: ShopSlot): number {
  return Math.floor(slot.def.price * slot.discount);
}
