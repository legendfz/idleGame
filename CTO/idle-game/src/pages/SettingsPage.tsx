import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { REALMS } from '../data/realms';
import { formatNumber, formatTime } from '../utils/format';
import FeedbackForm from '../components/FeedbackForm';
import { Card, SubPage } from './shared';

export function SettingsView({ setSubPage }: { setSubPage: (p: SubPage) => void }) {
  const save = useGameStore(s => s.save);
  const reset = useGameStore(s => s.reset);
  const totalPlayTime = useGameStore(s => s.totalPlayTime);
  const player = useGameStore(s => s.player);
  const realm = REALMS[player.realmIndex] ?? REALMS[0];
  const [animEnabled, setAnimEnabled] = useState(() => localStorage.getItem('anim') !== 'off');
  const [importText, setImportText] = useState('');
  const [showImport, setShowImport] = useState(false);
  const [showStats, setShowStats] = useState(false);

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
      JSON.parse(json); // validate
      localStorage.setItem('idle-game-save', json);
      alert('导入成功，即将刷新');
      location.reload();
    } catch { alert('导入失败：无效数据'); }
  };

  return (
    <div className="main-content fade-in">
      <h3 className="section-title">⚙️ 设置 & 统计</h3>

      {/* ── 统计面板 ── */}
      <Card title="📊 游戏统计" onClick={() => setShowStats(!showStats)}>
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
        <div className="color-dim" style={{ fontSize: 12, marginTop: 4 }}>{showStats ? '点击收起 ▲' : '点击展开 ▼'}</div>
      </Card>

      {/* ── 偏好设置 ── */}
      <Card title="🎛️ 偏好">
        <div className="stat-row" style={{ cursor: 'pointer' }} onClick={toggleAnim}>
          <span className="stat-label">动画效果</span>
          <span style={{ color: animEnabled ? 'var(--accent)' : 'var(--dim)' }}>
            {animEnabled ? '✅ 开启' : '❌ 关闭'}
          </span>
        </div>
      </Card>

      {/* ── 存档管理 ── */}
      <Card title="💾 存档管理">
        <div className="settings-actions">
          <button className="action-btn accent" onClick={save}>手动存档</button>
          <button className="action-btn" onClick={() => setSubPage({ type: 'saveManager' })}>
            多槽位管理
          </button>
          <button className="action-btn" onClick={exportSave}>📤 导出存档</button>
          <button className="action-btn" onClick={() => setShowImport(!showImport)}>📥 导入存档</button>
          {showImport && (
            <div style={{ marginTop: 8 }}>
              <textarea
                value={importText}
                onChange={e => setImportText(e.target.value)}
                placeholder="粘贴 Base64 存档数据..."
                style={{ width: '100%', height: 60, background: 'var(--bg-card)', color: 'var(--fg)', border: '1px solid var(--border)', borderRadius: 6, padding: 8, fontSize: 12 }}
              />
              <button className="action-btn accent" onClick={importSave} style={{ marginTop: 4 }}>确认导入</button>
            </div>
          )}
          <button className="action-btn danger"
            onClick={() => { if (confirm('⚠️ 确定重置？所有进度将丢失！此操作不可撤销！')) { if (confirm('再次确认：真的要重置吗？')) reset(); } }}>
            🗑️ 重置游戏
          </button>
        </div>
      </Card>

      {/* ── 关于 ── */}
      <Card title="ℹ️ 关于">
        <div className="stat-row"><span className="stat-label">版本</span><span>v12.0「仙途指引」</span></div>
        <div className="stat-row"><span className="stat-label">引擎</span><span>React + Zustand + Vite</span></div>
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

