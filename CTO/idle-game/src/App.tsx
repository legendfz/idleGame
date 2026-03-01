import { useEffect, useRef } from 'react';
import { useGameStore } from './store/gameStore';
import { REALMS } from './data/realms';
import { CHAPTERS } from './data/chapters';
import { getEquipEffectiveStat, getEnhanceCost, MAX_ENHANCE_LEVEL, getActiveSetBonuses } from './data/equipment';
import { formatNumber, expForLevel, formatTime } from './utils/format';
import { EquipmentItem, EquipSlot, QUALITY_INFO } from './types';

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

function BattleView() {
  const battle = useGameStore(s => s.battle);
  const clickAttack = useGameStore(s => s.clickAttack);
  const player = useGameStore(s => s.player);
  const getEffectiveStats = useGameStore(s => s.getEffectiveStats);
  const eStats = getEffectiveStats();
  const enemy = battle.currentEnemy;
  const hpPct = enemy ? Math.max(0, (enemy.hp / enemy.maxHp) * 100) : 0;

  return (
    <div className="main-content">
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

      <div className="battle-log">
        {battle.log.map(entry => (
          <div key={entry.id} className={entry.type}>{entry.text}</div>
        ))}
      </div>
    </div>
  );
}

function TeamView() {
  const player = useGameStore(s => s.player);
  const getEffectiveStats = useGameStore(s => s.getEffectiveStats);
  const attemptBreakthrough = useGameStore(s => s.attemptBreakthrough);
  const eStats = getEffectiveStats();
  const currentRealm = REALMS[player.realmIndex];
  const nextRealm = REALMS[player.realmIndex + 1];
  const canBreak = nextRealm && player.level >= nextRealm.levelReq && player.pantao >= nextRealm.pantaoReq;

  return (
    <div className="main-content">
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

function JourneyView() {
  const battle = useGameStore(s => s.battle);
  const highestChapter = useGameStore(s => s.highestChapter);

  return (
    <div className="main-content">
      <h3 style={{ textAlign: 'center', color: '#f0c040', marginBottom: 16 }}>🗺️ 西游之路</h3>
      {CHAPTERS.map(ch => {
        const isCurrent = ch.id === battle.chapterId;
        const isCleared = ch.id < highestChapter || (ch.id === highestChapter && battle.stageNum > ch.stages);
        const isLocked = ch.id > highestChapter;
        return (
          <div key={ch.id} className={`chapter-item ${isLocked ? 'locked' : ''} ${isCurrent ? 'current' : ''}`}>
            <div>
              {isCleared ? '✅' : isCurrent ? '🔥' : '🔒'} 第{ch.id}章 {ch.name}
            </div>
            <div style={{ fontSize: 12, color: '#8b8b9e' }}>
              {ch.description} · Lv.{ch.levelRange[0]}-{ch.levelRange[1]}
              {isCurrent && ` · 进度 ${battle.stageNum}/${ch.stages}`}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// === Equipment / Bag View ===

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

  return (
    <div className="equip-slot" style={{ borderLeftColor: QUALITY_INFO[item.quality].color }}>
      <div className="equip-header">
        <span>{item.emoji} {item.name} {item.level > 0 ? `+${item.level}` : ''}</span>
        <span className="equip-quality" style={{ color: QUALITY_INFO[item.quality].color }}>
          {QUALITY_INFO[item.quality].label}
        </span>
      </div>
      <div className="equip-stats">
        {item.slot === 'weapon' && <span>⚡+{formatNumber(stat)}</span>}
        {item.slot === 'armor' && <span>❤️+{formatNumber(stat)}</span>}
        {item.passive && <span style={{ color: '#64b5f6' }}>{item.passive.description}</span>}
      </div>
      <div className="equip-actions">
        {item.level < MAX_ENHANCE_LEVEL && (
          <button className="small-btn" disabled={!canEnhance} onClick={() => enhance(item.uid)}>
            ⬆️强化 🪙{formatNumber(cost)}
          </button>
        )}
        <button className="small-btn" onClick={() => unequip(slot)}>卸下</button>
      </div>
    </div>
  );
}

function BagView() {
  const weapon = useGameStore(s => s.equippedWeapon);
  const armor = useGameStore(s => s.equippedArmor);
  const treasure = useGameStore(s => s.equippedTreasure);
  const inventory = useGameStore(s => s.inventory);
  const equipItem = useGameStore(s => s.equipItem);
  const sellEquip = useGameStore(s => s.sellEquip);
  const enhance = useGameStore(s => s.enhanceEquip);
  const player = useGameStore(s => s.player);

  const setBonuses = getActiveSetBonuses(weapon, armor, treasure);

  return (
    <div className="main-content">
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

      <h3 style={{ textAlign: 'center', color: '#f0c040', margin: '16px 0 8px' }}>📦 背包 ({inventory.length})</h3>

      {inventory.length === 0 && (
        <div style={{ textAlign: 'center', color: '#8b8b9e', padding: 16 }}>背包空空如也，击败Boss获取装备！</div>
      )}

      {inventory
        .sort((a, b) => {
          const qi = Object.keys(QUALITY_INFO);
          return qi.indexOf(b.quality) - qi.indexOf(a.quality);
        })
        .map(item => {
          const stat = getEquipEffectiveStat(item);
          const cost = item.level < MAX_ENHANCE_LEVEL ? getEnhanceCost(item) : 0;
          const canEnhance = item.level < MAX_ENHANCE_LEVEL && player.lingshi >= cost;
          const sellPrice = Math.floor(stat * 0.5 + 10);

          return (
            <div key={item.uid} className="inv-item" style={{ borderLeftColor: QUALITY_INFO[item.quality].color }}>
              <div className="equip-header">
                <span>{item.emoji} {item.name} {item.level > 0 ? `+${item.level}` : ''}</span>
                <span style={{ color: QUALITY_INFO[item.quality].color, fontSize: 11 }}>
                  {QUALITY_INFO[item.quality].label}
                </span>
              </div>
              <div className="equip-stats">
                {item.slot === 'weapon' && <span>⚡+{formatNumber(stat)}</span>}
                {item.slot === 'armor' && <span>❤️+{formatNumber(stat)}</span>}
                {item.passive && <span style={{ color: '#64b5f6' }}>{item.passive.description}</span>}
                {item.setId && <span style={{ color: '#ce93d8', fontSize: 11 }}>🔗套装</span>}
              </div>
              <div className="equip-actions">
                <button className="small-btn accent" onClick={() => equipItem(item)}>装备</button>
                {item.level < MAX_ENHANCE_LEVEL && (
                  <button className="small-btn" disabled={!canEnhance} onClick={() => enhance(item.uid)}>
                    ⬆️ 🪙{formatNumber(cost)}
                  </button>
                )}
                <button className="small-btn danger" onClick={() => sellEquip(item.uid)}>
                  卖 🪙{sellPrice}
                </button>
              </div>
            </div>
          );
        })}
    </div>
  );
}

function SettingsView() {
  const save = useGameStore(s => s.save);
  const reset = useGameStore(s => s.reset);
  const totalPlayTime = useGameStore(s => s.totalPlayTime);

  return (
    <div className="main-content">
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

function OfflineReportModal() {
  const report = useGameStore(s => s.offlineReport);
  const dismiss = useGameStore(s => s.dismissOfflineReport);
  if (!report) return null;
  const hours = Math.floor(report.duration / 3600);
  const mins = Math.floor((report.duration % 3600) / 60);

  return (
    <div className="modal-overlay" onClick={dismiss}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h2>🌙 离线收益</h2>
        <div>离开了 {hours}小时 {mins}分</div>
        <div style={{ marginTop: 12, fontFamily: 'monospace' }}>
          <div>🪙 +{formatNumber(report.lingshi)}</div>
          <div>✨ +{formatNumber(report.exp)}</div>
        </div>
        <button onClick={dismiss}>✅ 领取</button>
      </div>
    </div>
  );
}

const TABS = [
  { id: 'battle' as const, icon: '🗡️', label: '战斗' },
  { id: 'team' as const, icon: '🐒', label: '队伍' },
  { id: 'journey' as const, icon: '🗺️', label: '旅途' },
  { id: 'bag' as const, icon: '📦', label: '背包' },
  { id: 'settings' as const, icon: '⚙️', label: '更多' },
];

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
