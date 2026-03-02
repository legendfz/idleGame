/**
 * IdleView — 修炼主界面
 */
import { usePlayerStore } from '../../store/player';
import { useIdleCalc } from '../../hooks/useIdleCalc';
import { formatBigNum, bn } from '../../engine/bignum';

export function IdleView() {
  const player = usePlayerStore(s => s.player);
  const xpsDisplay = usePlayerStore(s => s.xpsDisplay);
  const breakthrough = usePlayerStore(s => s.breakthrough);
  const { cost, canBreak, realm } = useIdleCalc();

  const handleBreakthrough = () => {
    const result = breakthrough();
    // TODO: show toast
  };

  return (
    <div className="view-idle">
      <div className="realm-display">
        <h2>{realm?.name ?? '凡人'}·{['', '一', '二', '三', '四', '五', '六', '七', '八', '九'][player.realmLevel]}层</h2>
        <div className="xps">{xpsDisplay}</div>
      </div>
      <div className="xiuwei-display">
        修为：{formatBigNum(bn(player.xiuwei))}
      </div>
      <div className="breakthrough-info">
        突破需要：{formatBigNum(cost)}
      </div>
      <button
        className="btn-breakthrough"
        disabled={!canBreak}
        onClick={handleBreakthrough}
      >
        突破
      </button>
    </div>
  );
}
