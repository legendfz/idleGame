/**
 * StatsView — 统计面板
 */
import { usePlayerStore } from '../../store/player';
import { useEquipStore } from '../../store/equipment';
import { useJourneyStore } from '../../store/journey';
import { useForgeStore } from '../../store/forge';
import { useMaterialStore } from '../../store/material';
import { getRealmConfig } from '../../data/config';
import { formatBigNum, bn } from '../../engine/bignum';

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}小时${m}分`;
  return `${m}分钟`;
}

export function StatsView() {
  const player = usePlayerStore(s => s.player);
  const items = useEquipStore(s => s.items);
  const journey = useJourneyStore(s => s.journey);
  const forgeLevel = useForgeStore(s => s.forgeLevel);
  const materials = useMaterialStore(s => s.materials);
  const realm = getRealmConfig(player.realmId);

  const clearedStages = Object.values(journey.stages).filter(s => s.stars > 0).length;
  const totalStars = Object.values(journey.stages).reduce((sum, s) => sum + s.stars, 0);
  const totalMaterials = Object.values(materials).reduce((sum, c) => sum + c, 0);

  const stats = [
    { label: '当前境界', value: `${realm?.name ?? '凡人'}·${player.realmLevel}层`, icon: '🏔️' },
    { label: '总修为', value: formatBigNum(bn(player.totalXiuwei || '0')), icon: '✨' },
    { label: '金币', value: formatBigNum(bn(player.coins || '0')), icon: '💰' },
    { label: '在线时长', value: formatTime(player.playTime), icon: '⏱️' },
    { label: '总点击', value: player.totalClicks.toLocaleString(), icon: '👆' },
    { label: '击杀数', value: player.totalKills.toLocaleString(), icon: '💀' },
    { label: '突破次数', value: player.totalBreakthroughs.toString(), icon: '⬆️' },
    { label: '转世次数', value: player.prestigeCount.toString(), icon: '🔄' },
    { label: '通关关卡', value: `${clearedStages} 难`, icon: '🗺️' },
    { label: '总星数', value: `⭐×${totalStars}`, icon: '⭐' },
    { label: '装备数', value: items.length.toString(), icon: '🎒' },
    { label: '锻造等级', value: `Lv.${forgeLevel}`, icon: '🔨' },
    { label: '材料种类', value: Object.keys(materials).length.toString(), icon: '📦' },
    { label: '材料总数', value: totalMaterials.toString(), icon: '🧱' },
  ];

  return (
    <div className="view-stats" style={{ padding: 16 }}>
      <h2>📊 统计</h2>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 12 }}>
        {stats.map(s => (
          <div key={s.label} style={{
            background: 'var(--color-bg-elevated, #1e1e2e)', borderRadius: 10, padding: '12px 10px',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
          }}>
            <span style={{ fontSize: 24 }}>{s.icon}</span>
            <span style={{ fontSize: 11, color: 'var(--color-text-muted, #888)' }}>{s.label}</span>
            <span style={{ fontSize: 15, fontWeight: 'bold' }}>{s.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
