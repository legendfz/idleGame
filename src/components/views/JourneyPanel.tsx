/**
 * JourneyPanel — 取经地图
 * 81难关卡列表，已通关/当前/未解锁三态
 */
import useGameStore from '../../store';
import { ProgressBar } from '../ui';
import styles from './JourneyPanel.module.css';

// 临时关卡数据（后续从 ConfigDB 读取）
const STAGES = [
  { id: 0,  name: '第一难 · 五行山',   boss: '五行山石灵',   emoji: '🏔️',  lvReq: 1 },
  { id: 1,  name: '第二难 · 鹰愁涧',   boss: '小白龙',       emoji: '🌊',  lvReq: 10 },
  { id: 2,  name: '第三难 · 观音院',   boss: '黑风怪',       emoji: '🏛️',  lvReq: 20 },
  { id: 3,  name: '第四难 · 黄风岭',   boss: '黄风大王',     emoji: '🌪️',  lvReq: 30 },
  { id: 4,  name: '第五难 · 火焰山',   boss: '牛魔王',       emoji: '🔥',  lvReq: 50 },
  { id: 5,  name: '第六难 · 盘丝洞',   boss: '蜘蛛精',       emoji: '🕸️',  lvReq: 70 },
  { id: 6,  name: '第七难 · 狮驼岭',   boss: '大鹏金翅雕',   emoji: '🦅',  lvReq: 90 },
  { id: 7,  name: '第八难 · 灵山',     boss: '???',           emoji: '🏔️',  lvReq: 100 },
];

function renderStars(count: number): string {
  return '★'.repeat(count) + '☆'.repeat(Math.max(0, 3 - count));
}

export function JourneyPanel() {
  const currentStage = useGameStore(s => s.currentStage);
  const maxStage = useGameStore(s => s.maxStage);
  const stars = useGameStore(s => s.stars);
  const totalStages = useGameStore(s => s.totalStages);

  return (
    <div className={styles.root}>
      <div className={styles.title}>═══ 🗺️ 取经之路 ═══</div>

      <div className={styles.progress}>
        📍 第 {currentStage + 1} 难 / {totalStages} 难
      </div>

      <ProgressBar
        value={maxStage + 1}
        max={totalStages}
        showText
        gradientColors={['#3A7D44', '#D4A843']}
        height={8}
      />

      <div className={styles.stageList}>
        {STAGES.map((stage, i) => {
          const isCleared = i < currentStage;
          const isCurrent = i === currentStage;
          const isLocked = i > maxStage + 1;

          const cardClass = [
            styles.stageCard,
            isCleared ? styles.stageCleared : '',
            isCurrent ? styles.stageCurrent : '',
            isLocked ? styles.stageLocked : '',
          ].filter(Boolean).join(' ');

          return (
            <div key={stage.id}>
              {i > 0 && <div className={styles.connector} />}
              <div className={cardClass}>
                <span className={styles.stageIcon}>
                  {isCleared ? '✅' : isCurrent ? '🔥' : '🔒'}
                </span>
                <div className={styles.stageInfo}>
                  <div className={styles.stageName}>
                    {stage.emoji} {stage.name}
                  </div>
                  <div className={styles.stageBoss}>
                    Boss: {stage.boss}
                  </div>
                  <div className={styles.stageDesc}>
                    {isCleared
                      ? `通关`
                      : isCurrent
                        ? `推荐 Lv.${stage.lvReq}`
                        : `需通关上一难 · Lv.${stage.lvReq}`
                    }
                  </div>
                  {isCleared && (
                    <div className={styles.stageStars}>
                      {renderStars(stars[String(stage.id)] || 0)}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
