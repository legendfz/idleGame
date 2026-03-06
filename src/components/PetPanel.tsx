import { PETS, type PetDef } from '../data/pets';
import { useGameStore } from '../store/gameStore';
import { formatNumber } from '../utils/format';

export function PetPanel() {
  const player = useGameStore(s => s.player);
  const feedPet = useGameStore(s => s.feedPet);
  const setActivePet = useGameStore(s => s.setActivePet);

  return (
    <div className="main-content fade-in">
      <h3 className="section-title">🐉 灵兽</h3>
      <p style={{ color: 'var(--text-dim)', fontSize: 12, textAlign: 'center', margin: '0 0 12px' }}>
        出战灵兽获100%加成，其余灵兽30%加成
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {PETS.map(pet => (
          <PetCard key={pet.id} pet={pet} player={player} feedPet={feedPet} setActivePet={setActivePet} />
        ))}
      </div>
    </div>
  );
}

function PetCard({ pet, player, feedPet, setActivePet }: {
  pet: PetDef; player: any; feedPet: (id: string) => void; setActivePet: (id: string | null) => void;
}) {
  const level = player.petLevels[pet.id] ?? 0;
  const unlocked = player.level >= pet.unlockLevel;
  const isActive = player.activePetId === pet.id;
  const maxed = level >= pet.maxLevel;
  const cost = maxed ? 0 : pet.feedCost(level);
  const canFeed = unlocked && !maxed && player.lingshi >= cost;
  const bonuses = pet.bonuses(Math.max(level, 1));

  return (
    <div style={{
      padding: '12px 14px', borderRadius: 12,
      background: unlocked ? (isActive ? 'rgba(251,191,36,0.12)' : 'rgba(255,255,255,0.06)') : 'rgba(255,255,255,0.02)',
      border: `1px solid ${isActive ? '#fbbf2466' : unlocked ? 'var(--border)' : 'rgba(255,255,255,0.05)'}`,
      opacity: unlocked ? 1 : 0.5,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <span style={{ fontSize: 20, marginRight: 6 }}>{pet.emoji}</span>
          <span style={{ fontWeight: 'bold', color: unlocked ? '#fbbf24' : 'var(--text-dim)' }}>{pet.name}</span>
          {level > 0 && <span style={{ color: '#a78bfa', fontSize: 12, marginLeft: 6 }}>Lv.{level}</span>}
          {isActive && <span style={{ color: '#fbbf24', fontSize: 11, marginLeft: 6 }}>⭐出战</span>}
        </div>
        {!unlocked && <span style={{ fontSize: 11, color: 'var(--text-dim)' }}>🔒 Lv.{pet.unlockLevel}解锁</span>}
      </div>
      <div style={{ color: 'var(--text-dim)', fontSize: 11, margin: '4px 0' }}>{pet.desc}</div>
      {level > 0 && (
        <div style={{ fontSize: 11, color: '#a78bfa', display: 'flex', gap: 8, flexWrap: 'wrap', margin: '4px 0' }}>
          {bonuses.atkPct ? <span>⚔️攻击+{bonuses.atkPct.toFixed(0)}%</span> : null}
          {bonuses.hpPct ? <span>❤️生命+{bonuses.hpPct.toFixed(0)}%</span> : null}
          {bonuses.expPct ? <span>✨经验+{bonuses.expPct.toFixed(0)}%</span> : null}
          {bonuses.goldPct ? <span>💰灵石+{bonuses.goldPct.toFixed(0)}%</span> : null}
          {bonuses.critRate ? <span>🎯暴击+{bonuses.critRate.toFixed(1)}%</span> : null}
          {bonuses.critDmg ? <span>💥暴伤+{bonuses.critDmg.toFixed(0)}%</span> : null}
          {bonuses.dropRate ? <span>🎁掉率+{bonuses.dropRate.toFixed(0)}%</span> : null}
        </div>
      )}
      {unlocked && (
        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          <button
            onClick={() => feedPet(pet.id)}
            disabled={!canFeed}
            style={{
              flex: 1, padding: '6px 0', borderRadius: 8, border: 'none', fontSize: 12, cursor: canFeed ? 'pointer' : 'default',
              background: maxed ? 'rgba(34,197,94,0.2)' : canFeed ? 'linear-gradient(135deg,#a78bfa,#7c3aed)' : 'rgba(255,255,255,0.08)',
              color: maxed ? '#22c55e' : canFeed ? '#fff' : 'var(--text-dim)',
            }}
          >
            {maxed ? '满级 ✓' : `喂养 💰${formatNumber(cost)}`}
          </button>
          {level > 0 && (
            <button
              onClick={() => setActivePet(isActive ? null : pet.id)}
              style={{
                padding: '6px 12px', borderRadius: 8, border: 'none', fontSize: 12, cursor: 'pointer',
                background: isActive ? 'rgba(251,191,36,0.3)' : 'rgba(255,255,255,0.1)',
                color: isActive ? '#fbbf24' : 'var(--text-dim)',
              }}
            >
              {isActive ? '收回' : '出战'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
