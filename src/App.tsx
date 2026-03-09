import { useEffect, useRef, useState, lazy, Suspense } from 'react';
import { useGameStore } from './store/gameStore';
import { useDungeonStore } from './store/dungeonStore';
import AchievementToast from './components/AchievementToast';
import { TutorialOverlay } from './components/TutorialOverlay';
import { useLoadGame, useTickLoop, useAutoSave, useDocumentTitle, useNotifications, useKeyboardShortcuts } from './hooks/useGameLoop';

// Lazy-loaded panels
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
import { useSeasonStore } from './store/seasonStore';
import { getSeasonQuests, SEASON_REWARDS } from './data/seasonPass';
import { useSanctuaryStore } from './store/sanctuaryStore';
import { useExplorationStore } from './store/explorationStore';
import { BUILDINGS, getUpgradeCost } from './engine/sanctuary';
import { getCurrentWorldBoss } from './data/worldBoss';

const LazyFallback = () => <div style={{ padding: 40, textAlign: 'center', color: '#aaa' }}>加载中...</div>;

function StoryModal() {
  const story = useGameStore(s => s.activeStory);
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
        .slice(prevCountRef.current - 4);
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
  const [settingsHasClaimable, setSettingsHasClaimable] = useState(dailyCanSignIn);
  useEffect(() => {
    const check = () => {
      if (useDailyStore.getState().canSignIn) return true;
      try { if (useDailyChallengeStore.getState().hasUnclaimed()) return true; } catch { /* */ }
      try {
        const ss = useSeasonStore.getState();
        const quests = getSeasonQuests();
        for (const q of quests) {
          if (!ss.questClaimed.includes(q.id) && (ss.questProgress[q.id] ?? 0) >= q.target) return true;
        }
        for (const r of SEASON_REWARDS) {
          if (r.level <= ss.level && !ss.claimedRewards.includes(r.level)) return true;
        }
      } catch { /* */ }
      return false;
    };
    setSettingsHasClaimable(check());
    const iv = setInterval(() => setSettingsHasClaimable(check()), 5000);
    return () => clearInterval(iv);
  }, [dailyCanSignIn]);
  const lingshi = useGameStore(s => s.player.lingshi);
  const sanctuaryLevels = useSanctuaryStore(s => s.sanctuary.levels);
  const explorationFree = useExplorationStore(s => s.exploration.dailyFree);
  const explorationRun = useExplorationStore(s => s.exploration.currentRun);

  const sanctuaryRedDot = BUILDINGS.some(b => {
    const lv = sanctuaryLevels[b.id] ?? 0;
    return lv < 10 && lingshi >= getUpgradeCost(b, lv);
  });
  const explorationRedDot = explorationFree > 0 && (!explorationRun || explorationRun.completed);
  const [worldBossActive, setWorldBossActive] = useState(false);
  useEffect(() => {
    let wasActive = false;
    const check = () => {
      const active = !!getCurrentWorldBoss(Date.now());
      setWorldBossActive(active);
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
          <button key={tab.id} className={activeTab === tab.id ? 'active' : ''} onClick={() => { setTab(tab.id); }}
            style={{ position: 'relative' }}>
            <span className="icon">{tab.icon}</span><span>{tab.label}</span>
            {tab.id === 'settings' && settingsHasClaimable && <span className="nav-red-dot" />}
            {tab.id === 'battle' && worldBossActive && <span className="nav-red-dot" style={{ background: '#ff4500' }} />}
          </button>
        ))}
      </div>
    </>
  );
}

export default function App() {
  const activeTab = useGameStore(s => s.activeTab);
  const [subPage, setSubPage] = useState<SubPage>({ type: 'none' });
  
  // v191.0: Extracted hooks
  useLoadGame();
  useTickLoop();
  const saveFlash = useAutoSave();
  useDocumentTitle();
  useNotifications();
  useKeyboardShortcuts(activeTab);

  // Reset sub-page on tab change
  useEffect(() => { setSubPage({ type: 'none' }); }, [activeTab]);

  const goBack = () => setSubPage({ type: 'none' });

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
      case 'guide': return (
        <div className="main-content fade-in"><SubPageHeader title="仙途百科" onBack={goBack} /><Suspense fallback={<LazyFallback />}><GuidePanel /></Suspense></div>
      );
      case 'handbook': return (
        <div className="main-content fade-in"><Suspense fallback={<LazyFallback />}><HandbookPanel onClose={goBack} /></Suspense></div>
      );
      default: return null;
    }
  };

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
