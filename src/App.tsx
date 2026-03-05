import { useEffect, useRef, useState, lazy, Suspense } from 'react';
import { useGameStore, setAchStatesCache } from './store/gameStore';
import { useDungeonStore } from './store/dungeonStore';
import { useAchievementStore } from './store/achievementStore';
import { useLeaderboardStore } from './store/leaderboardStore';
import DungeonList from './components/DungeonList';
import DungeonBattle from './components/DungeonBattle';
import AchievementList from './components/AchievementList';
import Leaderboard from './components/Leaderboard';
import AchievementToast from './components/AchievementToast';
import { TutorialOverlay } from './components/TutorialOverlay';

// Lazy-loaded heavy panels (not needed on first render)
const StatsView = lazy(() => import('./components/StatsView').then(m => ({ default: m.StatsView })));
const SanctuaryPanel = lazy(() => import('./components/SanctuaryPanel').then(m => ({ default: m.SanctuaryPanel })));
const ExplorationPanel = lazy(() => import('./components/ExplorationPanel').then(m => ({ default: m.ExplorationPanel })));
const AffinityPanel = lazy(() => import('./components/AffinityPanel').then(m => ({ default: m.AffinityPanel })));

import { TopBar, OfflineReportModal, SubPageHeader, SubPage } from './pages/shared';
import { BattleView } from './pages/BattlePage';
import { TeamView, CharacterDetailPage } from './pages/TeamPage';
import { JourneyView, ChapterSelectPage } from './pages/JourneyPage';
import { EquipDetailPage, RefinePage } from './pages/EquipmentPage';
import { ShopPage, SaveManagerPage } from './pages/ShopSavePage';
import { BagView } from './pages/BagPage';
import { SettingsView } from './pages/SettingsPage';
const ReincarnationPanel = lazy(() => import('./components/ReincarnationPanel').then(m => ({ default: m.ReincarnationPanel })));
const DailyPanel = lazy(() => import('./components/DailyPanel').then(m => ({ default: m.DailyPanel })));
const LuckyWheel = lazy(() => import('./components/LuckyWheel').then(m => ({ default: m.LuckyWheel })));
const TrialPanel = lazy(() => import('./components/TrialPanel').then(m => ({ default: m.TrialPanel })));
const AwakeningPanel = lazy(() => import('./components/AwakeningPanel').then(m => ({ default: m.AwakeningPanel })));
import { useDailyStore } from './store/dailyStore';
import { useSanctuaryStore } from './store/sanctuaryStore';
import { useExplorationStore } from './store/explorationStore';
import { BUILDINGS, getUpgradeCost } from './engine/sanctuary';
import { getCurrentWorldBoss } from './data/worldBoss';

const LazyFallback = () => <div style={{ padding: 40, textAlign: 'center', color: '#aaa' }}>加载中...</div>;

const ALL_TABS = [
  { id: 'battle' as const, icon: '战', label: '战斗', unlockLevel: 0 },
  { id: 'team' as const, icon: '伍', label: '队伍', unlockLevel: 0 },
  { id: 'journey' as const, icon: '途', label: '旅途', unlockLevel: 0 },
  { id: 'bag' as const, icon: '包', label: '背包', unlockLevel: 5 },
  { id: 'achievement' as const, icon: '勋', label: '成就', unlockLevel: 10 },
  { id: 'stats' as const, icon: '据', label: '统计', unlockLevel: 15 },
  { id: 'reincarnation' as const, icon: '轮', label: '转世', unlockLevel: 50 },
  { id: 'sanctuary' as const, icon: '府', label: '洞天', unlockLevel: 20 },
  { id: 'exploration' as const, icon: '境', label: '秘境', unlockLevel: 30 },
  { id: 'affinity' as const, icon: '缘', label: '仙缘', unlockLevel: 40 },
  { id: 'trial' as const, icon: '劫', label: '试炼', unlockLevel: 60 },
  { id: 'awakening' as const, icon: '醒', label: '觉醒', unlockLevel: 80 },
  { id: 'settings' as const, icon: '设', label: '更多', unlockLevel: 0 },
];

function useUnlockedTabs() {
  const level = useGameStore(s => s.player.level);
  const prevCountRef = useRef(0);
  const [toast, setToast] = useState<string | null>(null);
  const tabs = ALL_TABS.filter(t => level >= t.unlockLevel);

  useEffect(() => {
    if (prevCountRef.current > 0 && tabs.length > prevCountRef.current) {
      const newTabs = ALL_TABS.filter(t => t.unlockLevel > 0 && level >= t.unlockLevel)
        .slice(prevCountRef.current - 4); // minus the 4 initial tabs
      if (newTabs.length > 0) {
        setToast(`★ 新功能解锁：${newTabs[newTabs.length - 1].label}`);
        setTimeout(() => setToast(null), 3000);
      }
    }
    prevCountRef.current = tabs.length;
  }, [tabs.length, level]);

  return { tabs, toast };
}

