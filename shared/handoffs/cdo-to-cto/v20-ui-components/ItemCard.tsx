import React from 'react';
import styles from './ItemCard.module.css';
import { Quality, QUALITY_CONFIG, QualityBadge } from './QualityBadge';

export interface ItemCardProps {
  name: string;
  emoji: string;
  quality: Quality;
  level?: number;           // 强化等级
  mainStat?: string;        // "⚡+3,200"
  passive?: string;         // "暴伤+50%"
  equipped?: boolean;
  isNew?: boolean;
  onClick?: () => void;
  className?: string;
}

/**
 * 装备卡片 — 背包列表行
 *
 * @example
 * <ItemCard
 *   name="如意金箍棒"
 *   emoji="🏮"
 *   quality="divine"
 *   level={12}
 *   mainStat="⚡+3,200"
 *   passive="暴伤+50%"
 *   equipped
 * />
 */
export function ItemCard({
  name, emoji, quality, level, mainStat, passive,
  equipped, isNew, onClick, className,
}: ItemCardProps) {
  const cfg = QUALITY_CONFIG[quality];

  return (
    <div
      className={[styles.item, onClick && styles.clickable, className].filter(Boolean).join(' ')}
      style={{ borderLeftColor: cfg.color }}
      onClick={onClick}
    >
      {/* 左：图标 */}
      <span className={styles.emoji}>{emoji}</span>

      {/* 中：信息 */}
      <div className={styles.info}>
        <div className={styles.nameRow}>
          <span className={styles.name} style={{ color: cfg.color }}>
            {cfg.prefix}{name}
          </span>
          {level != null && level > 0 && (
            <span className={styles.level}>+{level}</span>
          )}
          {isNew && <span className={styles.newTag}>🆕</span>}
        </div>
        <div className={styles.statsRow}>
          {mainStat && <span className={styles.stat}>{mainStat}</span>}
          {passive && <span className={styles.passive}>{passive}</span>}
        </div>
      </div>

      {/* 右：标签 */}
      <div className={styles.tags}>
        {equipped && <span className={styles.equippedTag}>装备中</span>}
        <QualityBadge quality={quality} showLabel={false} size="sm" />
      </div>
    </div>
  );
}
