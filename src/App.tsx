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
import { formatBigNum, bn } from './engine/bignum';
import { getRealmConfig } from './data/config';
import { ToastContainer } from './components/shared/ToastContainer';
import { OfflineModal } from './components/shared/OfflineModal';

const NAV_ITEMS = [
  { id: 'idle', icon: '🧘', label: '修炼' },
  { id: 'battle', icon: '⚔️', label: '战斗' },
  { id: 'forge', icon: '🔨', label: '锻造' },
  { id: 'gather', icon: '⛏️', label: '采集' },
  { id: 'dungeon', icon: '🐉', label: '秘境' },
  { id: 'character', icon: '🐒', label: '角色' },
  { id: 'inventory', icon: '🎒', label: '背包' },
  { id: 'journey', icon: '🗺️', label: '取经' },
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
          items={NAV_ITEMS}
          activeId={currentView}
          onChange={(id) => setView(id as ViewId)}
        />
      }
    >
      <AppContent />
      <ToastContainer />
      <OfflineModal />
    </GameLayout>
  );
}