function BottomNav() {
  const activeTab = useGameStore(s => s.activeTab);
  const setTab = useGameStore(s => s.setTab);
  const dailyCanSignIn = useDailyStore(s => s.canSignIn);
  const lingshi = useGameStore(s => s.player.lingshi);
  const sanctuaryLevels = useSanctuaryStore(s => s.sanctuary.levels);
  const explorationFree = useExplorationStore(s => s.exploration.dailyFree);
  const explorationRun = useExplorationStore(s => s.exploration.currentRun);

  // Red dot: sanctuary has affordable upgrade
  const sanctuaryRedDot = BUILDINGS.some(b => {
    const lv = sanctuaryLevels[b.id] ?? 0;
    return lv < 10 && lingshi >= getUpgradeCost(b, lv);
  });
  // Red dot: exploration has free runs available
  const explorationRedDot = explorationFree > 0 && (!explorationRun || explorationRun.completed);
  // Red dot: world boss is active
  const [worldBossActive, setWorldBossActive] = useState(false);
  useEffect(() => {
    const check = () => setWorldBossActive(!!getCurrentWorldBoss(Date.now()));
    check();
    const id = setInterval(check, 10000);
    return () => clearInterval(id);
  }, []);

  const { tabs, toast } = useUnlockedTabs();
  return (
    <>
      {toast && (
        <div style={{
          position: 'fixed', bottom: '70px', left: '50%', transform: 'translateX(-50%)',
          background: 'linear-gradient(135deg, #667eea, #764ba2)', color: '#fff',
          padding: '8px 20px', borderRadius: '20px', fontSize: '14px', fontWeight: 600,
          zIndex: 9999, boxShadow: '0 4px 15px rgba(0,0,0,0.3)', whiteSpace: 'nowrap',
          animation: 'fadeInUp 0.3s ease'
        }}>{toast}</div>
      )}
      <div className="bottom-nav">
        {tabs.map(tab => (
          <button key={tab.id} className={activeTab === tab.id ? 'active' : ''} onClick={() => setTab(tab.id)}
            style={{ position: 'relative' }}>
            <span className="icon">{tab.icon}</span><span>{tab.label}</span>
            {tab.id === 'settings' && dailyCanSignIn && <span className="nav-red-dot" />}
            {tab.id === 'sanctuary' && sanctuaryRedDot && <span className="nav-red-dot" />}
            {tab.id === 'exploration' && explorationRedDot && <span className="nav-red-dot" />}
            {tab.id === 'battle' && worldBossActive && <span className="nav-red-dot" style={{ background: '#ff4500' }} />}
          </button>
        ))}
      </div>
    </>
  );
}

