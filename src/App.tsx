import { useEffect, useRef, useState, lazy, Suspense, memo, useCallback } from 'react';
import { useGameStore, setAchStatesCache } from './store/gameStore';
import { useDungeonStore } from './store/dungeonStore';
import { useAchievementStore } from './store/achievementStore';
import { useLeaderboardStore } from './store/leaderboardStore';
import AchievementToast from './components/AchievementToast';
import { TutorialOverlay } from './components/TutorialOverlay';

// Lazy-loaded panels (not needed on first render)
const StatsView = lazy(() => import('./components/StatsView').then(m => ({ default: m.StatsView })));
const SanctuaryPanel = lazy(() => import('./components/SanctuaryPanel').then(m => ({ default: m.SanctuaryPanel })));
const ExplorationPanel = lazy(() => import('./components/ExplorationPanel').then(m => ({ default: m.ExplorationPanel })));
const AffinityPanel = lazy(() => import('./components/AffinityPanel').then(m => ({ default: m.AffinityPanel })));
const ReincarnationPanel = lazy(() => import('./components/ReincarnationPanel').then(m => ({ default: m.ReincarnationPanel })));
const DailyPanel = lazy(() => import('./components/DailyPanel').then(m => ({ default: m.DailyPanel })));
const LuckyWheel = lazy(() => import('./components/LuckyWheel').then(m => ({ default: m.LuckyWheel })));
const TrialPanel = lazy(() => import('./components/TrialPanel').then(m => ({ default: m.TrialPanel })));
const AwakeningPanel = lazy(() => import('./components/AwakeningPanel').then(m => ({ default: m.AwakeningPanel })));
const PetPanel = lazy(() => import('./components/PetPanel').then(m => ({ default: m.PetPanel })));
const AscensionChallengePanel = lazy(() => import('./components/AscensionChallengePanel').then(m => ({ default: m.AscensionChallengePanel })));
const WeeklyBossPanel = lazy(() => import('./components/WeeklyBossPanel').then(m => ({ default: m.WeeklyBossPanel })));
const GuidePanel = lazy(() => import('./components/GuidePanel').then(m => ({ default: m.GuidePanel })));
const DungeonList = lazy(() => import('./components/DungeonList'));
const DungeonBattle = lazy(() => import('./components/DungeonBattle'));
const AchievementList = lazy(() => import('./components/AchievementList'));
const Leaderboard = lazy(() => import('./components/Leaderboard'));
const TitlePanel = lazy(() => import('./components/TitlePanel').then(m => ({ default: m.TitlePanel })));
const HandbookPanel = lazy(() => import('./components/HandbookPanel').then(m => ({ default: m.HandbookPanel })));
const BagView = lazy(() => import('./pages/BagPage').then(m => ({ default: m.BagView })));
const SettingsView = lazy(() => import('./pages/SettingsPage').then(m => ({ default: m.SettingsView })));
const ShopPage = lazy(() => import('./pages/ShopSavePage').then(m => ({ default: m.ShopPage })));
const SaveManagerPage = lazy(() => import('./pages/ShopSavePage').then(m => ({ default: m.SaveManagerPage })));

import { TopBar, OfflineReportModal, SubPageHeader, SubPage } from './pages/shared';
import { BattleView } from './pages/BattlePage';
const TeamPageLazy = lazy(() => import('./pages/TeamPage').then(m => ({ default: m.TeamView })));
const CharacterDetailPageLazy = lazy(() => import('./pages/TeamPage').then(m => ({ default: m.CharacterDetailPage })));
const JourneyViewLazy = lazy(() => import('./pages/JourneyPage').then(m => ({ default: m.JourneyView })));
const ChapterSelectPageLazy = lazy(() => import('./pages/JourneyPage').then(m => ({ default: m.ChapterSelectPage })));
const EquipDetailPageLazy = lazy(() => import('./pages/EquipmentPage').then(m => ({ default: m.EquipDetailPage })));
const RefinePageLazy = lazy(() => import('./pages/EquipmentPage').then(m => ({ default: m.RefinePage })));
import { useDailyStore } from './store/dailyStore';
import { useDailyChallengeStore } from './store/dailyChallengeStore';
import { useSanctuaryStore } from './store/sanctuaryStore';
import { useExplorationStore } from './store/explorationStore';
import { BUILDINGS, getUpgradeCost } from './engine/sanctuary';
import { getCurrentWorldBoss } from './data/worldBoss';

