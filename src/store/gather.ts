/**
 * GatherStore — 采集状态管理
 */
import { create } from 'zustand';
import {
  GatherNode, ActiveGather, startGather, isGatherComplete, collectGather,
} from '../engine/gather';
import { useMaterialStore } from './material';
import { usePlayerStore } from './player';
import { useUIStore } from './ui';
import { useMilestoneStore } from './milestone';
import { useTalentStore } from './talent';
import { useCompanionStore } from './companion';
import { useReincarnationStore } from './reincarnation';
import { useAchievementStore } from './achievement';
import { useDailyQuestStore } from './dailyQuest';

interface GatherStore {
  activeGather: ActiveGather | null;
  cooldowns: Record<string, number>; // nodeId -> cooldown end timestamp

  start: (node: GatherNode) => boolean;
  collect: (node: GatherNode) => { materials: { materialId: string; count: number }[] } | null;
  isComplete: () => boolean;
  isCooling: (nodeId: string) => boolean;
  loadState: (active: ActiveGather | null, cooldowns: Record<string, number>) => void;
}

export const useGatherStore = create<GatherStore>((set, get) => ({
  activeGather: null,
  cooldowns: {},

  start: (node) => {
    const { activeGather, cooldowns } = get();
    if (activeGather) return false;
    if ((cooldowns[node.id] ?? 0) > Date.now()) return false;

    const charId = usePlayerStore.getState().player.activeCharId || '';
    // 里程碑采集速度加成：缩短采集时间
    const msSpeed = (useMilestoneStore.getState().getBuffs().gatherSpeed || 0)
      + (useTalentStore.getState().getBuffs().gatherSpeed || 0)
      + (useCompanionStore.getState().getBuffs().gatherSpeed || 0)
      + (useReincarnationStore.getState().getBuffs().gatherSpeed || 0);
    const boostedNode = msSpeed > 0
      ? { ...node, gatherTime: Math.max(10, Math.floor(node.gatherTime * (1 - msSpeed / 100))) }
      : node;
    set({ activeGather: startGather(boostedNode, Date.now(), charId) });
    return true;
  },

  collect: (node) => {
    const { activeGather } = get();
    if (!activeGather || activeGather.nodeId !== node.id) return null;
    if (!isGatherComplete(activeGather)) return null;

    const charId = usePlayerStore.getState().player.activeCharId || '';
    const result = collectGather(node, charId);
    useMaterialStore.getState().addMaterials(result.materials);

    set({
      activeGather: null,
      cooldowns: { ...get().cooldowns, [node.id]: Date.now() + node.cooldown * 1000 },
    });

    // 追踪采集
    useAchievementStore.getState().addStat('gatherCount');
    useDailyQuestStore.getState().addProgress('gathers', 1);

    if (result.materials.length > 0) {
      useUIStore.getState().addToast(
        `采集完成：${result.materials.map(m => `${m.materialId} ×${m.count}`).join(', ')}`,
        'success'
      );
    }

    return { materials: result.materials };
  },

  isComplete: () => {
    const { activeGather } = get();
    return activeGather ? isGatherComplete(activeGather) : false;
  },

  isCooling: (nodeId) => (get().cooldowns[nodeId] ?? 0) > Date.now(),

  loadState: (active, cooldowns) => set({ activeGather: active, cooldowns }),
}));
