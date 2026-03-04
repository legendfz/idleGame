import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { REALMS } from '../data/realms';
import { formatNumber } from '../utils/format';
import { Card, SubPageHeader, SubPage } from './shared';

export function CharacterDetailPage({ onBack }: { onBack: () => void }) {
  const player = useGameStore(s => s.player);
  const getEffectiveStats = useGameStore(s => s.getEffectiveStats);
  const attemptBreakthrough = useGameStore(s => s.attemptBreakthrough);
  const eStats = getEffectiveStats();
  const currentRealm = REALMS[player.realmIndex];
  const nextRealm = REALMS[player.realmIndex + 1];
  const canBreak = nextRealm && player.level >= nextRealm.levelReq && player.pantao >= nextRealm.pantaoReq;

  return (
    <div className="main-content fade-in">
      <SubPageHeader title="角色详情" onBack={onBack} />
      <Card title={player.name} titleColor="var(--accent)">
        <div className="stat-grid">
          <div className="stat-item"><span className="stat-label">攻击</span><span className="color-attack">{formatNumber(eStats.attack)}</span></div>
          <div className="stat-item"><span className="stat-label">血量</span><span className="color-hp">{formatNumber(eStats.maxHp)}</span></div>
          <div className="stat-item"><span className="stat-label">速度</span><span className="color-speed">{eStats.speed.toFixed(1)}</span></div>
          <div className="stat-item"><span className="stat-label">暴击率</span><span className="color-crit">{eStats.critRate.toFixed(0)}%</span></div>
          <div className="stat-item"><span className="stat-label">暴击伤害</span><span className="color-crit">{eStats.critDmg.toFixed(1)}x</span></div>
          <div className="stat-item"><span className="stat-label">点击攻击</span><span className="color-attack">{player.clickPower}</span></div>
        </div>
      </Card>
      <Card title={`境界 · ${currentRealm.name}`} titleColor="var(--realm-color)">
        <div className="color-dim" style={{ fontSize: 12 }}>{currentRealm.description}</div>
        {nextRealm && (
          <>
            <div style={{ fontSize: 12, marginTop: 12 }} className="color-dim">
              下一境界：{nextRealm.name} (Lv.{nextRealm.levelReq} + {nextRealm.pantaoReq} 蟠桃)
            </div>
            <button className="breakthrough-btn" disabled={!canBreak} onClick={attemptBreakthrough}>
              {canBreak ? '突破！' : '条件不足'}
            </button>
          </>
        )}
      </Card>
    </div>
  );
}

export function TeamView({ setSubPage }: { setSubPage: (p: SubPage) => void }) {
  const player = useGameStore(s => s.player);
  const getEffectiveStats = useGameStore(s => s.getEffectiveStats);
  const batchEnhanceEquipped = useGameStore(s => s.batchEnhanceEquipped);
  const eStats = getEffectiveStats();
  const currentRealm = REALMS[player.realmIndex];
  const [enhanceMsg, setEnhanceMsg] = useState<string | null>(null);

  const handleBatchEnhance = () => {
    const result = batchEnhanceEquipped();
    if (result.count === 0) {
      setEnhanceMsg('没有可强化的装备（已满级或灵石不足）');
    } else {
      setEnhanceMsg(`强化 ${result.count} 次`);
    }
    setTimeout(() => setEnhanceMsg(null), 2500);
  };

  // Combat power
  const combatPower = Math.floor(eStats.attack * (1 + (eStats.critRate / 100) * ((eStats.critDmg || 150) / 100)) + eStats.maxHp * 0.05);

  return (
    <div className="main-content fade-in">
      <h3 className="section-title">队伍</h3>
      <Card className="clickable-card" style={{ cursor: 'pointer' }}
        onClick={() => setSubPage({ type: 'characterDetail' })}>
        <div className="card-title" style={{ color: 'var(--accent)' }}>{player.name}</div>
        <div className="stat-grid-compact">
          <span className="color-attack">攻 {formatNumber(eStats.attack)}</span>
          <span className="color-hp">血 {formatNumber(eStats.maxHp)}</span>
          <span className="color-crit">暴 {eStats.critRate.toFixed(0)}%</span>
          <span style={{ color: '#ffcc00', fontWeight: 700 }}>⭐ {formatNumber(combatPower)}</span>
        </div>
        <div className="card-footer">
          <span className="color-realm">{currentRealm.name}</span>
          <span className="color-dim">Lv.{player.level}</span>
          <span className="color-dim" style={{ marginLeft: 'auto' }}>查看详情 →</span>
        </div>
      </Card>
      <button className="breakthrough-btn" style={{ margin: '0 12px 12px', fontSize: 13 }} onClick={handleBatchEnhance}>
        ⚒ 一键强化已装备
      </button>
      {enhanceMsg && <div style={{ textAlign: 'center', color: '#ffcc00', fontSize: 13, marginBottom: 8 }}>{enhanceMsg}</div>}
    </div>
  );
}
