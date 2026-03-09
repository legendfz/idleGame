import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { REINC_PERKS, REINC_MIN_REALM, REINC_MIN_LEVEL, calcDaoPoints, REINC_MILESTONES } from '../data/reincarnation';
import { REALMS } from '../data/realms';
import { TranscendencePanel } from './TranscendencePanel';
import { TRANSCEND_MIN_REINC } from '../data/transcendence';
import { formatNumber, formatTime } from '../utils/format';

export function ReincarnationPanel() {
  const player = useGameStore(s => s.player);
  const reincarnate = useGameStore(s => s.reincarnate);
  const buyReincPerk = useGameStore(s => s.buyReincPerk);

  const canReinc = player.realmIndex >= REINC_MIN_REALM && player.level >= REINC_MIN_LEVEL;
  const daoPreview = canReinc ? calcDaoPoints(player.level, player.realmIndex, player.reincarnations) : 0;
  const realm = REALMS[player.realmIndex];

  return (
    <div className="main-content fade-in" style={{ padding: 'var(--space-md)' }}>
      <h3 className="section-title">转世轮回</h3>

      {/* Status card */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
          <span>转世次数</span>
          <span style={{ color: 'var(--accent)', fontWeight: 'bold' }}>{player.reincarnations} 世</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
          <span>道点</span>
          <span style={{ color: '#8af', fontWeight: 'bold' }}>{player.daoPoints}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>当前境界</span>
          <span>{realm?.name ?? '未知'} (Lv.{player.level})</span>
        </div>
      </div>

      {/* Reincarnate button */}
      <div className="card" style={{ marginBottom: 16, textAlign: 'center' }}>
        {canReinc ? (
          <>
            <div style={{ color: '#8af', marginBottom: 10 }}>
              转世将获得 <strong style={{ fontSize: 18 }}>+{daoPreview}</strong> 道点
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 12, fontSize: 11, color: '#aaa', marginBottom: 6, flexWrap: 'wrap' }}>
              <span>转世后道点: <span style={{ color: '#8af' }}>{player.daoPoints + daoPreview}</span></span>
              <span>第{player.reincarnations + 1}世</span>
              {player.reincarnations + 1 >= 3 && <span>觉醒点: <span style={{ color: '#c084fc' }}>+{Math.floor(((player.reincarnations + 1) - 2) * 2)}</span></span>}
              {player.fastestReincTime && player.fastestReincTime > 0 && <span>最速: <span style={{ color: '#34d399' }}>{Math.floor(player.fastestReincTime / 60)}m</span></span>}
            </div>
            <div style={{ color: 'var(--text-dim)', fontSize: 12, marginBottom: 10 }}>
              [注意] 等级、灵石、装备、境界将重置。道点和永久加成保留。
            </div>
            <button
              className="action-btn accent"
              style={{ width: '100%', padding: '10px 0', fontSize: 15 }}
              onClick={() => {
                if (confirm('转世将重置所有进度（保留道点和永久加成）。确定？')) {
                  reincarnate();
                }
              }}
            >
              转世轮回 (+{daoPreview} 道点)
            </button>
          </>
        ) : (
          <div style={{ color: 'var(--text-dim)', padding: 16 }}>
            需要达到「大乘」境界 (Lv.{REINC_MIN_LEVEL}) 才能转世
            <div style={{ marginTop: 6, fontSize: 12 }}>
              当前进度：Lv.{player.level}/{REINC_MIN_LEVEL} | 境界 {player.realmIndex}/{REINC_MIN_REALM}
            </div>
          </div>
        )}
      </div>

      {/* v67.0 Milestones */}
      <h3 className="section-title" style={{ marginTop: 20 }}>转世里程碑</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
        {REINC_MILESTONES.map(m => {
          const achieved = player.reincarnations >= m.reincCount;
          return (
            <div key={m.reincCount} className="card" style={{
              display: 'flex', alignItems: 'center', gap: 12,
              opacity: achieved ? 1 : 0.45,
              border: achieved ? '1px solid var(--accent)' : undefined,
            }}>
              <div style={{ fontSize: 22, minWidth: 36, textAlign: 'center' }}>{m.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 'bold', color: achieved ? 'var(--accent)' : 'var(--text-dim)' }}>
                  {m.title}
                  <span style={{ fontSize: 11, marginLeft: 6, color: 'var(--text-dim)' }}>({m.reincCount}次转世)</span>
                </div>
                <div style={{ fontSize: 12, color: achieved ? '#4ade80' : 'var(--text-dim)', marginTop: 2 }}>
                  {achieved ? '✓ ' : ''}{m.desc}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Perks */}
      <h3 className="section-title" style={{ marginTop: 20 }}>永久加成 · 道点商店</h3>
      {REINC_PERKS.map(perk => {
        const lv = player.reincPerks?.[perk.id] ?? 0;
        const maxed = lv >= perk.maxLevel;
        const canBuy = player.daoPoints >= perk.costPerLevel && !maxed;
        return (
          <div key={perk.id} className="card" style={{ marginBottom: 10, display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ fontSize: 14, minWidth: 36, textAlign: 'center', color: 'var(--accent)', fontWeight: 'bold' }}>{perk.icon}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 'bold' }}>
                {perk.name}
                <span style={{ color: maxed ? 'var(--green-bright)' : 'var(--accent)', marginLeft: 6, fontSize: 12 }}>
                  Lv.{lv}/{perk.maxLevel}
                </span>
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 2 }}>{perk.desc}</div>
            </div>
            <div style={{ display: 'flex', gap: 4, flexDirection: 'column', alignItems: 'flex-end' }}>
              <button
                className={`action-btn ${canBuy ? 'accent' : ''}`}
                disabled={!canBuy}
                onClick={() => buyReincPerk(perk.id)}
                style={{ minWidth: 60, opacity: canBuy ? 1 : 0.4, fontSize: 12 }}
              >
                {maxed ? '满级' : `${perk.costPerLevel} 道点`}
              </button>
              {canBuy && !maxed && Math.floor(player.daoPoints / perk.costPerLevel) > 1 && (
                <button
                  className="action-btn"
                  onClick={() => buyReincPerk(perk.id, true)}
                  style={{ minWidth: 60, fontSize: 11, background: 'linear-gradient(135deg, #a855f7, #6366f1)', color: '#fff', border: 'none', padding: '2px 8px', borderRadius: 6 }}
                >
                  买满 ×{Math.min(Math.floor(player.daoPoints / perk.costPerLevel), perk.maxLevel - lv)}
                </button>
              )}
            </div>
          </div>
        );
      })}

      {/* v194.0: Reincarnation History */}
      {(player.reincHistory ?? []).length > 0 && <ReincHistorySection history={player.reincHistory!} />}

      {/* v116.0: Transcendence section */}
      {(player.reincarnations >= TRANSCEND_MIN_REINC || (player.transcendCount ?? 0) > 0) && (
        <>
          <div style={{ margin: '16px 0 8px', borderTop: '1px solid rgba(139,92,246,0.3)' }} />
          <TranscendencePanel />
        </>
      )}
    </div>
  );
}

