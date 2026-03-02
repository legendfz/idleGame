/**
 * useGameLoop — 游戏主循环 + 离线收益 + 存档 + EventBus 集成
 */
import { useEffect, useRef } from 'react';
import { usePlayerStore } from '../store/player';
import { useBattleStore } from '../store/battle';
import { useEquipStore } from '../store/equipment';
import { useJourneyStore } from '../store/journey';
import { useUIStore } from '../store/ui';
import { SaveManager } from '../data/save';
import { calcOfflineReward } from '../engine/idle';
import { eventBus } from '../engine/events';
import { bn } from '../engine/bignum';

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
        useUIStore.getState().addToast(
          `离线 ${Math.floor(reward.duration / 60)} 分钟，修为 +${reward.xiuwei.toFixed(0)}`,
          'success'
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

    // === 4. Idle tick (1Hz) ===
    const idleInterval = setInterval(() => {
      const now = Date.now();
      const dt = (now - lastTickRef.current) / 1000;
      lastTickRef.current = now;
      tick(Math.min(dt, 2));
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
