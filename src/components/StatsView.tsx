/**
 * StatsView — 数据统计面板
 */
import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { REALMS } from '../data/realms';
import { formatNumber, formatTime } from '../utils/format';
import { CodexPanel } from './CodexPanel';
import { BuffOverview } from './BuffOverview';

export function StatsView() {
  const player = useGameStore(s => s.player);
  const totalPlayTime = useGameStore(s => s.totalPlayTime);
  const inventory = useGameStore(s => s.inventory);
  const highestChapter = useGameStore(s => s.highestChapter);
  const highestStage = useGameStore(s => s.highestStage);
  const realm = REALMS[player.realmIndex] ?? REALMS[0];

  const stats = [
    { icon: '◆', label: '当前境界', value: realm?.name ?? '凡人' },
    { icon: '▸', label: '等级', value: `Lv.${player.level}` },
    { icon: '▸', label: '总游戏时间', value: formatTime(totalPlayTime) },
    { icon: '▸', label: '修炼时长', value: formatTime(player.totalCultivateTime || 0) },
    { icon: '▸', label: '灵石', value: formatNumber(player.lingshi) },
    { icon: '▸', label: '蟠桃', value: formatNumber(player.pantao ?? 0) },
    { icon: '▸', label: '击杀数', value: (player.totalKills || 0).toLocaleString() },
    { icon: '▸', label: '累计击杀', value: (useGameStore.getState().allTimeKills || 0).toLocaleString() },
    { icon: '▸', label: '深渊最高层', value: `${useGameStore.getState().highestAbyssFloor || 0}层` },
    { icon: '▸', label: '最高伤害', value: formatNumber(player.maxDamage || 0) },
    { icon: '▸', label: '突破次数', value: (player.totalBreakthroughs || 0).toString() },
    { icon: '▸', label: '装备掉落', value: (player.totalEquipDrops || 0).toString() },
    { icon: '▸', label: '背包装备', value: inventory.length.toString() },
    { icon: '▸', label: '最高关卡', value: `${highestChapter}-${highestStage}` },
    { icon: '▸', label: '攻击力', value: formatNumber(player.stats.attack) },
    { icon: '▸', label: '生命值', value: formatNumber(player.stats.maxHp) },
    { icon: '▸', label: '暴击率', value: `${player.stats.critRate}%` },
    { icon: '▸', label: '暴击伤害', value: `${player.stats.critDmg}x` },
  ];

  const [tab, setTab] = useState<'stats' | 'buffs' | 'codex'>('stats');

  return (
    <div className="main-content fade-in">
      <div style={{ display: 'flex', gap: 0, marginBottom: 12 }}>
        {(['stats', 'buffs', 'codex'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            flex: 1, padding: '8px 0', fontSize: 13, fontWeight: tab === t ? 700 : 400,
            background: tab === t ? 'var(--accent)' : 'var(--bg-card, #1e1e2e)',
            color: tab === t ? '#fff' : '#888', border: 'none', cursor: 'pointer',
            borderRadius: t === 'stats' ? '8px 0 0 8px' : t === 'codex' ? '0 8px 8px 0' : '0',
          }}>
            {t === 'stats' ? '📊 统计' : t === 'buffs' ? '✨ 加成' : '📖 图鉴'}
          </button>
        ))}
      </div>
      {tab === 'buffs' && <BuffOverview />}
      {tab === 'codex' && <CodexPanel />}
      {tab === 'stats' && <>
      <h3 className="section-title">数据统计</h3>
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 16,
      }}>
        {stats.map(s => (
          <div key={s.label} style={{
            background: 'var(--bg-card, #1e1e2e)', borderRadius: 10, padding: '14px 12px',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
            border: '1px solid var(--border, #333)',
          }}>
            <span style={{ fontSize: 14, color: 'var(--accent)' }}>{s.icon}</span>
            <span style={{ fontSize: 11, color: 'var(--dim, #888)' }}>{s.label}</span>
            <span style={{ fontSize: 14, fontWeight: 'bold', color: 'var(--fg, #eee)' }}>{s.value}</span>
          </div>
        ))}
      </div>
      </>}
    </div>
  );
}
