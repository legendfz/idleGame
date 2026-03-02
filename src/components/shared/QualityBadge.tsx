/** 品质标签 */
const QUALITY_COLORS = ['#9E9E9E', '#4CAF50', '#2196F3', '#9C27B0', '#FF9800', '#FFD700'];
const QUALITY_NAMES = ['凡品', '灵品', '仙品', '神品', '混沌', '鸿蒙'];

interface QualityBadgeProps { quality: number; }

export function QualityBadge({ quality }: QualityBadgeProps) {
  return (
    <span style={{ color: QUALITY_COLORS[quality] || '#9E9E9E' }}>
      {QUALITY_NAMES[quality] || '未知'}
    </span>
  );
}
