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
import { useTalentStore } from './talent';
import { useCompanionStore } from './companion';
import { useReincarnationStore } from './reincarnation';
import { useSkillStore } from './skill';
import { calcSynergyBuffs } from '../engine/synergy';
import { useAchievementStore } from './achievement';
import { useSanctuaryStore } from './sanctuary'; // v16.0 fix: Gap 13
import { useAffinityStore } from './affinity'; // v16.0 fix: Gap 13
import { useDailyQuestStore } from './dailyQuest';

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

    // 里程碑+天赋+伙伴buff: 锻造成功率加成
    const msBonus = (useMilestoneStore.getState().getBuffs().forgeSuccessRate || 0)
      + (useTalentStore.getState().getBuffs().forgeRate || 0)
      + (useCompanionStore.getState().getBuffs().forgeRate || 0)
      + (useReincarnationStore.getState().getBuffs().forgeRate || 0)
      + (useSkillStore.getState().getAllBuffs().forgeRate || 0)
      + (useSanctuaryStore.getState().getBuffs().forgeRate || 0) // v16.0 fix: Gap 13
      + (useAffinityStore.getState().getBuffs().forgeRate || 0) // v16.0 fix: Gap 13
      + calcSynergyBuffs({
          talentUsedPoints: useTalentStore.getState().getUsedPoints(),
          skillTotalLevels: 0, achievementCount: 0, towerHighestFloor: 0,
          reincarnationCount: 0, petLevel: 0,
        }).forgeRate;
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

    // 追踪锻造次数
    useAchievementStore.getState().addStat('forgeCount');
    useDailyQuestStore.getState().addProgress('forges', 1);

    return result;
  },

  loadState: (level, exp) => set({ forgeLevel: level, forgeExp: exp }),
}));
