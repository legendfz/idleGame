import { useEffect, useRef, useState } from 'react';
import { useGameStore } from './store/gameStore';
import { REALMS } from './data/realms';
import { CHAPTERS } from './data/chapters';
import { getEquipEffectiveStat, getEnhanceCost, MAX_ENHANCE_LEVEL, getActiveSetBonuses } from './data/equipment';
import { formatNumber, expForLevel, formatTime, formatDuration } from './utils/format';
import { EquipmentItem, EquipSlot, QUALITY_INFO, INVENTORY_MAX, FloatingText } from './types';

// ─── TopBar ───
function TopBar() {
  const player = useGameStore(s => s.player);
  const battle = useGameStore(s => s.battle);
  const chapter = CHAPTERS.find(c => c.id === battle.chapterId);

  return (
    <div className="top-bar">
      <div className="location">📍 {chapter?.name ?? '未知'} · 第{battle.stageNum}关</div>
      <div className="resources">
        🪙 {formatNumber(player.lingshi)}  🍑 {player.pantao}  ✨ Lv.{player.level}  {REALMS[player.realmIndex].name}
      </div>
    </div>
  );
}

// ─── Floating Damage Text (P0-3) ───
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
        <div
          key={f.id}
          className={`floating-text float-${f.type}`}
          style={{ animationDelay: `${i * 50}ms` }}
        >
          {f.text}
        </div>
      ))}
    </div>
  );
}

// ─── Boss Entrance Toast (P1-8) ───
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
        🐉 BOSS 驾到！
        <div className="boss-toast-name">{battle.currentEnemy.emoji} {battle.currentEnemy.name}</div>
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
        <div className="enemy-section">
          <div className="enemy-name">
            {battle.isBossWave ? '🐉 BOSS: ' : ''}{enemy.emoji} {enemy.name}
            <span style={{ float: 'right', fontSize: 12, color: '#8b8b9e' }}>
              [{battle.wave}/{battle.maxWaves + 1}]
            </span>
          </div>
          <div className="hp-bar-bg">
            <div className="hp-bar-fill" style={{ width: `${hpPct}%` }} />
            <div className="hp-bar-text">❤️ {formatNumber(enemy.hp)} / {formatNumber(enemy.maxHp)}</div>
          </div>
          <FloatingDamage />
        </div>
      )}

      <div className="click-area" onClick={clickAttack}>
        <div style={{ fontSize: 32 }}>🐒</div>
        <div style={{ fontSize: 12, color: '#8b8b9e', marginTop: 4 }}>
          👆 点击攻击 (⚡{player.clickPower})
        </div>
      </div>

      <div className="stats-row">
        <span>⚡{formatNumber(eStats.attack)}</span>
        <span>❤️{formatNumber(eStats.maxHp)}</span>
        <span>💥{eStats.critRate.toFixed(0)}%</span>
        <span>✨{formatNumber(player.exp)}/{formatNumber(expForLevel(player.level))}</span>
      </div>

      {/* P0-5: Idle stats area */}
      <div className="idle-stats">
        💰 +{formatNumber(Math.floor(idleStats.goldPerSec))}/秒
        {'  '}✨ +{formatNumber(Math.floor(idleStats.expPerSec))}/秒
        {'  '}⏱️ 挂机中… {formatTime(idleStats.sessionTime)}
      </div>

      <div className="battle-log">
        {battle.log.map(entry => (
          <div key={entry.id} className={`log-${entry.type}`}>{entry.text}</div>
        ))}
      </div>

      <BossToast />
    </div>
  );
}

