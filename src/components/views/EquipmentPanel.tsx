/**
 * EquipmentPanel — 装备详情面板
 */
import { useEquipStore } from '../../store/equipment';
import { QUALITY_NAMES, calcEquipStats } from '../../engine/equipment';
import { formatBigNum } from '../../engine/bignum';

export function EquipmentPanel() {
  const items = useEquipStore(s => s.items);

  return (
    <div className="equipment-panel">
      <h3>装备列表 ({items.length})</h3>
      {items.map(item => {
        const stats = calcEquipStats(item);
        return (
          <div key={item.uid} className="equip-detail">
            <span>[{QUALITY_NAMES[item.quality]}] +{item.enhanceLevel}</span>
            <span>攻{formatBigNum(stats.atk)} 防{formatBigNum(stats.def)} 血{formatBigNum(stats.hp)}</span>
          </div>
        );
      })}
    </div>
  );
}
