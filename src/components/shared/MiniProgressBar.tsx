/**
 * Shared MiniProgressBar component per CDO COMPONENT-GUIDE-V1.3
 */

interface MiniProgressBarProps {
  current: number;
  max: number;
  color?: string;
  height?: number;
  showText?: boolean;
}

export default function MiniProgressBar({ current, max, color, height = 6, showText }: MiniProgressBarProps) {
  const pct = Math.min(100, Math.round((current / max) * 100));
  return (
    <div className="mini-progress">
      <div className="mini-progress-bg" style={{ height }}>
        <div
          className="mini-progress-fill"
          style={{ width: `${pct}%`, background: color || 'var(--green)' }}
        />
      </div>
      {showText && (
        <span className="mini-progress-text">{current}/{max}</span>
      )}
    </div>
  );
}
