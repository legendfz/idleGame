/**
 * TalentPanel — 天赋树UI
 */
import { useTalentStore } from '../../store/talent';
import { TALENTS, TalentDef, TalentPath } from '../../engine/talent';
import { useState } from 'react';

const PATH_LABELS: Record<TalentPath, { icon: string; name: string }> = {
  combat: { icon: '⚔️', name: '战斗之道' },
  cultivation: { icon: '🧘', name: '修炼之道' },
  craft: { icon: '🔨', name: '匠心之道' },
};

const BUFF_LABELS: Record<string, string> = {
  atkPercent: '攻击', defPercent: '防御', critRate: '暴击率', critDmg: '暴击伤害',
  xiuweiPercent: '修为', offlinePercent: '离线效率', forgeRate: '锻造成功率',
  gatherSpeed: '采集速度', coinPercent: '金币', bossTimer: 'Boss限时', comboWindow: '连击窗口',
};

export function TalentPanel() {
  const [activePath, setActivePath] = useState<TalentPath>('combat');
  const points = useTalentStore(s => s.points);
  const ranks = useTalentStore(s => s.ranks);
  const learn = useTalentStore(s => s.learn);
  const reset = useTalentStore(s => s.reset);
  const buffs = useTalentStore(s => s.getBuffs());

  const pathTalents = TALENTS.filter(t => t.path === activePath).sort((a, b) => a.tier - b.tier);
  const activeBuffs = Object.entries(buffs).filter(([, v]) => v > 0);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <span style={{ fontWeight: 'bold' }}>天赋点: {points}</span>
        <button style={{ padding: '4px 12px', background: '#e74c3c', border: 'none', borderRadius: 6, color: '#fff', fontSize: 11, cursor: 'pointer' }} onClick={reset}>重置天赋</button>
      </div>

      {activeBuffs.length > 0 && (
        <div style={{ fontSize: 11, color: 'var(--color-accent)', marginBottom: 8, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {activeBuffs.map(([k, v]) => <span key={k}>{BUFF_LABELS[k] ?? k}+{v}{k.includes('Timer') ? 's' : k.includes('Window') ? 'ms' : '%'}</span>)}
        </div>
      )}

      <div className="forge-tabs" style={{ marginBottom: 10 }}>
        {(['combat', 'cultivation', 'craft'] as TalentPath[]).map(p => (
          <button key={p} className={activePath === p ? 'active' : ''} onClick={() => setActivePath(p)}>
            {PATH_LABELS[p].icon} {PATH_LABELS[p].name}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {pathTalents.map(def => {
          const rank = ranks[def.id] ?? 0;
          const maxed = rank >= def.maxRank;
          const canLearn = !maxed && points >= def.cost;
          const reqMet = !def.requires || def.requires.every(r => (ranks[r] ?? 0) >= 1);

          return (
            <div key={def.id} style={{
              background: 'var(--color-bg-elevated)', borderRadius: 10, padding: '8px 12px',
              border: maxed ? '1px solid #4caf50' : rank > 0 ? '1px solid var(--color-accent)' : '1px solid var(--color-border, #333)',
              opacity: reqMet ? 1 : 0.4, display: 'flex', gap: 10, alignItems: 'center',
            }}>
              <span style={{ fontSize: 24 }}>{def.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 'bold', fontSize: 13 }}>
                  {def.name} <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{rank}/{def.maxRank}</span>
                </div>
                <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{def.desc} · 费用:{def.cost}点</div>
              </div>
              {!maxed && reqMet && (
                <button disabled={!canLearn} style={{
                  padding: '5px 12px', background: canLearn ? 'var(--color-primary)' : 'var(--color-bg-muted)',
                  border: 'none', borderRadius: 8, color: '#fff', fontSize: 11, cursor: canLearn ? 'pointer' : 'not-allowed',
                }} onClick={() => learn(def.id)}>学习</button>
              )}
              {maxed && <span style={{ color: '#4caf50', fontSize: 12 }}>✅</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
