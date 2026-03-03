import { useEffect, useRef, useState } from 'react';
import { useGameStore } from './store/gameStore';
import { useDungeonStore } from './store/dungeonStore';
import { useAchievementStore } from './store/achievementStore';
import { useLeaderboardStore } from './store/leaderboardStore';
import DungeonList from './components/DungeonList';
import DungeonBattle from './components/DungeonBattle';
import AchievementList from './components/AchievementList';
import Leaderboard from './components/Leaderboard';
import AchievementToast from './components/AchievementToast';
import { TutorialOverlay } from './components/TutorialOverlay';
import { StatsView } from './components/StatsView';
import { SanctuaryPanel } from './components/SanctuaryPanel';
import { ExplorationPanel } from './components/ExplorationPanel';
import { AffinityPanel } from './components/AffinityPanel';

import { TopBar, OfflineReportModal, SubPageHeader, SubPage } from './pages/shared';
import { BattleView } from './pages/BattlePage';
import { TeamView, CharacterDetailPage } from './pages/TeamPage';
import { JourneyView, ChapterSelectPage } from './pages/JourneyPage';
import { EquipDetailPage, RefinePage } from './pages/EquipmentPage';
import { ShopPage, SaveManagerPage } from './pages/ShopSavePage';
import { BagView } from './pages/BagPage';
import { SettingsView } from './pages/SettingsPage';

const TABS = [
  { id: 'battle' as const, icon: '⚔️', label: '战斗' },
  { id: 'team' as const, icon: '👤', label: '队伍' },
  { id: 'journey' as const, icon: '🏔️', label: '旅途' },
  { id: 'bag' as const, icon: '🎒', label: '背包' },
  { id: 'achievement' as const, icon: '🏆', label: '成就' },
  { id: 'sanctuary' as const, icon: '🏔️', label: '洞天' },
  { id: 'exploration' as const, icon: '🗺️', label: '秘境' },
  { id: 'affinity' as const, icon: '💕', label: '仙缘' },
  { id: 'stats' as const, icon: '📊', label: '统计' },
  { id: 'settings' as const, icon: '⚙️', label: '更多' },
];

function BottomNav() {
  const activeTab = useGameStore(s => s.activeTab);
  const setTab = useGameStore(s => s.setTab);
  return (
    <div className="bottom-nav">
      {TABS.map(tab => (
        <button key={tab.id} className={activeTab === tab.id ? 'active' : ''} onClick={() => setTab(tab.id)}>
          <span className="icon">{tab.icon}</span><span>{tab.label}</span>
        </button>
      ))}
    </div>
  );
}

export default function App() {
  const activeTab = useGameStore(s => s.activeTab);
  const setTab = useGameStore(s => s.setTab);
  const tick = useGameStore(s => s.tick);
  const save = useGameStore(s => s.save);
  const load = useGameStore(s => s.load);
  const loaded = useRef(false);
  const [subPage, setSubPage] = useState<SubPage>({ type: 'none' });

  // Load
  useEffect(() => {
    if (!loaded.current) {
      loaded.current = true;
      load();
      useDungeonStore.getState().load();
      useAchievementStore.getState().load();
      useLeaderboardStore.getState().load();
    }
  }, [load]);

  // Tick
  useEffect(() => {
    const id = setInterval(() => {
      tick();
      const gs = useGameStore.getState();
      const achStore = useAchievementStore.getState();
      achStore.updateProgress('monkey_awaken', gs.player.level);
      achStore.updateProgress('level_100', gs.player.level);
      achStore.updateProgress('online_24h', gs.totalPlayTime);
      achStore.checkAchievements();
    }, 1000);
    return () => clearInterval(id);
  }, [tick]);

  // Auto-save
  useEffect(() => {
    const id = setInterval(() => {
      save();
      useDungeonStore.getState().save();
      useAchievementStore.getState().save();
      useLeaderboardStore.getState().save();
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
      case 'sanctuary': return <SanctuaryPanel />;
      case 'exploration': return <ExplorationPanel />;
      case 'affinity': return <AffinityPanel />;
      case 'stats': return <StatsView />;
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
    </>
  );
}
