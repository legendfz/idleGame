/**
 * v82.0 TitlePanel — 称号面板
 * Display all titles, unlock status, equip/unequip, bonus preview
 */
import React from 'react';
import { useGameStore } from '../store/gameStore';
import { TITLES, type Title } from '../data/titles';
import { formatNumber } from '../utils/format';

function BonusTag({ label, value }: { label: string; value: string }) {
  return (
    <span style={{
      display: 'inline-block', padding: '2px 6px', margin: '2px 3px',
      background: 'rgba(255,215,0,0.1)', borderRadius: 4, fontSize: 11,
      color: '#ffd700', border: '1px solid rgba(255,215,0,0.2)'
    }}>
      {label} {value}
    </span>
  );
}

function formatBonus(b: Title['bonuses']): React.ReactElement[] {
  const tags: React.ReactElement[] = [];
  if (b.attack) tags.push(<BonusTag key="atk" label="⚔️攻击" value={`+${(b.attack * 100).toFixed(0)}%`} />);
  if (b.maxHp) tags.push(<BonusTag key="hp" label="❤️生命" value={`+${(b.maxHp * 100).toFixed(0)}%`} />);
  if (b.critRate) tags.push(<BonusTag key="cr" label="💥暴击率" value={`+${b.critRate}%`} />);
  if (b.critDmg) tags.push(<BonusTag key="cd" label="🔥暴伤" value={`+${(b.critDmg * 100).toFixed(0)}%`} />);
  if (b.expMul) tags.push(<BonusTag key="exp" label="📖经验" value={`+${(b.expMul * 100).toFixed(0)}%`} />);
  if (b.goldMul) tags.push(<BonusTag key="gold" label="💰灵石" value={`+${(b.goldMul * 100).toFixed(0)}%`} />);
  return tags;
}

export function TitlePanel() {
  const unlockedTitles = useGameStore(s => s.unlockedTitles);
  const equippedTitle = useGameStore(s => s.equippedTitle);
  const setEquippedTitle = useGameStore(s => s.setEquippedTitle);
  const unlocked = new Set(unlockedTitles);

  const equipped = TITLES.find(t => t.id === equippedTitle);

  return (
    <div style={{ padding: '0 0 20px' }}>
      {/* Current equipped */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(255,215,0,0.1), rgba(255,140,0,0.05))',
        borderRadius: 10, padding: 12, marginBottom: 14,
        border: '1px solid rgba(255,215,0,0.2)'
      }}>
        <div style={{ fontSize: 12, color: 'var(--dim)', marginBottom: 4 }}>当前称号</div>
        {equipped ? (
          <div>
            <span style={{ fontSize: 18, fontWeight: 700, color: equipped.color }}>{equipped.name}</span>
            <div style={{ marginTop: 6 }}>{formatBonus(equipped.bonuses)}</div>
            <button
              onClick={() => setEquippedTitle(null)}
              style={{
                marginTop: 8, padding: '4px 12px', fontSize: 12,
                background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)',
                borderRadius: 6, color: 'var(--dim)', cursor: 'pointer'
              }}
            >卸下称号</button>
          </div>
        ) : (
          <span style={{ color: 'var(--dim)', fontSize: 14 }}>未装备称号</span>
        )}
      </div>

      {/* Progress */}
      <div style={{ fontSize: 12, color: 'var(--dim)', marginBottom: 10 }}>
        已解锁 <span style={{ color: '#ffd700', fontWeight: 700 }}>{unlockedTitles.length}</span> / {TITLES.length} 称号
      </div>

      {/* Title list */}
      {TITLES.map(title => {
        const isUnlocked = unlocked.has(title.id);
        const isEquipped = equippedTitle === title.id;

        return (
          <div key={title.id} style={{
            background: isEquipped
              ? 'linear-gradient(135deg, rgba(255,215,0,0.15), rgba(255,140,0,0.08))'
              : isUnlocked
                ? 'var(--bg-card)'
                : 'rgba(255,255,255,0.02)',
            borderRadius: 8, padding: 10, marginBottom: 8,
            border: isEquipped
              ? '1px solid rgba(255,215,0,0.4)'
              : isUnlocked
                ? '1px solid var(--border)'
                : '1px solid rgba(255,255,255,0.05)',
            opacity: isUnlocked ? 1 : 0.5,
            cursor: isUnlocked ? 'pointer' : 'default',
            transition: 'all 0.2s'
          }}
            onClick={() => {
              if (!isUnlocked) return;
              setEquippedTitle(isEquipped ? null : title.id);
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{
                  fontWeight: 700, fontSize: 14,
                  color: isUnlocked ? title.color : 'var(--dim)'
                }}>
                  {isEquipped && '👑 '}{title.name}
                </span>
                <div style={{ fontSize: 11, color: 'var(--dim)', marginTop: 2 }}>
                  {title.desc}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                {isEquipped && <span style={{ fontSize: 11, color: '#ffd700' }}>已装备</span>}
                {isUnlocked && !isEquipped && <span style={{ fontSize: 11, color: 'var(--accent)' }}>点击装备</span>}
                {!isUnlocked && <span style={{ fontSize: 11, color: 'var(--dim)' }}>🔒 未解锁</span>}
              </div>
            </div>
            <div style={{ marginTop: 4 }}>{formatBonus(title.bonuses)}</div>
          </div>
        );
      })}
    </div>
  );
}
