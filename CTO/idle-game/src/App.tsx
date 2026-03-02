import { useEffect, useRef, useState, ReactNode } from 'react';
import { useGameStore } from './store/gameStore';
import { REALMS } from './data/realms';
import { CHAPTERS } from './data/chapters';
import {
  getEquipEffectiveStat, getEnhanceCost, getMaxEnhanceLevel, getActiveSetBonuses,
  isHighEnhance, getHighEnhanceRate, getHighEnhanceDrop,
  canRefine, getRefineCost, REFINE_MATERIAL_COUNT, REFINE_SHARD_PITY,
  hasHiddenPassive, hasFullMythic15, SCROLL_PRICES,
} from './data/equipment';
import { formatNumber, expForLevel, formatTime, formatDuration } from './utils/format';
import { EquipmentItem, EquipSlot, QUALITY_INFO, INVENTORY_MAX, FloatingText } from './types';
import FeedbackForm from './components/FeedbackForm';
import DungeonList from './components/DungeonList';
import DungeonBattle from './components/DungeonBattle';
import AchievementList from './components/AchievementList';
import Leaderboard from './components/Leaderboard';
import { useDungeonStore } from './store/dungeonStore';
import { useAchievementStore } from './store/achievementStore';
import { useLeaderboardStore } from './store/leaderboardStore';

// ─── Card wrapper component ───
function Card({ title, titleColor, children, className, style, borderColor, onClick }: {
  title?: string; titleColor?: string; children: ReactNode;
  className?: string; style?: React.CSSProperties; borderColor?: string;
  onClick?: () => void;
}) {
  return (
    <div className={`card ${className ?? ''}`} style={{ ...style, borderColor }} onClick={onClick}>
      {title && <div className="card-title" style={{ color: titleColor ?? 'var(--accent)' }}>{title}</div>}
      {children}
    </div>
  );
}

// ─── Sub-page navigation ───
type SubPage =
  | { type: 'none' }
  | { type: 'equipDetail'; item: EquipmentItem; location: 'equipped' | 'inventory' }
  | { type: 'refine' }
  | { type: 'shop' }
  | { type: 'characterDetail' }
  | { type: 'chapterSelect' }
  | { type: 'saveManager' }
  | { type: 'dungeonList' }
  | { type: 'dungeonBattle' }
  | { type: 'achievements' }
  | { type: 'leaderboard' };

function SubPageHeader({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <div className="subpage-header">
      <button className="back-btn" onClick={onBack}>← 返回</button>
      <span className="subpage-title">{title}</span>
    </div>
  );
}

