import { usePlayerStore } from '../../store/playerStore';
import { getRealmById } from '../../data/realms';
import { formatBig } from '../../utils/bignum';

export default function CultivateScreen() {
  const game = usePlayerStore(s => s.game);
  const cpsDisplay = usePlayerStore(s => s.cpsDisplay);
  const breakthrough = usePlayerStore(s => s.breakthrough);
  const realm = getRealmById(game.player.realmId);

  return (
    <div className="v2-screen">
      <div className="v2-cultivate-main">
        <div className="v2-realm-display">
          <h2>{realm?.name ?? '?'} {game.player.realmSubLevel}层</h2>
          <div className="v2-cps-large">{cpsDisplay}</div>
        </div>
        <div className="v2-cultivation-value">
          修为：{formatBig(game.player.cultivationXp)}
        </div>
        <button className="v2-btn v2-btn-primary" onClick={() => {
          const r = breakthrough();
          if (!r.success) alert(r.message);
        }}>
          突破
        </button>
      </div>
    </div>
  );
}
