/**
 * App.tsx — v2.0 西游记 Idle Game 主入口
 */
import { ReactNode } from 'react';
import { GameLayout } from './components/layout';
import { TopBar } from './components/layout/TopBar/TopBar';
import { BottomNav } from './components/layout/BottomNav/BottomNav';
import { useGameLoop } from './hooks/useGameLoop';
import { usePlayerStore } from './store/player';
import { useUIStore, ViewId } from './store/ui';
import { IdleView } from './components/views/IdleView';
import { BattleView } from './components/views/BattleView';
import { CharacterView } from './components/views/CharacterView';
import { InventoryView } from './components/views/InventoryView';
import { JourneyMap } from './components/views/JourneyMap';
import { ForgeView } from './components/views/ForgeView';
import { GatherView } from './components/views/GatherView';
import { DungeonView } from './components/views/DungeonView';
import { StatsView } from './components/views/StatsView';
import { QuestView } from './components/views/QuestView';
import { CultivationView } from './components/views/CultivationView';
import { ReincarnationPanel } from './components/views/ReincarnationPanel';
import { LeaderboardPanel } from './components/views/LeaderboardPanel';
import { ShopPanel } from './components/views/ShopPanel';
import { EventPanel } from './components/views/EventPanel';
import { TowerPanel } from './components/views/TowerPanel';
import { PetPanel } from './components/views/PetPanel';
import { WudaoView } from './components/views/WudaoView';
import { TutorialOverlay } from './components/shared/TutorialOverlay';
import { GuildPanel } from './components/views/GuildPanel';
import { PvpPanel } from './components/views/PvpPanel';
import { FestivalPanel } from './components/views/FestivalPanel';
import { formatBigNum, bn } from './engine/bignum';
import { getRealmConfig } from './data/config';
import { ToastContainer } from './components/shared/ToastContainer';
import { OfflineModal } from './components/shared/OfflineModal';
import { TutorialModal } from './components/shared/TutorialModal';

const ALL_NAV_ITEMS = [
  // 导航顺序: 核心→成长→挑战→社交→辅助
  { id: 'idle', icon: '🧘', label: '修炼', minRealm: 1 },
  { id: 'battle', icon: '⚔️', label: '战斗', minRealm: 1 },
  { id: 'character', icon: '🐒', label: '角色', minRealm: 1 },
  { id: 'inventory', icon: '🎒', label: '背包', minRealm: 1 },
  { id: 'forge', icon: '🔨', label: '锻造', minRealm: 3 },
  { id: 'gather', icon: '⛏️', label: '采集', minRealm: 2 },
  { id: 'cultivation', icon: '🌟', label: '修行', minRealm: 2 },
  { id: 'wudao', icon: '🌀', label: '悟道', minRealm: 4 },
  { id: 'pet', icon: '🐾', label: '灵兽', minRealm: 3 },
  { id: 'dungeon', icon: '🐉', label: '秘境', minRealm: 3 },
  { id: 'tower', icon: '🗼', label: '通天塔', minRealm: 3 },
  { id: 'journey', icon: '🗺️', label: '取经', minRealm: 1 },
  { id: 'quest', icon: '📋', label: '任务', minRealm: 1 },
  { id: 'reincarnation', icon: '🔄', label: '轮回', minRealm: 5 },
  { id: 'guild', icon: '🏯', label: '仙盟', minRealm: 3 },
  { id: 'pvp', icon: '🤺', label: '擂台', minRealm: 3 },
  { id: 'shop', icon: '🏪', label: '商店', minRealm: 2 },
  { id: 'festival', icon: '🎊', label: '竞技', minRealm: 2 },
  { id: 'event', icon: '🎉', label: '活动', minRealm: 1 },
  { id: 'leaderboard', icon: '🏆', label: '排行', minRealm: 1 },
  { id: 'stats', icon: '📊', label: '统计', minRealm: 1 },
];

function AppContent() {
  const currentView = useUIStore(s => s.currentView);

  const viewMap: Record<string, ReactNode> = {
    idle: <IdleView />,
    battle: <BattleView />,
    character: <CharacterView />,
    inventory: <InventoryView />,
    journey: <JourneyMap />,
    forge: <ForgeView />,
    gather: <GatherView />,
    dungeon: <DungeonView />,
    cultivation: <CultivationView />,
    quest: <QuestView />,
    reincarnation: <ReincarnationPanel />,
    wudao: <WudaoView />,
    tower: <TowerPanel />,
    pet: <PetPanel />,
    guild: <GuildPanel />,
    pvp: <PvpPanel />,
    festival: <FestivalPanel />,
    shop: <ShopPanel />,
    event: <EventPanel />,
    leaderboard: <LeaderboardPanel />,
    stats: <StatsView />,
  };

  return <>{viewMap[currentView] || <IdleView />}</>;
}

export default function App() {
  useGameLoop();

  const player = usePlayerStore(s => s.player);
  const xpsDisplay = usePlayerStore(s => s.xpsDisplay);
  const currentView = useUIStore(s => s.currentView);
  const setView = useUIStore(s => s.setView);
  const realm = getRealmConfig(player.realmId);
  const realmOrder = realm?.order ?? 1;
  const navItems = ALL_NAV_ITEMS.filter(item => realmOrder >= item.minRealm);

  return (
    <GameLayout
      topBar={
        <TopBar
          name="取经人"
          level={player.realmLevel}
          realm={realm?.name ?? '凡人'}
          xiuwei={formatBigNum(bn(player.xiuwei || '0'))}
          gold={formatBigNum(bn(player.coins || '0'))}
        />
      }
      bottomNav={
        <BottomNav
          items={navItems}
          activeId={currentView}
          onChange={(id) => setView(id as ViewId)}
        />
      }
    >
      <AppContent />
      <ToastContainer />
      <OfflineModal />
      <TutorialModal />
      <TutorialOverlay />
    </GameLayout>
  );
}