// ─── TopBar ───
function TopBar() {
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

// ─── Floating Damage Text ───
function FloatingDamage() {
  const floats = useGameStore(s => s.floatingTexts);
  const clearFloat = useGameStore(s => s.clearFloatingText);

  useEffect(() => {
    if (floats.length === 0) return;
    const timer = setTimeout(() => {
      const oldest = floats[0];
      if (oldest) clearFloat(oldest.id);
    }, 800);
    return () => clearTimeout(timer);
  }, [floats, clearFloat]);

  return (
    <div className="floating-container">
      {floats.map((f, i) => (
        <div key={f.id} className={`floating-text float-${f.type}`} style={{ animationDelay: `${i * 50}ms` }}>
          {f.text}
        </div>
      ))}
    </div>
  );
}

// ─── Boss Entrance Toast ───
function BossToast() {
  const battle = useGameStore(s => s.battle);
  const [show, setShow] = useState(false);
  const prevBoss = useRef(false);

  useEffect(() => {
    if (battle.isBossWave && !prevBoss.current) {
      setShow(true);
      const timer = setTimeout(() => setShow(false), 2000);
      return () => clearTimeout(timer);
    }
    prevBoss.current = battle.isBossWave;
  }, [battle.isBossWave]);

  if (!show || !battle.currentEnemy) return null;

  return (
    <div className="boss-toast">
      <div className="boss-toast-inner">
        <span className="color-boss">BOSS 驾到！</span>
        <div className="boss-toast-name">{battle.currentEnemy.name}</div>
      </div>
    </div>
  );
}

// ─── Battle View ───
function BattleView() {
  const battle = useGameStore(s => s.battle);
  const clickAttack = useGameStore(s => s.clickAttack);
  const player = useGameStore(s => s.player);
  const getEffectiveStats = useGameStore(s => s.getEffectiveStats);
  const idleStats = useGameStore(s => s.idleStats);
  const eStats = getEffectiveStats();
  const enemy = battle.currentEnemy;
  const hpPct = enemy ? Math.max(0, (enemy.hp / enemy.maxHp) * 100) : 0;

  return (
    <div className="main-content fade-in">
      {enemy && (
        <Card className="enemy-section">
          <div className="enemy-name">
            {battle.isBossWave && <span className="color-boss">[BOSS] </span>}
            <span>{enemy.name}</span>
            <span style={{ float: 'right', fontSize: 12 }} className="color-dim">
              [{battle.wave}/{battle.maxWaves + 1}]
            </span>
          </div>
          <div className="hp-bar-bg">
            <div className="hp-bar-fill" style={{ width: `${hpPct}%` }} />
            <div className="hp-bar-text">{formatNumber(enemy.hp)} / {formatNumber(enemy.maxHp)}</div>
          </div>
          <FloatingDamage />
        </Card>
      )}

      <div className="click-area" onClick={clickAttack}>
        <div style={{ fontSize: 28, color: 'var(--accent)' }}>悟空</div>
        <div style={{ fontSize: 12, marginTop: 4 }} className="color-dim">
          点击攻击 (攻击力 {player.clickPower})
        </div>
      </div>

      <Card className="stats-card">
        <div className="stats-row">
          <span className="color-attack">攻 {formatNumber(eStats.attack)}</span>
          <span className="color-hp">血 {formatNumber(eStats.maxHp)}</span>
          <span className="color-crit">暴 {eStats.critRate.toFixed(0)}%</span>
          <span className="color-exp">经验 {formatNumber(player.exp)}/{formatNumber(expForLevel(player.level))}</span>
        </div>
      </Card>

      <Card className="idle-stats-card">
        <div className="idle-stats">
          <span className="color-gold">+{formatNumber(Math.floor(idleStats.goldPerSec))}/秒</span>
          {'  '}
          <span className="color-exp">+{formatNumber(Math.floor(idleStats.expPerSec))}/秒</span>
          {'  '}
          <span className="color-dim">挂机 {formatTime(idleStats.sessionTime)}</span>
        </div>
      </Card>

      <Card className="battle-log-card">
        <div className="battle-log">
          {battle.log.map(entry => (
            <div key={entry.id} className={`log-${entry.type}`}>{entry.text}</div>
          ))}
        </div>
      </Card>

      <BossToast />
    </div>
  );
}

// ─── Character Detail Sub-page ───
function CharacterDetailPage({ onBack }: { onBack: () => void }) {
  const player = useGameStore(s => s.player);
  const getEffectiveStats = useGameStore(s => s.getEffectiveStats);
  const attemptBreakthrough = useGameStore(s => s.attemptBreakthrough);
  const eStats = getEffectiveStats();
  const currentRealm = REALMS[player.realmIndex];
  const nextRealm = REALMS[player.realmIndex + 1];
  const canBreak = nextRealm && player.level >= nextRealm.levelReq && player.pantao >= nextRealm.pantaoReq;

  return (
    <div className="main-content fade-in">
      <SubPageHeader title="角色详情" onBack={onBack} />

      <Card title={player.name} titleColor="var(--accent)">
        <div className="stat-grid">
          <div className="stat-item"><span className="stat-label">攻击</span><span className="color-attack">{formatNumber(eStats.attack)}</span></div>
          <div className="stat-item"><span className="stat-label">血量</span><span className="color-hp">{formatNumber(eStats.maxHp)}</span></div>
          <div className="stat-item"><span className="stat-label">速度</span><span className="color-speed">{eStats.speed.toFixed(1)}</span></div>
          <div className="stat-item"><span className="stat-label">暴击率</span><span className="color-crit">{eStats.critRate.toFixed(0)}%</span></div>
          <div className="stat-item"><span className="stat-label">暴击伤害</span><span className="color-crit">{eStats.critDmg.toFixed(1)}x</span></div>
          <div className="stat-item"><span className="stat-label">点击攻击</span><span className="color-attack">{player.clickPower}</span></div>
        </div>
      </Card>

      <Card title={`境界 · ${currentRealm.name}`} titleColor="var(--realm-color)">
        <div className="color-dim" style={{ fontSize: 12 }}>{currentRealm.description}</div>
        {nextRealm && (
          <>
            <div style={{ fontSize: 12, marginTop: 12 }} className="color-dim">
              下一境界：{nextRealm.name} (Lv.{nextRealm.levelReq} + {nextRealm.pantaoReq} 蟠桃)
            </div>
            <button className="breakthrough-btn" disabled={!canBreak} onClick={attemptBreakthrough}>
              {canBreak ? '突破！' : '条件不足'}
            </button>
          </>
        )}
      </Card>
    </div>
  );
}

// ─── Team View ───
function TeamView({ setSubPage }: { setSubPage: (p: SubPage) => void }) {
  const player = useGameStore(s => s.player);
  const getEffectiveStats = useGameStore(s => s.getEffectiveStats);
  const eStats = getEffectiveStats();
  const currentRealm = REALMS[player.realmIndex];

  return (
    <div className="main-content fade-in">
      <h3 className="section-title">队伍</h3>

      <Card className="clickable-card" style={{ cursor: 'pointer' }}
        onClick={() => setSubPage({ type: 'characterDetail' })}>
        <div className="card-title" style={{ color: 'var(--accent)' }}>{player.name}</div>
        <div className="stat-grid-compact">
          <span className="color-attack">攻 {formatNumber(eStats.attack)}</span>
          <span className="color-hp">血 {formatNumber(eStats.maxHp)}</span>
          <span className="color-crit">暴 {eStats.critRate.toFixed(0)}%</span>
        </div>
        <div className="card-footer">
          <span className="color-realm">{currentRealm.name}</span>
          <span className="color-dim">Lv.{player.level}</span>
          <span className="color-dim" style={{ marginLeft: 'auto' }}>查看详情 →</span>
        </div>
      </Card>
    </div>
  );
}

// ─── Chapter Select Sub-page ───
function ChapterSelectPage({ onBack }: { onBack: () => void }) {
  const battle = useGameStore(s => s.battle);
  const highestChapter = useGameStore(s => s.highestChapter);
  const [expandedChapter, setExpandedChapter] = useState<number | null>(null);

  return (
    <div className="main-content fade-in">
      <SubPageHeader title="章节选择" onBack={onBack} />
      {CHAPTERS.map(ch => {
        const isCurrent = ch.id === battle.chapterId;
        const isCleared = ch.id < highestChapter || (ch.id === highestChapter && battle.stageNum > ch.stages);
        const isLocked = ch.id > highestChapter;
        const isExpanded = expandedChapter === ch.id;

        return (
          <div key={ch.id}>
            <Card
              className={`chapter-card ${isLocked ? 'locked' : ''} ${isCurrent ? 'current' : ''}`}
              style={{ cursor: isLocked ? 'default' : 'pointer' }}
              onClick={() => !isLocked && setExpandedChapter(isExpanded ? null : ch.id)}
            >
              <div className="chapter-header">
                <span className={isCleared ? 'color-success' : isCurrent ? 'color-active' : 'color-dim'}>
                  {isCleared ? '[已通关]' : isCurrent ? '[进行中]' : '[未解锁]'}
                </span>
                {' '}第{ch.id}章 {ch.name}
              </div>
              <div style={{ fontSize: 12 }} className="color-dim">
                {ch.description} · Lv.{ch.levelRange[0]}-{ch.levelRange[1]}
                {isCurrent && ` · 进度 ${battle.stageNum}/${ch.stages}`}
              </div>
              {(isCurrent || isCleared) && (
                <div className="chapter-progress-bg">
                  <div className="chapter-progress-fill"
                    style={{ width: `${isCleared ? 100 : (battle.stageNum / ch.stages) * 100}%` }} />
                </div>
              )}
            </Card>
            {isExpanded && isCurrent && (
              <div className="sub-stages">
                {Array.from({ length: Math.min(battle.stageNum + 2, ch.stages) }, (_, i) => {
                  const stageNum = i + 1;
                  const cleared = stageNum < battle.stageNum;
                  const current = stageNum === battle.stageNum;
                  return (
                    <div key={stageNum} className="sub-stage-item">
                      <span className={cleared ? 'color-success' : current ? 'color-active' : 'color-dim'}>
                        {cleared ? '[通关]' : current ? '[当前]' : '[未至]'}
                      </span>
                      {' '}第{stageNum}关
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Journey View ───
function JourneyView({ setSubPage }: { setSubPage: (p: SubPage) => void }) {
  const battle = useGameStore(s => s.battle);
  const highestChapter = useGameStore(s => s.highestChapter);
  const chapter = CHAPTERS.find(c => c.id === battle.chapterId);

  return (
    <div className="main-content fade-in">
      <h3 className="section-title">西游之路</h3>

      <Card title="当前进度" className="clickable-card"
        style={{ cursor: 'pointer' }}
        onClick={() => setSubPage({ type: 'chapterSelect' })}>
        <div>
          <span className="color-active">第{battle.chapterId}章</span>
          {' '}{chapter?.name}
        </div>
        <div className="color-dim" style={{ fontSize: 12 }}>
          进度 {battle.stageNum}/{chapter?.stages} · 已解锁 {highestChapter} 章
        </div>
        <div className="chapter-progress-bg" style={{ marginTop: 8 }}>
          <div className="chapter-progress-fill"
            style={{ width: `${chapter ? (battle.stageNum / chapter.stages) * 100 : 0}%` }} />
        </div>
        <div className="color-dim" style={{ fontSize: 11, marginTop: 4, textAlign: 'right' }}>
          查看全部章节 →
        </div>
      </Card>

      {/* v1.3: Dungeon, Achievement, Leaderboard */}
      <Card title="🗺️ 取经副本" className="clickable-card"
        style={{ cursor: 'pointer' }}
        onClick={() => setSubPage({ type: 'dungeonList' })}>
        <div className="color-dim" style={{ fontSize: 12 }}>
          挑战西游取经路线 Boss 战，获取稀有奖励
        </div>
        <div className="color-dim" style={{ fontSize: 11, marginTop: 4, textAlign: 'right' }}>
          进入副本 →
        </div>
      </Card>

      <Card title="🏆 成就" className="clickable-card"
        style={{ cursor: 'pointer' }}
        onClick={() => setSubPage({ type: 'achievements' })}>
        <div className="color-dim" style={{ fontSize: 12 }}>
          里程碑与挑战成就，获取永久属性加成
        </div>
        <div className="color-dim" style={{ fontSize: 11, marginTop: 4, textAlign: 'right' }}>
          查看成就 →
        </div>
      </Card>

      <Card title="📊 排行榜" className="clickable-card"
        style={{ cursor: 'pointer' }}
        onClick={() => setSubPage({ type: 'leaderboard' })}>
        <div className="color-dim" style={{ fontSize: 12 }}>
          查看你的历史最佳记录
        </div>
        <div className="color-dim" style={{ fontSize: 11, marginTop: 4, textAlign: 'right' }}>
          查看排行 →
        </div>
      </Card>
    </div>
  );
}

// ─── Equipment Detail Sub-page ───
function EquipDetailPage({ item, onBack }: { item: EquipmentItem; onBack: () => void }) {
  const enhance = useGameStore(s => s.enhanceEquip);
  const player = useGameStore(s => s.player);
  const [useProtect, setUseProtect] = useState(false);
  const [useLucky, setUseLucky] = useState(false);

  const stat = getEquipEffectiveStat(item);
  const maxLvl = getMaxEnhanceLevel(item);
  const atMax = item.level >= maxLvl;
  const cost = !atMax ? getEnhanceCost(item) : 0;
  const canEnhanceNow = !atMax && player.lingshi >= cost;
  const qi = QUALITY_INFO[item.quality];
  const highEnhance = isHighEnhance(item);
  const hidden = hasHiddenPassive(item);
  const targetLvl = item.level + 1;
  const rate = highEnhance ? getHighEnhanceRate(targetLvl) + (useLucky ? 10 : 0) : 100;
  const drop = highEnhance ? (useProtect ? 0 : getHighEnhanceDrop(targetLvl)) : 0;

  return (
    <div className="main-content fade-in">
      <SubPageHeader title="装备详情" onBack={onBack} />

      <Card borderColor={qi.color}>
        <div className="equip-detail-header">
          <span style={{ color: qi.color, fontSize: 18, fontWeight: 'bold' }}>
            {qi.symbol} {item.name} {item.level > 0 ? `+${item.level}` : ''}
          </span>
          <span style={{ color: qi.color, fontSize: 12 }}>{qi.label}</span>
        </div>

        <div className="equip-detail-stats">
          {item.slot === 'weapon' && <div className="stat-row"><span className="stat-label">攻击加成</span><span className="color-attack">+{formatNumber(stat)}</span></div>}
          {item.slot === 'armor' && <div className="stat-row"><span className="stat-label">血量加成</span><span className="color-hp">+{formatNumber(stat)}</span></div>}
          {item.passive && <div className="stat-row"><span className="stat-label">被动</span><span className="color-passive">{item.passive.description}</span></div>}
          {item.setId && <div className="stat-row"><span className="stat-label">套装</span><span className="color-set">已激活</span></div>}
          {hidden && <div className="stat-row"><span className="stat-label">隐藏</span><span className="color-boss">{hidden.name}</span></div>}
        </div>
      </Card>

      {!atMax && (
        <Card title="强化">
          <div className="enhance-info">
            <div className="stat-row">
              <span className="stat-label">等级</span>
              <span>{item.level} / {maxLvl}</span>
            </div>
            <div className="stat-row">
              <span className="stat-label">费用</span>
              <span className="color-gold">{formatNumber(cost)} 灵石</span>
            </div>
            {highEnhance && (
              <>
                <div className="stat-row">
                  <span className="stat-label">成功率</span>
                  <span style={{ color: rate >= 50 ? 'var(--green)' : rate >= 30 ? 'var(--accent)' : 'var(--red)' }}>
                    {rate}%
                  </span>
                </div>
                {drop > 0 && (
                  <div className="stat-row">
                    <span className="stat-label">失败降级</span>
                    <span className="color-boss">-{drop}级</span>
                  </div>
                )}
                <div className="scroll-toggles">
                  <label className="scroll-label">
                    <input type="checkbox" checked={useProtect} onChange={e => setUseProtect(e.target.checked)} />
                    护级符({player.protectScrolls})
                  </label>
                  <label className="scroll-label">
                    <input type="checkbox" checked={useLucky} onChange={e => setUseLucky(e.target.checked)} />
                    幸运符({player.luckyScrolls})
                  </label>
                </div>
              </>
            )}
          </div>
          <button className="action-btn accent" disabled={!canEnhanceNow}
            onClick={() => enhance(item.uid, useProtect, useLucky)}>
            {highEnhance ? '高阶强化' : '强化'} · {formatNumber(cost)} 灵石
          </button>
        </Card>
      )}
      {atMax && (
        <Card><div className="color-accent" style={{ textAlign: 'center', padding: 8 }}>已满级</div></Card>
      )}
    </div>
  );
}

// ─── Equipment Slot Display (compact, in bag list) ───
function EquipSlotDisplay({ label, item, slot, onDetail }: {
  label: string; item: EquipmentItem | null; slot: EquipSlot; onDetail: (item: EquipmentItem) => void;
}) {
  const unequip = useGameStore(s => s.unequipSlot);

  if (!item) {
    return (
      <Card className="equip-slot-card empty">
        <span className="slot-label">{label}</span>
        <span className="color-dim">— 空 —</span>
      </Card>
    );
  }

  const qi = QUALITY_INFO[item.quality];
  const stat = getEquipEffectiveStat(item);

  return (
    <Card className="equip-slot-card" borderColor={qi.color} style={{ cursor: 'pointer' }}
      onClick={() => onDetail(item)}>
      <div className="equip-header">
        <span style={{ color: qi.color }}>
          {qi.symbol} {item.name} {item.level > 0 ? `+${item.level}` : ''}
        </span>
        <span style={{ color: qi.color, fontSize: 11 }}>{qi.label}</span>
      </div>
      <div className="equip-stats">
        {item.slot === 'weapon' && <span className="color-attack">攻+{formatNumber(stat)}</span>}
        {item.slot === 'armor' && <span className="color-hp">血+{formatNumber(stat)}</span>}
        {item.passive && <span className="color-passive">{item.passive.description}</span>}
      </div>
      <div className="equip-actions">
        <button className="small-btn" onClick={(e) => { e.stopPropagation(); unequip(slot); }}>卸下</button>
        <span className="color-dim" style={{ fontSize: 11 }}>点击查看详情</span>
      </div>
    </Card>
  );
}

// ─── Refine Sub-page ───
function RefinePage({ onBack }: { onBack: () => void }) {
  const inventory = useGameStore(s => s.inventory);
  const player = useGameStore(s => s.player);
  const refineItem = useGameStore(s => s.refineItem);
  const [targetUid, setTargetUid] = useState<string | null>(null);
  const [selectedMats, setSelectedMats] = useState<Set<string>>(new Set());
  const [useTianming, setUseTianming] = useState(false);

  const legendaryItems = inventory.filter(i => i.quality === 'legendary');
  const target = legendaryItems.find(i => i.uid === targetUid);
  const availableMats = legendaryItems.filter(i => i.uid !== targetUid);

  const toggleMat = (uid: string) => {
    const next = new Set(selectedMats);
    if (next.has(uid)) next.delete(uid); else if (next.size < REFINE_MATERIAL_COUNT) next.add(uid);
    setSelectedMats(next);
  };

  const cost = target ? getRefineCost(target) : 0;
  const canRefineNow = target && selectedMats.size >= REFINE_MATERIAL_COUNT && player.lingshi >= cost;
  const canPity = target && selectedMats.size >= REFINE_MATERIAL_COUNT && player.hongmengShards >= REFINE_SHARD_PITY && player.lingshi >= cost;

  return (
    <div className="main-content fade-in">
      <SubPageHeader title="精炼 · 混沌→鸿蒙" onBack={onBack} />

      {legendaryItems.length === 0 ? (
        <Card><div className="color-dim" style={{ textAlign: 'center', padding: 16 }}>没有可精炼的混沌装备</div></Card>
      ) : (
        <>
          <Card title="选择目标 (混沌装备)">
            <div className="refine-targets">
              {legendaryItems.map(item => (
                <button key={item.uid}
                  className={`small-btn ${targetUid === item.uid ? 'accent' : ''}`}
                  onClick={() => { setTargetUid(item.uid === targetUid ? null : item.uid); setSelectedMats(new Set()); }}>
                  {item.name}{item.level > 0 ? `+${item.level}` : ''}
                </button>
              ))}
            </div>
          </Card>

          {target && (
            <>
              <Card title="选择材料">
                <div className="color-dim" style={{ fontSize: 12, marginBottom: 8 }}>
                  混沌装备 x{selectedMats.size}/{REFINE_MATERIAL_COUNT}
                </div>
                <div className="refine-targets">
                  {availableMats.map(item => (
                    <button key={item.uid}
                      className={`small-btn ${selectedMats.has(item.uid) ? 'accent' : ''}`}
                      onClick={() => toggleMat(item.uid)}>
                      {selectedMats.has(item.uid) ? '[已选] ' : ''}{item.name}
                    </button>
                  ))}
                </div>
              </Card>

              <Card title="精炼信息">
                <div className="stat-row">
                  <span className="stat-label">费用</span>
                  <span className="color-gold">{formatNumber(cost)} 灵石</span>
                </div>
                <div className="stat-row">
                  <span className="stat-label">成功率</span>
                  <span className="color-crit">{useTianming ? '15%' : '10%'}</span>
                </div>
                <div className="stat-row">
                  <span className="stat-label">鸿蒙碎片</span>
                  <span className="color-set">{player.hongmengShards}/{REFINE_SHARD_PITY}</span>
                </div>
                <label className="scroll-label" style={{ marginTop: 4 }}>
                  <input type="checkbox" checked={useTianming} onChange={e => setUseTianming(e.target.checked)} />
                  天命符({player.tianmingScrolls}) +5%成功率
                </label>
                <div className="equip-actions" style={{ marginTop: 8 }}>
                  <button className="action-btn accent" disabled={!canRefineNow}
                    onClick={() => { refineItem(target.uid, [...selectedMats], useTianming, false); setTargetUid(null); setSelectedMats(new Set()); }}>
                    精炼
                  </button>
                  <button className="action-btn" disabled={!canPity}
                    style={{ background: canPity ? '#ce93d8' : undefined }}
                    onClick={() => { refineItem(target.uid, [...selectedMats], false, true); setTargetUid(null); setSelectedMats(new Set()); }}>
                    碎片保底 ({player.hongmengShards}/{REFINE_SHARD_PITY})
                  </button>
                </div>
              </Card>
            </>
          )}
        </>
      )}
    </div>
  );
}

// ─── Shop Sub-page ───
function ShopPage({ onBack }: { onBack: () => void }) {
  const player = useGameStore(s => s.player);
  const buyScroll = useGameStore(s => s.buyScroll);

  const scrolls = [
    { type: 'tianming' as const, name: '天命符', desc: '精炼成功率+5%', price: SCROLL_PRICES.tianming, count: player.tianmingScrolls },
    { type: 'protect' as const, name: '护级符', desc: '高阶强化失败不降级', price: SCROLL_PRICES.protect, count: player.protectScrolls },
    { type: 'lucky' as const, name: '幸运符', desc: '高阶强化成功率+10%', price: SCROLL_PRICES.lucky, count: player.luckyScrolls },
  ];

  return (
    <div className="main-content fade-in">
      <SubPageHeader title="道具商店" onBack={onBack} />
      <Card>
        <div className="color-dim" style={{ fontSize: 12, marginBottom: 8 }}>蟠桃余额：<span className="color-pantao">{player.pantao}</span></div>
        {scrolls.map(s => (
          <Card key={s.type} className="shop-item-card">
            <div className="shop-item-header">
              <span className="color-accent">{s.name}</span>
              <span className="color-dim">x{s.count}</span>
            </div>
            <div className="color-dim" style={{ fontSize: 11 }}>{s.desc}</div>
            <button className="small-btn accent" disabled={player.pantao < s.price}
              onClick={() => buyScroll(s.type)} style={{ marginTop: 4 }}>
              购买 · {s.price} 蟠桃
            </button>
          </Card>
        ))}
      </Card>
    </div>
  );
}

// ─── Save Manager Sub-page ───
function SaveManagerPage({ onBack }: { onBack: () => void }) {
  const saveToSlot = useGameStore(s => s.saveToSlot);
  const loadFromSlot = useGameStore(s => s.loadFromSlot);
  const deleteSlot = useGameStore(s => s.deleteSlot);
  const getSaveSlots = useGameStore(s => s.getSaveSlots);
  const [slots, setSlots] = useState(getSaveSlots());
  const [message, setMessage] = useState('');

  const refresh = () => setSlots(getSaveSlots());

  const handleSave = (slotId: number) => {
    const slotData = slots.find(s => s.id === slotId);
    if (slotData?.hasData && !confirm(`槽位 ${slotId} 已有存档，确定覆盖？`)) return;
    saveToSlot(slotId);
    refresh();
    setMessage(`已保存到槽位 ${slotId}`);
    setTimeout(() => setMessage(''), 2000);
  };

  const handleLoad = (slotId: number) => {
    if (!confirm(`确定加载槽位 ${slotId} 的存档？当前进度将丢失！`)) return;
    loadFromSlot(slotId);
    refresh();
    setMessage(`已加载槽位 ${slotId}`);
    setTimeout(() => setMessage(''), 2000);
  };

  const handleDelete = (slotId: number) => {
    if (!confirm(`确定删除槽位 ${slotId} 的存档？`)) return;
    deleteSlot(slotId);
    refresh();
    setMessage(`已删除槽位 ${slotId}`);
    setTimeout(() => setMessage(''), 2000);
  };

  return (
    <div className="main-content fade-in">
      <SubPageHeader title="存档管理" onBack={onBack} />

      {message && (
        <div className="save-message">{message}</div>
      )}

      {slots.map(slot => (
        <Card key={slot.id} className="save-slot-card">
          <div className="save-slot-header">
            <span className="color-accent">存档槽 {slot.id}</span>
            {slot.hasData ? (
              <span className="color-success">[有数据]</span>
            ) : (
              <span className="color-dim">[空]</span>
            )}
          </div>
          {slot.hasData && slot.summary && (
            <div className="save-slot-info">
              <div className="stat-row"><span className="stat-label">角色</span><span>{slot.summary.name} Lv.{slot.summary.level}</span></div>
              <div className="stat-row"><span className="stat-label">境界</span><span className="color-realm">{slot.summary.realm}</span></div>
              <div className="stat-row"><span className="stat-label">章节</span><span>第{slot.summary.chapter}章 第{slot.summary.stage}关</span></div>
              <div className="stat-row"><span className="stat-label">游戏时间</span><span>{formatTime(slot.summary.playTime)}</span></div>
              <div className="stat-row"><span className="stat-label">保存时间</span><span className="color-dim">{new Date(slot.summary.savedAt).toLocaleString()}</span></div>
            </div>
          )}
          <div className="save-slot-actions">
            <button className="small-btn accent" onClick={() => handleSave(slot.id)}>保存</button>
            {slot.hasData && (
              <>
                <button className="small-btn" onClick={() => handleLoad(slot.id)}>加载</button>
                <button className="small-btn danger" onClick={() => handleDelete(slot.id)}>删除</button>
              </>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}

// ─── Bag View ───
function BagView({ setSubPage }: { setSubPage: (p: SubPage) => void }) {
  const weapon = useGameStore(s => s.equippedWeapon);
  const armor = useGameStore(s => s.equippedArmor);
  const treasure = useGameStore(s => s.equippedTreasure);
  const inventory = useGameStore(s => s.inventory);
  const equipItem = useGameStore(s => s.equipItem);
  const sellEquip = useGameStore(s => s.sellEquip);
  const decomposeEquip = useGameStore(s => s.decomposeEquip);
  const batchDecompose = useGameStore(s => s.batchDecompose);
  const player = useGameStore(s => s.player);
  const [filter, setFilter] = useState<EquipSlot | 'all'>('all');
  const [decomposeMode, setDecomposeMode] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toggleSelect = (uid: string) => {
    setSelected(prev => { const next = new Set(prev); if (next.has(uid)) next.delete(uid); else next.add(uid); return next; });
  };

  const smartRecommend = () => {
    const qualityOrder = Object.keys(QUALITY_INFO);
    const sorted = [...inventory].sort((a, b) => {
      const qa = qualityOrder.indexOf(a.quality), qb = qualityOrder.indexOf(b.quality);
      if (qa !== qb) return qa - qb;
      return a.level - b.level;
    });
    const count = Math.max(1, Math.min(Math.floor(inventory.length / 2), inventory.length - 25));
    setSelected(new Set(sorted.slice(0, count).map(i => i.uid)));
  };

  const handleBatchDecompose = () => {
    if (selected.size === 0) return;
    if (confirm(`确定分解 ${selected.size} 件装备？`)) {
      batchDecompose(Array.from(selected));
      setSelected(new Set());
      setDecomposeMode(false);
    }
  };

  const setBonuses = getActiveSetBonuses(weapon, armor, treasure);
  const filtered = inventory
    .filter(item => filter === 'all' || item.slot === filter)
    .sort((a, b) => {
      const qi = Object.keys(QUALITY_INFO);
      return qi.indexOf(b.quality) - qi.indexOf(a.quality);
    });

  const onDetail = (item: EquipmentItem) => setSubPage({ type: 'equipDetail', item, location: 'equipped' });

  return (
    <div className="main-content fade-in">
      <h3 className="section-title">装备</h3>

      <EquipSlotDisplay label="武器" item={weapon} slot="weapon" onDetail={onDetail} />
      <EquipSlotDisplay label="护甲" item={armor} slot="armor" onDetail={onDetail} />
      <EquipSlotDisplay label="法宝" item={treasure} slot="treasure" onDetail={onDetail} />

      {setBonuses.length > 0 && (
        <div className="set-bonus-section">
          {setBonuses.map(sb => (
            <Card key={sb.set.id} borderColor="#ce93d8" className="set-bonus-card">
              <div className="color-set" style={{ fontWeight: 'bold' }}>{sb.set.name} ({sb.activeCount}/{sb.set.pieces.length})</div>
              {sb.bonuses.map((b, i) => (
                <div key={i} className="color-accent" style={{ fontSize: 12 }}>{b.description}</div>
              ))}
            </Card>
          ))}
        </div>
      )}

      {hasFullMythic15(weapon, armor, treasure) && (
        <Card borderColor="var(--red)" className="mythic-card">
          <div className="color-boss" style={{ fontWeight: 'bold' }}>鸿蒙至尊</div>
          <div className="color-accent" style={{ fontSize: 12 }}>全属性额外 +100%</div>
        </Card>
      )}

      {/* Quick actions */}
      <div className="bag-quick-actions">
        <button className="small-btn" onClick={() => setSubPage({ type: 'refine' })}>精炼</button>
        <button className="small-btn" onClick={() => setSubPage({ type: 'shop' })}>商店</button>
      </div>

      {/* Resources */}
      <Card className="resources-card">
        <div className="resources-row">
          <span className="color-set">碎片 {player.hongmengShards}</span>
          <span className="color-dim">天命 {player.tianmingScrolls}</span>
          <span className="color-dim">护级 {player.protectScrolls}</span>
          <span className="color-dim">幸运 {player.luckyScrolls}</span>
        </div>
      </Card>

      {/* Bag header */}
      <div className="bag-header">
        <h3 className="section-title" style={{ margin: 0 }}>
          背包 ({inventory.length}/{INVENTORY_MAX})
        </h3>
        <button className={`small-btn ${decomposeMode ? 'danger' : ''}`}
          onClick={() => { setDecomposeMode(!decomposeMode); setSelected(new Set()); }}
          style={{ fontSize: 11 }}>
          {decomposeMode ? '取消' : '分解'}
        </button>
      </div>

      {decomposeMode && (
        <div className="decompose-toolbar">
          <button className="small-btn" onClick={smartRecommend}>智能推荐</button>
          <button className="small-btn" onClick={() => setSelected(new Set(inventory.map(i => i.uid)))}>全选</button>
          <button className="small-btn" onClick={() => setSelected(new Set())}>清空</button>
          <button className="small-btn danger" onClick={handleBatchDecompose} disabled={selected.size === 0}>
            分解({selected.size})
          </button>
        </div>
      )}

      <div className="bag-filters">
        {([['all', '全部'], ['weapon', '武器'], ['armor', '护甲'], ['treasure', '法宝']] as const).map(([key, label]) => (
          <button key={key} className={`filter-btn ${filter === key ? 'active' : ''}`}
            onClick={() => setFilter(key)}>{label}</button>
        ))}
      </div>

      {filtered.length === 0 && (
        <Card><div className="color-dim" style={{ textAlign: 'center', padding: 16 }}>背包空空如也…去战斗获取装备吧！</div></Card>
      )}

      {filtered.map(item => {
        const stat = getEquipEffectiveStat(item);
        const maxLvl = getMaxEnhanceLevel(item);
        const cost = item.level < maxLvl ? getEnhanceCost(item) : 0;
        const canEnhance = item.level < maxLvl && player.lingshi >= cost;
        const sellPrice = Math.floor(stat * 2 + (item.level + 1) * 50);
        const qi = QUALITY_INFO[item.quality];
        const decompLingshi = Math.floor(sellPrice * 0.6);
        const isSelected = selected.has(item.uid);

        return (
          <Card key={item.uid} className="inv-item-card" borderColor={qi.color}
            style={{ background: decomposeMode && isSelected ? 'rgba(244,67,54,0.1)' : undefined, cursor: decomposeMode ? 'pointer' : undefined }}
            onClick={decomposeMode ? () => toggleSelect(item.uid) : undefined}>
            <div className="equip-header">
              <span style={{ color: qi.color }}>
                {decomposeMode && <span style={{ marginRight: 4 }}>{isSelected ? '[x]' : '[ ]'}</span>}
                {qi.symbol} {item.name} {item.level > 0 ? `+${item.level}` : ''}
              </span>
              <span style={{ color: qi.color, fontSize: 11 }}>{qi.label}</span>
            </div>
            <div className="equip-stats">
              {item.slot === 'weapon' && <span className="color-attack">攻+{formatNumber(stat)}</span>}
              {item.slot === 'armor' && <span className="color-hp">血+{formatNumber(stat)}</span>}
              {item.passive && <span className="color-passive">{item.passive.description}</span>}
              {item.setId && <span className="color-set" style={{ fontSize: 11 }}>套装</span>}
            </div>
            {!decomposeMode && (
              <div className="equip-actions">
                <button className="small-btn accent" onClick={() => equipItem(item)}>装备</button>
                <button className="small-btn" onClick={() => setSubPage({ type: 'equipDetail', item, location: 'inventory' })}>详情</button>
                <button className="small-btn" onClick={() => {
                  if (confirm(`确定分解 ${qi.symbol}${item.name}？获得 ${decompLingshi} 灵石`)) decomposeEquip(item.uid);
                }}>分解</button>
                <button className="small-btn danger" onClick={() => {
                  if (confirm(`确定卖出 ${qi.symbol}${item.name}？获得 ${sellPrice} 灵石`)) sellEquip(item.uid);
                }}>卖 {sellPrice}</button>
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}

// ─── Settings View ───
function SettingsView({ setSubPage }: { setSubPage: (p: SubPage) => void }) {
  const save = useGameStore(s => s.save);
  const reset = useGameStore(s => s.reset);
  const totalPlayTime = useGameStore(s => s.totalPlayTime);

  return (
    <div className="main-content fade-in">
      <h3 className="section-title">设置</h3>

      <Card title="游戏信息">
        <div className="stat-row">
          <span className="stat-label">总游戏时间</span>
          <span>{formatTime(totalPlayTime)}</span>
        </div>
      </Card>

      <Card title="存档">
        <div className="settings-actions">
          <button className="action-btn accent" onClick={save}>手动存档</button>
          <button className="action-btn" onClick={() => setSubPage({ type: 'saveManager' })}>
            存档管理（多槽位）
          </button>
          <button className="action-btn danger"
            onClick={() => { if (confirm('确定重置？所有进度将丢失！')) reset(); }}>
            重置游戏
          </button>
        </div>
      </Card>

      <FeedbackForm />
    </div>
  );
}

// ─── Offline Report ───
function OfflineReportModal() {
  const report = useGameStore(s => s.offlineReport);
  const dismiss = useGameStore(s => s.dismissOfflineReport);
  if (!report) return null;

  return (
    <div className="modal-overlay" onClick={dismiss}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h2 className="color-accent">离线修炼报告</h2>
        <div className="color-dim">离线时长：{formatDuration(report.duration)}</div>
        <Card className="offline-detail">
          <div className="stat-row"><span className="stat-label">击败怪物</span><span>{formatNumber(report.kills)} 只</span></div>
          {report.stagesCleared > 0 && <div className="stat-row"><span className="stat-label">通关关卡</span><span>{report.stagesCleared} 关</span></div>}
          <div style={{ borderTop: '1px solid var(--border)', margin: '8px 0', paddingTop: 8 }}>
            <div className="stat-row"><span className="stat-label">灵石</span><span className="color-gold">+{formatNumber(report.lingshi)}</span></div>
            <div className="stat-row"><span className="stat-label">经验</span><span className="color-exp">+{formatNumber(report.exp)}</span></div>
            {report.pantao > 0 && <div className="stat-row"><span className="stat-label">蟠桃</span><span className="color-pantao">+{report.pantao}</span></div>}
            {report.levelsGained > 0 && <div className="stat-row"><span className="stat-label">升级</span><span className="color-level">x{report.levelsGained}</span></div>}
          </div>
          {report.equipment.length > 0 && (
            <div style={{ borderTop: '1px solid var(--border)', margin: '8px 0', paddingTop: 8 }}>
              <div className="color-dim" style={{ marginBottom: 4 }}>获得装备：</div>
              {report.equipment.map((name, i) => (
                <div key={i} className="color-drop" style={{ paddingLeft: 12 }}>{name}</div>
              ))}
            </div>
          )}
        </Card>
        <button onClick={dismiss}>领取</button>
      </div>
    </div>
  );
}

// ─── Tab Bar ───
const TABS = [
  { id: 'battle' as const, label: '战斗' },
  { id: 'team' as const, label: '队伍' },
  { id: 'journey' as const, label: '旅途' },
  { id: 'bag' as const, label: '背包' },
  { id: 'settings' as const, label: '更多' },
];

// ─── App ───
export default function App() {
  const activeTab = useGameStore(s => s.activeTab);
  const setTab = useGameStore(s => s.setTab);
  const tick = useGameStore(s => s.tick);
  const save = useGameStore(s => s.save);
  const load = useGameStore(s => s.load);
  const loaded = useRef(false);
  const [subPage, setSubPage] = useState<SubPage>({ type: 'none' });

  useEffect(() => {
    if (!loaded.current) {
      loaded.current = true;
      load();
      useDungeonStore.getState().load();
      useAchievementStore.getState().load();
      useLeaderboardStore.getState().load();
    }
  }, [load]);
  useEffect(() => { const id = setInterval(tick, 1000); return () => clearInterval(id); }, [tick]);
  useEffect(() => {
    const id = setInterval(() => {
      save();
      useDungeonStore.getState().save();
      useAchievementStore.getState().save();
      useLeaderboardStore.getState().save();
    }, 30000);
    return () => clearInterval(id);
  }, [save]);

  // Reset sub-page when tab changes
  useEffect(() => { setSubPage({ type: 'none' }); }, [activeTab]);

  const goBack = () => setSubPage({ type: 'none' });

  // Render sub-pages
  if (subPage.type === 'equipDetail') return (
    <><TopBar /><EquipDetailPage item={subPage.item} onBack={goBack} />
    <div className="bottom-nav">{TABS.map(tab => (
      <button key={tab.id} className={activeTab === tab.id ? 'active' : ''} onClick={() => { setTab(tab.id); }}>{tab.label}</button>
    ))}</div><OfflineReportModal /></>
  );
  if (subPage.type === 'refine') return (
    <><TopBar /><RefinePage onBack={goBack} />
    <div className="bottom-nav">{TABS.map(tab => (
      <button key={tab.id} className={activeTab === tab.id ? 'active' : ''} onClick={() => { setTab(tab.id); }}>{tab.label}</button>
    ))}</div><OfflineReportModal /></>
  );
  if (subPage.type === 'shop') return (
    <><TopBar /><ShopPage onBack={goBack} />
    <div className="bottom-nav">{TABS.map(tab => (
      <button key={tab.id} className={activeTab === tab.id ? 'active' : ''} onClick={() => { setTab(tab.id); }}>{tab.label}</button>
    ))}</div><OfflineReportModal /></>
  );
  if (subPage.type === 'characterDetail') return (
    <><TopBar /><CharacterDetailPage onBack={goBack} />
    <div className="bottom-nav">{TABS.map(tab => (
      <button key={tab.id} className={activeTab === tab.id ? 'active' : ''} onClick={() => { setTab(tab.id); }}>{tab.label}</button>
    ))}</div><OfflineReportModal /></>
  );
  if (subPage.type === 'chapterSelect') return (
    <><TopBar /><ChapterSelectPage onBack={goBack} />
    <div className="bottom-nav">{TABS.map(tab => (
      <button key={tab.id} className={activeTab === tab.id ? 'active' : ''} onClick={() => { setTab(tab.id); }}>{tab.label}</button>
    ))}</div><OfflineReportModal /></>
  );
  if (subPage.type === 'saveManager') return (
    <><TopBar /><SaveManagerPage onBack={goBack} />
    <div className="bottom-nav">{TABS.map(tab => (
      <button key={tab.id} className={activeTab === tab.id ? 'active' : ''} onClick={() => { setTab(tab.id); }}>{tab.label}</button>
    ))}</div><OfflineReportModal /></>
  );
  if (subPage.type === 'dungeonList') return (
    <><TopBar />
    <div className="main-content fade-in">
      <SubPageHeader title="取经副本" onBack={goBack} />
      <DungeonList onStartDungeon={(id) => {
        const player = useGameStore.getState().player;
        const stats = useGameStore.getState().getEffectiveStats();
        useDungeonStore.getState().startDungeon(id, stats.maxHp);
        setSubPage({ type: 'dungeonBattle' });
      }} />
    </div>
    <div className="bottom-nav">{TABS.map(tab => (
      <button key={tab.id} className={activeTab === tab.id ? 'active' : ''} onClick={() => { setTab(tab.id); }}>{tab.label}</button>
    ))}</div><OfflineReportModal /></>
  );
  if (subPage.type === 'dungeonBattle') return (
    <><TopBar />
    <div className="main-content fade-in">
      <DungeonBattle onEnd={() => {
        useDungeonStore.getState().save();
        setSubPage({ type: 'dungeonList' });
      }} />
    </div>
    <div className="bottom-nav">{TABS.map(tab => (
      <button key={tab.id} className={activeTab === tab.id ? 'active' : ''} onClick={() => { setTab(tab.id); }}>{tab.label}</button>
    ))}</div><OfflineReportModal /></>
  );
  if (subPage.type === 'achievements') return (
    <><TopBar />
    <div className="main-content fade-in">
      <SubPageHeader title="成就" onBack={goBack} />
      <AchievementList />
    </div>
    <div className="bottom-nav">{TABS.map(tab => (
      <button key={tab.id} className={activeTab === tab.id ? 'active' : ''} onClick={() => { setTab(tab.id); }}>{tab.label}</button>
    ))}</div><OfflineReportModal /></>
  );
  if (subPage.type === 'leaderboard') return (
    <><TopBar />
    <div className="main-content fade-in">
      <SubPageHeader title="排行榜" onBack={goBack} />
      <Leaderboard />
    </div>
    <div className="bottom-nav">{TABS.map(tab => (
      <button key={tab.id} className={activeTab === tab.id ? 'active' : ''} onClick={() => { setTab(tab.id); }}>{tab.label}</button>
    ))}</div><OfflineReportModal /></>
  );

  return (
    <>
      <TopBar />
      {activeTab === 'battle' && <BattleView />}
      {activeTab === 'team' && <TeamView setSubPage={setSubPage} />}
      {activeTab === 'journey' && <JourneyView setSubPage={setSubPage} />}
      {activeTab === 'bag' && <BagView setSubPage={setSubPage} />}
      {activeTab === 'settings' && <SettingsView setSubPage={setSubPage} />}
      <div className="bottom-nav">
        {TABS.map(tab => (
          <button key={tab.id} className={activeTab === tab.id ? 'active' : ''} onClick={() => setTab(tab.id)}>
            {tab.label}
          </button>
        ))}
      </div>
      <OfflineReportModal />
    </>
  );
}