// ─── Team View ───
function TeamView() {
  const player = useGameStore(s => s.player);
  const getEffectiveStats = useGameStore(s => s.getEffectiveStats);
  const attemptBreakthrough = useGameStore(s => s.attemptBreakthrough);
  const eStats = getEffectiveStats();
  const currentRealm = REALMS[player.realmIndex];
  const nextRealm = REALMS[player.realmIndex + 1];
  const canBreak = nextRealm && player.level >= nextRealm.levelReq && player.pantao >= nextRealm.pantaoReq;

  return (
    <div className="main-content fade-in">
      <div className="char-card">
        <h3>🐒 {player.name}</h3>
        <div className="stat-grid">
          <span>⚡ 攻击: {formatNumber(eStats.attack)}</span>
          <span>❤️ 血量: {formatNumber(eStats.maxHp)}</span>
          <span>💨 速度: {eStats.speed.toFixed(1)}</span>
          <span>💥 暴击: {eStats.critRate.toFixed(0)}%</span>
          <span>💥 暴伤: {eStats.critDmg.toFixed(1)}x</span>
          <span>👆 点击: {player.clickPower}</span>
        </div>
      </div>

      <div className="realm-info">
        <div className="realm-name">🌟 {currentRealm.name}</div>
        <div className="realm-desc">{currentRealm.description}</div>
        {nextRealm && (
          <>
            <div style={{ fontSize: 12, color: '#8b8b9e', marginTop: 12 }}>
              下一境界：{nextRealm.name} (Lv.{nextRealm.levelReq} + 🍑{nextRealm.pantaoReq})
            </div>
            <button className="breakthrough-btn" disabled={!canBreak} onClick={attemptBreakthrough}>
              {canBreak ? '⚡ 突破！' : '条件不足'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Journey View ───
function JourneyView() {
  const battle = useGameStore(s => s.battle);
  const highestChapter = useGameStore(s => s.highestChapter);
  const [expandedChapter, setExpandedChapter] = useState<number | null>(null);

  return (
    <div className="main-content fade-in">
      <h3 style={{ textAlign: 'center', color: '#f0c040', marginBottom: 16 }}>🗺️ 西游之路</h3>
      {CHAPTERS.map(ch => {
        const isCurrent = ch.id === battle.chapterId;
        const isCleared = ch.id < highestChapter || (ch.id === highestChapter && battle.stageNum > ch.stages);
        const isLocked = ch.id > highestChapter;
        const isExpanded = expandedChapter === ch.id;

        return (
          <div key={ch.id}>
            <div
              className={`chapter-item ${isLocked ? 'locked' : ''} ${isCurrent ? 'current' : ''}`}
              onClick={() => !isLocked && setExpandedChapter(isExpanded ? null : ch.id)}
            >
              <div>
                {isCleared ? '✅' : isCurrent ? '🔥' : '🔒'} 第{ch.id}章 {ch.name}
              </div>
              <div style={{ fontSize: 12, color: '#8b8b9e' }}>
                {ch.description} · Lv.{ch.levelRange[0]}-{ch.levelRange[1]}
                {isCurrent && ` · 进度 ${battle.stageNum}/${ch.stages}`}
              </div>
              {/* P1-5: Progress bar */}
              {(isCurrent || isCleared) && (
                <div className="chapter-progress-bg">
                  <div
                    className="chapter-progress-fill"
                    style={{ width: `${isCleared ? 100 : (battle.stageNum / ch.stages) * 100}%` }}
                  />
                </div>
              )}
            </div>
            {/* P1-5: Expanded sub-stages */}
            {isExpanded && isCurrent && (
              <div className="sub-stages">
                {Array.from({ length: Math.min(battle.stageNum + 2, ch.stages) }, (_, i) => {
                  const stageNum = i + 1;
                  const cleared = stageNum < battle.stageNum;
                  const current = stageNum === battle.stageNum;
                  return (
                    <div key={stageNum} className="sub-stage-item">
                      {cleared ? '├ ✅' : current ? '├ 🔥' : '├ 🔒'} 第{stageNum}关
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

// ─── Equipment Slot Display ───
function EquipSlotDisplay({ label, item, slot }: { label: string; item: EquipmentItem | null; slot: EquipSlot }) {
  const unequip = useGameStore(s => s.unequipSlot);
  const enhance = useGameStore(s => s.enhanceEquip);
  const player = useGameStore(s => s.player);

  if (!item) {
    return (
      <div className="equip-slot empty">
        <span className="slot-label">{label}</span>
        <span className="slot-empty">— 空 —</span>
      </div>
    );
  }

  const stat = getEquipEffectiveStat(item);
  const cost = item.level < MAX_ENHANCE_LEVEL ? getEnhanceCost(item) : 0;
  const canEnhance = item.level < MAX_ENHANCE_LEVEL && player.lingshi >= cost;
  const qi = QUALITY_INFO[item.quality];

  return (
    <div className="equip-slot" style={{ borderLeftColor: qi.color }}>
      <div className="equip-header">
        <span>{qi.symbol}{item.emoji} {item.name} {item.level > 0 ? `+${item.level}` : ''}</span>
        <span style={{ color: qi.color, fontSize: 11 }}>{qi.label}</span>
      </div>
      <div className="equip-stats">
        {item.slot === 'weapon' && <span>⚡+{formatNumber(stat)}</span>}
        {item.slot === 'armor' && <span>❤️+{formatNumber(stat)}</span>}
        {item.passive && <span style={{ color: '#64b5f6' }}>{item.passive.description}</span>}
        {item.setId && <span style={{ color: '#ce93d8', fontSize: 11 }}>🔗套装</span>}
      </div>
      <div className="equip-actions">
        {item.level < MAX_ENHANCE_LEVEL ? (
          <button className="small-btn" disabled={!canEnhance} onClick={() => enhance(item.uid)}>
            ⬆️强化 🪙{formatNumber(cost)}
          </button>
        ) : (
          <span style={{ fontSize: 11, color: '#f0c040' }}>✨ 已满级</span>
        )}
        <button className="small-btn" onClick={() => unequip(slot)}>卸下</button>
      </div>
    </div>
  );
}

// ─── Bag View (P0-1: list layout) ───
function BagView() {
  const weapon = useGameStore(s => s.equippedWeapon);
  const armor = useGameStore(s => s.equippedArmor);
  const treasure = useGameStore(s => s.equippedTreasure);
  const inventory = useGameStore(s => s.inventory);
  const equipItem = useGameStore(s => s.equipItem);
  const sellEquip = useGameStore(s => s.sellEquip);
  const enhance = useGameStore(s => s.enhanceEquip);
  const player = useGameStore(s => s.player);
  const [filter, setFilter] = useState<EquipSlot | 'all'>('all');

  const setBonuses = getActiveSetBonuses(weapon, armor, treasure);
  const filtered = inventory
    .filter(item => filter === 'all' || item.slot === filter)
    .sort((a, b) => {
      const qi = Object.keys(QUALITY_INFO);
      return qi.indexOf(b.quality) - qi.indexOf(a.quality);
    });

  return (
    <div className="main-content fade-in">
      <h3 style={{ textAlign: 'center', color: '#f0c040', marginBottom: 12 }}>⚔️ 装备</h3>

      <EquipSlotDisplay label="武器" item={weapon} slot="weapon" />
      <EquipSlotDisplay label="护甲" item={armor} slot="armor" />
      <EquipSlotDisplay label="法宝" item={treasure} slot="treasure" />

      {setBonuses.length > 0 && (
        <div className="set-bonus-section">
          {setBonuses.map(sb => (
            <div key={sb.set.id} className="set-bonus">
              <div className="set-name">🔗 {sb.set.name} ({sb.activeCount}/{sb.set.pieces.length})</div>
              {sb.bonuses.map((b, i) => (
                <div key={i} className="set-effect">✨ {b.description}</div>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* T-055: capacity display */}
      <h3 style={{ textAlign: 'center', color: '#f0c040', margin: '16px 0 8px' }}>
        📦 背包 ({inventory.length}/{INVENTORY_MAX})
      </h3>

      {/* T-056: filter buttons */}
      <div className="bag-filters">
        {([['all', '全部'], ['weapon', '🗡️武器'], ['armor', '🛡️护甲'], ['treasure', '🔮法宝']] as const).map(([key, label]) => (
          <button
            key={key}
            className={`filter-btn ${filter === key ? 'active' : ''}`}
            onClick={() => setFilter(key)}
          >
            {label}
          </button>
        ))}
      </div>

      {/* T-058 / P2-5: Empty state */}
      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', color: '#8b8b9e', padding: 24 }}>
          📦 背包空空如也…<br/>去战斗获取装备吧！
        </div>
      )}

      {/* P0-1: List layout with full info per row */}
      {filtered.map(item => {
        const stat = getEquipEffectiveStat(item);
        const cost = item.level < MAX_ENHANCE_LEVEL ? getEnhanceCost(item) : 0;
        const canEnhance = item.level < MAX_ENHANCE_LEVEL && player.lingshi >= cost;
        const sellPrice = Math.floor(stat * 2 + (item.level + 1) * 50);
        const qi = QUALITY_INFO[item.quality];

        return (
          <div key={item.uid} className="inv-item" style={{ borderLeftColor: qi.color }}>
            {/* Row 1: name + quality */}
            <div className="equip-header">
              <span>{qi.symbol}{item.emoji} {item.name} {item.level > 0 ? `+${item.level}` : ''}</span>
              <span style={{ color: qi.color, fontSize: 11 }}>{qi.label}</span>
            </div>
            {/* Row 2: stats */}
            <div className="equip-stats">
              {item.slot === 'weapon' && <span>⚡+{formatNumber(stat)}</span>}
              {item.slot === 'armor' && <span>❤️+{formatNumber(stat)}</span>}
              {item.passive && <span style={{ color: '#64b5f6' }}>{item.passive.description}</span>}
              {item.setId && <span style={{ color: '#ce93d8', fontSize: 11 }}>🔗套装</span>}
            </div>
            {/* Row 3: actions */}
            <div className="equip-actions">
              <button className="small-btn accent" onClick={() => equipItem(item)}>装备</button>
              {item.level < MAX_ENHANCE_LEVEL && (
                <button className="small-btn" disabled={!canEnhance} onClick={() => enhance(item.uid)}>
                  ⬆️ 🪙{formatNumber(cost)}
                </button>
              )}
              <button className="small-btn danger" onClick={() => {
                if (confirm(`确定卖出 ${qi.symbol}${item.name}？获得 🪙${sellPrice}`)) sellEquip(item.uid);
              }}>
                卖 🪙{sellPrice}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Settings View ───
function SettingsView() {
  const save = useGameStore(s => s.save);
  const reset = useGameStore(s => s.reset);
  const totalPlayTime = useGameStore(s => s.totalPlayTime);

  return (
    <div className="main-content fade-in">
      <h3 style={{ textAlign: 'center', color: '#f0c040', marginBottom: 16 }}>⚙️ 设置</h3>
      <div className="char-card">
        <div style={{ marginBottom: 12 }}>⏱️ 总游戏时间：{formatTime(totalPlayTime)}</div>
        <button className="breakthrough-btn" onClick={save} style={{ marginRight: 8 }}>💾 手动存档</button>
        <button className="breakthrough-btn" onClick={() => { if (confirm('确定重置？所有进度将丢失！')) reset(); }}
          style={{ background: '#f44336' }}>🗑️ 重置</button>
      </div>
    </div>
  );
}

// ─── Offline Report (v1.1: simulation-based) ───
function OfflineReportModal() {
  const report = useGameStore(s => s.offlineReport);
  const dismiss = useGameStore(s => s.dismissOfflineReport);
  if (!report) return null;

  return (
    <div className="modal-overlay" onClick={dismiss}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h2>🌙 离线修炼报告</h2>
        <div>⏱️ 离线时长：{formatDuration(report.duration)}</div>
        <div style={{ marginTop: 12, fontFamily: 'monospace', textAlign: 'left' }}>
          <div>⚔️ 击败怪物：{formatNumber(report.kills)} 只</div>
          {report.stagesCleared > 0 && <div>🗺️ 通关关卡：{report.stagesCleared} 关</div>}
          <div style={{ marginTop: 8, borderTop: '1px solid #2a2a4a', paddingTop: 8 }}>
            <div>🪙 灵石 +{formatNumber(report.lingshi)}</div>
            <div>✨ 经验 +{formatNumber(report.exp)}</div>
            {report.pantao > 0 && <div>🍑 蟠桃 +{report.pantao}</div>}
            {report.levelsGained > 0 && (
              <div style={{ color: '#f0c040', fontWeight: 'bold' }}>⬆️ 升级 ×{report.levelsGained}</div>
            )}
          </div>
          {report.equipment.length > 0 && (
            <div style={{ marginTop: 8, borderTop: '1px solid #2a2a4a', paddingTop: 8 }}>
              📦 获得装备：
              {report.equipment.map((name, i) => (
                <div key={i} style={{ paddingLeft: 12 }}>{name}</div>
              ))}
            </div>
          )}
        </div>
        <button onClick={dismiss}>✅ 领取</button>
      </div>
    </div>
  );
}

// ─── Tab Bar ───
const TABS = [
  { id: 'battle' as const, icon: '🗡️', label: '战斗' },
  { id: 'team' as const, icon: '🐒', label: '队伍' },
  { id: 'journey' as const, icon: '🗺️', label: '旅途' },
  { id: 'bag' as const, icon: '📦', label: '背包' },
  { id: 'settings' as const, icon: '⚙️', label: '更多' },
];

// ─── App ───
export default function App() {
  const activeTab = useGameStore(s => s.activeTab);
  const setTab = useGameStore(s => s.setTab);
  const tick = useGameStore(s => s.tick);
  const save = useGameStore(s => s.save);
  const load = useGameStore(s => s.load);
  const loaded = useRef(false);

  useEffect(() => { if (!loaded.current) { loaded.current = true; load(); } }, [load]);
  useEffect(() => { const id = setInterval(tick, 1000); return () => clearInterval(id); }, [tick]);
  useEffect(() => { const id = setInterval(save, 30000); return () => clearInterval(id); }, [save]);

  return (
    <>
      <TopBar />
      {activeTab === 'battle' && <BattleView />}
      {activeTab === 'team' && <TeamView />}
      {activeTab === 'journey' && <JourneyView />}
      {activeTab === 'bag' && <BagView />}
      {activeTab === 'settings' && <SettingsView />}
      {/* P1-6: bottom nav with dot indicator */}
      <div className="bottom-nav">
        {TABS.map(tab => (
          <button key={tab.id} className={activeTab === tab.id ? 'active' : ''} onClick={() => setTab(tab.id)}>
            <span className="icon">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>
      <OfflineReportModal />
    </>
  );
}
