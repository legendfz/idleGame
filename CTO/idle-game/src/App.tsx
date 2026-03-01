import { useEffect, useRef, useState } from 'react';
import { useGameStore } from './store/gameStore';
import { REALMS } from './data/realms';
import { CHAPTERS } from './data/chapters';
import { formatNumber, expForLevel, formatTime } from './utils/format';
import { EquipmentItem, EquipSlot, QUALITY_INFO } from './types';
import { getEquipEffectiveStat, getEnhanceCost, getActiveSetBonuses, MAX_ENHANCE_LEVEL } from './data/equipment';

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
  const stats = getEffectiveStats();
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
          👆 点击攻击 (⚡{stats.clickPower})
        </div>
      </div>

      <div className="stats-row">
        <span>⚡攻击 {formatNumber(stats.attack)}</span>
        <span>❤️血量 {formatNumber(stats.maxHp)}</span>
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
  const equipment = useGameStore(s => s.equipment);
  const stats = getEffectiveStats();
  const currentRealm = REALMS[player.realmIndex];
  const nextRealm = REALMS[player.realmIndex + 1];
  const canBreak = nextRealm && player.level >= nextRealm.levelReq && player.pantao >= nextRealm.pantaoReq;
  const setBonuses = getActiveSetBonuses(equipment.weapon, equipment.armor, equipment.treasure);

  return (
    <div className="main-content">
      <div className="char-card">
        <h3>🐒 {player.name}</h3>
        <div className="stat-grid">
          <span>⚡ 攻击: {formatNumber(stats.attack)}</span>
          <span>❤️ 血量: {formatNumber(stats.maxHp)}</span>
          <span>💨 速度: {stats.speed.toFixed(1)}</span>
          <span>💥 暴击: {stats.critRate.toFixed(0)}%</span>
          <span>🔥 暴伤: {(stats.critDmg * 100).toFixed(0)}%</span>
          <span>👆 点击: {stats.clickPower}</span>
        </div>
      </div>

      {/* Equipped items */}
      <div className="char-card">
        <h3>⚔️ 装备</h3>
        {(['weapon', 'armor', 'treasure'] as EquipSlot[]).map(slot => {
          const item = equipment[slot];
          const labels = { weapon: '🗡️ 武器', armor: '🛡️ 防具', treasure: '✨ 法宝' };
          return (
            <div key={slot} className="equip-slot-row">
              <span className="slot-label">{labels[slot]}</span>
              {item ? (
                <span style={{ color: QUALITY_INFO[item.quality].color }}>
                  {item.emoji} {item.name} +{item.level}
                </span>
              ) : (
                <span style={{ color: '#555' }}>— 空 —</span>
              )}
            </div>
          );
        })}
        {setBonuses.length > 0 && (
          <div style={{ marginTop: 8, fontSize: 12, color: '#f0c040' }}>
            {setBonuses.map(sb => (
              <div key={sb.set.id}>🔗 {sb.set.name} ({sb.activeCount}件): {sb.bonuses.map(b => b.description).join(', ')}</div>
            ))}
          </div>
        )}
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
            <div>{isCleared ? '✅' : isCurrent ? '🔥' : '🔒'} 第{ch.id}章 {ch.name}</div>
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

function EquipDetail({ item, onClose }: { item: EquipmentItem; onClose: () => void }) {
  const enhanceItem = useGameStore(s => s.enhanceItem);
  const equipItem = useGameStore(s => s.equipItem);
  const sellItem = useGameStore(s => s.sellItem);
  const player = useGameStore(s => s.player);
  const equipment = useGameStore(s => s.equipment);
  const isEquipped = equipment.weapon?.uid === item.uid || equipment.armor?.uid === item.uid || equipment.treasure?.uid === item.uid;
  const cost = getEnhanceCost(item);
  const canEnhance = item.level < MAX_ENHANCE_LEVEL && player.lingshi >= cost;
  const qualityInfo = QUALITY_INFO[item.quality];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content equip-detail" onClick={e => e.stopPropagation()}>
        <div style={{ color: qualityInfo.color, fontSize: 18 }}>
          {item.emoji} {item.name} +{item.level}
        </div>
        <div style={{ color: qualityInfo.color, fontSize: 12 }}>{qualityInfo.label}</div>
        <div style={{ marginTop: 8, fontFamily: 'monospace', fontSize: 13 }}>
          {item.slot === 'weapon' && <div>⚡ 攻击力 +{formatNumber(getEquipEffectiveStat(item))}</div>}
          {item.slot === 'armor' && <div>❤️ 血量 +{formatNumber(getEquipEffectiveStat(item))}</div>}
          {item.passive && <div style={{ color: '#4caf50' }}>🔮 {item.passive.description}</div>}
        </div>

        <div style={{ marginTop: 12, display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
          {!isEquipped && (
            <button className="breakthrough-btn" onClick={() => { equipItem(item.uid); onClose(); }}>
              ⚔️ 装备
            </button>
          )}
          <button className="breakthrough-btn" disabled={!canEnhance}
            onClick={() => enhanceItem(item.uid)}>
            {item.level >= MAX_ENHANCE_LEVEL ? '已满级' : `🔨 强化 (🪙${formatNumber(cost)})`}
          </button>
          {!isEquipped && (
            <button className="breakthrough-btn" style={{ background: '#f44336' }}
              onClick={() => { sellItem(item.uid); onClose(); }}>
              💰 出售
            </button>
          )}
        </div>
        <button onClick={onClose} style={{ marginTop: 8, background: 'none', border: 'none', color: '#8b8b9e', cursor: 'pointer' }}>关闭</button>
      </div>
    </div>
  );
}

function BagView() {
  const inventory = useGameStore(s => s.inventory);
  const equipment = useGameStore(s => s.equipment);
  const unequipItem = useGameStore(s => s.unequipItem);
  const [selectedItem, setSelectedItem] = useState<EquipmentItem | null>(null);
  const [filter, setFilter] = useState<'all' | EquipSlot>('all');

  const filtered = filter === 'all' ? inventory : inventory.filter(i => i.slot === filter);
  const sorted = [...filtered].sort((a, b) => {
    const qOrder = { chaos: 0, divine: 1, immortal: 2, spirit: 3, common: 4 };
    return (qOrder[a.quality] ?? 5) - (qOrder[b.quality] ?? 5);
  });

  return (
    <div className="main-content">
      <h3 style={{ textAlign: 'center', color: '#f0c040', marginBottom: 8 }}>📦 背包 ({inventory.length}/50)</h3>

      {/* Equipped section */}
      <div className="char-card" style={{ marginBottom: 8 }}>
        <div style={{ fontSize: 12, color: '#8b8b9e', marginBottom: 4 }}>已装备</div>
        {(['weapon', 'armor', 'treasure'] as EquipSlot[]).map(slot => {
          const item = equipment[slot];
          const labels = { weapon: '🗡️', armor: '🛡️', treasure: '✨' };
          return (
            <div key={slot} className="equip-slot-row" style={{ cursor: item ? 'pointer' : 'default' }}
              onClick={() => item && setSelectedItem(item)}>
              <span>{labels[slot]}</span>
              {item ? (
                <span style={{ color: QUALITY_INFO[item.quality].color, flex: 1 }}>
                  {item.emoji} {item.name}+{item.level}
                </span>
              ) : <span style={{ color: '#555', flex: 1 }}>空</span>}
              {item && <span style={{ fontSize: 11, color: '#f44336', cursor: 'pointer' }} onClick={e => { e.stopPropagation(); unequipItem(slot); }}>卸下</span>}
            </div>
          );
        })}
      </div>

      {/* Filter tabs */}
      <div className="bag-filters">
        {[{ k: 'all', l: '全部' }, { k: 'weapon', l: '🗡️武器' }, { k: 'armor', l: '🛡️防具' }, { k: 'treasure', l: '✨法宝' }].map(f => (
          <button key={f.k} className={filter === f.k ? 'active' : ''} onClick={() => setFilter(f.k as typeof filter)}>{f.l}</button>
        ))}
      </div>

      {/* Inventory grid */}
      <div className="bag-grid">
        {sorted.map(item => (
          <div key={item.uid} className="bag-item" style={{ borderColor: QUALITY_INFO[item.quality].color }}
            onClick={() => setSelectedItem(item)}>
            <div style={{ fontSize: 20 }}>{item.emoji}</div>
            <div style={{ fontSize: 10, color: QUALITY_INFO[item.quality].color }}>{item.name}</div>
            {item.level > 0 && <div style={{ fontSize: 9, color: '#f0c040' }}>+{item.level}</div>}
          </div>
        ))}
        {sorted.length === 0 && <div style={{ gridColumn: '1/-1', textAlign: 'center', color: '#555', padding: 20 }}>暂无物品</div>}
      </div>

      {selectedItem && <EquipDetail item={selectedItem} onClose={() => setSelectedItem(null)} />}
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
        <button className="breakthrough-btn" onClick={() => { if (confirm('确定重置？')) reset(); }}
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

  useEffect(() => {
    if (!loaded.current) {
      loaded.current = true;
      load();
    }
  }, [load]);

  useEffect(() => {
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [tick]);

  useEffect(() => {
    const interval = setInterval(save, 30000);
    return () => clearInterval(interval);
  }, [save]);

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