const LazyFallback = () => <div style={{ padding: 40, textAlign: 'center', color: '#aaa' }}>加载中...</div>;

function StoryModal() {
  const story = useGameStore(s => s.activeStory);
  // v149.0: Auto-dismiss story after 3s for automated players
  useEffect(() => {
    if (!story) return;
    const timer = setTimeout(() => useGameStore.setState({ activeStory: null }), 3000);
    return () => clearTimeout(timer);
  }, [story]);
  if (!story) return null;
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 20000,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
      animation: 'fadeIn 0.5s ease',
    }} onClick={() => useGameStore.setState({ activeStory: null })}>
      <div style={{
        background: 'linear-gradient(135deg, #1a1a2e, #16213e)', border: '2px solid #ffd700',
        borderRadius: 16, padding: '28px 24px', maxWidth: 360, width: '100%',
        boxShadow: '0 0 40px rgba(255,215,0,0.3)', textAlign: 'center',
      }} onClick={e => e.stopPropagation()}>
        <div style={{ fontSize: 14, color: '#ffd700', marginBottom: 8, letterSpacing: 2 }}>═══ 仙途传说 ═══</div>
        <h2 style={{ color: '#fff', fontSize: 22, margin: '8px 0 16px', textShadow: '0 0 10px rgba(255,215,0,0.5)' }}>
          {story.title}
        </h2>
        <p style={{ color: '#ddd', fontSize: 14, lineHeight: 1.8, textAlign: 'left', marginBottom: 16 }}>
          {story.text}
        </p>
        {story.reward && (
          <div style={{
            background: 'rgba(255,215,0,0.15)', borderRadius: 8, padding: '8px 12px',
            color: '#ffd700', fontSize: 13, marginBottom: 12,
          }}>
            🎁 获得奖励：{story.reward.type === 'lingshi' ? '灵石' : story.reward.type === 'pantao' ? '蟠桃' : '经验'} +{story.reward.amount.toLocaleString()}
          </div>
        )}
        <button style={{
          background: 'linear-gradient(135deg, #ffd700, #ff8c00)', border: 'none',
          borderRadius: 20, padding: '10px 32px', color: '#1a1a2e', fontWeight: 700,
          fontSize: 15, cursor: 'pointer',
        }} onClick={() => useGameStore.setState({ activeStory: null })}>
          继续修行
        </button>
      </div>
    </div>
  );
}

function TitleToast() {
  const titleToast = useGameStore(s => s.titleToast);
  if (!titleToast) return null;
  return (
    <div style={{
      position: 'fixed', top: '20%', left: '50%', transform: 'translateX(-50%)',
      background: 'linear-gradient(135deg, #f0c040, #ff6b35)', color: '#fff',
      padding: '12px 28px', borderRadius: '24px', fontSize: '16px', fontWeight: 700,
      zIndex: 10000, boxShadow: '0 6px 20px rgba(240,192,64,0.4)', whiteSpace: 'nowrap',
      animation: 'fadeInUp 0.4s ease', textShadow: '0 1px 2px rgba(0,0,0,0.3)',
    }}>{titleToast}</div>
  );
}

