// v177.0 仙途秘典 — Cultivation Handbook Panel
import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { HANDBOOK_ENTRIES } from '../data/handbook';

export function HandbookPanel({ onClose }: { onClose: () => void }) {
  const level = useGameStore(s => s.player.level);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const unlocked = HANDBOOK_ENTRIES.filter(e => level >= e.unlockLevel);
  const locked = HANDBOOK_ENTRIES.filter(e => level < e.unlockLevel);

  return (
    <div style={{ padding: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#aaa', fontSize: 20, cursor: 'pointer', marginRight: 8 }}>←</button>
        <h2 style={{ margin: 0, color: '#e8d5a3' }}>📖 仙途秘典</h2>
        <span style={{ marginLeft: 'auto', color: '#888', fontSize: 12 }}>{unlocked.length}/{HANDBOOK_ENTRIES.length} 已解锁</span>
      </div>

      {unlocked.map(entry => (
        <div
          key={entry.id}
          onClick={() => setExpandedId(expandedId === entry.id ? null : entry.id)}
          style={{
            background: expandedId === entry.id ? 'rgba(232,213,163,0.1)' : 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(232,213,163,0.2)',
            borderRadius: 8,
            padding: '10px 14px',
            marginBottom: 8,
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 18 }}>{entry.emoji}</span>
            <span style={{ color: '#e8d5a3', fontWeight: 600 }}>{entry.title}</span>
            <span style={{ marginLeft: 'auto', color: '#666', fontSize: 12 }}>
              {expandedId === entry.id ? '▲' : '▼'}
            </span>
          </div>
          {expandedId === entry.id && (
            <p style={{ color: '#ccc', fontSize: 13, lineHeight: 1.6, margin: '8px 0 0 26px' }}>
              {entry.content}
            </p>
          )}
        </div>
      ))}

      {locked.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <div style={{ color: '#666', fontSize: 12, marginBottom: 8 }}>🔒 未解锁 ({locked.length})</div>
          {locked.map(entry => (
            <div
              key={entry.id}
              style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.05)',
                borderRadius: 8,
                padding: '8px 14px',
                marginBottom: 6,
                opacity: 0.5,
              }}
            >
              <span style={{ fontSize: 16 }}>🔒</span>
              <span style={{ color: '#888', marginLeft: 8 }}>Lv.{entry.unlockLevel} 解锁</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
