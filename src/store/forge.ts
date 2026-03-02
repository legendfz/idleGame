/**
 * ForgeStore — 锻造状态管理
 */
import { create } from 'zustand';
import { canForge, doForge, forgeLevelExp, ForgeRecipe, ForgeResult } from '../engine/forge';
import { bn } from '../engine/bignum';
import { useMaterialStore } from './material';
import { usePlayerStore } from './player';
import { useEquipStore } from './equipment';
import { useUIStore } from './ui';

interface ForgeStore {
  forgeLevel: number;
  forgeExp: number;

  forge: (recipe: ForgeRecipe) => ForgeResult;
  loadState: (level: number, exp: number) => void;
}

export const useForgeStore = create<ForgeStore>((set, get) => ({
  forgeLevel: 1,
  forgeExp: 0,

  forge: (recipe) => {
    const { forgeLevel, forgeExp } = get();
    const materials = useMaterialStore.getState().materials;
    const coins = bn(usePlayerStore.getState().player.coins);

    // 检查
    const check = canForge(recipe, materials, coins, forgeLevel);
    if (!check.ok) {
      return { success: false, expGained: 0, message: `无法锻造：${check.missing.join('、')}` };
    }

    // 扣除材料和金币
    useMaterialStore.getState().removeMaterials(recipe.materials);
    usePlayerStore.getState().spendCoins(bn(recipe.coinsCost));

    // 执行锻造
    const result = doForge(recipe, forgeLevel);

    // 加经验
    let newExp = forgeExp + result.expGained;
    let newLevel = forgeLevel;
    while (newExp >= forgeLevelExp(newLevel) && newLevel < 50) {
      newExp -= forgeLevelExp(newLevel);
      newLevel++;
      useUIStore.getState().addToast(`锻造等级提升至 ${newLevel} 级！`, 'success');
    }
    set({ forgeLevel: newLevel, forgeExp: newExp });

    // 装备入背包
    if (result.success && result.item) {
      useEquipStore.getState().addItem(result.item);
    }

    return result;
  },

  loadState: (level, exp) => set({ forgeLevel: level, forgeExp: exp }),
}));
