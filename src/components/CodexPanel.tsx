import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { EQUIPMENT_TEMPLATES } from '../data/equipment';
import { CHAPTERS, CHAPTER_ENEMIES, ABYSS_CHAPTER_ID } from '../data/chapters';
import { QUALITY_INFO } from '../types';
import { CODEX_MILESTONES, getCodexBonuses } from '../data/codexPower';

type Tab = 'equip' | 'enemy';

export function CodexPanel() {
  const [tab, setTab] = useState<Tab>('equip');
  const codexEquipIds = useGameStore(s => s.player.codexEquipIds);
  const codexEnemyNames = useGameStore(s => s.player.codexEnemyNames);

  const totalEquip = EQUIPMENT_TEMPLATES.length;
  const collectedEquip = codexEquipIds.length;
  const equipPct = totalEquip > 0 ? Math.round(collectedEquip / totalEquip * 100) : 0;

  // Gather all enemy names from chapters
  const allEnemies: { name: string; emoji: string; chapter: string }[] = [];
  for (const ch of CHAPTERS) {
    const ce = CHAPTER_ENEMIES[ch.id];
    if (!ce) continue;
    for (const m of ce.mobs) allEnemies.push({ name: m.name, emoji: m.emoji, chapter: ch.name });
    allEnemies.push({ name: ce.boss.name, emoji: ce.boss.emoji, chapter: ch.name });
  }
  // Abyss enemies
  const abyssCe = CHAPTER_ENEMIES[ABYSS_CHAPTER_ID];
  if (abyssCe) {
    for (const m of abyssCe.mobs) allEnemies.push({ name: m.name, emoji: m.emoji, chapter: '无尽深渊' });
    allEnemies.push({ name: abyssCe.boss.name, emoji: abyssCe.boss.emoji, chapter: '无尽深渊' });
  }
  const totalEnemy = allEnemies.length;
  const collectedEnemy = codexEnemyNames.length;
  const enemyPct = totalEnemy > 0 ? Math.round(collectedEnemy / totalEnemy * 100) : 0;

  return (
    <div style={{ padding: '12px' }}>
      <h3 style={{ textAlign: 'center', color: '#ffd700', margin: '0 0 8px' }}>📖 图鉴</h3>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 12, justifyContent: 'center' }}>
        {(['equip', 'enemy'] as Tab[]).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: '6px 16px', borderRadius: 6, border: 'none', cursor: 'pointer',
            background: tab === t ? '#ffd700' : '#333', color: tab === t ? '#000' : '#aaa',
            fontWeight: tab === t ? 700 : 400, fontSize: 14,
          }}>
            {t === 'equip' ? `⚔️ 装备 ${collectedEquip}/${totalEquip}` : `👹 妖怪 ${collectedEnemy}/${totalEnemy}`}
          </button>
        ))}
      </div>

      {/* Progress bar */}
      <div style={{ background: '#222', borderRadius: 4, height: 20, marginBottom: 12, overflow: 'hidden', position: 'relative' }}>
        <div style={{
          height: '100%', borderRadius: 4, transition: 'width 0.3s',
          width: `${tab === 'equip' ? equipPct : enemyPct}%`,
          background: tab === 'equip' ? 'linear-gradient(90deg, #667eea, #764ba2)' : 'linear-gradient(90deg, #f093fb, #f5576c)',
        }} />
        <span style={{
          position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
          lineHeight: '20px', fontSize: 12, color: '#fff', fontWeight: 700,
        }}>
          {tab === 'equip' ? equipPct : enemyPct}%
        </span>
      </div>

      {/* Codex Power Milestones */}
      <CodexMilestones equipCount={collectedEquip} enemyCount={collectedEnemy} />

      {tab === 'equip' ? (
        <EquipCodex codexIds={codexEquipIds} />
      ) : (
        <EnemyCodex codexNames={codexEnemyNames} allEnemies={allEnemies} />
      )}
    </div>
  );
}

