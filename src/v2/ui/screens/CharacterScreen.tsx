import { usePlayerStore } from '../../store/playerStore';
import { CHARACTERS } from '../../data/characters';

export default function CharacterScreen() {
  const game = usePlayerStore(s => s.game);
  const switchChar = usePlayerStore(s => s.switchCharacter);

  return (
    <div className="v2-screen">
      <h3>[人] 角色</h3>
      {game.characters.map(c => {
        const def = CHARACTERS.find(d => d.id === c.id);
        return (
          <div key={c.id} className={`v2-char-card ${c.id === game.activeCharId ? 'active' : ''}`}
            style={{ opacity: c.unlocked ? 1 : 0.4 }}>
            <span>{def?.icon} {def?.name}</span>
            <span>{c.unlocked ? (c.id === game.activeCharId ? '[OK] 主控' : '') : '[锁]'}</span>
            {c.unlocked && c.id !== game.activeCharId && (
              <button className="v2-btn v2-btn-sm" onClick={() => switchChar(c.id)}>切换</button>
            )}
          </div>
        );
      })}
    </div>
  );
}
