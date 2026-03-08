// v125.0「万法溯源」— Stat source breakdown popup
import { useMemo, useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { useAffinityStore } from '../store/affinityStore';
import { useAchievementStore } from '../store/achievementStore';
import { getEquipEffectiveStat, getActiveSetBonuses, hasFullMythic15 } from '../data/equipment';
import { getResonanceBonus } from '../data/resonance';
import { getTranscendBonuses } from '../data/transcendence';
import { getPetTotalBonus } from '../data/pets';
import { getAwakeningBonuses } from './AwakeningPanel';
import { ACHIEVEMENTS } from '../data/achievements';
import { getReincMilestoneBonus } from '../data/reincarnation';
import { TITLES } from '../data/titles';
import { formatNumber } from '../utils/format';

interface BuffSource {
  name: string;
  emoji: string;
  attack: number;
  hp: number;
  critRate: number;
  critDmg: number;
}

export function useStatBreakdown() {
  const player = useGameStore(s => s.player);
  const weapon = useGameStore(s => s.equippedWeapon);
  const armor = useGameStore(s => s.equippedArmor);
  const treasure = useGameStore(s => s.equippedTreasure);
  const achStates = useAchievementStore(s => s.states);
  const equippedTitle = useGameStore(s => s.equippedTitle);
  const affinityBuffs = useAffinityStore(s => s.getBuffs());

  return useMemo(() => {
    const sources: BuffSource[] = [];

    // 1. Base stats
    sources.push({
      name: '基础属性', emoji: '🧬',
      attack: player.stats.attack, hp: player.stats.maxHp,
      critRate: player.stats.critRate, critDmg: player.stats.critDmg,
    });

    // 2. Equipment flat
    let eqAtk = 0, eqHp = 0, eqCrit = 0, eqCritDmg = 0;
    if (weapon) eqAtk += getEquipEffectiveStat(weapon);
    if (armor) eqHp += getEquipEffectiveStat(armor);
    for (const eq of [weapon, armor, treasure]) {
      if (!eq?.passive) continue;
      if (eq.passive.type === 'critRate') eqCrit += eq.passive.value;
      if (eq.passive.type === 'critDmg') eqCritDmg += eq.passive.value;
    }
    if (eqAtk || eqHp || eqCrit || eqCritDmg) {
      sources.push({ name: '装备', emoji: '⚔️', attack: eqAtk, hp: eqHp, critRate: eqCrit, critDmg: eqCritDmg });
    }

    // 3. Set bonuses
    const setBonuses = getActiveSetBonuses(weapon, armor, treasure);
    let setAtk = 0, setHp = 0, setCrit = 0, setCritDmg = 0;
    for (const sb of setBonuses) {
      for (const b of sb.bonuses) {
        if (b.effect.attack) setAtk += b.effect.attack * 100;
        if (b.effect.maxHp) setHp += b.effect.maxHp * 100;
        if (b.effect.critRate) setCrit += b.effect.critRate;
        if (b.effect.critDmg) setCritDmg += b.effect.critDmg;
      }
    }
    if (setAtk || setHp || setCrit || setCritDmg) {
      sources.push({ name: '套装效果', emoji: '🛡️', attack: setAtk, hp: setHp, critRate: setCrit, critDmg: setCritDmg });
    }

    // 4. Full Mythic +15
    if (hasFullMythic15(weapon, armor, treasure)) {
      sources.push({ name: '鸿蒙至尊', emoji: '👑', attack: 100, hp: 100, critRate: 0, critDmg: 0 });
    }

    // 5. Reincarnation perks
    const rp = player.reincPerks ?? {};
    if (rp.atk_mult || rp.hp_mult || rp.crit_rate || rp.crit_dmg) {
      sources.push({
        name: '转世道点', emoji: '🔄',
        attack: (rp.atk_mult ?? 0) * 20, hp: (rp.hp_mult ?? 0) * 15,
        critRate: (rp.crit_rate ?? 0) * 2, critDmg: (rp.crit_dmg ?? 0) * 10,
      });
    }

    // 6. Reincarnation milestones
    const rmb = getReincMilestoneBonus(player.reincarnations ?? 0);
    if (rmb.atk || rmb.hp || rmb.crit || rmb.critDmg) {
      sources.push({
        name: '转世里程碑', emoji: '🏅',
        attack: rmb.atk ?? 0, hp: rmb.hp ?? 0,
        critRate: rmb.crit ?? 0, critDmg: rmb.critDmg ?? 0,
      });
    }

    // 7. Awakening
    const aw = getAwakeningBonuses(player.awakeningPoints ?? {});
    if (aw.atkPct || aw.hpPct || aw.critRate || aw.critDmg) {
      sources.push({
        name: '觉醒', emoji: '💫',
        attack: aw.atkPct ?? 0, hp: aw.hpPct ?? 0,
        critRate: aw.critRate ?? 0, critDmg: aw.critDmg ?? 0,
      });
    }

    // 8. Transcendence
    const tr = getTranscendBonuses(player.transcendPerks ?? {});
    if (tr.atkMul > 1 || tr.hpMul > 1 || tr.critFlat || tr.critDmg) {
      sources.push({
        name: '超越轮回', emoji: '✨',
        attack: Math.round((tr.atkMul - 1) * 100), hp: Math.round((tr.hpMul - 1) * 100),
        critRate: tr.critFlat, critDmg: tr.critDmg,
      });
    }

    // 9. Pets
    const pet = getPetTotalBonus(player.petLevels ?? {}, player.activePetId, player.petEvolutions);
    if (pet.atkPct || pet.hpPct || pet.critRate || pet.critDmg) {
      sources.push({
        name: '灵兽', emoji: '🐉',
        attack: pet.atkPct ?? 0, hp: pet.hpPct ?? 0,
        critRate: pet.critRate ?? 0, critDmg: (pet.critDmg ?? 0) / 100,
      });
    }

    // 10. Affinity
    if (affinityBuffs.attack || affinityBuffs.maxHp || affinityBuffs.critRate || affinityBuffs.critDmg) {
      sources.push({
        name: '仙缘', emoji: '💕',
        attack: affinityBuffs.attack ?? 0, hp: (affinityBuffs.maxHp ?? 0) + (affinityBuffs.defense ?? 0),
        critRate: affinityBuffs.critRate ?? 0, critDmg: (affinityBuffs.critDmg ?? 0) / 100,
      });
    }

    // 11. Resonance
    const res = getResonanceBonus(weapon, armor, treasure);
    if (res) {
      sources.push({
        name: '装备共鸣', emoji: '🔮',
        attack: res.atkPct, hp: res.hpPct,
        critRate: res.critRate, critDmg: res.critDmg,
      });
    }

    // 12. Equipped title
    if (equippedTitle) {
      const t = TITLES.find(tt => tt.id === equippedTitle);
      if (t?.bonuses) {
        sources.push({
          name: `称号「${t.name}」`, emoji: '📜',
          attack: (t.bonuses.attack ?? 0) * 100, hp: (t.bonuses.maxHp ?? 0) * 100,
          critRate: t.bonuses.critRate ?? 0, critDmg: t.bonuses.critDmg ?? 0,
        });
      }
    }

    return sources;
  }, [player, weapon, armor, treasure, affinityBuffs, equippedTitle]);
}

export function StatBreakdownModal({ onClose }: { onClose: () => void }) {
  const sources = useStatBreakdown();
  const [tab, setTab] = useState<'attack' | 'hp' | 'crit'>('attack');

  const filtered = sources.filter(s => {
    if (tab === 'attack') return s.attack > 0;
    if (tab === 'hp') return s.hp > 0;
    return s.critRate > 0 || s.critDmg > 0;
  });

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 19000,
      background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 16,
    }} onClick={onClose}>
      <div style={{
        background: 'linear-gradient(135deg, #1a1a2e, #16213e)',
        borderRadius: 16, border: '1px solid #333',
        maxWidth: 380, width: '100%', maxHeight: '80vh', overflow: 'auto',
        padding: 20,
      }} onClick={e => e.stopPropagation()}>
        <div style={{ textAlign: 'center', marginBottom: 12 }}>
          <span style={{ fontSize: 18, fontWeight: 700, color: '#ffcc00' }}>📊 属性溯源</span>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 14, justifyContent: 'center' }}>
          {(['attack', 'hp', 'crit'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: '6px 16px', borderRadius: 20, border: 'none',
              background: tab === t ? (t === 'attack' ? '#e74c3c' : t === 'hp' ? '#2ecc71' : '#f39c12') : '#333',
              color: '#fff', fontWeight: tab === t ? 700 : 400, fontSize: 13, cursor: 'pointer',
            }}>
              {t === 'attack' ? '⚔攻击' : t === 'hp' ? '❤生命' : '💥暴击'}
            </button>
          ))}
        </div>

        {/* Sources */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.length === 0 && (
            <div style={{ color: '#666', textAlign: 'center', padding: 20 }}>暂无加成来源</div>
          )}
          {filtered.map((s, i) => (
            <div key={i} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '8px 12px', background: 'rgba(255,255,255,0.05)', borderRadius: 10,
            }}>
              <span style={{ color: '#ccc', fontSize: 13 }}>{s.emoji} {s.name}</span>
              <span style={{ color: '#fff', fontWeight: 600, fontSize: 13 }}>
                {tab === 'attack' && (
                  s.name === '基础属性' || s.name === '装备'
                    ? `+${formatNumber(s.attack)}`
                    : `+${s.attack}%`
                )}
                {tab === 'hp' && (
                  s.name === '基础属性' || s.name === '装备'
                    ? `+${formatNumber(s.hp)}`
                    : `+${s.hp}%`
                )}
                {tab === 'crit' && (
                  <span>
                    {s.critRate > 0 && <span style={{ color: '#f39c12' }}>率+{s.critRate}%</span>}
                    {s.critRate > 0 && s.critDmg > 0 && ' '}
                    {s.critDmg > 0 && <span style={{ color: '#e67e22' }}>伤+{s.critDmg}%</span>}
                  </span>
                )}
              </span>
            </div>
          ))}
        </div>

        <button onClick={onClose} style={{
          marginTop: 16, width: '100%', padding: '10px 0', borderRadius: 12,
          border: 'none', background: '#333', color: '#fff', fontSize: 14, cursor: 'pointer',
        }}>关闭</button>
      </div>
    </div>
  );
}
