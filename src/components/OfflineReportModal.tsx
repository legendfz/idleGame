import { useGameStore } from '../store/gameStore';
import { formatNumber, formatDuration } from '../utils/format';
import { Card } from './shared/Card';

export function OfflineReportModal() {
  const report = useGameStore(s => s.offlineReport);
  const dismiss = useGameStore(s => s.dismissOfflineReport);
  if (!report) return null;

  const maxShow = 10;
  const equipList = report.equipment || [];
  const showEquip = equipList.slice(0, maxShow);
  const hiddenCount = equipList.length - maxShow;

  return (
    <div className="modal-overlay" onClick={dismiss}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxHeight: '70vh', display: 'flex', flexDirection: 'column' }}>
        <button onClick={dismiss} style={{ alignSelf: 'flex-end', marginBottom: 8, minWidth: 80 }}>领取</button>
        <h2 className="color-accent">离线修炼报告</h2>
        <div className="color-dim">离线时长：{formatDuration(report.duration)}</div>
        {(report as any).comebackMul > 1 && (
          <div style={{ color: '#fbbf24', fontWeight: 'bold', fontSize: 14, margin: '4px 0', textAlign: 'center' }}>
            🎉 回归加成 ×{(report as any).comebackMul} {(report as any).comebackMul >= 2 ? '（离线8h+）' : '（离线4h+）'}
          </div>
        )}
        <Card className="offline-detail" style={{ overflow: 'auto', flex: 1 }}>
          <div className="stat-row"><span className="stat-label">击败怪物</span><span>{formatNumber(report.kills)} 只</span></div>
          {report.stagesCleared > 0 && <div className="stat-row"><span className="stat-label">通关关卡</span><span>{report.stagesCleared} 关</span></div>}
          <div style={{ borderTop: '1px solid var(--border)', margin: '8px 0', paddingTop: 8 }}>
            <div className="stat-row"><span className="stat-label">灵石</span><span className="color-gold">+{formatNumber(report.lingshi)}</span></div>
            <div className="stat-row"><span className="stat-label">经验</span><span className="color-exp">+{formatNumber(report.exp)}</span></div>
            {report.pantao > 0 && <div className="stat-row"><span className="stat-label">蟠桃</span><span className="color-pantao">+{report.pantao}</span></div>}
            {report.levelsGained > 0 && <div className="stat-row"><span className="stat-label">升级</span><span className="color-level">x{report.levelsGained}</span></div>}
          </div>
          {showEquip.length > 0 && (
            <div style={{ borderTop: '1px solid var(--border)', margin: '8px 0', paddingTop: 8 }}>
              <div className="color-dim" style={{ marginBottom: 4 }}>获得装备：</div>
              {showEquip.map((name, i) => (
                <div key={i} className="color-drop" style={{ paddingLeft: 12 }}>{name}</div>
              ))}
              {hiddenCount > 0 && (
                <div className="color-dim" style={{ paddingLeft: 12, marginTop: 4 }}>...及其他 {hiddenCount} 件装备</div>
              )}
            </div>
          )}
        </Card>
        <button onClick={dismiss} style={{ marginTop: 8, minWidth: 80 }}>领取</button>
      </div>
    </div>
  );
}
