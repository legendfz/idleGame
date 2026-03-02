import React from 'react';
import styles from './Panel.module.css';

export interface PanelProps {
  title?: string;
  accent?: boolean;        // 金色强调边框
  children: React.ReactNode;
  className?: string;
}

/**
 * 面板容器 — 用于角色面板、装备面板等大区块
 *
 * @example
 * <Panel title="🐒 角色信息" accent>
 *   <div>Lv.15 练气九层</div>
 * </Panel>
 */
export function Panel({ title, accent = false, children, className }: PanelProps) {
  return (
    <div className={[styles.panel, accent && styles.accent, className].filter(Boolean).join(' ')}>
      {title && <h3 className={styles.title}>{title}</h3>}
      <div className={styles.body}>{children}</div>
    </div>
  );
}
