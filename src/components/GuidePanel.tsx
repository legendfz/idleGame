import React, { useState } from 'react';
import { GUIDE_ENTRIES } from '../data/guide';
import { useGameStore } from '../store/gameStore';

export const GuidePanel: React.FC = () => {
  const level = useGameStore(s => s.player.level);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const unlocked = GUIDE_ENTRIES.filter(e => level >= e.unlockLevel);
  const locked = GUIDE_ENTRIES.filter(e => level < e.unlockLevel);

  return (
    <div style={{ padding: '12px' }}>
      <h3 style={{ textAlign: 'center', color: '#fbbf24', margin: '0 0 12px' }}>📖 仙途百科</h3>
      <p style={{ textAlign: 'center', color: '#9ca3af', fontSize: '12px', margin: '0 0 16px' }}>
        点击展开查看详细说明（已解锁 {unlocked.length}/{GUIDE_ENTRIES.length}）
      </p>

      {unlocked.map(entry => (
        <div key={entry.id} onClick={() => setExpandedId(expandedId === entry.id ? null : entry.id)}
          style={{
            background: expandedId === entry.id ? 'rgba(251,191,36,0.1)' : 'rgba(255,255,255,0.05)',
            borderRadius: '8px', padding: '10px 12px', marginBottom: '8px', cursor: 'pointer',
            border: expandedId === entry.id ? '1px solid rgba(251,191,36,0.3)' : '1px solid rgba(255,255,255,0.1)',
            transition: 'all 0.2s',
          }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '14px', fontWeight: 600 }}>
              {entry.icon} {entry.title}
            </span>
            <span style={{ color: '#9ca3af', fontSize: '12px' }}>
              {expandedId === entry.id ? '▲' : '▼'}
            </span>
          </div>
          {expandedId === entry.id && (
            <p style={{ color: '#d1d5db', fontSize: '13px', lineHeight: 1.6, margin: '8px 0 0', whiteSpace: 'pre-wrap' }}>
              {entry.content}
            </p>
          )}
        </div>
      ))}

      {locked.length > 0 && (
        <>
          <div style={{ color: '#6b7280', fontSize: '12px', margin: '16px 0 8px', textAlign: 'center' }}>
            🔒 未解锁（{locked.length}项）
          </div>
          {locked.map(entry => (
            <div key={entry.id} style={{
              background: 'rgba(255,255,255,0.02)', borderRadius: '8px', padding: '10px 12px',
              marginBottom: '6px', border: '1px solid rgba(255,255,255,0.05)', opacity: 0.5,
            }}>
              <span style={{ fontSize: '14px' }}>🔒 {entry.title}</span>
              <span style={{ color: '#6b7280', fontSize: '11px', marginLeft: '8px' }}>Lv.{entry.unlockLevel} 解锁</span>
            </div>
          ))}
        </>
      )}
    </div>
  );
};
