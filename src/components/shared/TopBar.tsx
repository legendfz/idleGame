import { useGameStore } from '../../store/gameStore';
import { REALMS } from '../../data/realms';
import { CHAPTERS } from '../../data/chapters';
import { formatNumber } from '../../utils/format';

export function TopBar() {
  const player = useGameStore(s => s.player);
  const battle = useGameStore(s => s.battle);
  const chapter = CHAPTERS.find(c => c.id === battle.chapterId);

  return (
    <div className="top-bar">
      <div className="location">
        <span className="color-location">{chapter?.name ?? '未知'}</span>
        <span className="color-dim"> · 第{battle.stageNum}关</span>
      </div>
      <div className="resources">
        <span className="color-gold">{formatNumber(player.lingshi)} 灵石</span>
        {'  '}
        <span className="color-pantao">{player.pantao} 蟠桃</span>
        {'  '}
        <span className="color-level">Lv.{player.level}</span>
        {'  '}
        <span className="color-realm">{REALMS[player.realmIndex].name}</span>
      </div>
    </div>
  );
}
