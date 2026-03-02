/**
 * App.tsx — v2.0 西游记 Idle Game 主入口
 */
import { ReactNode } from 'react';
import { GameLayout } from './components/layout';
import { TopBar } from './components/layout/TopBar/TopBar';
import { BottomNav } from './components/layout/BottomNav/BottomNav';
import { useGameLoop } from './hooks/useGameLoop';
import useGameStore from './store';
import type { ViewId } from './store/ui';
import { IdleView } from './components/views/IdleView';
import { BattleView } from './components/views/BattleView';
import { CharacterView } from './components/views/CharacterView';
import { InventoryView } from './components/views/InventoryView';
import { JourneyMap } from './components/views/JourneyMap';
import { formatBigNum, bn } from './engine';

const NAV_ITEMS = [
  { id: 'idle', icon: '🧘', label: '修炼' },
  { id: 'battle', icon: '⚔️', label: '战斗' },
  { id: 'character', icon: '🐒', label: '角色' },
  { id: 'inventory', icon: '🎒', label: '背包' },
  { id: 'journey', icon: '🗺️', label: '取经' },
];

function AppContent() {
  const currentView = useGameStore((s) => s.currentView);

  const viewMap: Record<string, ReactNode> = {
    idle: <IdleView />,
    battle: <BattleView />,
    character: <CharacterView />,
    inventory: <InventoryView />,
    journey: <JourneyMap />,
  };

  return <>{viewMap[currentView] || <IdleView />}</>;
}

export default function App() {
  useGameLoop();

  const xiuwei = useGameStore((s) => s.xiuwei);
  const gold = useGameStore((s) => s.gold);
  const level = useGameStore((s) => s.level);
  const realmId = useGameStore((s) => s.realmId);
  const currentView = useGameStore((s) => s.currentView);
  const setView = useGameStore((s) => s.setView);

  return (
    <GameLayout
      topBar={
        <TopBar
          name="唐僧"
          level={level}
          realm={realmId}
          xiuwei={formatBigNum(bn(xiuwei || '0'))}
          gold={formatBigNum(bn(gold || '0'))}
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
    </GameLayout>
  );
}
