import { useMemo } from 'react';
import { useGameStore } from '../../store/gameStore';
import type { TabId } from '../../types';

const AUTO_KEYS = [
  'autoEquipOnDrop', 'autoSkill', 'autoConsume', 'autoWorldBoss', 'autoExplore',
  'autoSanctuary', 'autoAffinity', 'autoSweep', 'autoFate', 'autoWheel',
  'autoTrial', 'autoAscension', 'autoEnhance', 'autoReforge', 'autoRefine',
  'autoFeedPet', 'autoBuyPerks', 'autoSynth', 'autoReincarnate', 'autoDaoAlloc',
  'autoBuyScrolls', 'autoAwaken', 'autoFarm', 'autoEvent', 'autoWeeklyBoss',
  'autoClaimChallenges', 'autoTranscend', 'autoBuyTranscendPerks',
] as const;

export function AutoStatusBar() {
  const state = useGameStore();
  const setTab = useGameStore(s => s.setTab);

  const { on, total } = useMemo(() => {
    let on = 0;
    for (const k of AUTO_KEYS) {
      if ((state as any)[k]) on++;
    }
    return { on, total: AUTO_KEYS.length };
  }, [state]);

  const pct = Math.round((on / total) * 100);
  const color = pct >= 80 ? '#4ade80' : pct >= 50 ? '#facc15' : '#94a3b8';

  return (
    <div
      style={{
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '3px 8px', borderRadius: 6,
        background: 'rgba(255,255,255,0.04)', cursor: 'pointer',
        fontSize: 11, color,
      }}
      onClick={() => setTab('settings' as TabId)}
      title="点击前往设置管理自动功能"
    >
      <span>🤖</span>
      <span style={{ fontWeight: 600 }}>{on}/{total}</span>
      <div style={{
        width: 40, height: 4, borderRadius: 2,
        background: 'rgba(255,255,255,0.1)',
      }}>
        <div style={{
          width: `${pct}%`, height: '100%', borderRadius: 2,
          background: color, transition: 'width 0.3s',
        }} />
      </div>
    </div>
  );
}
