/**
 * BuffOverview — v60.0「万法归宗」加成总览面板
 * 显示所有系统的加成来源和数值
 */
import { useMemo, useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { useSanctuaryStore } from '../store/sanctuaryStore';
import { getActiveSetBonuses, getEquipEffectiveStat } from '../data/equipment';
import { REINC_PERKS, REINC_MILESTONES, getReincMilestoneBonus } from '../data/reincarnation';
import { BUILDINGS, getBuildingOutput } from '../engine/sanctuary';
import { getAwakeningBonuses } from './AwakeningPanel';
import { CONSUMABLE_BUFFS } from '../data/consumables';
import { formatNumber } from '../utils/format';
import { useAffinityStore } from '../store/affinityStore';
import { getResonanceBonus } from '../data/resonance';
import { AFFINITY_NPCS } from '../engine/affinity';

interface BuffSource {
  system: string;
  icon: string;
  color: string;
  buffs: { label: string; value: string }[];
}

export function BuffOverview() {
  const player = useGameStore(s => s.player);
  const weapon = useGameStore(s => s.equippedWeapon);
  const armor = useGameStore(s => s.equippedArmor);
  const treasure = useGameStore(s => s.equippedTreasure);
  const sanctuary = useSanctuaryStore(s => s.sanctuary);
  const [expanded, setExpanded] = useState<string | null>(null);

  const sources = useMemo(() => {
    const result: BuffSource[] = [];

    // 1. Equipment stats
    const eqBuffs: { label: string; value: string }[] = [];
    if (weapon) eqBuffs.push({ label: `${weapon.name} +${weapon.level}`, value: `攻击 +${formatNumber(getEquipEffectiveStat(weapon))}` });
    if (armor) eqBuffs.push({ label: `${armor.name} +${armor.level}`, value: `生命 +${formatNumber(getEquipEffectiveStat(armor))}` });
    const passives = [weapon, armor, treasure].filter(e => e?.passive);
    for (const eq of passives) {
      if (eq?.passive) eqBuffs.push({ label: eq.name, value: eq.passive.description });
    }
    if (eqBuffs.length > 0) result.push({ system: '装备', icon: '⚔️', color: '#4fc3f7', buffs: eqBuffs });

    // 2. Set bonuses
    const sets = getActiveSetBonuses(weapon, armor, treasure);
    if (sets.length > 0) {
      const setBuffs = sets.flatMap(s => s.bonuses.map(b => ({ label: `${s.set.name} (${s.activeCount}件)`, value: b.description })));
      result.push({ system: '套装', icon: '🔗', color: '#ab47bc', buffs: setBuffs });
    }

    // 3. Reincarnation perks
    const reincBuffs: { label: string; value: string }[] = [];
    if (player.reincPerks) {
      for (const perk of REINC_PERKS) {
        const lv = player.reincPerks[perk.id] ?? 0;
        if (lv > 0) {
          const val = perk.effect(lv);
          const pctStr = val > 1 ? `+${Math.round((val - 1) * 100)}%` : `+${val}`;
          reincBuffs.push({ label: `${perk.name} Lv.${lv}`, value: pctStr });
        }
      }
    }
    // v67.0 转世里程碑
    const rmbBonus = getReincMilestoneBonus(player.reincarnations);
    if (rmbBonus.atk > 0) reincBuffs.push({ label: '里程碑·攻击', value: `+${Math.round(rmbBonus.atk * 100)}%` });
    if (rmbBonus.hp > 0) reincBuffs.push({ label: '里程碑·生命', value: `+${Math.round(rmbBonus.hp * 100)}%` });
    if (rmbBonus.exp > 0) reincBuffs.push({ label: '里程碑·经验', value: `+${Math.round(rmbBonus.exp * 100)}%` });
    if (rmbBonus.gold > 0) reincBuffs.push({ label: '里程碑·灵石', value: `+${Math.round(rmbBonus.gold * 100)}%` });
    if (rmbBonus.crit > 0) reincBuffs.push({ label: '里程碑·暴击', value: `+${rmbBonus.crit}%` });
    if (rmbBonus.critDmg > 0) reincBuffs.push({ label: '里程碑·暴伤', value: `+${Math.round(rmbBonus.critDmg * 100)}%` });
    if (rmbBonus.drop > 0) reincBuffs.push({ label: '里程碑·掉率', value: `+${Math.round(rmbBonus.drop * 100)}%` });
    if (reincBuffs.length > 0) result.push({ system: '转世', icon: '🔄', color: '#ff7043', buffs: reincBuffs });

    // 4. Awakening
    const awk = getAwakeningBonuses(player);
    const awkBuffs: { label: string; value: string }[] = [];
    if (awk.atk_pct) awkBuffs.push({ label: '觉醒·战', value: `攻击 +${awk.atk_pct}%` });
    if (awk.hp_pct) awkBuffs.push({ label: '觉醒·战', value: `生命 +${awk.hp_pct}%` });
    if (awk.crit_rate) awkBuffs.push({ label: '觉醒·战/运', value: `暴击 +${awk.crit_rate}%` });
    if (awk.crit_dmg) awkBuffs.push({ label: '觉醒·战', value: `暴伤 +${awk.crit_dmg}%` });
    if (awk.exp_pct) awkBuffs.push({ label: '觉醒·法', value: `经验 +${awk.exp_pct}%` });
    if (awk.gold_pct) awkBuffs.push({ label: '觉醒·运', value: `灵石 +${awk.gold_pct}%` });
    if (awk.drop_pct) awkBuffs.push({ label: '觉醒·运', value: `掉率 +${awk.drop_pct}%` });
    if (awkBuffs.length > 0) result.push({ system: '觉醒', icon: '✨', color: '#ffd54f', buffs: awkBuffs });

    // 5. Consumables
    const actives = player.activeConsumables ?? [];
    if (actives.length > 0) {
      const cBuffs = actives.map(a => {
        const def = CONSUMABLE_BUFFS.find(c => c.id === a.buffId);
        return { label: def?.name ?? a.buffId, value: def?.description ?? '增益中' };
      });
      result.push({ system: '丹药', icon: '💊', color: '#66bb6a', buffs: cBuffs });
    }

    // 6. Sanctuary
    const sancBuffs: { label: string; value: string }[] = [];
    for (const b of BUILDINGS) {
      const lv = sanctuary.levels[b.id] ?? 0;
      if (lv > 0) {
        const output = getBuildingOutput(b, lv);
        const unit = b.produceType === 'expMul' ? '%' : (b.produceType === 'forgeRate' ? '%' : '/s');
        sancBuffs.push({ label: `${b.name} Lv.${lv}`, value: `${b.desc.replace('每秒', '')} +${output}${unit}` });
      }
    }
    if (sancBuffs.length > 0) result.push({ system: '洞天', icon: '🏠', color: '#8d6e63', buffs: sancBuffs });

    // 7. Affinity (仙缘)
    const afState = useAffinityStore.getState().affinity;
    const afBuffs: { label: string; value: string }[] = [];
    for (const npc of AFFINITY_NPCS) {
      const lv = afState.levels[npc.id] ?? 0;
      for (const b of npc.buffs) {
        if (lv >= b.threshold) afBuffs.push({ label: `${npc.name} (${lv})`, value: b.desc });
      }
    }
    if (afBuffs.length > 0) result.push({ system: '仙缘', icon: '💕', color: '#f48fb1', buffs: afBuffs });

    // 8. Equipment resonance (v71.0)
    const resonance = getResonanceBonus(weapon, armor, treasure);
    if (resonance) {
      result.push({ system: '共鸣', icon: '🔮', color: '#e2c97e', buffs: [{ label: resonance.name, value: resonance.description }] });
    }

    // 9. Reincarnation count
    const reincCount = player.reincarnations ?? 0;
    if (reincCount > 0) {
      result.push({ system: '轮回', icon: '♾️', color: '#ce93d8', buffs: [{ label: `转世 ${reincCount} 次`, value: `道点可用` }] });
    }

    return result;
  }, [player, weapon, armor, treasure, sanctuary]);

  // Calculate total effective multipliers
  const getEffectiveStats = useGameStore(s => s.getEffectiveStats);
  const eStats = getEffectiveStats();
  const baseStats = player.stats;

  return (
    <div style={{ padding: '0 4px' }}>
      <h3 className="section-title" style={{ marginBottom: 12 }}>万法归宗 · 加成总览</h3>

      {/* Summary card */}
      <div style={{
        background: 'linear-gradient(135deg, #1a1a2e, #16213e)',
        borderRadius: 12, padding: 16, marginBottom: 16,
        border: '1px solid #333',
      }}>
        <div style={{ fontSize: 13, color: '#aaa', marginBottom: 10 }}>最终属性（含所有加成）</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <StatCompare label="攻击" base={baseStats.attack} final={eStats.attack} color="#ff6b6b" />
          <StatCompare label="生命" base={baseStats.maxHp} final={eStats.maxHp} color="#51cf66" />
          <StatCompare label="暴击率" base={baseStats.critRate} final={eStats.critRate} color="#ffd43b" suffix="%" />
          <StatCompare label="暴伤" base={baseStats.critDmg} final={eStats.critDmg ?? 150} color="#ff922b" suffix="%" />
          <StatCompare label="速度" base={baseStats.speed} final={eStats.speed} color="#74c0fc" suffix="x" />
        </div>
      </div>

      {/* Source breakdown */}
      {sources.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#666', padding: 40 }}>暂无加成，继续修炼吧！</div>
      ) : (
        sources.map(src => (
          <div key={src.system} style={{
            background: 'var(--bg-card, #1e1e2e)', borderRadius: 10, marginBottom: 8,
            border: `1px solid ${src.color}33`, overflow: 'hidden',
          }}>
            <div
              onClick={() => setExpanded(expanded === src.system ? null : src.system)}
              style={{
                padding: '12px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
                borderBottom: expanded === src.system ? '1px solid #333' : 'none',
              }}
            >
              <span style={{ fontSize: 18 }}>{src.icon}</span>
              <span style={{ fontWeight: 600, color: src.color, flex: 1 }}>{src.system}</span>
              <span style={{ fontSize: 12, color: '#888' }}>{src.buffs.length}项</span>
              <span style={{ color: '#666', fontSize: 12 }}>{expanded === src.system ? '▲' : '▼'}</span>
            </div>
            {expanded === src.system && (
              <div style={{ padding: '8px 14px 12px' }}>
                {src.buffs.map((b, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: 13, borderBottom: i < src.buffs.length - 1 ? '1px solid #222' : 'none' }}>
                    <span style={{ color: '#aaa' }}>{b.label}</span>
                    <span style={{ color: src.color, fontWeight: 600 }}>{b.value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))
      )}

      <div style={{ textAlign: 'center', color: '#555', fontSize: 11, marginTop: 12 }}>
        共 {sources.reduce((s, src) => s + src.buffs.length, 0)} 项加成来自 {sources.length} 个系统
      </div>
    </div>
  );
}

function StatCompare({ label, base, final: fin, color, suffix = '' }: {
  label: string; base: number; final: number; color: string; suffix?: string;
}) {
  const diff = fin - base;
  const pct = base > 0 ? Math.round((diff / base) * 100) : 0;
  return (
    <div style={{ background: '#0d1117', borderRadius: 8, padding: '8px 10px' }}>
      <div style={{ fontSize: 11, color: '#888' }}>{label}</div>
      <div style={{ fontSize: 16, fontWeight: 700, color }}>
        {suffix === '%' || suffix === 'x' ? fin.toFixed(1) : formatNumber(fin)}{suffix}
      </div>
      {diff > 0 && (
        <div style={{ fontSize: 10, color: '#4caf50' }}>
          +{suffix === '%' || suffix === 'x' ? diff.toFixed(1) : formatNumber(diff)} ({pct > 0 ? `+${pct}%` : '—'})
        </div>
      )}
    </div>
  );
}
