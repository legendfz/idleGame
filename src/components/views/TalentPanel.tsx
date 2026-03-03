/**
 * TalentPanel — 天赋树UI（v5.1 样式重构）
 */
import { useTalentStore } from '../../store/talent';
import { TALENTS, TalentPath } from '../../engine/talent';
import { useState } from 'react';

const PATH_LABELS: Record<TalentPath, { icon: string; name: string; cls: string }> = {
  combat:      { icon: '⚔️', name: '战斗之道', cls: 'battle' },
  cultivation: { icon: '🧘', name: '修炼之道', cls: 'cultivate' },
  craft:       { icon: '🔨', name: '匠心之道', cls: 'craft' },
};

const BUFF_LABELS: Record<string, string> = {
  atkPercent: '攻击', defPercent: '防御', critRate: '暴击率', critDmg: '暴击伤害',
  xiuweiPercent: '修为', offlinePercent: '离线效率', forgeRate: '锻造成功率',
  gatherSpeed: '采集速度', coinPercent: '金币', bossTimer: 'Boss限时', comboWindow: '连击窗口',
};

function formatBuff(key: string, val: number) {
  const suffix = key.includes('Timer') ? 's' : key.includes('Window') ? 'ms' : '%';
  return `${BUFF_LABELS[key] ?? key}+${val}${suffix}`;
}

export function TalentPanel() {
  const [activePath, setActivePath] = useState<TalentPath>('combat');
  const points = useTalentStore(s => s.points);
  const ranks = useTalentStore(s => s.ranks);
  const learn = useTalentStore(s => s.learn);
  const reset = useTalentStore(s => s.reset);
  const buffs = useTalentStore(s => s.getBuffs());

  const pathTalents = TALENTS.filter(t => t.path === activePath).sort((a, b) => a.tier - b.tier);
  const activeBuffs = Object.entries(buffs).filter(([, v]) => v > 0);
  const pathInfo = PATH_LABELS[activePath];

  return (
    <div className="view-talent">
      {/* 顶栏 */}
      <div className="talent-header">
        <span className="talent-title">🌳 天赋</span>
        <span className="talent-points">⭐ {points} 点</span>
      </div>

      {/* 当前加成 */}
      {activeBuffs.length > 0 && (
        <div className="ms-buff-summary" style={{ marginBottom: 'var(--sp-md)' }}>
          <div className="ms-buff-grid">
            {activeBuffs.map(([k, v]) => (
              <span key={k} className="ms-buff-tag">{formatBuff(k, v)}</span>
            ))}
          </div>
        </div>
      )}

      {/* 三路 Tab */}
      <div className="talent-branch-tabs">
        {(['combat', 'cultivation', 'craft'] as TalentPath[]).map(p => (
          <button
            key={p}
            className={`talent-branch-tab ${PATH_LABELS[p].cls} ${activePath === p ? 'active' : ''}`}
            onClick={() => setActivePath(p)}
          >
            {PATH_LABELS[p].icon} {PATH_LABELS[p].name}
          </button>
        ))}
      </div>

      {/* 天赋列表 */}
      <div className="talent-tree">
        {pathTalents.map(def => {
          const rank = ranks[def.id] ?? 0;
          const maxed = rank >= def.maxRank;
          const canLearn = !maxed && points >= def.cost;
          const reqMet = !def.requires || def.requires.every(r => (ranks[r] ?? 0) >= 1);

          const nodeClass = [
            'talent-node',
            pathInfo.cls,
            !reqMet ? 'locked' : maxed ? 'learned' : rank > 0 ? 'learned' : canLearn ? 'available' : 'locked',
          ].join(' ');

          return (
            <div key={def.id} className={nodeClass} style={{ width: '100%', flexDirection: 'row', gap: 'var(--sp-md)', padding: 'var(--sp-md)', background: 'var(--color-bg-card)', borderRadius: 'var(--radius-lg)', cursor: 'default' }}>
              <div className="talent-node-circle">
                {def.icon}
                {rank > 0 && <span className="talent-node-level">{rank}</span>}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--sp-xs)' }}>
                  <span className="ach-name">{def.name}</span>
                  <span className="panel-summary" style={{ margin: 0 }}>{rank}/{def.maxRank}</span>
                </div>
                <div className="ach-desc">{def.desc} · 费用:{def.cost}点</div>
              </div>
              {!maxed && reqMet && (
                <button
                  className={`talent-learn-btn ${pathInfo.cls}`}
                  style={{ flex: 'none', width: 'auto', padding: 'var(--sp-xs) var(--sp-md)', fontSize: 'var(--fs-xs)' }}
                  disabled={!canLearn}
                  onClick={() => learn(def.id)}
                >
                  学习
                </button>
              )}
              {maxed && <span className="ach-badge">✅</span>}
            </div>
          );
        })}
      </div>

      {/* 重置 */}
      <div className="talent-reset-bar">
        <button className="talent-reset-btn" onClick={reset}>重置天赋</button>
        <div className="talent-reset-hint">转世后免费重置一次</div>
      </div>
    </div>
  );
}
