/**
 * ForgeStore — 锻造状态管理
 * Bug #2: 失败退还50%材料
 * Bug #3: 连续失败5次保底成功
 */
import { create } from 'zustand';
import { canForge, doForge, doForgePity, forgeLevelExp, ForgeRecipe, ForgeResult } from '../engine/forge';
import { bn } from '../engine/bignum';
import { useMaterialStore } from './material';
import { usePlayerStore } from './player';
import { useEquipStore } from './equipment';
import { useUIStore } from './ui';
import { vibrateSuccess, vibrateFail } from '../utils/feedback';
import { useMilestoneStore } from './milestone';

const PITY_THRESHOLD = 5;

interface ForgeStore {
  forgeLevel: number;
  forgeExp: number;
  failStreak: number;

  forge: (recipe: ForgeRecipe) => ForgeResult;
  loadState: (level: number, exp: number) => void;
}

export const useForgeStore = create<ForgeStore>((set, get) => ({
  forgeLevel: 1,
  forgeExp: 0,
  failStreak: 0,

  forge: (recipe) => {
    const { forgeLevel, forgeExp, failStreak } = get();
    const materials = useMaterialStore.getState().materials;
    const coins = bn(usePlayerStore.getState().player.coins);

    const check = canForge(recipe, materials, coins, forgeLevel);
    if (!check.ok) {
      return { success: false, expGained: 0, message: `无法锻造：${check.missing.join('、')}` };
    }

    useMaterialStore.getState().removeMaterials(recipe.materials);
    usePlayerStore.getState().spendCoins(bn(recipe.coinsCost));

    // 里程碑buff: 锻造成功率加成
    const msBonus = useMilestoneStore.getState().getBuffs().forgeSuccessRate;
    const boostedRecipe = msBonus > 0
      ? { ...recipe, successRate: Math.min(0.99, recipe.successRate + msBonus / 100) }
      : recipe;

    // Bug #3: 保底
    const forcePity = failStreak >= PITY_THRESHOLD - 1;
    const result = forcePity
      ? doForgePity(boostedRecipe, forgeLevel)
      : doForge(boostedRecipe, forgeLevel);

    // Feedback
    result.success ? vibrateSuccess() : vibrateFail();

    // Bug #2: 失败退还50%
    if (!result.success) {
      const refund = recipe.materials
        .map(m => ({ materialId: m.materialId, count: Math.floor(m.count * 0.5) }))
        .filter(m => m.count > 0);
      if (refund.length > 0) {
        useMaterialStore.getState().addMaterials(refund);
        result.message += ` 退还50%材料。`;
      }
      set({ failStreak: failStreak + 1 });
    } else {
      set({ failStreak: 0 });
    }

    let newExp = forgeExp + result.expGained;
    let newLevel = forgeLevel;
    while (newExp >= forgeLevelExp(newLevel) && newLevel < 50) {
      newExp -= forgeLevelExp(newLevel);
      newLevel++;
      useUIStore.getState().addToast(`锻造等级提升至 ${newLevel} 级！`, 'success');
    }
    set(s => ({ forgeLevel: newLevel, forgeExp: newExp }));

    if (result.success && result.item) {
      useEquipStore.getState().addItem(result.item);
    }

    return result;
  },

  loadState: (level, exp) => set({ forgeLevel: level, forgeExp: exp }),
}));
