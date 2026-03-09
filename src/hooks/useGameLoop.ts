/**
 * v191.0: Extracted game loop + tracking from App.tsx
 * Handles: tick loop, achievement sync, daily challenge tracking, season tracking, auto-save
 */
import { useEffect, useRef, useState } from 'react';
import { useGameStore, setAchStatesCache } from '../store/gameStore';
import { useDungeonStore } from '../store/dungeonStore';
import { useAchievementStore } from '../store/achievementStore';
import { useLeaderboardStore } from '../store/leaderboardStore';
import { useDailyStore } from '../store/dailyStore';
import { useDailyChallengeStore } from '../store/dailyChallengeStore';
import { useSeasonStore } from '../store/seasonStore';

export function useLoadGame() {
  const load = useGameStore(s => s.load);
  const loaded = useRef(false);

  useEffect(() => {
    if (!loaded.current) {
      loaded.current = true;
      load();
      useDungeonStore.getState().load();
      useAchievementStore.getState().load();
      useLeaderboardStore.getState().load();
      useDailyStore.getState().load();
      useDailyChallengeStore.getState().load();
      useSeasonStore.getState().load();
      // Referral bonus
      import('../data/referral').then(({ hasReferralParam, isReferralClaimed, markReferralClaimed, REFERRAL_REWARD }) => {
        if (hasReferralParam() && !isReferralClaimed()) {
          const gs = useGameStore.getState();
          gs.updatePlayer({
            lingshi: gs.player.lingshi + REFERRAL_REWARD.lingshi,
            pantao: gs.player.pantao + REFERRAL_REWARD.pantao,
            hongmengShards: gs.player.hongmengShards + REFERRAL_REWARD.hongmengShards,
            tianmingScrolls: gs.player.tianmingScrolls + REFERRAL_REWARD.tianmingScrolls,
          });
          markReferralClaimed();
        }
      });
    }
  }, [load]);
}

export function useTickLoop() {
  const tick = useGameStore(s => s.tick);

  useEffect(() => {
    let id: ReturnType<typeof setInterval>;
    let _pk = 0, _pg = 0, _pd = 0, _pb = 0, _pc = 0, _pe = 0, _plv = 0, _init = false;

    const doTick = () => {
      const speed = useGameStore.getState().battleSpeed || 1;
      for (let i = 0; i < speed; i++) tick();
      const gs = useGameStore.getState();
      const dcStore = useDailyChallengeStore.getState();
      const _p = gs.player;
      if (!_init) {
        _pk = _p.totalKills || 0; _pg = _p.totalGoldEarned || 0; _pd = _p.totalEquipDrops || 0;
        _pb = _p.totalBossKills || 0; _pc = _p.totalCrits || 0; _pe = _p.totalEnhances || 0;
        _plv = _p.level || 1; _init = true;
      } else {
        const nk = _p.totalKills || 0, ng = _p.totalGoldEarned || 0, nd = _p.totalEquipDrops || 0;
        const nb = _p.totalBossKills || 0, nc = _p.totalCrits || 0, ne = _p.totalEnhances || 0;
        if (nk > _pk) { dcStore.track('kills', nk - _pk); useSeasonStore.getState().trackQuest('kills', nk - _pk); _pk = nk; }
        if (ng > _pg) { dcStore.track('gold', ng - _pg); useSeasonStore.getState().trackQuest('gold', ng - _pg); _pg = ng; }
        if (nd > _pd) { dcStore.track('equips', nd - _pd); useSeasonStore.getState().trackQuest('equips', nd - _pd); _pd = nd; }
        if (nb > _pb) { dcStore.track('boss', nb - _pb); useSeasonStore.getState().trackQuest('boss', nb - _pb); _pb = nb; }
        if (nc > _pc) { dcStore.track('crit', nc - _pc); useSeasonStore.getState().trackQuest('crit', nc - _pc); _pc = nc; }
        if (ne > _pe) { dcStore.track('enhance', ne - _pe); useSeasonStore.getState().trackQuest('enhance', ne - _pe); _pe = ne; }
        const nlv = _p.level || 1;
        if (nlv > _plv) { dcStore.track('levelUp', nlv - _plv); useSeasonStore.getState().trackQuest('levelUp', nlv - _plv); _plv = nlv; }
      }
      // Achievement sync
      const achStore = useAchievementStore.getState();
      achStore.updateProgress('ach_level_50', gs.player.level);
      achStore.updateProgress('ach_level_100', gs.player.level);
      achStore.updateProgress('ach_online_24h', gs.totalPlayTime);
      const c = achStore.counters;
      const p = gs.player;
      if (p.totalKills > c.totalKills) achStore.incrementCounter('totalKills', p.totalKills - c.totalKills);
      if (p.totalEquipDrops > c.totalEquipObtained) achStore.incrementCounter('totalEquipObtained', p.totalEquipDrops - c.totalEquipObtained);
      const pGold = p.totalGoldEarned || 0;
      if (pGold > c.totalGoldEarned) achStore.incrementCounter('totalGoldEarned', pGold - c.totalGoldEarned);
      const uniqueNames = new Set(gs.inventory.map((e: any) => e.name));
      if (uniqueNames.size > c.collectUnique) achStore.incrementCounter('collectUnique', uniqueNames.size - c.collectUnique);
      achStore.checkAchievements();
      setAchStatesCache(achStore.states as Record<string, { completed: boolean }>);
      // Consume pending resource rewards
      const rewards = achStore.consumeRewards();
      if (rewards.length > 0) {
        const gs2 = useGameStore.getState();
        const up = { ...gs2.player };
        for (const r of rewards) {
          if (r.description.includes('灵石')) up.lingshi += r.value;
          else if (r.description.includes('蟠桃')) up.pantao += r.value;
        }
        useGameStore.setState({ player: up });
      }
    };

    const startLoop = () => {
      clearInterval(id);
      id = setInterval(doTick, document.hidden ? 5000 : 1000);
    };
    startLoop();
    document.addEventListener('visibilitychange', startLoop);
    return () => { clearInterval(id); document.removeEventListener('visibilitychange', startLoop); };
  }, [tick]);
}

