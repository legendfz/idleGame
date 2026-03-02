/**
 * CharacterPanel — 角色面板详情
 */
import { usePlayerStore } from '../../store/player';
import { getRealmConfig, getCharacterConfig } from '../../data/config';
import { calcAttack, calcDefense, calcHp } from '../../engine/formulas';
import { formatBigNum } from '../../engine/bignum';

export function CharacterPanel() {
  const player = usePlayerStore(s => s.player);
  const realm = getRealmConfig(player.realmId);
  const mult = realm?.multiplier ?? 1;

  const atk = calcAttack(1, mult, 0);
  const def = calcDefense(1, mult, 0);
  const hp = calcHp(1, mult, 0);

  return (
    <div className="character-panel">
      <h3>角色属性</h3>
      <div>攻击: {formatBigNum(atk)}</div>
      <div>防御: {formatBigNum(def)}</div>
      <div>生命: {formatBigNum(hp)}</div>
    </div>
  );
}
