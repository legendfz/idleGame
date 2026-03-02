/**
 * CultivationPanel — 修炼面板（嵌入 IdleView 使用）
 */
import { usePlayerStore } from '../../store/player';
import { useIdleCalc } from '../../hooks/useIdleCalc';
import { formatBigNum, bn } from '../../engine/bignum';
import { xiuweiRequired } from '../../engine/formulas';

export function CultivationPanel() {
  const player = usePlayerStore(s => s.player);
  const xpsDisplay = usePlayerStore(s => s.xpsDisplay);
  const { cost, canBreak, realm } = useIdleCalc();

  const progress = bn(player.xiuwei).div(cost).toNumber();

  return (
    <div className="cultivation-panel">
      <div className="cultivation-info">
        <div>境界: {realm?.name ?? '?'} {player.realmLevel}层</div>
        <div>修为: {formatBigNum(bn(player.xiuwei))} / {formatBigNum(cost)}</div>
        <div>速度: {xpsDisplay}</div>
      </div>
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${Math.min(100, progress * 100)}%` }} />
      </div>
    </div>
  );
}
