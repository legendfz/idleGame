/**
 * EventPanel — 活动界面
 */
import { useEventStore } from '../../store/event';
import { useState, useEffect } from 'react';

const TYPE_LABELS: Record<string, string> = {
  cultivationBoost: '修炼加速', bossRush: '猎魔盛宴', gatherFest: '灵材丰收',
};

export function EventPanel() {
  const eventState = useEventStore(s => s.state);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const event = eventState.current;
  const active = event && now < event.endTime;

  return (
    <div style={{ padding: 16, height: '100%', overflow: 'auto' }}>
      <h2>🎉 限时活动</h2>

      {active && event ? (
        <div style={{
          background: 'rgba(255,165,0,0.1)', border: '1px solid var(--color-accent)',
          borderRadius: 12, padding: 16, marginBottom: 16,
        }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 36 }}>{event.icon}</span>
            <div>
              <div style={{ fontWeight: 'bold', fontSize: 16 }}>{event.name}</div>
              <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{TYPE_LABELS[event.type]}</div>
            </div>
          </div>
          <div style={{ fontSize: 13, marginBottom: 8 }}>{event.desc}</div>
          <div style={{ fontSize: 13, color: 'var(--color-accent)' }}>
            加成倍率: ×{event.multiplier}
          </div>
          <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 8 }}>
            ⏰ 剩余: {formatTime(event.endTime - now)}
          </div>
          <div style={{
            marginTop: 8, height: 4, background: 'var(--color-bg-muted)', borderRadius: 2,
          }}>
            <div style={{
              height: '100%', borderRadius: 2, background: 'var(--color-accent)',
              width: `${Math.max(0, (event.endTime - now) / (event.endTime - event.startTime) * 100)}%`,
              transition: 'width 1s linear',
            }} />
          </div>
        </div>
      ) : (
        <div style={{
          textAlign: 'center', padding: 40, color: 'var(--color-text-muted)', fontSize: 14,
        }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🌙</div>
          暂无进行中的活动
          <div style={{ fontSize: 11, marginTop: 8 }}>活动会随机开启，敬请期待</div>
        </div>
      )}

      <h3 style={{ fontSize: 14, marginBottom: 8 }}>📜 历史活动</h3>
      {eventState.history.length === 0 ? (
        <div style={{ color: 'var(--color-text-muted)', fontSize: 12 }}>暂无历史记录</div>
      ) : (
        <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
          已参与 {eventState.history.length} 次活动
        </div>
      )}
    </div>
  );
}

function formatTime(ms: number): string {
  if (ms <= 0) return '已结束';
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}
