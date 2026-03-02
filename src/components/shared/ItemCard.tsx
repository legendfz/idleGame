/** 装备卡片 */
import { QualityBadge } from './QualityBadge';

interface ItemCardProps {
  name: string;
  quality: number;
  level: number;
  onClick?: () => void;
}

export function ItemCard({ name, quality, level, onClick }: ItemCardProps) {
  return (
    <div onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default' }}>
      <QualityBadge quality={quality} />
      <span> {name} +{level}</span>
    </div>
  );
}
