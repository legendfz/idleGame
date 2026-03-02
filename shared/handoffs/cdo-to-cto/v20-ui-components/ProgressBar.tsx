import React from 'react';
import styles from './ProgressBar.module.css';

export interface ProgressBarProps {
  value: number;
  max: number;
  label?: string;             // 左侧标签，如 "❤️" "✨"
  showText?: boolean;         // 显示 "value/max" 文字
  showPercent?: boolean;
  height?: number;            // px，默认 16
  color?: string;             // 自定义填充色
  gradient?: boolean;         // 根据百分比渐变（绿→黄→红）
  animated?: boolean;         // 填充过渡动画，默认 true
  className?: string;
}

/**
 * 进度条 — HP 条、经验条、精炼进度等
 *
 * @example
 * <ProgressBar value={3200} max={5000} label="✨" showText gradient />
 * <ProgressBar value={hp} max={maxHp} label="❤️" gradient height={20} showText />
 * <ProgressBar value={80} max={100} showPercent color="#D4A843" />
 */
export function ProgressBar({
  value,
  max,
  label,
  showText = false,
  showPercent = false,
  height = 16,
  color,
  gradient = false,
  animated = true,
  className,
}: ProgressBarProps) {
  const pct = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;

  let fillColor = color || 'var(--color-success)';
  if (gradient) {
    if (pct > 50) fillColor = 'var(--color-success)';
    else if (pct > 20) fillColor = 'var(--color-warning)';
    else fillColor = 'var(--color-primary)';
  }

  return (
    <div className={[styles.wrapper, className].filter(Boolean).join(' ')}>
      {label && <span className={styles.label}>{label}</span>}
      <div className={styles.track} style={{ height }}>
        <div
          className={[styles.fill, animated && styles.animated].filter(Boolean).join(' ')}
          style={{ width: `${pct}%`, background: fillColor }}
        />
        {showText && (
          <span className={styles.text}>
            {value.toLocaleString()} / {max.toLocaleString()}
          </span>
        )}
        {showPercent && !showText && (
          <span className={styles.text}>{Math.round(pct)}%</span>
        )}
      </div>
    </div>
  );
}
