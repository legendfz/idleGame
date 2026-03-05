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
  const [showStats, setShowStats] = useState(false);
  const autoDecomp = useGameStore(s => s.autoDecomposeQuality) ?? 0;
  const setAutoDecomp = useGameStore(s => s.setAutoDecomposeQuality);
  const autoEquip = useGameStore(s => s.autoEquipOnDrop);
  const setAutoEquip = useGameStore(s => s.setAutoEquipOnDrop);
  const autoSkill = useGameStore(s => s.autoSkill);
  const setAutoSkill = useGameStore(s => s.setAutoSkill);
  const autoConsume = useGameStore(s => s.autoConsume);
  const setAutoConsume = useGameStore(s => s.setAutoConsume);
  const autoWorldBoss = useGameStore(s => (s as any).autoWorldBoss) as boolean;
  const setAutoWorldBoss = useGameStore(s => (s as any).setAutoWorldBoss) as (v: boolean) => void;
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
        onClick={() => setSubPage({ type: 'wheel' as any })}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 600 }}>🎡 天道轮盘</span>
          <span className="color-dim" style={{ fontSize: 12 }}>消耗灵石抽奖</span>
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

      {/* Preferences */}
      <Card title="偏好设置">
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
        <div className="stat-row" style={{ cursor: 'pointer' }} onClick={() => setAutoDecomp((autoDecomp + 1) % 4)}>
          <span className="stat-label">自动分解</span>
          <span style={{ color: autoDecomp > 0 ? 'var(--accent)' : 'var(--dim)' }}>
            {DECOMP_LABELS[autoDecomp]}
          </span>
        </div>
        <div className="stat-row" style={{ cursor: 'pointer' }} onClick={() => setAutoEquip(!autoEquip)}>
          <span className="stat-label">掉落自动装备</span>
          <span style={{ color: autoEquip ? 'var(--accent)' : 'var(--dim)' }}>
            {autoEquip ? '✅ 开启' : '关闭'}
          </span>
        </div>
        <div className="stat-row" style={{ cursor: 'pointer' }} onClick={() => setAutoSkill(!autoSkill)}>
          <span className="stat-label">自动释放技能</span>
          <span style={{ color: autoSkill ? 'var(--accent)' : 'var(--dim)' }}>
            {autoSkill ? '✅ 开启' : '关闭'}
          </span>
        </div>
        <div className="stat-row" style={{ cursor: 'pointer' }} onClick={() => setAutoConsume(!autoConsume)}>
          <span className="stat-label">自动使用丹药</span>
          <span style={{ color: autoConsume ? 'var(--accent)' : 'var(--dim)' }}>
            {autoConsume ? '✅ 开启' : '关闭'}
          </span>
        </div>
        <div className="stat-row" style={{ cursor: 'pointer' }} onClick={() => setAutoWorldBoss(!autoWorldBoss)}>
          <span className="stat-label">自动挑战世界Boss</span>
          <span style={{ color: autoWorldBoss ? 'var(--accent)' : 'var(--dim)' }}>
            {autoWorldBoss ? '✅ 开启' : '关闭'}
          </span>
        </div>
      </Card>

      {/* Save management */}
      <Card title="存档管理">
        <div className="settings-actions">
          <button className="action-btn accent" onClick={save}>手动存档</button>
          <button className="action-btn" onClick={() => setSubPage({ type: 'saveManager' })}>
            多槽位管理
          </button>
          <button className="action-btn" onClick={exportSave}>导出存档</button>
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
        <div className="stat-row"><span className="stat-label">版本</span><span>v51.0</span></div>
        <div className="stat-row"><span className="stat-label">引擎</span><span>React + Zustand + Vite</span></div>
      </Card>

      <FeedbackForm />
    </div>
  );
}

// Offline Report (duplicate removed, using shared.tsx version)
