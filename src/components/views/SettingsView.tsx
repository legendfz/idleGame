/**
 * SettingsView — 设置面板: 存档管理+动画+版本
 */
import { useState } from 'react';
import { useUIStore } from '../../store/ui';

const SAVE_KEY = 'xiyou_idle_save';
const GAME_VERSION = '12.0.0';

export function SettingsView() {
  const addToast = useUIStore(s => s.addToast);
  const [animOff, setAnimOff] = useState(() => localStorage.getItem('xiyou_anim_off') === '1');

  const toggleAnim = () => {
    const next = !animOff;
    setAnimOff(next);
    localStorage.setItem('xiyou_anim_off', next ? '1' : '0');
    addToast(next ? '动画已关闭' : '动画已开启', 'info');
  };

  const exportSave = () => {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) { addToast('无存档', 'warn'); return; }
    const b64 = btoa(unescape(encodeURIComponent(raw)));
    navigator.clipboard.writeText(b64).then(
      () => addToast('存档已复制到剪贴板', 'success'),
      () => {
        // fallback: download
        const blob = new Blob([b64], { type: 'text/plain' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `xiyou_save_${Date.now()}.txt`;
        a.click();
        addToast('存档已下载', 'success');
      },
    );
  };

  const importSave = () => {
    const b64 = prompt('粘贴存档码:');
    if (!b64) return;
    try {
      const json = decodeURIComponent(escape(atob(b64)));
      JSON.parse(json); // validate
      localStorage.setItem(SAVE_KEY, json);
      addToast('导入成功，刷新页面生效', 'success');
      setTimeout(() => location.reload(), 1000);
    } catch {
      addToast('存档码无效', 'warn');
    }
  };

  const resetSave = () => {
    if (!confirm('确定重置所有数据？此操作不可恢复！')) return;
    localStorage.removeItem(SAVE_KEY);
    addToast('存档已清除，刷新中...', 'info');
    setTimeout(() => location.reload(), 500);
  };

  const btnStyle = (bg: string) => ({
    width: '100%', padding: '10px', border: 'none', borderRadius: 8,
    background: bg, color: '#fff', fontSize: 13, cursor: 'pointer', marginBottom: 8,
  });

  return (
    <div style={{ padding: 16, height: '100%', overflow: 'auto' }}>
      <h2>⚙️ 设置</h2>

      <div style={{ marginTop: 16 }}>
        <h3 style={{ fontSize: 14, marginBottom: 8 }}>🎬 动画</h3>
        <button onClick={toggleAnim} style={btnStyle(animOff ? '#4caf50' : '#666')}>
          {animOff ? '🔴 动画已关闭 (点击开启)' : '🟢 动画已开启 (点击关闭)'}
        </button>
      </div>

      <div style={{ marginTop: 16 }}>
        <h3 style={{ fontSize: 14, marginBottom: 8 }}>💾 存档管理</h3>
        <button onClick={exportSave} style={btnStyle('var(--color-primary)')}>📤 导出存档</button>
        <button onClick={importSave} style={btnStyle('#2196f3')}>📥 导入存档</button>
        <button onClick={resetSave} style={btnStyle('#e74c3c')}>🗑️ 重置存档</button>
      </div>

      <div style={{ marginTop: 24, textAlign: 'center', color: 'var(--color-text-muted)', fontSize: 11 }}>
        <div>🎮 西游·修仙录</div>
        <div>版本 v{GAME_VERSION}</div>
        <div>React 19 + Zustand + Vite</div>
      </div>
    </div>
  );
}