function EquipCodex({ codexIds }: { codexIds: string[] }) {
  // Group by slot
  const slots = ['weapon', 'armor', 'treasure'] as const;
  const slotNames = { weapon: '⚔️ 武器', armor: '🛡️ 护甲', treasure: '💎 法宝' };

  return (
    <div>
      {slots.map(slot => {
        const items = EQUIPMENT_TEMPLATES.filter(e => e.slot === slot);
        return (
          <div key={slot} style={{ marginBottom: 12 }}>
            <div style={{ color: '#aaa', fontSize: 13, marginBottom: 4 }}>
              {slotNames[slot]} ({items.filter(i => codexIds.includes(i.id)).length}/{items.length})
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {items.map(eq => {
                const collected = codexIds.includes(eq.id);
                const qi = QUALITY_INFO[eq.quality];
                return (
                  <div key={eq.id} style={{
                    padding: '4px 8px', borderRadius: 4, fontSize: 12,
                    background: collected ? '#1a1a2e' : '#111',
                    border: `1px solid ${collected ? qi.color : '#333'}`,
                    color: collected ? qi.color : '#444',
                    opacity: collected ? 1 : 0.4,
                  }}>
                    {collected ? `${qi.symbol}${eq.name}` : '???'}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function CodexMilestones({ equipCount, enemyCount }: { equipCount: number; enemyCount: number }) {
  const bonuses = getCodexBonuses(equipCount, enemyCount);
  const hasAny = bonuses.atkPct > 0 || bonuses.hpPct > 0;
  
  return (
    <div style={{ marginBottom: 12, padding: '8px 10px', background: '#1a1a2e', borderRadius: 8, border: '1px solid #333' }}>
      <div style={{ fontSize: 13, color: '#81d4fa', fontWeight: 700, marginBottom: 6 }}>
        📖 图鉴之力 {hasAny && <span style={{ color: '#4caf50', fontSize: 11 }}>已激活</span>}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: hasAny ? 6 : 0 }}>
        {CODEX_MILESTONES.map((m, i) => {
          const count = m.type === 'equip' ? equipCount : enemyCount;
          const unlocked = count >= m.count;
          return (
            <div key={i} style={{
              padding: '3px 8px', borderRadius: 4, fontSize: 11,
              background: unlocked ? '#1b5e20' : '#222',
              border: `1px solid ${unlocked ? '#4caf50' : '#444'}`,
              color: unlocked ? '#a5d6a7' : '#666',
            }}>
              {m.type === 'equip' ? '⚔️' : '👹'}{m.count} {m.name} {unlocked ? '✅' : `(${count}/${m.count})`}
            </div>
          );
        })}
      </div>
      {hasAny && (
        <div style={{ fontSize: 11, color: '#aaa', display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {bonuses.atkPct > 0 && <span>⚔️+{bonuses.atkPct}%</span>}
          {bonuses.hpPct > 0 && <span>❤️+{bonuses.hpPct}%</span>}
          {bonuses.critRate > 0 && <span>💥+{bonuses.critRate}%</span>}
          {bonuses.critDmg > 0 && <span>🔥+{(bonuses.critDmg * 100).toFixed(0)}%</span>}
          {bonuses.expPct > 0 && <span>📈+{bonuses.expPct}%</span>}
          {bonuses.lingshiPct > 0 && <span>💰+{bonuses.lingshiPct}%</span>}
        </div>
      )}
    </div>
  );
}

function EnemyCodex({ codexNames, allEnemies }: { codexNames: string[]; allEnemies: { name: string; emoji: string; chapter: string }[] }) {
  // Group by chapter
  const chapters = [...new Set(allEnemies.map(e => e.chapter))];

  return (
    <div>
      {chapters.map(ch => {
        const enemies = allEnemies.filter(e => e.chapter === ch);
        return (
          <div key={ch} style={{ marginBottom: 12 }}>
            <div style={{ color: '#aaa', fontSize: 13, marginBottom: 4 }}>
              {ch} ({enemies.filter(e => codexNames.includes(e.name)).length}/{enemies.length})
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {enemies.map((en, i) => {
                const found = codexNames.includes(en.name);
                return (
                  <div key={i} style={{
                    padding: '4px 8px', borderRadius: 4, fontSize: 12,
                    background: found ? '#1a1a2e' : '#111',
                    border: `1px solid ${found ? '#f5576c' : '#333'}`,
                    color: found ? '#f5576c' : '#444',
                    opacity: found ? 1 : 0.4,
                  }}>
                    {found ? `${en.emoji} ${en.name}` : '???'}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
