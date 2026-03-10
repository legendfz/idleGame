import { useState } from 'react';
import { CHANGELOG } from '../data/changelog';

export function ChangelogPanel({ onClose }: { onClose: () => void }) {
  const [expandedIdx, setExpandedIdx] = useState<number>(0);

  return (
    <div className="modal-overlay" style={{ zIndex: 15000 }} onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: 420, maxHeight: '80vh', overflow: 'auto' }}
        onClick={e => e.stopPropagation()}>
        <h3 style={{ textAlign: 'center', margin: '0 0 12px', color: '#c084fc' }}>📜 更新日志</h3>
        {CHANGELOG.map((entry, i) => (
          <div key={entry.version} style={{
            marginBottom: 8, padding: '8px 10px', borderRadius: 8,
            background: i === 0 ? 'rgba(192,132,252,0.15)' : 'rgba(255,255,255,0.03)',
            border: i === 0 ? '1px solid rgba(192,132,252,0.3)' : '1px solid rgba(255,255,255,0.05)',
            cursor: 'pointer',
          }} onClick={() => setExpandedIdx(expandedIdx === i ? -1 : i)}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 700, color: i === 0 ? '#c084fc' : '#e2e8f0', fontSize: 13 }}>
                {entry.version} {entry.title} {i === 0 && <span style={{ fontSize: 10, color: '#4ade80' }}>NEW</span>}
              </span>
              <span style={{ fontSize: 10, color: '#94a3b8' }}>{entry.date}</span>
            </div>
            {expandedIdx === i && (
              <ul style={{ margin: '6px 0 0', paddingLeft: 16, fontSize: 12, color: '#94a3b8' }}>
                {entry.highlights.map((h, j) => (
                  <li key={j} style={{ marginBottom: 2 }}>{h}</li>
                ))}
              </ul>
            )}
          </div>
        ))}
        <button className="action-btn" style={{ width: '100%', marginTop: 8 }} onClick={onClose}>关闭</button>
      </div>
    </div>
  );
}
