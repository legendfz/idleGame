/**
 * EquipmentPanel — 背包装备界面
 * 已装备槽 + 背包列表 + 分类过滤
 */
import { useState } from 'react';
import useGameStore from '../../store';
import { Tab } from '../ui';
import styles from './EquipmentPanel.module.css';

const QUALITY_COLORS = ['#9E9E9E', '#4CAF50', '#2196F3', '#9C27B0', '#FF9800', '#FFD700'];
const QUALITY_NAMES = ['凡', '灵', '仙', '神', '混沌', '鸿蒙'];

const SLOT_CONFIG = [
  { key: 'weapon',    label: '武器', emoji: '⚔️' },
  { key: 'armor',     label: '防具', emoji: '🛡️' },
  { key: 'accessory', label: '法宝', emoji: '💎' },
  { key: 'mount',     label: '坐骑', emoji: '🐴' },
];

const FILTER_TABS = [
  { id: 'all',       label: '全部' },
  { id: 'weapon',    label: '⚔️ 武器' },
  { id: 'armor',     label: '🛡️ 防具' },
  { id: 'accessory', label: '💎 法宝' },
];

export function EquipmentPanel() {
  const inventory = useGameStore(s => s.inventory);
  const equipped = useGameStore(s => s.equipped);
  const [filter, setFilter] = useState('all');

  const filtered = filter === 'all'
    ? inventory
    : inventory.filter(i => i.templateId.includes(filter)); // 简化过滤

  // 按品质降序排列
  const sorted = [...filtered].sort((a, b) => b.quality - a.quality);

  return (
    <div className={styles.root}>
      {/* 标题 */}
      <div className={styles.header}>
        <span className={styles.title}>📦 背包</span>
        <span className={styles.count}>{inventory.length}/50</span>
      </div>

      {/* 已装备槽 */}
      <div className={styles.equippedGrid}>
        {SLOT_CONFIG.map(slot => {
          const item = equipped[slot.key];
          return (
            <div
              key={slot.key}
              className={styles.slotCard}
              data-filled={!!item}
              style={item ? { borderColor: QUALITY_COLORS[item.quality] } : {}}
            >
              <span className={styles.slotEmoji}>{item ? '⚡' : slot.emoji}</span>
              {item ? (
                <span className={styles.slotName} style={{ color: QUALITY_COLORS[item.quality] }}>
                  {item.name}
                </span>
              ) : (
                <span className={styles.slotEmpty}>{slot.label}</span>
              )}
            </div>
          );
        })}
      </div>

      {/* 分类过滤 */}
      <Tab items={FILTER_TABS} activeId={filter} onChange={setFilter} />

      {/* 背包列表 */}
      <div className={styles.itemList}>
        {sorted.map(item => (
          <div
            key={item.id}
            className={styles.itemRow}
            style={{ borderLeftColor: QUALITY_COLORS[item.quality] }}
          >
            <span className={styles.itemEmoji}>⚔️</span>
            <div className={styles.itemInfo}>
              <div className={styles.itemName} style={{ color: QUALITY_COLORS[item.quality] }}>
                {QUALITY_NAMES[item.quality] ? `[${QUALITY_NAMES[item.quality]}]` : ''} {item.name}
              </div>
              <div className={styles.itemStat}>
                ⚡{item.attack} 🛡️{item.defense}
              </div>
            </div>
            {item.level > 0 && (
              <span className={styles.itemLevel}>+{item.level}</span>
            )}
          </div>
        ))}
        {sorted.length === 0 && (
          <div className={styles.empty}>📦 暂无装备，去战斗获取吧！</div>
        )}
      </div>
    </div>
  );
}
