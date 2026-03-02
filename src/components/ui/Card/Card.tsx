import { ReactNode, CSSProperties } from 'react';
import styles from './Card.module.css';

interface CardProps {
  title?: string;
  qualityColor?: string;   // 品质边框色
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  onClick?: () => void;
}

/**
 * 通用卡片容器
 *
 * @example
 * <Card title="⚔️ 装备">内容</Card>
 * <Card qualityColor="var(--q-divine)">紫色边框卡片</Card>
 */
export function Card({ title, qualityColor, children, className = '', style, onClick }: CardProps) {
  const borderStyle = qualityColor ? { borderColor: qualityColor, borderWidth: 2 } : {};
  return (
    <div
      className={[styles.card, onClick ? styles.clickable : '', className].filter(Boolean).join(' ')}
      style={{ ...borderStyle, ...style }}
      onClick={onClick}
    >
      {title && <div className={styles.title}>{title}</div>}
      <div className={styles.body}>{children}</div>
    </div>
  );
}
