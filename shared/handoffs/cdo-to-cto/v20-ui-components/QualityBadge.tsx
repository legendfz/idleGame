import React from 'react';
import styles from './QualityBadge.module.css';

export type Quality = 'common' | 'spirit' | 'immortal' | 'divine' | 'chaos' | 'hongmeng';

export const QUALITY_CONFIG: Record<Quality, { label: string; prefix: string; color: string }> = {
  common:   { label: '凡品', prefix: '○', color: '#9E9E9E' },
  spirit:   { label: '灵品', prefix: '●', color: '#4CAF50' },
  immortal: { label: '仙品', prefix: '◆', color: '#2196F3' },
  divine:   { label: '神品', prefix: '★', color: '#9C27B0' },
  chaos:    { label: '混沌', prefix: '✦', color: '#FF9800' },
  hongmeng: { label: '鸿蒙', prefix: '✧', color: '#FFD700' },
};

export interface QualityBadgeProps {
  quality: Quality;
  showLabel?: boolean;   // 显示 "灵品" 文字，默认 true
  showPrefix?: boolean;  // 显示 "●" 前缀，默认 true
  size?: 'sm' | 'md';
  className?: string;
}

/**
 * 品质标签
 *
 * @example
 * <QualityBadge quality="divine" />           // ★ 神品
 * <QualityBadge quality="hongmeng" size="sm" /> // 小号鸿蒙标签
 * <QualityBadge quality="chaos" showPrefix={false} /> // 仅文字
 */
export function QualityBadge({
  quality,
  showLabel = true,
  showPrefix = true,
  size = 'md',
  className,
}: QualityBadgeProps) {
  const cfg = QUALITY_CONFIG[quality];

  return (
    <span
      className={[styles.badge, styles[size], styles[quality], className].filter(Boolean).join(' ')}
      style={{ '--q-color': cfg.color } as React.CSSProperties}
    >
      {showPrefix && <span className={styles.prefix}>{cfg.prefix}</span>}
      {showLabel && cfg.label}
    </span>
  );
}
