import { useGameStore } from '../../store/gameStore';
import { ACTIVE_SKILLS } from '../../data/skills';

export function SkillBar() {
  const player = useGameStore(s => s.player);
  const useSkill = useGameStore(s => s.useSkill);
  const skills = ACTIVE_SKILLS.filter(s => player.level >= s.unlockLevel);

  if (skills.length === 0) return null;

  return (
    <div className="skill-bar">
      {skills.map(skill => {
        const cd = player.activeSkills?.cooldowns?.[skill.id] ?? 0;
        const buffActive = (player.activeSkills?.buffs?.[skill.id] ?? 0) > 0;
        const buffTime = player.activeSkills?.buffs?.[skill.id] ?? 0;
        const onCooldown = cd > 0;
        const cdPct = onCooldown ? (cd / skill.cooldown) * 100 : 0;

        return (
          <button
            key={skill.id}
            className={`skill-btn${buffActive ? ' skill-active' : ''}${onCooldown ? ' skill-cd' : ''}`}
            onClick={() => useSkill(skill.id)}
            disabled={onCooldown}
            title={skill.description}
          >
            <span className="skill-emoji">{skill.emoji}</span>
            <span className="skill-name">{skill.name}</span>
            {onCooldown && (
              <>
                <div className="skill-cd-overlay" style={{ height: `${cdPct}%` }} />
                <span className="skill-cd-text">{cd}s</span>
              </>
            )}
            {buffActive && <span className="skill-buff-text">{buffTime}s</span>}
          </button>
        );
      })}
    </div>
  );
}
