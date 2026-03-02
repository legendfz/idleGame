/**
 * OfflineReward — 离线收益弹窗
 */
import { formatBigNum } from '../../engine/bignum';
import Decimal from 'break_infinity.js';

interface Props {
  duration: number;
  xiuwei: Decimal;
  coins: Decimal;
  bonusApplied: boolean;
  onCollect: () => void;
}

export function OfflineReward({ duration, xiuwei, coins, bonusApplied, onCollect }: Props) {
  const hours = Math.floor(duration / 3600);
  const mins = Math.floor((duration % 3600) / 60);

  return (
    <div className="offline-modal">
      <h2>🌙 离线收益</h2>
      <p>离线 {hours > 0 ? `${hours}小时` : ''}{mins}分钟</p>
      <div className="offline-rewards">
        <div>修为 +{formatBigNum(xiuwei)}</div>
        <div>金币 +{formatBigNum(coins)}</div>
        {bonusApplied && <div className="bonus">🎁 回归奖励 +10%！</div>}
      </div>
      <button className="btn-primary" onClick={onCollect}>领取</button>
    </div>
  );
}
