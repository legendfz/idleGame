/**
 * ProgressPanel — 游戏进度总览
 * 展示各系统完成百分比和整体进度
 */
import { useGameStore } from '../store/gameStore';
import { CHAPTERS } from '../data/chapters';
import { REALMS } from '../data/realms';
import { EQUIPMENT_TEMPLATES, EQUIP_SETS } from '../data/equipment';
import { TITLES } from '../data/titles';
import { ACHIEVEMENTS } from '../data/achievements';

function ProgressBar({ label, current, total, color = '#8b5cf6' }: { label: string; current: number; total: number; color?: string }) {
  const pct = total > 0 ? Math.min(100, Math.round((current / total) * 100)) : 0;
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 3 }}>
        <span>{label}</span>
        <span style={{ color: pct === 100 ? '#fbbf24' : 'var(--text-dim)' }}>
          {current}/{total} ({pct}%){pct === 100 ? ' ✅' : ''}
        </span>
      </div>
      <div style={{ height: 8, borderRadius: 4, background: 'var(--bg-card)', overflow: 'hidden' }}>
        <div style={{
          height: '100%',
          width: `${pct}%`,
          borderRadius: 4,
          background: pct === 100 ? 'linear-gradient(90deg, #fbbf24, #f59e0b)' : `linear-gradient(90deg, ${color}, ${color}88)`,
          transition: 'width 0.5s ease',
        }} />
      </div>
    </div>
  );
}

export function ProgressPanel() {
  const state = useGameStore.getState();
  const player = useGameStore(s => s.player);

  // 章节进度
  const totalChapters = CHAPTERS.length;
  const clearedChapters = (state.highestChapter ?? 1) - 1;

  // 境界进度
  const totalRealms = REALMS.length;
  const currentRealm = (player.realmIndex ?? 0) + 1;

  // 装备图鉴
  const totalEquipTemplates = EQUIPMENT_TEMPLATES.length;
  const collectedEquips = (player as any).codexEquipIds?.length ?? 0;

  // 妖怪图鉴
  const collectedEnemies = (player as any).codexEnemyNames?.length ?? 0;
  const totalEnemies = 45; // from data

  // 称号
  const totalTitles = TITLES.length;
  const unlockedTitles = (state as any).unlockedTitles?.length ?? 0;

  // 成就
  const totalAchievements = ACHIEVEMENTS.length;
  const completedAchievements = Object.values((state as any).achievementStates ?? {}).filter((s: any) => s?.completed).length;

  // 套装
  const totalSets = EQUIP_SETS.length;
  // Count active sets by checking equipped items
  const equipped = [state.equippedWeapon, state.equippedArmor, state.equippedTreasure].filter(Boolean);
  const equippedSetIds = new Set(equipped.map((e: any) => e?.setId).filter(Boolean));
  const activeSets = equippedSetIds.size;

  // 转世次数
  const reincCount = (state as any).reincarnationCount ?? 0;

  // 觉醒点
  const awakeningSpent = Object.values((player as any).awakening ?? {}).reduce((sum: number, v: any) => sum + (v ?? 0), 0) as number;

  // 深渊最高层
  const abyssFloor = (state as any).highestAbyssFloor ?? 0;

  // 试炼最高层
  const trialBest = (state as any).trialBestFloor ?? 0;

  // 计算整体进度
  const categories = [
    { w: 15, pct: clearedChapters / totalChapters },
    { w: 15, pct: currentRealm / totalRealms },
    { w: 15, pct: collectedEquips / totalEquipTemplates },
    { w: 10, pct: collectedEnemies / totalEnemies },
    { w: 15, pct: unlockedTitles / totalTitles },
    { w: 15, pct: completedAchievements / totalAchievements },
    { w: 5, pct: Math.min(1, reincCount / 20) },
    { w: 5, pct: Math.min(1, abyssFloor / 100) },
    { w: 5, pct: Math.min(1, trialBest / 20) },
  ];
  const overallPct = Math.round(categories.reduce((s, c) => s + c.w * c.pct, 0));

  return (
    <div style={{ padding: '0 2px' }}>
      {/* 整体进度 */}
      <div style={{
        textAlign: 'center', margin: '8px 0 16px',
        padding: 12, borderRadius: 12,
        background: 'linear-gradient(135deg, rgba(139,92,246,0.15), rgba(251,191,36,0.1))',
        border: '1px solid rgba(139,92,246,0.3)',
      }}>
        <div style={{ fontSize: 13, color: 'var(--text-dim)', marginBottom: 4 }}>🏆 仙途总进度</div>
        <div style={{ fontSize: 32, fontWeight: 700, color: overallPct >= 100 ? '#fbbf24' : '#8b5cf6' }}>
          {overallPct}%
        </div>
        <div style={{ height: 10, borderRadius: 5, background: 'var(--bg-card)', margin: '8px 0 4px', overflow: 'hidden' }}>
          <div style={{
            height: '100%', borderRadius: 5, width: `${overallPct}%`,
            background: overallPct >= 100
              ? 'linear-gradient(90deg, #fbbf24, #f59e0b)'
              : 'linear-gradient(90deg, #8b5cf6, #6366f1, #3b82f6)',
            transition: 'width 0.5s ease',
          }} />
        </div>
      </div>

      {/* 各系统进度 */}
      <ProgressBar label="📖 章节通关" current={clearedChapters} total={totalChapters} color="#3b82f6" />
      <ProgressBar label="🔮 境界突破" current={currentRealm} total={totalRealms} color="#f59e0b" />
      <ProgressBar label="⚔️ 装备收集" current={collectedEquips} total={totalEquipTemplates} color="#8b5cf6" />
      <ProgressBar label="👹 妖怪图鉴" current={collectedEnemies} total={totalEnemies} color="#ef4444" />
      <ProgressBar label="🎖️ 称号解锁" current={unlockedTitles} total={totalTitles} color="#fbbf24" />
      <ProgressBar label="🏅 成就完成" current={completedAchievements} total={totalAchievements} color="#10b981" />

      {/* 里程碑数据 */}
      <div style={{
        marginTop: 12, padding: 10, borderRadius: 8,
        background: 'var(--bg-card)', border: '1px solid var(--border)',
      }}>
        <div style={{ fontSize: 13, color: 'var(--text-dim)', marginBottom: 8 }}>📊 修仙里程碑</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 16px', fontSize: 13 }}>
          <div>🔄 转世次数：<span style={{ color: '#8b5cf6' }}>{reincCount}</span></div>
          <div>⭐ 觉醒点数：<span style={{ color: '#fbbf24' }}>{awakeningSpent}</span></div>
          <div>🕳️ 深渊最高：<span style={{ color: '#ef4444' }}>{abyssFloor}层</span></div>
          <div>⚡ 试炼最高：<span style={{ color: '#3b82f6' }}>{trialBest}层</span></div>
          <div>⚔️ 累计击杀：<span style={{ color: '#10b981' }}>{((state as any).allTimeKills ?? 0).toLocaleString()}</span></div>
          <div>🛡️ 套装激活：<span style={{ color: '#f59e0b' }}>{activeSets}/{totalSets}</span></div>
        </div>
      </div>
    </div>
  );
}
