/**
 * SanctuaryPanel — 洞天福地面板
 */
import { useSanctuaryStore } from '../../store/sanctuary';
import { BUILDINGS, getBuildingOutput, getUpgradeCost } from '../../engine/sanctuary';
import '../../styles/sanctuary.css';

export function SanctuaryPanel() {
  const state = useSanctuaryStore(s => s.state);
  const upgrade = useSanctuaryStore(s => s.upgrade);

  return (
    <div className="sanctuary-panel">
      <h2>🏔️ 洞天福地</h2>
      <p className="sanctuary-desc">经营你的仙府，获得持续加成</p>
      <div className="sanctuary-grid">
        {BUILDINGS.map(def => {
          const lv = state.levels[def.id] ?? 0;
          const output = getBuildingOutput(def, lv);
          const cost = getUpgradeCost(def, lv);
          const maxed = lv >= 10;
          return (
            <div key={def.id} className="sanctuary-building">
              <div className="building-header">
                <span className="building-icon">{def.icon}</span>
                <span className="building-name">{def.name}</span>
                <span className="building-level">Lv.{lv}</span>
              </div>
              <div className="building-desc">{def.desc}</div>
              <div className="building-output">
                {lv > 0 ? `产出: ${output}${def.produceType === 'lingshi' ? '/秒' : '%'}` : '未建造'}
              </div>
              <button
                className="building-upgrade-btn"
                onClick={() => upgrade(def.id)}
                disabled={maxed}
              >
                {maxed ? '已满级' : `升级 (${cost} 灵石)`}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