export function useAutoSave() {
  const save = useGameStore(s => s.save);
  const [saveFlash, setSaveFlash] = useState(false);

  useEffect(() => {
    const id = setInterval(() => {
      save();
      useDungeonStore.getState().save();
      useAchievementStore.getState().save();
      useLeaderboardStore.getState().save();
      useDailyChallengeStore.getState().save();
      setSaveFlash(true);
      setTimeout(() => setSaveFlash(false), 1500);
    }, 30000);
    return () => clearInterval(id);
  }, [save]);

  return saveFlash;
}

export function useDocumentTitle() {
  const playerLevel = useGameStore(s => s.player.level);

  useEffect(() => {
    const id = setInterval(() => {
      const p = useGameStore.getState().player;
      document.title = `Lv.${p.level} 西游·悟空传`;
    }, 5000);
    document.title = `Lv.${playerLevel} 西游·悟空传`;
    return () => clearInterval(id);
  }, [playerLevel]);

  return playerLevel;
}

export function useNotifications() {
  const playerLevel = useGameStore(s => s.player.level);
  const lastNotifLevel = useRef(playerLevel);

  useEffect(() => {
    if (!document.hidden || !('Notification' in window) || Notification.permission !== 'granted') return;
    if (playerLevel > lastNotifLevel.current && playerLevel % 50 === 0) {
      new Notification('🎉 西游·悟空传', { body: `恭喜突破 Lv.${playerLevel}！`, icon: '/pwa-192x192.svg' });
    }
    lastNotifLevel.current = playerLevel;
  }, [playerLevel]);

  useEffect(() => {
    const ask = () => {
      if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
      }
      window.removeEventListener('click', ask);
    };
    window.addEventListener('click', ask);
    return () => window.removeEventListener('click', ask);
  }, []);
}

export function useKeyboardShortcuts(activeTab: string) {
  const setTab = useGameStore(s => s.setTab);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      const key = e.key;
      if (key >= '1' && key <= '9') {
        const tabs: import('../types').TabId[] = ['battle', 'team', 'journey', 'bag', 'achievement', 'stats', 'sanctuary', 'exploration', 'affinity', 'settings'];
        const idx = parseInt(key) - 1;
        if (idx < tabs.length) { e.preventDefault(); setTab(tabs[idx]); }
      }
      if (key === ' ' && activeTab === 'battle') { e.preventDefault(); useGameStore.getState().clickAttack(); }
      if (key === 'b' || key === 'B') { useGameStore.getState().autoEquipBest(); }
      if (key === 'R' && e.shiftKey) { useGameStore.getState().reincarnate(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [activeTab, setTab]);
}
