import { useState, lazy, Suspense } from 'react';
import { useGameStore } from '../store/gameStore';
import { REALMS } from '../data/realms';
import { formatNumber, formatTime } from '../utils/format';
import FeedbackForm from '../components/FeedbackForm';
import { Card, SubPage } from './shared';
import { getSfxEnabled, setSfxEnabled, getSfxVolume, setSfxVolume, sfx } from '../engine/audio';
import { useDailyStore } from '../store/dailyStore';
import { DailyChallengePanel } from '../components/DailyChallengePanel';
import { getReferralUrl } from '../data/referral';
import { AutoActionsPanel, useAllAutoOn, toggleAllAuto } from '../components/AutoActionsPanel';
const ShareCard = lazy(() => import('../components/ShareCard').then(m => ({ default: m.ShareCard })));
const SeasonPassPanel = lazy(() => import('../components/SeasonPassPanel').then(m => ({ default: m.SeasonPassPanel })));

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
  const [showShare, setShowShare] = useState(false);
  const [showSeason, setShowSeason] = useState(false);
  const [showAutoDetails, setShowAutoDetails] = useState(false);

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
      navigator.clipboard.writeText(b64).then(() => {
        localStorage.setItem('idle-game-last-export', String(Date.now()));
        alert('存档已复制到剪贴板！');
      });
    } catch { alert('导出失败'); }
  };
  const lastExportTs = parseInt(localStorage.getItem('idle-game-last-export') ?? '0');
  const daysSinceExport = lastExportTs ? Math.floor((Date.now() - lastExportTs) / 86400000) : -1;

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
  const allOn = useAllAutoOn();

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

      <Card style={{ cursor: 'pointer', border: '1px solid rgba(168,130,255,0.3)' }}
        onClick={() => setSubPage({ type: 'handbook' })}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 600 }}>📜 仙途秘典</span>
          <span className="color-dim" style={{ fontSize: 12 }}>系统攻略指南</span>
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
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
          onClick={() => toggleAllAuto(!allOn)}>
          <span style={{ fontWeight: 700, fontSize: 15 }}>🤖 一键全自动</span>
          <span style={{ color: allOn ? '#ffd700' : 'var(--dim)', fontWeight: 600 }}>
            {allOn ? '✅ 全部开启' : '点击全开'}
          </span>
        </div>
      </Card>

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
        <AutoActionsPanel showDetails={showAutoDetails} />
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
          {daysSinceExport >= 7 && (
            <div style={{ fontSize: 11, color: '#f59e0b', marginTop: 2, padding: '4px 8px', background: 'rgba(245,158,11,0.1)', borderRadius: 6 }}>
              ⚠️ 已{daysSinceExport}天未导出存档，建议定期备份！
            </div>
          )}
          {daysSinceExport >= 0 && daysSinceExport < 7 && (
            <div style={{ fontSize: 11, color: '#4ade80', marginTop: 2 }}>✅ {daysSinceExport === 0 ? '今日已导出' : `${daysSinceExport}天前导出`}</div>
          )}
          {daysSinceExport < 0 && (
            <div style={{ fontSize: 11, color: '#f87171', marginTop: 2 }}>⚠️ 从未导出存档，建议立即备份！</div>
          )}
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

      {/* Season Pass */}
      <Card title="🏅 赛季通行证">
        <button className="action-btn" style={{
          width: '100%', padding: '10px 0', fontWeight: 'bold',
          background: 'linear-gradient(135deg, #d97706, #fbbf24)', color: '#1a0a2e', border: 'none', borderRadius: 8,
        }} onClick={() => setShowSeason(true)}>
          🏅 查看赛季进度
        </button>
      </Card>
      {showSeason && <Suspense fallback={null}><SeasonPassPanel onClose={() => setShowSeason(false)} /></Suspense>}

      {/* Share & Invite */}
      <Card title="📜 分享与邀请">
        <button className="action-btn" style={{
          width: '100%', padding: '10px 0', fontWeight: 'bold', marginBottom: 8,
          background: 'linear-gradient(135deg, #7c3aed, #a78bfa)', color: '#fff', border: 'none', borderRadius: 8,
        }} onClick={() => setShowShare(true)}>
          🏆 生成战绩卡
        </button>
        <div style={{ fontSize: 13, color: 'var(--dim)', marginBottom: 6 }}>邀请链接（好友获得新手礼包）：</div>
        <div style={{ display: 'flex', gap: 6 }}>
          <input readOnly value={getReferralUrl()} style={{
            flex: 1, background: 'var(--bg-card)', color: 'var(--fg)', border: '1px solid var(--border)',
            borderRadius: 6, padding: '6px 8px', fontSize: 12,
          }} />
          <button className="action-btn accent" style={{ fontSize: 12, padding: '6px 10px' }}
            onClick={() => { navigator.clipboard.writeText(getReferralUrl()); }}>
            复制
          </button>
        </div>
      </Card>

      {showShare && <Suspense fallback={null}><ShareCard onClose={() => setShowShare(false)} /></Suspense>}

      {/* About */}
      <Card title="关于">
        <div className="stat-row"><span className="stat-label">版本</span><span>v199.0</span></div>
        <div className="stat-row"><span className="stat-label">引擎</span><span>React + Zustand + Vite</span></div>
      </Card>

      <FeedbackForm />
    </div>
  );
}
