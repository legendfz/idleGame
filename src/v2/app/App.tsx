/**
 * v2.0 App Shell
 */

import { useEffect, useRef } from 'react';
import './v2.css';
import TopBar from '../ui/layout/TopBar';
import BottomNav from '../ui/layout/BottomNav';
import Toast from '../ui/common/Toast';
import CultivateScreen from '../ui/screens/CultivateScreen';
import BattleScreen from '../ui/screens/BattleScreen';
import CharacterScreen from '../ui/screens/CharacterScreen';
import InventoryScreen from '../ui/screens/InventoryScreen';
import JourneyMap from '../ui/screens/JourneyMap';
import { useUIStore } from '../store/uiStore';
import { useGameLoop } from './GameLoop';

export default function AppV2() {
  useGameLoop();

  const activeTab = useUIStore(s => s.activeTab);

  return (
    <div className="v2-app">
      <TopBar />
      {activeTab === 'cultivate' && <CultivateScreen />}
      {activeTab === 'battle' && <BattleScreen />}
      {activeTab === 'character' && <CharacterScreen />}
      {activeTab === 'inventory' && <InventoryScreen />}
      {activeTab === 'journey' && <JourneyMap />}
      <BottomNav />
      <Toast />
    </div>
  );
}
