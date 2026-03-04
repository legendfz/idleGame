import { useGameStore } from '../store/gameStore';
import { REINC_PERKS, REINC_MIN_REALM, REINC_MIN_LEVEL, calcDaoPoints } from '../data/reincarnation';
import { REALMS } from '../data/realms';

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
            <button
              className={`action-btn ${canBuy ? 'accent' : ''}`}
              disabled={!canBuy}
              onClick={() => buyReincPerk(perk.id)}
              style={{ minWidth: 60, opacity: canBuy ? 1 : 0.4 }}
            >
              {maxed ? '满级' : `${perk.costPerLevel} 道点`}
            </button>
          </div>
        );
      })}
    </div>
  );
}