// Primary tabs (always visible in main row)
const PRIMARY_TABS = [
  { id: 'battle' as const, icon: '战', label: '战斗', unlockLevel: 0 },
  { id: 'team' as const, icon: '伍', label: '队伍', unlockLevel: 0 },
  { id: 'journey' as const, icon: '途', label: '旅途', unlockLevel: 0 },
  { id: 'bag' as const, icon: '包', label: '背包', unlockLevel: 5 },
  { id: 'settings' as const, icon: '设', label: '更多', unlockLevel: 0 },
];
// Secondary tabs (shown in expandable row)
const SECONDARY_TABS = [
  { id: 'pets' as const, icon: '兽', label: '灵兽', unlockLevel: 10 },
  { id: 'achievement' as const, icon: '勋', label: '成就', unlockLevel: 10 },
  { id: 'stats' as const, icon: '据', label: '统计', unlockLevel: 15 },
  { id: 'sanctuary' as const, icon: '府', label: '洞天', unlockLevel: 20 },
  { id: 'exploration' as const, icon: '境', label: '秘境', unlockLevel: 30 },
  { id: 'affinity' as const, icon: '缘', label: '仙缘', unlockLevel: 40 },
  { id: 'reincarnation' as const, icon: '轮', label: '转世', unlockLevel: 50 },
  { id: 'trial' as const, icon: '劫', label: '试炼', unlockLevel: 60 },
  { id: 'awakening' as const, icon: '醒', label: '觉醒', unlockLevel: 80 },
];
const ALL_TABS = [...PRIMARY_TABS, ...SECONDARY_TABS];

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
    let wasActive = false;
    const check = () => {
      const active = !!getCurrentWorldBoss(Date.now());
      setWorldBossActive(active);
      // v150.0: Notify idle players when world boss spawns
      if (active && !wasActive && document.hidden && 'Notification' in window && Notification.permission === 'granted') {
        new Notification('⚔️ 世界Boss来袭！', { body: '快来挑战世界Boss，赢取丰厚奖励！', icon: '/pwa-192x192.svg' });
      }
      wasActive = active;
    };
    check();
    const id = setInterval(check, 10000);
    return () => clearInterval(id);
  }, []);

  const { tabs, toast } = useUnlockedTabs();
  const level = useGameStore(s => s.player.level);
  const [showSecondary, setShowSecondary] = useState(false);
  const primaryTabs = PRIMARY_TABS.filter(t => level >= t.unlockLevel);
  const secondaryTabs = SECONDARY_TABS.filter(t => level >= t.unlockLevel);
  const isSecondaryActive = secondaryTabs.some(t => t.id === activeTab);

  // Auto-show secondary row when a secondary tab is active
  useEffect(() => {
    if (isSecondaryActive) setShowSecondary(true);
  }, [isSecondaryActive]);

  return (
    <>
      {toast && (
        <div style={{
          position: 'fixed', bottom: showSecondary ? '120px' : '70px', left: '50%', transform: 'translateX(-50%)',
          background: 'linear-gradient(135deg, #667eea, #764ba2)', color: '#fff',
          padding: '8px 20px', borderRadius: '20px', fontSize: '14px', fontWeight: 600,
          zIndex: 9999, boxShadow: '0 4px 15px rgba(0,0,0,0.3)', whiteSpace: 'nowrap',
          animation: 'fadeInUp 0.3s ease'
        }}>{toast}</div>
      )}
      {/* Secondary row (expandable) */}
      {showSecondary && secondaryTabs.length > 0 && (
        <div className="bottom-nav secondary-nav">
          {secondaryTabs.map(tab => (
            <button key={tab.id} className={activeTab === tab.id ? 'active' : ''} onClick={() => setTab(tab.id)}
              style={{ position: 'relative' }}>
              <span className="icon">{tab.icon}</span><span>{tab.label}</span>
              {tab.id === 'sanctuary' && sanctuaryRedDot && <span className="nav-red-dot" />}
              {tab.id === 'exploration' && explorationRedDot && <span className="nav-red-dot" />}
            </button>
          ))}
        </div>
      )}
      {/* Primary row (always visible) */}
      <div className="bottom-nav primary-nav">
        {secondaryTabs.length > 0 && (
          <button onClick={() => setShowSecondary(!showSecondary)}
            className={isSecondaryActive ? 'active' : ''}
            style={{ position: 'relative' }}>
            <span className="icon" style={{ transition: 'transform 0.2s', transform: showSecondary ? 'rotate(180deg)' : 'none' }}>▲</span>
            <span>{isSecondaryActive ? secondaryTabs.find(t => t.id === activeTab)?.label || '展开' : '展开'}</span>
          </button>
        )}
        {primaryTabs.map(tab => (
          <button key={tab.id} className={activeTab === tab.id ? 'active' : ''} onClick={() => { setTab(tab.id); if (!PRIMARY_TABS.some(t => t.id === tab.id)) return; }}
            style={{ position: 'relative' }}>
            <span className="icon">{tab.icon}</span><span>{tab.label}</span>
            {tab.id === 'settings' && dailyCanSignIn && <span className="nav-red-dot" />}
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
  const playerLevel = useGameStore(s => s.player.level);
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
      useDailyChallengeStore.getState().load();
      // v179.0: Referral bonus
      import('./data/referral').then(({ hasReferralParam, isReferralClaimed, markReferralClaimed, REFERRAL_REWARD }) => {
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

  // Tick (throttle when tab hidden)
  useEffect(() => {
    let id: ReturnType<typeof setInterval>;
    let _pk = 0, _pg = 0, _pd = 0, _pb = 0, _pc = 0, _pe = 0, _init = false;
    const doTick = () => {
      const speed = useGameStore.getState().battleSpeed || 1;
      for (let i = 0; i < speed; i++) tick();
      const gs = useGameStore.getState();
      // v70.0: Track daily challenge deltas
      const dcStore = useDailyChallengeStore.getState();
      const _p = gs.player;
      if (!_init) { _pk = _p.totalKills||0; _pg = _p.totalGoldEarned||0; _pd = _p.totalEquipDrops||0; _pb = _p.totalBossKills||0; _pc = _p.totalCrits||0; _pe = _p.totalEnhances||0; _init = true; }
      else {
        const nk=_p.totalKills||0, ng=_p.totalGoldEarned||0, nd=_p.totalEquipDrops||0, nb=_p.totalBossKills||0, nc=_p.totalCrits||0, ne=_p.totalEnhances||0;
        if(nk>_pk){dcStore.track('kills',nk-_pk);_pk=nk;} if(ng>_pg){dcStore.track('gold',ng-_pg);_pg=ng;}
        if(nd>_pd){dcStore.track('equips',nd-_pd);_pd=nd;} if(nb>_pb){dcStore.track('boss',nb-_pb);_pb=nb;}
        if(nc>_pc){dcStore.track('crit',nc-_pc);_pc=nc;} if(ne>_pe){dcStore.track('enhance',ne-_pe);_pe=ne;}
      }
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
      setAchStatesCache(achStore.states as Record<string, { completed: boolean }>);
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
      useDailyChallengeStore.getState().save();
      setSaveFlash(true);
      setTimeout(() => setSaveFlash(false), 1500);
    }, 30000);
    return () => clearInterval(id);
  }, [save]);

  // v130.0: Keyboard shortcuts
  const setTab = useGameStore(s => s.setTab);
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      const key = e.key;
      // Number keys 1-9 for tabs
      if (key >= '1' && key <= '9') {
        const tabs: import('./types').TabId[] = ['battle', 'team', 'journey', 'bag', 'achievement', 'stats', 'sanctuary', 'exploration', 'affinity', 'settings'];
        const idx = parseInt(key) - 1;
        if (idx < tabs.length) { e.preventDefault(); setTab(tabs[idx]); }
      }
      // Space = click attack
      if (key === ' ' && activeTab === 'battle') { e.preventDefault(); useGameStore.getState().clickAttack(); }
      // B = auto equip best
      if (key === 'b' || key === 'B') { useGameStore.getState().autoEquipBest(); }
      // R = reincarnate (with shift)
      if (key === 'R' && e.shiftKey) { useGameStore.getState().reincarnate(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [activeTab, setTab]);

  // Reset sub-page on tab change
  useEffect(() => { setSubPage({ type: 'none' }); }, [activeTab]);

  // v145.0: Document title with level
  useEffect(() => {
    const id = setInterval(() => {
      const p = useGameStore.getState().player;
      document.title = `Lv.${p.level} 西游·悟空传`;
    }, 5000);
    document.title = `Lv.${playerLevel} 西游·悟空传`;
    return () => clearInterval(id);
  }, [playerLevel]);

  // v150.0: Browser notifications for idle players (tab hidden)
  const lastNotifLevel = useRef(playerLevel);
  useEffect(() => {
    if (!document.hidden || Notification.permission !== 'granted') return;
    if (playerLevel > lastNotifLevel.current && playerLevel % 50 === 0) {
      new Notification('🎉 西游·悟空传', { body: `恭喜突破 Lv.${playerLevel}！`, icon: '/pwa-192x192.svg' });
    }
    lastNotifLevel.current = playerLevel;
  }, [playerLevel]);
  // Request notification permission on first interaction
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

  const goBack = () => setSubPage({ type: 'none' });

  // ─── Sub-page routing ───
  const renderSubPage = () => {
    switch (subPage.type) {
      case 'equipDetail': return <EquipDetailPageLazy item={subPage.item} onBack={goBack} />;
      case 'refine': return <RefinePageLazy onBack={goBack} />;
      case 'shop': return <Suspense fallback={<LazyFallback />}><ShopPage onBack={goBack} /></Suspense>;
      case 'characterDetail': return <CharacterDetailPageLazy onBack={goBack} />;
      case 'chapterSelect': return <ChapterSelectPageLazy onBack={goBack} />;
      case 'saveManager': return <Suspense fallback={<LazyFallback />}><SaveManagerPage onBack={goBack} /></Suspense>;
      case 'dungeonList': return (
        <div className="main-content fade-in">
          <SubPageHeader title="取经副本" onBack={goBack} />
          <Suspense fallback={<LazyFallback />}><DungeonList onStartDungeon={(id) => {
            const stats = useGameStore.getState().getEffectiveStats();
            useDungeonStore.getState().startDungeon(id, stats.maxHp);
            setSubPage({ type: 'dungeonBattle' });
          }} /></Suspense>
        </div>
      );
      case 'dungeonBattle': return (
        <div className="main-content fade-in">
          <Suspense fallback={<LazyFallback />}><DungeonBattle onEnd={() => { useDungeonStore.getState().save(); setSubPage({ type: 'dungeonList' }); }} /></Suspense>
        </div>
      );
      case 'achievements': return (
        <div className="main-content fade-in"><SubPageHeader title="成就" onBack={goBack} /><Suspense fallback={<LazyFallback />}><AchievementList /></Suspense></div>
      );
      case 'leaderboard': return (
        <div className="main-content fade-in"><SubPageHeader title="排行榜" onBack={goBack} /><Suspense fallback={<LazyFallback />}><Leaderboard /></Suspense></div>
      );
      case 'daily': return (
        <div className="main-content fade-in"><SubPageHeader title="每日签到" onBack={goBack} /><Suspense fallback={<LazyFallback />}><DailyPanel /></Suspense></div>
      );
      case 'wheel': return (
        <div className="main-content fade-in"><SubPageHeader title="天道轮盘" onBack={goBack} /><Suspense fallback={<LazyFallback />}><LuckyWheel /></Suspense></div>
      );
      case 'titles': return (
        <div className="main-content fade-in"><SubPageHeader title="封神榜·称号" onBack={goBack} /><Suspense fallback={<LazyFallback />}><TitlePanel /></Suspense></div>
      );
      case 'ascension': return (
        <div className="main-content fade-in"><SubPageHeader title="天道考验" onBack={goBack} /><Suspense fallback={<LazyFallback />}><AscensionChallengePanel /></Suspense></div>
      );
      case 'weeklyBoss': return (
        <div className="main-content fade-in"><SubPageHeader title="周天秘境" onBack={goBack} /><Suspense fallback={<LazyFallback />}><WeeklyBossPanel /></Suspense></div>
      );
    if (subPage.type === 'guide') return (
        <div className="main-content fade-in"><SubPageHeader title="仙途百科" onBack={goBack} /><Suspense fallback={<LazyFallback />}><GuidePanel /></Suspense></div>
      );
    if (subPage.type === 'handbook') return (
        <div className="main-content fade-in"><Suspense fallback={<LazyFallback />}><HandbookPanel onClose={goBack} /></Suspense></div>
      );
      default: return null;
    }
  };

  // ─── Main tab routing ───
  const renderTab = () => {
    switch (activeTab) {
      case 'battle': return <BattleView />;
      case 'team': return <TeamPageLazy setSubPage={setSubPage} />;
      case 'journey': return <JourneyViewLazy setSubPage={setSubPage} />;
      case 'bag': return <Suspense fallback={<LazyFallback />}><BagView setSubPage={setSubPage} /></Suspense>;
      case 'achievement': return <Suspense fallback={<LazyFallback />}><div className="main-content fade-in"><AchievementList /></div></Suspense>;
      case 'reincarnation': return <Suspense fallback={<LazyFallback />}><ReincarnationPanel /></Suspense>;
      case 'sanctuary': return <Suspense fallback={<LazyFallback />}><SanctuaryPanel /></Suspense>;
      case 'exploration': return <Suspense fallback={<LazyFallback />}><ExplorationPanel /></Suspense>;
      case 'affinity': return <Suspense fallback={<LazyFallback />}><AffinityPanel /></Suspense>;
      case 'stats': return <Suspense fallback={<LazyFallback />}><StatsView /></Suspense>;
      case 'trial': return <Suspense fallback={<LazyFallback />}><TrialPanel /></Suspense>;
      case 'awakening': return <Suspense fallback={<LazyFallback />}><AwakeningPanel /></Suspense>;
      case 'pets': return <Suspense fallback={<LazyFallback />}><PetPanel /></Suspense>;
      case 'settings': return <Suspense fallback={<LazyFallback />}><SettingsView setSubPage={setSubPage} /></Suspense>;
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
      <TitleToast />
      <StoryModal />
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
