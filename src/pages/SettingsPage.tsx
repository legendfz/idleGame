import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { REALMS } from '../data/realms';
import { formatNumber, formatTime } from '../utils/format';
import FeedbackForm from '../components/FeedbackForm';
import { Card, SubPage } from './shared';
import { getSfxEnabled, setSfxEnabled, getSfxVolume, setSfxVolume, sfx } from '../engine/audio';
import { useDailyStore } from '../store/dailyStore';
import { DailyChallengePanel } from '../components/DailyChallengePanel';

export function SettingsView({ setSubPage }: { setSubPage: (p: SubPage) => void }) {
  const save = useGameStore(s => s.save);
  const reset = useGameStore(s => s.reset);
  const totalPlayTime = useGameStore(s => s.totalPlayTime);
  const player = useGameStore(s => s.player);
  const realm = REALMS[player.realmIndex] ?? REALMS[0];
  const [animEnabled, setAnimEnabled] = useState(() => localStorage.getItem('anim') !== 'off');
  const [sfxEnabled, setSfxEnabledState] = useState(getSfxEnabled);
  const [sfxVol, setSfxVol] = useState(getSfxVolume);
  const [importText, setImportText] = useState('');
  const [showImport, setShowImport] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const autoDecomp = useGameStore(s => s.autoDecomposeQuality) ?? 0;
  const setAutoDecomp = useGameStore(s => s.setAutoDecomposeQuality);
  const autoEquip = useGameStore(s => s.autoEquipOnDrop);
  const setAutoEquip = useGameStore(s => s.setAutoEquipOnDrop);
  const autoSkill = useGameStore(s => s.autoSkill);
  const setAutoSkill = useGameStore(s => s.setAutoSkill);
  const autoConsume = useGameStore(s => s.autoConsume);
  const setAutoConsume = useGameStore(s => s.setAutoConsume);
  const autoWorldBoss = useGameStore(s => s.autoWorldBoss);
  const autoExplore = useGameStore(s => s.autoExplore);
  const autoSanctuary = useGameStore(s => s.autoSanctuary);
  const autoAffinity = useGameStore(s => s.autoAffinity);
  const setAutoWorldBoss = useGameStore(s => s.setAutoWorldBoss);
  const setAutoExplore = useGameStore(s => s.setAutoExplore);
  const setAutoSanctuary = useGameStore(s => s.setAutoSanctuary);
  const setAutoAffinity = useGameStore(s => s.setAutoAffinity);
  const autoSweep = useGameStore(s => s.autoSweep);
  const setAutoSweep = useGameStore(s => s.setAutoSweep);
  const autoFate = useGameStore(s => s.autoFate);
  const setAutoFate = useGameStore(s => s.setAutoFate);
  const autoWheel = useGameStore(s => s.autoWheel);
  const setAutoWheel = useGameStore(s => s.setAutoWheel);
  const autoTrial = useGameStore(s => s.autoTrial);
  const setAutoTrial = useGameStore(s => s.setAutoTrial);
  const autoAscension = useGameStore(s => s.autoAscension);
  const setAutoAscension = useGameStore(s => s.setAutoAscension);
  const autoEnhance = useGameStore(s => s.autoEnhance);
  const setAutoEnhance = useGameStore(s => s.setAutoEnhance);
  const autoReforge = useGameStore(s => s.autoReforge);
  const setAutoReforge = useGameStore(s => s.setAutoReforge);
  const autoFeedPet = useGameStore(s => s.autoFeedPet);
  const setAutoFeedPet = useGameStore(s => s.setAutoFeedPet);
  const autoBuyPerks = useGameStore(s => s.autoBuyPerks);
  const setAutoBuyPerks = useGameStore(s => s.setAutoBuyPerks);
  const autoSynth = useGameStore(s => s.autoSynth);
  const setAutoSynth = useGameStore(s => s.setAutoSynth);
  const autoReincarnate = useGameStore(s => s.autoReincarnate);
  const autoDaoAlloc = useGameStore(s => s.autoDaoAlloc) ?? false;
  const autoFarm = useGameStore(s => s.autoFarm) ?? false;
  const autoEvent = useGameStore(s => s.autoEvent) ?? false;
  const autoWeeklyBoss = useGameStore(s => s.autoWeeklyBoss) ?? false;
  const autoTranscend = useGameStore(s => s.autoTranscend) ?? false;
  const autoBuyTranscendPerks = useGameStore(s => s.autoBuyTranscendPerks) ?? false;
  const setAutoReincarnate = useGameStore(s => s.setAutoReincarnate);
  const [showAutoDetails, setShowAutoDetails] = useState(false);
  const DECOMP_LABELS = ['关闭', '凡品', '灵品以下', '仙品以下'];

  const toggleAnim = () => {
    const next = !animEnabled;
    setAnimEnabled(next);
    localStorage.setItem('anim', next ? 'on' : 'off');
    document.documentElement.classList.toggle('no-anim', !next);
  };

  const exportSave = () => {
    try {
      const data = localStorage.getItem('idle-game-save');
      if (!data) { alert('无存档'); return; }
      const b64 = btoa(data);
      navigator.clipboard.writeText(b64).then(() => alert('存档已复制到剪贴板！'));
    } catch { alert('导出失败'); }
  };

  const importSave = () => {
    try {
      const json = atob(importText.trim());
      JSON.parse(json);
      localStorage.setItem('idle-game-save', json);
      alert('导入成功，即将刷新');
      location.reload();
    } catch { alert('导入失败：无效数据'); }
  };

  const dailyCanSignIn = useDailyStore(s => s.canSignIn);

  return (
    <div className="main-content fade-in">
      <h3 className="section-title">设置 & 统计</h3>

      {/* Daily Check-in */}
      <Card className="clickable-card" style={{ cursor: 'pointer', borderColor: dailyCanSignIn ? '#ffd700' : undefined }}
        onClick={() => setSubPage({ type: 'daily' })}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 600 }}>📅 每日签到</span>
          {dailyCanSignIn && <span className="red-dot-badge">可领取</span>}
          {!dailyCanSignIn && <span className="color-dim" style={{ fontSize: 12 }}>已签到 ✓</span>}
        </div>
      </Card>

      {/* Daily Challenges */}
      <Card><DailyChallengePanel /></Card>

      <Card className="clickable-card" style={{ cursor: 'pointer' }}
        onClick={() => setSubPage({ type: 'weeklyBoss' })}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 600 }}>⚔️ 周天秘境</span>
          <span className="color-dim" style={{ fontSize: 12 }}>每周重置</span>
        </div>
      </Card>

      <Card className="clickable-card" style={{ cursor: 'pointer' }}
        onClick={() => setSubPage({ type: 'wheel' })}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 600 }}>🎡 天道轮盘</span>
          <span className="color-dim" style={{ fontSize: 12 }}>消耗灵石抽奖</span>
        </div>
      </Card>

      <Card className="clickable-card" style={{ cursor: 'pointer' }}
        onClick={() => setSubPage({ type: 'titles' })}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 600 }}>👑 封神榜·称号</span>
          <span className="color-dim" style={{ fontSize: 12 }}>已解锁 {useGameStore.getState().unlockedTitles.length} 个</span>
        </div>
      </Card>

      <Card className="clickable-card" style={{ cursor: 'pointer' }}
        onClick={() => setSubPage({ type: 'ascension' })}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 600 }}>🔱 天道考验</span>
          <span className="color-dim" style={{ fontSize: 12 }}>每日挑战</span>
        </div>
      </Card>

      <Card className="clickable-card" style={{ cursor: 'pointer' }}
        onClick={() => setSubPage({ type: 'guide' })}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 600 }}>📖 仙途百科</span>
          <span className="color-dim" style={{ fontSize: 12 }}>系统说明</span>
        </div>
      </Card>

      {/* Statistics */}
      <Card title="游戏统计" onClick={() => setShowStats(!showStats)}>
        <div className="stat-row"><span className="stat-label">总游戏时间</span><span>{formatTime(totalPlayTime)}</span></div>
        <div className="stat-row"><span className="stat-label">境界</span><span>{realm?.name ?? '未知'}</span></div>
        <div className="stat-row"><span className="stat-label">等级</span><span>{player.level}</span></div>
        {showStats && (
          <>
            <div className="stat-row"><span className="stat-label">灵石</span><span className="color-gold">{formatNumber(player.lingshi)}</span></div>
            <div className="stat-row"><span className="stat-label">蟠桃</span><span className="color-pantao">{formatNumber(player.pantao ?? 0)}</span></div>
            <div className="stat-row"><span className="stat-label">攻击力</span><span className="color-attack">{formatNumber(player.stats.attack)}</span></div>
            <div className="stat-row"><span className="stat-label">生命值</span><span className="color-hp">{formatNumber(player.stats.maxHp)}</span></div>
            <div className="stat-row"><span className="stat-label">暴击率</span><span>{player.stats.critRate}%</span></div>
            <div className="stat-row"><span className="stat-label">暴击伤害</span><span>{player.stats.critDmg}x</span></div>
          </>
        )}
        <div className="color-dim" style={{ fontSize: 12, marginTop: 6 }}>{showStats ? '点击收起' : '点击展开'}</div>
      </Card>

      {/* Master Auto Toggle */}
      {(() => {
        const allOn = autoDecomp >= 2 && autoEquip && autoSkill && autoConsume && autoWorldBoss && autoExplore && autoSanctuary && autoAffinity && autoSweep && autoFate && autoWheel && autoTrial && autoAscension && autoEnhance && autoReforge && autoFeedPet && autoBuyPerks && autoSynth && autoReincarnate && autoDaoAlloc && autoFarm && autoTranscend && autoBuyTranscendPerks && autoEvent && autoWeeklyBoss;
        return (<Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
          onClick={() => {
            if (allOn) {
              setAutoDecomp(0); setAutoEquip(false); setAutoSkill(false); setAutoConsume(false);
              setAutoWorldBoss(false); setAutoExplore(false); setAutoSanctuary(false); setAutoAffinity(false);
              setAutoSweep(false); setAutoFate(false); setAutoWheel(false); setAutoTrial(false); setAutoAscension(false); setAutoEnhance(false); setAutoReforge(false); setAutoBuyPerks(false); setAutoSynth(false); useGameStore.getState().setAutoDaoAlloc(false); useGameStore.getState().setAutoFarm(false); useGameStore.getState().setAutoTranscend(false); useGameStore.getState().setAutoBuyTranscendPerks(false); useGameStore.getState().setAutoEvent(false); useGameStore.getState().setAutoWeeklyBoss(false);
            } else {
              setAutoDecomp(2); setAutoEquip(true); setAutoSkill(true); setAutoConsume(true);
              setAutoWorldBoss(true); setAutoExplore(true); setAutoSanctuary(true); setAutoAffinity(true);
              setAutoSweep(true); setAutoFate(true); setAutoWheel(true); setAutoTrial(true); setAutoAscension(true); setAutoEnhance(true); setAutoReforge(true); setAutoFeedPet(true); setAutoBuyPerks(true); setAutoSynth(true); setAutoReincarnate(true); useGameStore.getState().setAutoDaoAlloc(true); useGameStore.getState().setAutoFarm(true); useGameStore.getState().setAutoTranscend(true); useGameStore.getState().setAutoBuyTranscendPerks(true); useGameStore.getState().setAutoEvent(true); useGameStore.getState().setAutoWeeklyBoss(true);
            }
          }}>
          <span style={{ fontWeight: 700, fontSize: 15 }}>🤖 一键全自动</span>
          <span style={{
            color: allOn ? '#ffd700' : 'var(--dim)',
            fontWeight: 600
          }}>
            {allOn ? '✅ 全部开启' : '点击全开'}
          </span>
        </div>
      </Card>);
      })()}

      {/* Preferences */}
      <Card title="⚙️ 基础设置">
        <div className="stat-row" style={{ cursor: 'pointer' }} onClick={toggleAnim}>
          <span className="stat-label">动画效果</span>
          <span style={{ color: animEnabled ? 'var(--accent)' : 'var(--dim)' }}>
            {animEnabled ? '已开启' : '已关闭'}
          </span>
        </div>
        <div className="stat-row" style={{ cursor: 'pointer' }} onClick={() => {
          const next = !sfxEnabled;
          setSfxEnabledState(next);
          setSfxEnabled(next);
          localStorage.setItem('sfx', next ? 'on' : 'off');
          if (next) sfx.click();
        }}>
          <span className="stat-label">音效</span>
          <span style={{ color: sfxEnabled ? 'var(--accent)' : 'var(--dim)' }}>
            {sfxEnabled ? '已开启' : '已关闭'}
          </span>
        </div>
        {sfxEnabled && (
          <div className="stat-row">
            <span className="stat-label">音量</span>
            <input type="range" min="0" max="100" value={Math.round(sfxVol * 100)}
              style={{ flex: 1, accentColor: 'var(--accent)' }}
              onChange={e => { const v = Number(e.target.value) / 100; setSfxVol(v); setSfxVolume(v); }}
            />
            <span style={{ marginLeft: 8, minWidth: 32 }}>{Math.round(sfxVol * 100)}%</span>
          </div>
        )}
      </Card>

      {/* Auto-actions: grouped & collapsible */}
      <Card>
        <div style={{ cursor: 'pointer', marginBottom: showAutoDetails ? 12 : 0 }}
          onClick={() => setShowAutoDetails(!showAutoDetails)}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 700, fontSize: 14 }}>🤖 自动操作 <span style={{ fontSize: 12, color: 'var(--dim)' }}>（{showAutoDetails ? '收起' : '展开详情'}）</span></span>
            <span style={{ fontSize: 12, color: 'var(--dim)' }}>{showAutoDetails ? '▲' : '▼'}</span>
          </div>
        </div>
        {showAutoDetails && (<>
          {/* ⚔️ 战斗组 */}
          <div style={{ fontSize: 12, fontWeight: 700, color: '#ef4444', margin: '8px 0 4px', borderTop: '1px solid var(--border)', paddingTop: 8 }}>⚔️ 战斗</div>
          <AutoRow label="自动释放技能" on={autoSkill} toggle={() => setAutoSkill(!autoSkill)} />
          <AutoRow label="自动使用丹药" on={autoConsume} toggle={() => setAutoConsume(!autoConsume)} />
          <AutoRow label="自动挑战世界Boss" on={autoWorldBoss} toggle={() => setAutoWorldBoss(!autoWorldBoss)} />
          <AutoRow label="自动回退/推进刷怪" on={autoFarm} toggle={() => useGameStore.getState().setAutoFarm(!autoFarm)} />
          <AutoRow label="自动处理随机事件" on={autoEvent} toggle={() => useGameStore.getState().setAutoEvent(!autoEvent)} />
          <AutoRow label="自动每周Boss" on={autoWeeklyBoss} toggle={() => useGameStore.getState().setAutoWeeklyBoss(!autoWeeklyBoss)} />

          {/* 🎒 装备组 */}
          <div style={{ fontSize: 12, fontWeight: 700, color: '#8b5cf6', margin: '12px 0 4px', borderTop: '1px solid var(--border)', paddingTop: 8 }}>🎒 装备</div>
          <div className="stat-row" style={{ cursor: 'pointer' }} onClick={() => setAutoDecomp((autoDecomp + 1) % 4)}>
            <span className="stat-label" style={{ fontSize: 13 }}>自动分解</span>
            <span style={{ color: autoDecomp > 0 ? 'var(--accent)' : 'var(--dim)', fontSize: 13 }}>{DECOMP_LABELS[autoDecomp]}</span>
          </div>
          <AutoRow label="掉落自动装备" on={autoEquip} toggle={() => setAutoEquip(!autoEquip)} />
          <AutoRow label="自动强化已装备(+1~+10)" on={autoEnhance} toggle={() => setAutoEnhance(!autoEnhance)} />
          <AutoRow label="自动洗炼(只接受提升)" on={autoReforge} toggle={() => setAutoReforge(!autoReforge)} />
          <AutoRow label="自动合成装备(低→高)" on={autoSynth} toggle={() => setAutoSynth(!autoSynth)} />

          {/* 🌍 探索组 */}
          <div style={{ fontSize: 12, fontWeight: 700, color: '#10b981', margin: '12px 0 4px', borderTop: '1px solid var(--border)', paddingTop: 8 }}>🌍 探索</div>
          <AutoRow label="自动秘境探索" on={autoExplore} toggle={() => setAutoExplore(!autoExplore)} />
          <AutoRow label="自动洞天升级" on={autoSanctuary} toggle={() => setAutoSanctuary(!autoSanctuary)} />
          <AutoRow label="自动仙缘赠礼" on={autoAffinity} toggle={() => setAutoAffinity(!autoAffinity)} />
          <AutoRow label="自动喂养灵兽" on={autoFeedPet} toggle={() => setAutoFeedPet(!autoFeedPet)} />
          <AutoRow label="自动扫荡(60秒)" on={autoSweep} toggle={() => setAutoSweep(!autoSweep)} />

          {/* 💰 经济组 */}
          <div style={{ fontSize: 12, fontWeight: 700, color: '#f59e0b', margin: '12px 0 4px', borderTop: '1px solid var(--border)', paddingTop: 8 }}>💰 经济</div>
          <AutoRow label="自动天命符(双倍)" on={autoFate} toggle={() => setAutoFate(!autoFate)} />
          <AutoRow label="自动转盘(每小时)" on={autoWheel} toggle={() => setAutoWheel(!autoWheel)} />
          <AutoRow label="自动购买道点加成" on={autoBuyPerks} toggle={() => setAutoBuyPerks(!autoBuyPerks)} />

          {/* 🏆 挑战组 */}
          <div style={{ fontSize: 12, fontWeight: 700, color: '#ec4899', margin: '12px 0 4px', borderTop: '1px solid var(--border)', paddingTop: 8 }}>🏆 挑战</div>
          <AutoRow label="自动试炼(每5分钟)" on={autoTrial} toggle={() => setAutoTrial(!autoTrial)} />
          <AutoRow label="自动天道考验(每日)" on={autoAscension} toggle={() => setAutoAscension(!autoAscension)} />

          {/* 🔄 轮回组 */}
          <div style={{ fontSize: 12, fontWeight: 700, color: '#6366f1', margin: '12px 0 4px', borderTop: '1px solid var(--border)', paddingTop: 8 }}>🔄 轮回</div>
          <AutoRow label="自动转世(大乘境界)" on={autoReincarnate} toggle={() => setAutoReincarnate(!autoReincarnate)} />
          <AutoRow label="自动分配道点" on={autoDaoAlloc} toggle={() => useGameStore.getState().setAutoDaoAlloc(!autoDaoAlloc)} />
          <AutoRow label="自动超越(10次转世)" on={autoTranscend} toggle={() => useGameStore.getState().setAutoTranscend(!autoTranscend)} />
          <AutoRow label="自动购买超越加成" on={autoBuyTranscendPerks} toggle={() => useGameStore.getState().setAutoBuyTranscendPerks(!autoBuyTranscendPerks)} />
        </>)}
      </Card>

      {/* v117.0: Player Card */}
      <Card title="📜 仙途名片">
        <p style={{ color: 'var(--dim)', fontSize: 12, margin: '0 0 8px' }}>生成你的修仙名片，分享给好友</p>
        <button className="action-btn" style={{ background: 'linear-gradient(135deg, #7c3aed, #f59e0b)', border: 'none', color: '#fff', fontWeight: 700, width: '100%' }}
          onClick={() => {
            const s = useGameStore.getState();
            const es = s.getEffectiveStats();
            const r = REALMS[s.player.realmIndex] ?? REALMS[0];
            const card = [
              '╔══════════════════════════╗',
              '║    🐵 西游·悟空传 名片    ║',
              '╠══════════════════════════╣',
              `║ 境界：${r.name}`,
              `║ 等级：Lv.${s.player.level}`,
              `║ ⚔️ 攻击：${formatNumber(es.attack)}`,
              `║ ❤️ 生命：${formatNumber(es.maxHp)}`,
              `║ ⭐ 战力：${formatNumber(es.attack * (1 + (es.critRate / 100) * (es.critDmg)) + es.maxHp * 0.05)}`,
              `║ 🔄 转世：${s.player.reincarnations ?? 0}次`,
              `║ 💫 超越：${s.player.transcendCount ?? 0}次`,
              `║ 🏆 最高战力：${formatNumber(s.highestPower ?? 0)}`,
              `║ ⏱️ 游戏时长：${formatTime(s.totalPlayTime)}`,
              '╚══════════════════════════╝',
              '🔗 https://legendfz.github.io/idleGame/',
            ].join('\n');
            navigator.clipboard.writeText(card).then(() => {
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }).catch(() => {});
          }}>
          {copied ? '✅ 已复制到剪贴板！' : '📋 生成并复制名片'}
        </button>
      </Card>

      {/* Save management */}
      <Card title="存档管理">
        <div className="settings-actions">
          <button className="action-btn accent" onClick={save}>手动存档</button>
          <button className="action-btn" onClick={() => setSubPage({ type: 'saveManager' })}>
            多槽位管理
          </button>
          <button className="action-btn" onClick={exportSave}>导出存档</button>
          <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>💾 自动备份已开启（保留最近3次存档）</div>
          <button className="action-btn" onClick={() => setShowImport(!showImport)}>导入存档</button>
          {showImport && (
            <div style={{ marginTop: 10 }}>
              <textarea
                value={importText}
                onChange={e => setImportText(e.target.value)}
                placeholder="粘贴 Base64 存档数据..."
                style={{ width: '100%', height: 60, background: 'var(--bg-card)', color: 'var(--fg)', border: '1px solid var(--border)', borderRadius: 6, padding: 8, fontSize: 12 }}
              />
              <button className="action-btn accent" onClick={importSave} style={{ marginTop: 6 }}>确认导入</button>
            </div>
          )}
          <button className="action-btn danger"
            onClick={() => { if (confirm('确定重置？所有进度将丢失！此操作不可撤销！')) { if (confirm('再次确认：真的要重置吗？')) reset(); } }}>
            重置游戏
          </button>
        </div>
      </Card>

      {/* About */}
      <Card title="关于">
        <div className="stat-row"><span className="stat-label">版本</span><span>v155.0</span></div>
        <div className="stat-row"><span className="stat-label">引擎</span><span>React + Zustand + Vite</span></div>
      </Card>

      <FeedbackForm />
    </div>
  );
}

function AutoRow({ label, on, toggle }: { label: string; on: boolean; toggle: () => void }) {
  return (
    <div className="stat-row" style={{ cursor: 'pointer', padding: '3px 0' }} onClick={toggle}>
      <span className="stat-label" style={{ fontSize: 13 }}>{label}</span>
      <span style={{ color: on ? 'var(--accent)' : 'var(--dim)', fontSize: 13 }}>{on ? '✅' : '关闭'}</span>
    </div>
  );
}

// Offline Report (duplicate removed, using shared.tsx version)