function ReincHistorySection({ history }: { history: { world: number; level: number; realm: number; daoGained: number; kills: number; gold: number; duration: number; timestamp: number }[] }) {
  const [expanded, setExpanded] = useState(false);
  const sorted = [...history].reverse(); // newest first
  const display = expanded ? sorted : sorted.slice(0, 5);

  return (
    <>
      <h3 className="section-title" style={{ marginTop: 20, cursor: 'pointer' }} onClick={() => setExpanded(!expanded)}>
        轮回记忆 {expanded ? '▼' : '▶'} <span style={{ fontSize: 11, color: 'var(--text-dim)', marginLeft: 6 }}>{history.length}条</span>
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
        {display.map((h, i) => {
          const realm = REALMS[h.realm]?.name ?? '未知';
          return (
            <div key={i} className="card" style={{ padding: '8px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12 }}>
              <div>
                <span style={{ color: 'var(--accent)', fontWeight: 'bold' }}>第{h.world}世</span>
                <span style={{ marginLeft: 8, color: 'var(--text-dim)' }}>Lv.{h.level} {realm}</span>
              </div>
              <div style={{ textAlign: 'right', display: 'flex', gap: 10, color: 'var(--text-dim)' }}>
                <span style={{ color: '#8af' }}>+{h.daoGained}道</span>
                <span>⚔{formatNumber(h.kills)}</span>
                <span>⏱{h.duration > 0 ? formatTime(h.duration) : '-'}</span>
              </div>
            </div>
          );
        })}
        {!expanded && sorted.length > 5 && (
          <div style={{ textAlign: 'center', color: 'var(--accent)', fontSize: 12, cursor: 'pointer', padding: 4 }} onClick={() => setExpanded(true)}>
            展开全部 ({sorted.length}条) ▼
          </div>
        )}
      </div>
    </>
  );
}
