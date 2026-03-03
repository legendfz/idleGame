/**
 * AffinityPanel — 仙缘系统面板
 */
import { useAffinityStore } from '../../store/affinity';
import { NPCS, getAffinityTier, getGiftCost } from '../../engine/affinity';
import '../../styles/affinity.css';

export function AffinityPanel() {
  const state = useAffinityStore(s => s.state);
  const gift = useAffinityStore(s => s.gift);

  return (
    <div className="affinity-panel">
      <h2>💕 仙缘</h2>
      <p className="affinity-desc">赠礼结交仙友，获得永久加成</p>
      <div className="npc-grid">
        {NPCS.map(npc => {
          const level = state.levels[npc.id] ?? 0;
          const tier = getAffinityTier(level);
          const maxed = level >= 100;
          return (
            <div key={npc.id} className="npc-card">
              <div className="npc-header">
                <span className="npc-icon">{npc.icon}</span>
                <span className="npc-name">{npc.name}</span>
              </div>
              <div className="npc-desc">{npc.desc}</div>
              <div className="affinity-bar">
                <div className="affinity-fill" style={{ width: `${level}%` }} />
                <span className="affinity-text">{level}/100</span>
              </div>
              <div className="npc-buffs">
                {npc.buffs.map((b, i) => (
                  <span key={i} className="buff-tag">{b.stat} +{b.perTier * tier}%</span>
                ))}
              </div>
              {level >= 100 && (
                <div className="ultimate-skill">🌟 {npc.ultimateSkill}: {npc.ultimateDesc}</div>
              )}
              <button className="gift-btn" onClick={() => gift(npc.id)} disabled={maxed}>
                {maxed ? '好感已满' : `赠礼 (${getGiftCost()} 灵石)`}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
