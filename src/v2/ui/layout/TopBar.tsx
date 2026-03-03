import { usePlayerStore } from '../../store/playerStore';
import { getRealmById } from '../../data/realms';
import { formatBig } from '../../utils/bignum';

export default function TopBar() {
  const game = usePlayerStore(s => s.game);
  const cpsDisplay = usePlayerStore(s => s.cpsDisplay);
  const realm = getRealmById(game.player.realmId);

  return (
    <div className="v2-topbar">
      <div className="v2-topbar-left">
        <span className="v2-player-name">{game.player.name}</span>
        <span className="v2-realm">{realm?.name ?? '?'} {game.player.realmSubLevel}层</span>
      </div>
      <div className="v2-topbar-right">
        <span className="v2-resource">修为 {formatBig(game.player.cultivationXp)}</span>
        <span className="v2-cps">{cpsDisplay}</span>
      </div>
    </div>
  );
}
