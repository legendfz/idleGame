interface Props {
  value: number; // 0-1
  color?: string;
  height?: number;
}

export default function ProgressBar({ value, color = 'var(--v2-red)', height = 8 }: Props) {
  return (
    <div className="v2-progress-bg" style={{ height }}>
      <div className="v2-progress-fill" style={{ width: `${Math.max(0, Math.min(100, value * 100))}%`, background: color }} />
    </div>
  );
}
