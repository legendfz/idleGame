/**
 * InventoryView — 背包界面
 */
import { useEquipStore } from '../../store/equipment';
import { QUALITY_NAMES } from '../../engine/equipment';

export function InventoryView() {
  const items = useEquipStore(s => s.items);
  const maxSlots = useEquipStore(s => s.maxSlots);
  const sellItem = useEquipStore(s => s.sellItem);
  const enhance = useEquipStore(s => s.enhance);

  return (
    <div className="view-inventory">
      <h2>🎒 背包 ({items.length}/{maxSlots})</h2>
      {items.length === 0 ? (
        <p className="empty-msg">背包空空如也，去战斗获取装备吧！</p>
      ) : (
        items.map(item => (
          <div key={item.uid} className="equip-card">
            <div className="equip-name">
              [{QUALITY_NAMES[item.quality]}] {item.templateId.split('_')[0]}
              {item.enhanceLevel > 0 && <span className="enhance-level">+{item.enhanceLevel}</span>}
            </div>
            <div className="equip-stats">
              {item.baseAtk > 0 && <span>攻:{item.baseAtk}</span>}
              {item.baseDef > 0 && <span>防:{item.baseDef}</span>}
              {item.baseHp > 0 && <span>血:{item.baseHp}</span>}
            </div>
            <div className="equip-actions">
              <button onClick={() => enhance(item.uid)}>强化</button>
              <button onClick={() => sellItem(item.uid)}>出售</button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
