/**
 * BattlePanel — 战斗界面
 * 怪物血条 + 点击攻击 + 战斗日志 + 收益
 */
import { useCallback } from 'react';
import useGameStore from '../../store';
import { formatBigNum, bn } from '../../engine/bignum';
import { Card, ProgressBar, Button } from '../ui';
import styles from './BattlePanel.module.css';

export function BattlePanel() {
  const active = useGameStore(s => s.active);
  const monsterHp = useGameStore(s => s.monsterHp);
  const monsterMaxHp = useGameStore(s => s.monsterMaxHp);
  const isBoss = useGameStore(s => s.isBoss);
  const stageId = useGameStore(s => s.stageId);
  const startBattle = useGameStore(s => s.startBattle);
  const setMonsterHp = useGameStore(s => s.setMonsterHp);

  const hp = bn(monsterHp);
  const maxHp = bn(monsterMaxHp);
  const hpPct = maxHp.gt(0) ? hp.div(maxHp).toNumber() * 100 : 0;

  // HP 条颜色
  const hpColor = hpPct > 50
    ? 'var(--color-success)'
    : hpPct > 20
      ? 'var(--color-accent)'
      : 'var(--color-primary)';

  const handleTapAttack = useCallback(() => {
    if (!active) return;
    // 简易点击伤害，后续由 BattleCalc.tap() 处理
    const dmg = 10;
    const newHp = Math.max(0, Number(monsterHp) - dmg);
    setMonsterHp(String(newHp));
  }, [active, monsterHp, setMonsterHp]);

  const handleStartBattle = useCallback(() => {
    startBattle('stage-1', '1000', false);
  }, [startBattle]);

  if (!active) {
    return (
      <div className={styles.root}>
        <div className={styles.idle}>
          <span className={styles.idleEmoji}>⚔️</span>
          <div>暂无战斗</div>
          <Button variant="primary" onClick={handleStartBattle}>
            开始战斗
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.root}>
      {/* 怪物信息 */}
      <Card className={styles.monsterSection}>
        <span className={styles.monsterEmoji}>{isBoss ? '🐉' : '👹'}</span>
        <div className={styles.monsterName}>
          {isBoss ? '牛魔王' : '石头精'}
          {isBoss && <span className={styles.bossTag}>BOSS</span>}
        </div>
        <ProgressBar
          value={hp.toNumber()}
          max={maxHp.toNumber()}
          icon="❤️"
          showText
          color={hpColor}
          height={20}
        />
      </Card>

      {/* 点击攻击 */}
      <div className={styles.tapAttack} onClick={handleTapAttack}>
        <span className={styles.tapAttackEmoji}>🐒</span>
        <span className={styles.tapAttackLabel}>👆 点击攻击</span>
      </div>

      {/* 战斗日志 */}
      <div className={styles.log}>
        <div>🐒 悟空 → 👹 石头精 -10</div>
        <div className={styles.logCrit}>🐒 悟空 →→ 👹 -20 💥暴击!</div>
        <div className={styles.logKill}>👹 石头精 💀 击败!</div>
        <div className={styles.logDrop}>→ 🪙 +500 ✨ +120</div>
      </div>

      {/* 收益统计 */}
      <div className={styles.earningsRow}>
        <span>🪙 <span className={styles.earningsValue}>+350/秒</span></span>
        <span>✨ <span className={styles.earningsValue}>+42/秒</span></span>
      </div>
    </div>
  );
}
