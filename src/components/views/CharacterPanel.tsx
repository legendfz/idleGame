/**
 * CharacterPanel — 角色总览
 * 角色信息 + 属性面板 + 装备预览 + 修为进度
 */
import useGameStore from '../../store';
import { formatBigNum, bn } from '../../engine/bignum';
import { breakthroughCost } from '../../engine/formulas';
import { Card, ProgressBar } from '../ui';
import styles from './CharacterPanel.module.css';

const REALM_NAMES: Record<string, string> = {
  lianqi: '练气', zhuji: '筑基', jiedan: '结丹',
  yuanying: '元婴', huashen: '化神', dacheng: '大乘',
};
const CHAR_NAMES: Record<string, { name: string; emoji: string }> = {
  tangseng: { name: '唐僧', emoji: '🧘' },
  wukong:   { name: '孙悟空', emoji: '🐒' },
  bajie:    { name: '猪八戒', emoji: '🐷' },
  shaseng:  { name: '沙悟净', emoji: '🏔️' },
};

const QUALITY_COLORS = ['#9E9E9E', '#4CAF50', '#2196F3', '#9C27B0', '#FF9800', '#FFD700'];

const SLOT_LABELS = [
  { key: 'weapon',    label: '武器', emoji: '⚔️' },
  { key: 'armor',     label: '防具', emoji: '🛡️' },
  { key: 'accessory', label: '法宝', emoji: '💎' },
  { key: 'mount',     label: '坐骑', emoji: '🐴' },
];

interface StatDef {
  icon: string;
  label: string;
  value: string;
}

export function CharacterPanel() {
  const xiuwei = useGameStore(s => s.xiuwei);
  const gold = useGameStore(s => s.gold);
  const realmId = useGameStore(s => s.realmId);
  const realmStage = useGameStore(s => s.realmStage);
  const level = useGameStore(s => s.level);
  const characterId = useGameStore(s => s.characterId);
  const equipped = useGameStore(s => s.equipped);

  const xiuweiDec = bn(xiuwei);
  const goldDec = bn(gold);
  const cost = breakthroughCost(bn(100), realmStage);
  const realmName = REALM_NAMES[realmId] || realmId;
  const char = CHAR_NAMES[characterId] || { name: '唐僧', emoji: '🧘' };

  const stats: StatDef[] = [
    { icon: '✨', label: '修为',   value: formatBigNum(xiuweiDec) },
    { icon: '🪙', label: '金币',   value: formatBigNum(goldDec) },
    { icon: '📈', label: '等级',   value: `Lv.${level}` },
    { icon: '🌟', label: '境界',   value: `${realmName} ${realmStage + 1}层` },
    { icon: '⚡', label: '攻击',   value: '—' },   // TODO: 从 engine 计算
    { icon: '❤️', label: '血量',   value: '—' },
  ];

  return (
    <div className={styles.root}>
      {/* 角色头部 */}
      <div className={styles.charHeader}>
        <span className={styles.charEmoji}>{char.emoji}</span>
        <div className={styles.charName}>{char.name}</div>
        <div className={styles.charRealm}>{realmName} · 第{realmStage + 1}层</div>
      </div>

      {/* 修为进度 */}
      <Card title="✨ 修为进度" className={styles.expSection}>
        <ProgressBar
          value={Math.min(xiuweiDec.toNumber(), cost.toNumber())}
          max={cost.toNumber()}
          showText
          gradientColors={['#D4A843', '#C13B3B']}
          height={12}
        />
      </Card>

      {/* 属性面板 */}
      <Card title="📊 属性">
        <div className={styles.statsGrid}>
          {stats.map(s => (
            <div key={s.label} className={styles.statItem}>
              <span className={styles.statIcon}>{s.icon}</span>
              <div className={styles.statInfo}>
                <div className={styles.statLabel}>{s.label}</div>
                <div className={styles.statValue}>{s.value}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* 装备预览 */}
      <Card title="⚔️ 装备">
        <div className={styles.equipPreview}>
          {SLOT_LABELS.map(slot => {
            const item = equipped[slot.key];
            return (
              <div
                key={slot.key}
                className={styles.equipRow}
                style={item ? { borderLeftColor: QUALITY_COLORS[item.quality] } : {}}
              >
                <span className={styles.equipSlotLabel}>{slot.emoji} {slot.label}</span>
                {item ? (
                  <span className={styles.equipName} style={{ color: QUALITY_COLORS[item.quality] }}>
                    {item.name} {item.level > 0 ? `+${item.level}` : ''}
                  </span>
                ) : (
                  <span className={styles.equipEmpty}>— 空 —</span>
                )}
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
