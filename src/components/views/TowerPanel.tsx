/**
 * TowerPanel — 通天塔界面
 */
import { useTowerStore } from '../../store/tower';
import { TOWER_DAILY_LIMIT } from '../../engine/tower';

export function TowerPanel() {
  const state = useTowerStore(s => s.state);
  const challenge = useTowerStore(s => s.challenge);
  const sweep = useTowerStore(s => s.sweep);
  const remaining = TOWER_DAILY_LIMIT - state.dailyAttempts;

  return (
    <div style={{ padding: 16, height: '100%', overflow: 'auto' }}>
      <h2>🗼 通天塔</h2>

      <div style={{
        background: 'var(--color-bg-elevated)', borderRadius: 12, padding: 16, marginBottom: 12,
        border: '1px solid var(--color-accent)', textAlign: 'center',
      }}>
        <div style={{ fontSize: 48, marginBottom: 8 }}>🗼</div>
        <div style={{ fontSize: 20, fontWeight: 'bold' }}>第 {state.currentFloor} 层</div>
        <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 4 }}>
          最高记录: {state.highestFloor} 层 · 今日剩余: {remaining}/{TOWER_DAILY_LIMIT}
        </div>
        {state.currentFloor % 10 === 0 && (
          <div style={{ fontSize: 11, color: '#e74c3c', marginTop: 4 }}>⚠️ Boss层!</div>
        )}
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <button disabled={remaining <= 0} style={{
          flex: 1, padding: '12px', border: 'none', borderRadius: 10,
          background: remaining > 0 ? 'var(--color-primary)' : 'var(--color-bg-muted)',
          color: '#fff', fontSize: 14, fontWeight: 'bold', cursor: remaining > 0 ? 'pointer' : 'not-allowed',
        }} onClick={challenge}>
          ⚔️ 挑战
        </button>
        <button disabled={state.highestFloor <= 0} style={{
          flex: 1, padding: '12px', border: 'none', borderRadius: 10,
          background: state.highestFloor > 0 ? '#27ae60' : 'var(--color-bg-muted)',
          color: '#fff', fontSize: 14, fontWeight: 'bold', cursor: state.highestFloor > 0 ? 'pointer' : 'not-allowed',
        }} onClick={sweep}>
          🧹 扫荡 ({state.highestFloor}层)
        </button>
      </div>

      <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
        <div style={{ fontWeight: 'bold', marginBottom: 4 }}>📜 规则</div>
        <div>• 每层敌人逐渐变强 (×1.08/层)</div>
        <div>• 每5层精英怪，每10层Boss</div>
        <div>• Boss层奖励星辰石+灵石</div>
        <div>• 每日{TOWER_DAILY_LIMIT}次挑战，扫荡不限</div>
      </div>
    </div>
  );
}
