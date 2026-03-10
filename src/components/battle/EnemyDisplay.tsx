import { useGameStore } from '../../store/gameStore';
import { formatNumber } from '../../utils/format';
import { Card, FloatingDamage } from '../../pages/shared';
import { getEnemyElement, getElementMultiplier, ELEMENTS, ElementType } from '../../data/elements';

export function EnemyDisplay() {
  const battle = useGameStore(s => s.battle);
  const clickAttack = useGameStore(s => s.clickAttack);
  const player = useGameStore(s => s.player);
  const getEffectiveStats = useGameStore(s => s.getEffectiveStats);
  const equippedWeapon = useGameStore(s => s.equippedWeapon);
  const enemy = battle.currentEnemy;
  const eStats = getEffectiveStats();

  if (!enemy) return null;

  const hpPct = Math.max(0, (enemy.hp / enemy.maxHp) * 100);

  return (
    <>
      <Card className={`enemy-section${battle.isBossWave ? ' boss-active' : ''}${enemy.elite ? ' elite-active' : ''}`} style={{ textAlign: 'center', padding: '8px 12px' }}>
        <div className={`enemy-emoji${battle.isBossWave ? ' boss-glow' : ''}${enemy.elite ? ' elite-glow' : ''}`}>
          {enemy.emoji || '👾'}
        </div>
        <div className="enemy-name">
          {battle.isBossWave && <span className="color-boss">⚠ </span>}
          {enemy.elite && <span style={{ color: enemy.elite.color, fontWeight: 700 }}>⚡ </span>}
          <span style={enemy.elite ? { color: enemy.elite.color } : undefined}>{enemy.name}</span>
          {(() => {
            const eElem = getEnemyElement(battle.chapterId, enemy.name);
            const eInfo = ELEMENTS[eElem];
            const pElem = equippedWeapon?.element as ElementType | undefined;
            const mul = getElementMultiplier(pElem, eElem);
            const mulLabel = mul > 1 ? ' 克制!' : mul < 1 ? ' 被克' : '';
            const mulColor = mul > 1 ? '#22c55e' : mul < 1 ? '#ef4444' : eInfo.color;
            return <span style={{ marginLeft: 4, color: mulColor, fontSize: 11 }}>{eInfo.emoji}{eInfo.name}{mulLabel}</span>;
          })()}
        </div>
        <div className="hp-bar-bg" style={{ marginTop: 6 }}>
          <div className={`hp-bar-fill${battle.isBossWave ? ' boss' : ''} ${hpPct > 60 ? 'hp-high' : hpPct > 25 ? 'hp-mid' : 'hp-low'}${hpPct < 25 ? ' low' : ''}`} style={{ width: `${hpPct}%` }} />
          <div className="hp-bar-text">{formatNumber(enemy.hp)} / {formatNumber(enemy.maxHp)}</div>
        </div>
        <div className="enemy-sub-stats">
          防御 {formatNumber(enemy.defense)} · 经验 {formatNumber(enemy.expDrop)} · 灵石 {formatNumber(enemy.lingshiDrop)}
          {(() => {
            const ratio = eStats.attack > 0 ? enemy.maxHp / eStats.attack : 999;
            const diff = ratio > 50 ? { label: '🔴极难', color: '#ef4444' } : ratio > 20 ? { label: '🟠困难', color: '#f59e0b' } : ratio > 5 ? { label: '🟡普通', color: '#eab308' } : { label: '🟢轻松', color: '#22c55e' };
            return <span style={{ marginLeft: 6, color: diff.color, fontWeight: 600, fontSize: 10 }}>{diff.label}</span>;
          })()}
        </div>
        <FloatingDamage />
      </Card>

      {/* Click attack area */}
      <div className="click-area" onClick={clickAttack}>
        <div className="wukong-icon">🐵</div>
        <div className="wukong-name">悟空</div>
        <div className="wukong-hint">点击攻击 · 攻击力 {formatNumber(player.clickPower)}</div>
      </div>
    </>
  );
}
