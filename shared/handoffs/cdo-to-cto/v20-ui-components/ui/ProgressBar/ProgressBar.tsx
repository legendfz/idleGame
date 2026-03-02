import { CSSProperties } from 'react';
import styles from './ProgressBar.module.css';

interface ProgressBarProps {
  value: number;
  max: number;
  label?: string;
  icon?: string;
  showText?: boolean;
  height?: number;
  color?: string;              // 自定义填充色
  gradientColors?: [string, string]; // 渐变 [from, to]
  animate?: boolean;
  className?: string;
}

/**
 * 进度条
 *
 * @example
 * <ProgressBar value={hp} max={maxHp} icon="❤️" showText color="var(--color-success)" />
 * <ProgressBar value={exp} max={nextLevel} gradientColors={['#D4A843','#C13B3B']} animate />
 */
export function ProgressBar({
  value, max, label, icon, showText = false,
  height = 16, color, gradientColors, animate = true, className = '',
}: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));

  const fillStyle: CSSProperties = {
    width: `${pct}%`,
    height,
    ...(gradientColors
      ? { background: `linear-gradient(90deg, ${gradientColors[0]}, ${gradientColors[1]})` }
      : color ? { background: color } : {}),
    transition: animate ? `width var(--dur-norm) var(--ease-out)` : 'none',
  };

  return (
    <div className={[styles.wrapper, className].filter(Boolean).join(' ')}>
      {(icon || label) && (
        <div className={styles.labelRow}>
          {icon && <span className={styles.icon}>{icon}</span>}
          {label && <span className={styles.label}>{label}</span>}
        </div>
      )}
      <div className={styles.track} style={{ height }}>
        <div className={styles.fill} style={fillStyle} />
        {showText && (
          <span className={styles.text}>
            {value.toLocaleString()} / {max.toLocaleString()}
          </span>
        )}
      </div>
    </div>
  );
}
