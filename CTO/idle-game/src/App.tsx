import { useEffect, useRef } from 'react';
import { useGameStore } from './store/gameStore';
import { REALMS } from './data/realms';
import { CHAPTERS } from './data/chapters';
import { formatNumber, expForLevel, formatTime } from './utils/format';

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
        <span>⚡攻击 {formatNumber(player.stats.attack)}</span>
        <span>❤️血量 {formatNumber(player.stats.maxHp)}</span>
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
  const attemptBreakthrough = useGameStore(s => s.attemptBreakthrough);
  const currentRealm = REALMS[player.realmIndex];
  const nextRealm = REALMS[player.realmIndex + 1];
  const canBreak = nextRealm && player.level >= nextRealm.levelReq && player.pantao >= nextRealm.pantaoReq;

  return (
    <div className="main-content">
      <div className="char-card">
        <h3>🐒 {player.name}</h3>
        <div className="stat-grid">
          <span>⚡ 攻击: {formatNumber(player.stats.attack)}</span>
          <span>❤️ 血量: {formatNumber(player.stats.maxHp)}</span>
          <span>💨 速度: {player.stats.speed.toFixed(1)}</span>
          <span>💥 暴击: {player.stats.critRate}%</span>
          <span>👆 点击: {player.clickPower}</span>
          <span>✨ Lv.{player.level}</span>
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

  // Load save on mount
  useEffect(() => {
    if (!loaded.current) {
      loaded.current = true;
      load();
    }
  }, [load]);

  // Game loop — tick every second
  useEffect(() => {
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [tick]);

  // Auto-save every 30 seconds
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
      {activeTab === 'bag' && <div className="main-content"><p style={{ textAlign: 'center', color: '#8b8b9e' }}>📦 背包系统开发中...</p></div>}
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
