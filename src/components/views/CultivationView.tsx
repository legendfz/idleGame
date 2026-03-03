/**
 * CultivationView — 修行总面板(天赋+伙伴)
 */
import { useState } from 'react';
import { TalentPanel } from './TalentPanel';
import { CompanionPanel } from './CompanionPanel';

type CultTab = 'talent' | 'companion';

export function CultivationView() {
  const [tab, setTab] = useState<CultTab>('talent');

  return (
    <div style={{ padding: 16, height: '100%', overflow: 'auto' }}>
      <h2>🌟 修行</h2>
      <div className="forge-tabs" style={{ marginBottom: 12 }}>
        <button className={tab === 'talent' ? 'active' : ''} onClick={() => setTab('talent')}>🌳 天赋</button>
        <button className={tab === 'companion' ? 'active' : ''} onClick={() => setTab('companion')}>🤝 伙伴</button>
      </div>
      {tab === 'talent' && <TalentPanel />}
      {tab === 'companion' && <CompanionPanel />}
    </div>
  );
}
