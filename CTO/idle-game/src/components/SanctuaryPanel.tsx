import { useSanctuaryStore } from '../store/sanctuaryStore';
import { useGameStore } from '../store/gameStore';
import { BUILDINGS, getBuildingOutput, getUpgradeCost } from '../engine/sanctuary';
import { formatNumber } from '../utils/format';

export function SanctuaryPanel() {
  const levels = useSanctuaryStore(s => s.sanctuary.levels);
  const upgrade = useSanctuaryStore(s => s.upgrade);
  const lingshi = useGameStore(s => s.player.lingshi);

  const handleUpgrade = (buildingId: string) => {
    const result = upgrade(buildingId, lingshi);
    if (result) {
      useGameStore.setState(s => ({ player: { ...s.player, lingshi: s.player.lingshi - result.cost } }));
    }
  };

  return (
    <div className="main-content fade-in">
      <h3 className="section-title">🏔️ 洞天福地</h3>
      <div style={{ fontSize: 12, color: 'var(--dim)', marginBottom: 12 }}>建设你的修仙福地，获取持续加成</div>
      {BUILDINGS.map(def => {
        const lv = levels[def.id] ?? 0;
        const output = getBuildingOutput(def, lv);
        const cost = lv < 10 ? getUpgradeCost(def, lv) : 0;
        const canUp = lv < 10 && lingshi >= cost;
        return (
          <div key={def.id} style={{
            background: 'var(--bg-card)', borderRadius: 10, padding: 12, marginBottom: 8,
            border: lv > 0 ? '1px solid var(--accent)' : '1px solid var(--border)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 28 }}>{def.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 'bold' }}>{def.name} <span style={{ fontSize: 11, color: 'var(--dim)' }}>Lv.{lv}/10</span></div>
                <div style={{ fontSize: 11, color: 'var(--dim)' }}>{def.desc}</div>
                {lv > 0 && <div style={{ fontSize: 11, color: 'var(--accent)' }}>产出: +{output}</div>}
              </div>
              {lv < 10 ? (
                <button className={`action-btn ${canUp ? 'accent' : ''}`} disabled={!canUp} onClick={() => handleUpgrade(def.id)}
                  style={{ fontSize: 11, padding: '4px 10px', opacity: canUp ? 1 : 0.4 }}>
                  升级 ({formatNumber(cost)}💰)
                </button>
              ) : <span style={{ color: 'var(--accent)', fontSize: 11 }}>已满级</span>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
