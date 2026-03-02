/**
 * CultivationPanel — 修炼主界面
 * 点击区 + 修为产出 + 境界信息 + 突破按钮
 */
import { useCallback } from 'react';
import useGameStore from '../../store';
import { formatBigNum, bn } from '../../engine/bignum';
import { breakthroughCost } from '../../engine/formulas';
import { Button, Card, ProgressBar } from '../ui';
import styles from './CultivationPanel.module.css';

// 临时境界配置（后续从 ConfigDB 读取）
const REALM_NAMES: Record<string, string> = {
  lianqi: '练气', zhuji: '筑基', jiedan: '结丹',
  yuanying: '元婴', huashen: '化神', dacheng: '大乘',
};

export function CultivationPanel() {
  const xiuwei = useGameStore(s => s.xiuwei);
  const realmId = useGameStore(s => s.realmId);
  const realmStage = useGameStore(s => s.realmStage);
  const addXiuwei = useGameStore(s => s.addXiuwei);

  const xiuweiDec = bn(xiuwei);
  const cost = breakthroughCost(bn(100), realmStage);
  const canBreak = xiuweiDec.gte(cost);
  const realmName = REALM_NAMES[realmId] || realmId;

  const handleTap = useCallback(() => {
    // 点击获得修为（基础 1，后续从 engine 计算）
    addXiuwei('1');
  }, [addXiuwei]);

  const handleBreakthrough = useCallback(() => {
    // 突破逻辑由 engine 处理，这里触发 store action
    // TODO: 接入 BreakThroughEngine
  }, []);

  return (
    <div className={styles.root}>
      {/* 境界信息 */}
      <div className={styles.realmInfo}>
        <div className={styles.realmName}>{realmName}</div>
        <div className={styles.realmStage}>第 {realmStage + 1} 层</div>
      </div>

      {/* 修为产出 */}
      <div className={styles.production}>
        修为 <span className={styles.productionValue}>{formatBigNum(xiuweiDec)}</span>
        <br />
        +{formatBigNum(bn(1))}/点击 · +{formatBigNum(bn(0))}/秒
      </div>

      {/* 点击修炼区 */}
      <div className={styles.tapZone} onClick={handleTap}>
        <span className={styles.tapEmoji}>🧘</span>
        <span className={styles.tapHint}>点击修炼</span>
      </div>

      {/* 突破进度 */}
      <Card title="⚡ 境界突破" className={styles.breakthroughSection}>
        <ProgressBar
          value={Math.min(xiuweiDec.toNumber(), cost.toNumber())}
          max={cost.toNumber()}
          icon="✨"
          showText
          gradientColors={['#D4A843', '#C13B3B']}
        />
        <div className={styles.costRow}>
          <span>需要修为</span>
          <span className={styles.costValue}>{formatBigNum(cost)}</span>
        </div>
        <Button
          variant="primary"
          fullWidth
          disabled={!canBreak}
          onClick={handleBreakthrough}
        >
          {canBreak ? '⚡ 突破！' : '修为不足'}
        </Button>
      </Card>
    </div>
  );
}
