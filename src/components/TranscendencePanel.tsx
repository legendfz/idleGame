import { useGameStore } from '../store/gameStore';
import { TRANSCEND_PERKS, TRANSCEND_MIN_REINC, calcTranscendPoints, getTranscendBonuses } from '../data/transcendence';
import { formatNumber } from '../utils/format';

export function TranscendencePanel() {
  const player = useGameStore(s => s.player);
  const transcend = useGameStore(s => s.transcend);
  const buyTranscendPerk = useGameStore(s => s.buyTranscendPerk);

  const canTranscend = player.reincarnations >= TRANSCEND_MIN_REINC;
  const tpPreview = canTranscend ? calcTranscendPoints(player.reincarnations, player.totalDaoPoints) : 0;
  const bonuses = getTranscendBonuses(player.transcendPerks ?? {});

  return (
    <div style={{ padding: 12 }}>
      {/* Header */}
      <div style={{
        textAlign: 'center', marginBottom: 12, padding: 12, borderRadius: 12,
        background: 'linear-gradient(135deg, rgba(139,92,246,0.2), rgba(236,72,153,0.2))',
        border: '1px solid rgba(139,92,246,0.3)',
      }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: '#c084fc' }}>🌌 超越轮回</div>
        <div style={{ fontSize: 11, color: '#a78bfa', marginTop: 4 }}>
          超越次数: {player.transcendCount ?? 0} | 超越点: {formatNumber(player.transcendPoints ?? 0)}
        </div>
        {(player.transcendCount ?? 0) === 0 && (
          <div style={{ fontSize: 10, color: '#888', marginTop: 4 }}>
            需要 {TRANSCEND_MIN_REINC} 次转世后解锁超越（当前: {player.reincarnations} 次）
          </div>
        )}
      </div>

      {/* Transcend Button */}
      {canTranscend && (
        <button onClick={transcend} style={{
          width: '100%', padding: '10px 16px', borderRadius: 10, cursor: 'pointer',
          background: 'linear-gradient(135deg, #7c3aed, #ec4899)', border: 'none',
          color: '#fff', fontWeight: 700, fontSize: 14, marginBottom: 12,
          animation: 'levelUpGlow 2s ease-in-out infinite',
        }}>
          🌌 超越轮回 → 获得 {tpPreview} 超越点
          <div style={{ fontSize: 10, fontWeight: 400, marginTop: 2, opacity: 0.8 }}>
            ⚠️ 重置转世次数+道点+觉醒，保留超越加成/图鉴/灵兽
          </div>
        </button>
      )}

      {/* Current Bonuses Summary */}
      {(player.transcendCount ?? 0) > 0 && (
        <div style={{
          padding: 8, borderRadius: 8, marginBottom: 12,
          background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)',
          fontSize: 11, color: '#c084fc',
        }}>
          <div style={{ fontWeight: 600, marginBottom: 4 }}>当前超越加成:</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {bonuses.atkMul > 1 && <span>💥攻击×{bonuses.atkMul.toFixed(1)}</span>}
            {bonuses.hpMul > 1 && <span>🛡️生命×{bonuses.hpMul.toFixed(1)}</span>}
            {bonuses.expMul > 1 && <span>📜经验×{bonuses.expMul.toFixed(1)}</span>}
            {bonuses.goldMul > 1 && <span>💰灵石×{bonuses.goldMul.toFixed(1)}</span>}
            {bonuses.critFlat > 0 && <span>👁️暴击+{bonuses.critFlat}%</span>}
            {bonuses.critDmg > 0 && <span>⚡暴伤+{(bonuses.critDmg * 100).toFixed(0)}%</span>}
            {bonuses.speedMul > 1 && <span>⏩速度×{bonuses.speedMul.toFixed(1)}</span>}
            {bonuses.dropMul > 1 && <span>🎁掉率×{bonuses.dropMul.toFixed(1)}</span>}
          </div>
        </div>
      )}

      {/* Perk Shop */}
      <div style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0', marginBottom: 8 }}>超越商店</div>
      {TRANSCEND_PERKS.map(perk => {
        const lv = (player.transcendPerks ?? {})[perk.id] ?? 0;
        const maxed = lv >= perk.maxLevel;
        const canBuy = !maxed && (player.transcendPoints ?? 0) >= perk.costPerLevel;

        return (
          <div key={perk.id} style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px',
            borderRadius: 8, marginBottom: 6,
            background: maxed ? 'rgba(34,197,94,0.1)' : 'rgba(100,100,100,0.1)',
            border: `1px solid ${maxed ? 'rgba(34,197,94,0.3)' : 'rgba(100,100,100,0.2)'}`,
          }}>
            <span style={{ fontSize: 20 }}>{perk.icon}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0' }}>
                {perk.name} <span style={{ color: '#888', fontWeight: 400 }}>Lv.{lv}/{perk.maxLevel}</span>
              </div>
              <div style={{ fontSize: 10, color: '#a0aec0' }}>{perk.desc}</div>
            </div>
            <div style={{ display: 'flex', gap: 4 }}>
              <button onClick={() => buyTranscendPerk(perk.id)} disabled={!canBuy} style={{
                padding: '4px 10px', borderRadius: 6, cursor: canBuy ? 'pointer' : 'default',
                background: canBuy ? 'rgba(139,92,246,0.3)' : 'rgba(100,100,100,0.15)',
                border: `1px solid ${canBuy ? 'rgba(139,92,246,0.5)' : 'rgba(100,100,100,0.2)'}`,
                color: canBuy ? '#c084fc' : '#555', fontSize: 11, fontWeight: 600,
              }}>
                +1 ({perk.costPerLevel}点)
              </button>
              <button onClick={() => buyTranscendPerk(perk.id, true)} disabled={!canBuy} style={{
                padding: '4px 8px', borderRadius: 6, cursor: canBuy ? 'pointer' : 'default',
                background: canBuy ? 'linear-gradient(135deg, rgba(139,92,246,0.3), rgba(236,72,153,0.3))' : 'rgba(100,100,100,0.15)',
                border: `1px solid ${canBuy ? 'rgba(236,72,153,0.5)' : 'rgba(100,100,100,0.2)'}`,
                color: canBuy ? '#f0abfc' : '#555', fontSize: 11, fontWeight: 600,
              }}>
                买满
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
