import React from 'react';
import styles from './Card.module.css';

export interface CardProps {
  title?: string;
  qualityColor?: string;  // 品质色覆盖左边框
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

/**
 * 通用卡片容器
 *
 * @example
 * <Card title="⚔️ 装备">内容</Card>
 * <Card qualityColor="#9C27B0">紫色边框卡片</Card>
 * <Card onClick={() => console.log('tap')}>可点击卡片</Card>
 */
export function Card({ title, qualityColor, children, className, onClick }: CardProps) {
  return (
    <div
      className={[styles.card, onClick && styles.clickable, className].filter(Boolean).join(' ')}
      style={qualityColor ? { borderLeftColor: qualityColor, borderLeftWidth: 3 } : undefined}
      onClick={onClick}
    >
      {title && <div className={styles.title}>{title}</div>}
      {children}
    </div>
  );
}