export default function App() {
  const activeTab = useGameStore(s => s.activeTab);
  const tick = useGameStore(s => s.tick);
  const save = useGameStore(s => s.save);
  const load = useGameStore(s => s.load);
  const loaded = useRef(false);
  const [subPage, setSubPage] = useState<SubPage>({ type: 'none' });
  const [saveFlash, setSaveFlash] = useState(false);

  // Load
  useEffect(() => {
    if (!loaded.current) {
      loaded.current = true;
      load();
      useDungeonStore.getState().load();
      useAchievementStore.getState().load();
      useLeaderboardStore.getState().load();
      useDailyStore.getState().load();
    }
  }, [load]);

  // Tick (throttle when tab hidden)
  useEffect(() => {
    let id: ReturnType<typeof setInterval>;
    const doTick = () => {
      const speed = useGameStore.getState().battleSpeed || 1;
      for (let i = 0; i < speed; i++) tick();
      const gs = useGameStore.getState();
      const achStore = useAchievementStore.getState();
      achStore.updateProgress('ach_level_50', gs.player.level);
      achStore.updateProgress('ach_level_100', gs.player.level);
      achStore.updateProgress('ach_online_24h', gs.totalPlayTime);
      // Sync game stats → achievement counters
      const c = achStore.counters;
      const p = gs.player;
      if (p.totalKills > c.totalKills) achStore.incrementCounter('totalKills', p.totalKills - c.totalKills);
      if (p.totalEquipDrops > c.totalEquipObtained) achStore.incrementCounter('totalEquipObtained', p.totalEquipDrops - c.totalEquipObtained);
      const pGold = p.totalGoldEarned || 0;
      if (pGold > c.totalGoldEarned) achStore.incrementCounter('totalGoldEarned', pGold - c.totalGoldEarned);
      // Track unique equipment names
      const uniqueNames = new Set(gs.inventory.map((e: any) => e.name));
      if (uniqueNames.size > c.collectUnique) achStore.incrementCounter('collectUnique', uniqueNames.size - c.collectUnique);
      achStore.checkAchievements();
      // v42.0: Sync achievement states cache for stat bonuses
      setAchStatesCache(achStore.states as any);
      // v42.0: Consume pending resource rewards
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

  // Auto-save
  useEffect(() => {
    const id = setInterval(() => {
      save();
      useDungeonStore.getState().save();
      useAchievementStore.getState().save();
      useLeaderboardStore.getState().save();
      setSaveFlash(true);
      setTimeout(() => setSaveFlash(false), 1500);
    }, 30000);
    return () => clearInterval(id);
  }, [save]);

  // Reset sub-page on tab change
  useEffect(() => { setSubPage({ type: 'none' }); }, [activeTab]);

  const goBack = () => setSubPage({ type: 'none' });

  // ─── Sub-page routing ───
  const renderSubPage = () => {
    switch (subPage.type) {
      case 'equipDetail': return <EquipDetailPage item={subPage.item} onBack={goBack} />;
      case 'refine': return <RefinePage onBack={goBack} />;
      case 'shop': return <ShopPage onBack={goBack} />;
      case 'characterDetail': return <CharacterDetailPage onBack={goBack} />;
      case 'chapterSelect': return <ChapterSelectPage onBack={goBack} />;
      case 'saveManager': return <SaveManagerPage onBack={goBack} />;
      case 'dungeonList': return (
        <div className="main-content fade-in">
          <SubPageHeader title="取经副本" onBack={goBack} />
          <DungeonList onStartDungeon={(id) => {
            const stats = useGameStore.getState().getEffectiveStats();
            useDungeonStore.getState().startDungeon(id, stats.maxHp);
            setSubPage({ type: 'dungeonBattle' });
          }} />
        </div>
      );
      case 'dungeonBattle': return (
        <div className="main-content fade-in">
          <DungeonBattle onEnd={() => { useDungeonStore.getState().save(); setSubPage({ type: 'dungeonList' }); }} />
        </div>
      );
      case 'achievements': return (
        <div className="main-content fade-in"><SubPageHeader title="成就" onBack={goBack} /><AchievementList /></div>
      );
      case 'leaderboard': return (
        <div className="main-content fade-in"><SubPageHeader title="排行榜" onBack={goBack} /><Leaderboard /></div>
      );
      case 'daily': return (
        <div className="main-content fade-in"><SubPageHeader title="每日签到" onBack={goBack} /><Suspense fallback={<LazyFallback />}><DailyPanel /></Suspense></div>
      );
      case 'wheel': return (
        <div className="main-content fade-in"><SubPageHeader title="天道轮盘" onBack={goBack} /><Suspense fallback={<LazyFallback />}><LuckyWheel /></Suspense></div>
      );
      default: return null;
    }
  };

  // ─── Main tab routing ───
  const renderTab = () => {
    switch (activeTab) {
      case 'battle': return <BattleView />;
      case 'team': return <TeamView setSubPage={setSubPage} />;
      case 'journey': return <JourneyView setSubPage={setSubPage} />;
      case 'bag': return <BagView setSubPage={setSubPage} />;
      case 'achievement': return <div className="main-content fade-in"><AchievementList /></div>;
      case 'reincarnation': return <Suspense fallback={<LazyFallback />}><ReincarnationPanel /></Suspense>;
      case 'sanctuary': return <Suspense fallback={<LazyFallback />}><SanctuaryPanel /></Suspense>;
      case 'exploration': return <Suspense fallback={<LazyFallback />}><ExplorationPanel /></Suspense>;
      case 'affinity': return <Suspense fallback={<LazyFallback />}><AffinityPanel /></Suspense>;
      case 'stats': return <Suspense fallback={<LazyFallback />}><StatsView /></Suspense>;
      case 'trial': return <Suspense fallback={<LazyFallback />}><TrialPanel /></Suspense>;
      case 'awakening': return <Suspense fallback={<LazyFallback />}><AwakeningPanel /></Suspense>;
      case 'settings': return <SettingsView setSubPage={setSubPage} />;
      default: return <BattleView />;
    }
  };

  return (
    <>
      <TopBar />
      {subPage.type !== 'none' ? renderSubPage() : renderTab()}
      <BottomNav />
      <AchievementToast />
      <OfflineReportModal />
      <TutorialOverlay />
      {saveFlash && (
        <div style={{
          position: 'fixed', bottom: 70, left: '50%', transform: 'translateX(-50%)',
          background: 'rgba(0,0,0,0.7)', color: '#4ade80', padding: '4px 16px',
          borderRadius: 12, fontSize: 12, zIndex: 9998, pointerEvents: 'none',
          animation: 'fadeInUp 0.3s ease'
        }}>✓ 已存档</div>
      )}
    </>
  );
}
