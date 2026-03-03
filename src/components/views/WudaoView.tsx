/**
 * WudaoView — 悟道总面板(神通+策略)
 */
import { useState } from 'react';
import { SkillPanel } from './SkillPanel';
import { StrategyPanel } from './StrategyPanel';

type WudaoTab = 'skill' | 'strategy';

export function WudaoView() {
  const [tab, setTab] = useState<WudaoTab>('skill');

  return (
    <div style={{ padding: 16, height: '100%', overflow: 'auto' }}>
      <h2>🌀 悟道</h2>
      <div className="forge-tabs" style={{ marginBottom: 12 }}>
        <button className={tab === 'skill' ? 'active' : ''} onClick={() => setTab('skill')}>🔮 神通</button>
        <button className={tab === 'strategy' ? 'active' : ''} onClick={() => setTab('strategy')}>⚔️ 策略</button>
      </div>
      {tab === 'skill' && <SkillPanel />}
      {tab === 'strategy' && <StrategyPanel />}
    </div>
  );
}
