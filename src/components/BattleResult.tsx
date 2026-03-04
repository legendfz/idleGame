/**
 * 战斗结算弹窗
 */

import { formatNumber } from '../utils/format';

interface BattleReward {
  icon: string;
  name: string;
  amount: number;
}

interface BattleResultProps {
  dungeonName: string;
  clearTime: number;
  isFirstClear: boolean;
  rewards: BattleReward[];
  remainAttempts: number;
  onConfirm: () => void;
  onRetry?: () => void;
}

export default function BattleResult({
  dungeonName, clearTime, isFirstClear,
  rewards, remainAttempts, onConfirm, onRetry
}: BattleResultProps) {
  return (
    <div className="modal-overlay">
      <div className={`modal-content battle-result ${isFirstClear ? 'first-clear' : ''}`}>
        <h2 className="result-title">★ 副本通关！</h2>
        <div className="result-dungeon">{dungeonName} · {Math.floor(clearTime)}秒</div>

        {isFirstClear && (
          <div className="result-record" style={{ color: 'var(--accent)' }}>
            ◆ 首次通关！额外奖励！
          </div>
        )}

        <div className="result-divider">── 奖励 ──</div>
        <div className="result-rewards">
          {rewards.map((r, i) => (
            <div
              key={i}
              className="result-reward-row"
              style={{ animationDelay: `${300 + i * 200}ms` }}
            >
              <span>{r.icon}</span>
              <span>{r.name}</span>
              <span>x{formatNumber(r.amount)}</span>
            </div>
          ))}
        </div>

        <div className="result-actions">
          <button className="btn-primary" onClick={onConfirm}>确认</button>
          {onRetry && remainAttempts > 0 && (
            <button className="btn-secondary" onClick={onRetry}>
              再次挑战 ({remainAttempts}次)
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
