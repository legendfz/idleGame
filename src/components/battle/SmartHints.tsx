import { useMemo } from 'react';
import { useGameStore } from '../../store/gameStore';
import { useDailyStore } from '../../store/dailyStore';
import { useSanctuaryStore } from '../../store/sanctuaryStore';
import { useExplorationStore } from '../../store/explorationStore';
import { REALMS } from '../../data/realms';
import { BUILDINGS, getUpgradeCost } from '../../engine/sanctuary';
import type { TabId } from '../../types';

export function SmartHints() {
  const player = useGameStore(s => s.player);
  const setTab = useGameStore(s => s.setTab);
  const dailyCanSignIn = useDailyStore(s => s.canSignIn);
  const sanctuaryLevels = useSanctuaryStore(s => s.sanctuary.levels);
  const explorationFreeRuns = useExplorationStore(s => s.exploration.dailyFree);

  const hints = useMemo(() => {
    const h: { label: string; tab: string }[] = [];
    const nextRealm = REALMS[player.realmIndex + 1];
    if (nextRealm && player.level >= nextRealm.levelReq && player.pantao >= nextRealm.pantaoReq) {
      h.push({ label: '⚡ 可突破境界', tab: 'battle' });
    }
    if (player.level >= 500) {
      h.push({ label: '🔄 可转世', tab: 'reincarnation' });
    }
    if (dailyCanSignIn) {
      h.push({ label: '📅 签到可领', tab: 'settings' });
    }
    if (sanctuaryLevels && BUILDINGS.some(b => {
      const lv = sanctuaryLevels[b.id] ?? 0;
      return lv < 10 && player.lingshi >= getUpgradeCost(b, lv);
    })) {
      h.push({ label: '🏠 洞天可升级', tab: 'sanctuary' });
    }
    if (explorationFreeRuns > 0) {
      h.push({ label: '🗺️ 免费秘境', tab: 'exploration' });
    }
    if (player.reincarnations >= 3 && player.level >= 80) {
      h.push({ label: '✨ 觉醒可点', tab: 'awakening' });
    }
    return h.slice(0, 4);
  }, [player.level, player.realmIndex, player.pantao, player.lingshi, player.reincarnations, dailyCanSignIn, sanctuaryLevels, explorationFreeRuns]);

  if (hints.length === 0 || !player.tutorialDone) return null;

  return (
    <div className="action-hints">
      {hints.map((h, i) => (
        <span key={i} className="action-hint" onClick={() => setTab(h.tab as TabId)}>
          {h.label}
        </span>
      ))}
    </div>
  );
}
