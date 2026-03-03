/**
 * useGameLoop — 游戏主循环 + 离线收益 + 存档 + EventBus 集成
 */
import { useEffect, useRef } from 'react';
import { usePlayerStore } from '../store/player';
import { useBattleStore } from '../store/battle';
import { useEquipStore } from '../store/equipment';
import { useJourneyStore } from '../store/journey';
import { useUIStore } from '../store/ui';
import { useMaterialStore } from '../store/material';
import { useForgeStore } from '../store/forge';
import { useGatherStore } from '../store/gather';
import { useDungeonStore } from '../store/dungeon';
import { useAchievementStore } from '../store/achievement';
import { useDailyQuestStore } from '../store/dailyQuest';
import { useMilestoneStore } from '../store/milestone';
import { SaveManager } from '../data/save';
import { GameStats } from '../engine/achievement';
import { calcOfflineReward } from '../engine/idle';
import { calcOfflineGather, GatherNode } from '../engine/gather';
import { eventBus } from '../engine/events';
import { bn } from '../engine/bignum';
import { getRealmConfig } from '../data/config';
import gatherNodesData from '../data/configs/gather-nodes.json';

export function useGameLoop() {
  const tick = usePlayerStore(s => s.tick);
  const tickBattle = useBattleStore(s => s.tickBattle);
  const lastTickRef = useRef(Date.now());
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    // === 1. 加载存档 ===
    const saved = SaveManager.load();
    if (saved) {
      if (saved.player) usePlayerStore.getState().loadState(saved.player);
      if (saved.equipment) useEquipStore.getState().loadState(saved.equipment.items || [], saved.equipment.equipped || {});
      if (saved.journey) useJourneyStore.getState().loadState(saved.journey);
      if (saved.materials) useMaterialStore.getState().loadState(saved.materials);
      if (saved.forge) useForgeStore.getState().loadState(saved.forge.forgeLevel || 1, saved.forge.forgeExp || 0);
      if (saved.gather) useGatherStore.getState().loadState(saved.gather.activeGather || null, saved.gather.cooldowns || {});
      if (saved.dungeon) useDungeonStore.getState().loadState(saved.dungeon);
      if (saved.achievement) useAchievementStore.getState().loadState(saved.achievement.progress || {}, saved.achievement.stats || {});
      if (saved.dailyQuest) useDailyQuestStore.getState().loadState(saved.dailyQuest);
      if (saved.milestone) useMilestoneStore.getState().loadState(saved.milestone);

      // === 2. 离线收益 ===
      const lastOnline = saved.player?.lastOnlineAt || Date.now();
      const reward = calcOfflineReward(lastOnline, Date.now(), saved.player?.realmId || 'fanren', 0, 0, 0);
      if (reward.duration >= 60) {
        usePlayerStore.getState().addXiuwei(reward.xiuwei);
        usePlayerStore.getState().addCoins(reward.coins);
        eventBus.emit({
          type: 'OFFLINE_REWARD',
          duration: reward.duration,
          xiuwei: reward.xiuwei,
          coins: reward.coins,
          bonusApplied: reward.bonusApplied,
        });
        // BUG-06 fix: 弹窗显示离线收益
        const hours = Math.floor(reward.duration / 3600);
        const mins = Math.floor((reward.duration % 3600) / 60);
        const timeStr = hours > 0 ? `${hours}小时${mins}分钟` : `${mins}分钟`;
        const bonusStr = reward.bonusApplied ? '\n🎁 回归奖励 +10%！' : '';
        // Bug #4: 离线采集收益
        const activeGather = useGatherStore.getState().activeGather;
        let gatherStr = '';
        if (activeGather) {
          const node = (gatherNodesData as GatherNode[]).find(n => n.id === activeGather.nodeId);
          if (node) {
            const gatherResult = calcOfflineGather(node, reward.duration);
            if (gatherResult.materials.length > 0) {
              useMaterialStore.getState().addMaterials(gatherResult.materials);
              gatherStr = '\n' + gatherResult.materials.map(m => `${m.materialId} ×${m.count}`).join(', ');
            }
          }
        }

        useUIStore.getState().setModal(
          `🌙 离线收益\n离线 ${timeStr}\n修为 +${reward.xiuwei.toFixed(0)}\n金币 +${reward.coins.toFixed(0)}${bonusStr}${gatherStr ? `\n⛏️ 采集: ${gatherStr}` : ''}`
        );
      }
    }

    // === 3. EventBus: 战斗完成 → 奖励结算 ===
    const unsubStage = eventBus.on('STAGE_COMPLETE', (e) => {
      const battle = useBattleStore.getState().battle;
      if (battle) {
        useJourneyStore.getState().complete(
          e.stageId,
          e.stars as 1 | 2 | 3,
          battle.elapsed
        );
        useUIStore.getState().addToast(`第 ${e.stageId} 难通关！⭐×${e.stars}`, 'success');
      }
    });

    const unsubBreak = eventBus.on('BREAKTHROUGH', (e) => {
      useUIStore.getState().addToast(`突破至 ${e.toRealm}！`, 'success');
    });

    const unsubLoot = eventBus.on('LOOT_DROP', (e) => {
      useUIStore.getState().addToast(`获得 ${e.items.length} 件装备`, 'info');
    });

    // === 4. Idle tick (1Hz) + achievement check (5s) ===
    let achCheckCounter = 0;
    const idleInterval = setInterval(() => {
      const now = Date.now();
      const dt = (now - lastTickRef.current) / 1000;
      lastTickRef.current = now;
      tick(Math.min(dt, 2));

      // 每5秒检测成就+里程碑
      achCheckCounter++;
      if (achCheckCounter % 5 === 0) {
        const p = usePlayerStore.getState().player;
        const realm = getRealmConfig(p.realmId);
        const journey = useJourneyStore.getState().journey;
        const achStats = useAchievementStore.getState().stats;
        const stats: GameStats = {
          totalKills: p.totalKills,
          totalBreakthroughs: p.totalBreakthroughs,
          realmOrder: realm?.order ?? 1,
          highestStage: journey.currentStage - 1,
          totalXiuwei: p.totalXiuwei,
          totalClicks: p.totalClicks,
          forgeLevel: useForgeStore.getState().forgeLevel,
          forgeCount: (achStats.forgeCount as number) ?? 0,
          gatherCount: (achStats.gatherCount as number) ?? 0,
          materialTypes: Object.keys(useMaterialStore.getState().materials).length,
          equipCount: useEquipStore.getState().items.length,
          playTime: p.playTime,
          prestigeCount: p.prestigeCount,
          dungeonClears: (achStats.dungeonClears as number) ?? 0,
        };
        useAchievementStore.getState().checkAll(stats);
        useMilestoneStore.getState().checkAll(stats);
      }
    }, 1000);

    // === 5. Battle tick (rAF) ===
    let running = true;
    let lastBattle = Date.now();
    const battleLoop = () => {
      if (!running) return;
      const now = Date.now();
      const dtMs = now - lastBattle;
      lastBattle = now;
      tickBattle(Math.min(dtMs, 100));
      requestAnimationFrame(battleLoop);
    };
    requestAnimationFrame(battleLoop);

    // === 6. Auto-save (30s) ===
    const getFullState = () => ({
      player: usePlayerStore.getState().player,
      equipment: {
        items: useEquipStore.getState().items,
        equipped: useEquipStore.getState().equipped,
      },
      journey: useJourneyStore.getState().journey,
      materials: useMaterialStore.getState().materials,
      forge: { forgeLevel: useForgeStore.getState().forgeLevel, forgeExp: useForgeStore.getState().forgeExp },
      gather: { activeGather: useGatherStore.getState().activeGather, cooldowns: useGatherStore.getState().cooldowns },
      dungeon: useDungeonStore.getState().getState(),
      achievement: useAchievementStore.getState().getState(),
      dailyQuest: useDailyQuestStore.getState().getState(),
      milestone: useMilestoneStore.getState().getState(),
    });
    const stopAutoSave = SaveManager.startAutoSave(getFullState);

    return () => {
      clearInterval(idleInterval);
      running = false;
      stopAutoSave();
      unsubStage();
      unsubBreak();
      unsubLoot();
    };
  }, [tick, tickBattle]);
}
