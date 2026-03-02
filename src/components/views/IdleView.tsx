/**
 * IdleView — 修炼主界面（完整集成版）
 */
import { usePlayerStore } from '../../store/player';
import { useUIStore } from '../../store/ui';
import { useIdleCalc } from '../../hooks/useIdleCalc';
import { formatBigNum, bn } from '../../engine/bignum';
import { getRealmConfig, getRealmByOrder } from '../../data/config';

const LEVEL_NAMES = ['', '一', '二', '三', '四', '五', '六', '七', '八', '九'];

export function IdleView() {
  const player = usePlayerStore(s => s.player);
  const xpsDisplay = usePlayerStore(s => s.xpsDisplay);
  const breakthrough = usePlayerStore(s => s.breakthrough);
  const addToast = useUIStore(s => s.addToast);
  const { cost, canBreak, realm } = useIdleCalc();

  const xiuwei = bn(player.xiuwei);
  const progress = xiuwei.div(cost).toNumber();
  const nextRealm = player.realmLevel >= 9
    ? getRealmByOrder((realm?.order ?? 1) + 1)
    : null;

  const handleBreakthrough = () => {
    const result = breakthrough();
    if (result.success) {
      addToast(result.message, 'success');
      if (result.unlockMessage) {
        addToast(`🔓 ${result.unlockMessage}`, 'info');
      }
    } else {
      addToast(result.message, 'warn');
    }
  };

  // 点击加速修炼
  const handleClick = () => {
    const clickXiuwei = bn(10).mul(realm?.multiplier ?? 1);
    usePlayerStore.getState().addXiuwei(clickXiuwei);
    usePlayerStore.getState().incrementClicks();
  };

  return (
    <div className="view-idle">
      <div className="realm-display">
        <h2>{realm?.name ?? '凡人'}·{LEVEL_NAMES[player.realmLevel]}层</h2>
        <div className="realm-mult">修炼倍率 ×{realm?.multiplier ?? 1}</div>
      </div>

      <div className="xiuwei-section">
        <div className="xiuwei-value">{formatBigNum(xiuwei)}</div>
        <div className="xiuwei-speed">{xpsDisplay}</div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${Math.min(100, progress * 100)}%` }} />
        </div>
        <div className="xiuwei-target">
          突破需要: {formatBigNum(cost)}
          {nextRealm && player.realmLevel >= 9 && (
            <span className="next-realm"> → {nextRealm.name}</span>
          )}
        </div>
      </div>

      <div className="click-cultivate" onClick={handleClick}>
        <span className="click-icon-large">🧘</span>
        <span>点击修炼</span>
      </div>

      <button
        className={`btn-breakthrough ${canBreak ? 'can-break' : ''}`}
        disabled={!canBreak}
        onClick={handleBreakthrough}
      >
        {canBreak ? '💫 突破！' : '⏳ 修炼中...'}
      </button>

      <div className="stats-footer">
        <span>总修为: {formatBigNum(bn(player.totalXiuwei))}</span>
        <span>在线: {Math.floor(player.playTime / 60)}分钟</span>
        <span>点击: {player.totalClicks}</span>
      </div>
    </div>
  );
}
