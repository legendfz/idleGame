import { useState, useRef, useCallback } from 'react';
import { useGameStore } from '../store/gameStore';
import { REALMS } from '../data/realms';
import { formatNumber, formatTime } from '../utils/format';

/** Generate a shareable text card */
function generateShareText(p: any, realm: any, combatPower: number, totalPlayTime: number): string {
  const lines = [
    `🎮 西游·悟空传 — 战绩分享`,
    `━━━━━━━━━━━━━━━━`,
    `🏷️ 境界：${realm?.name ?? '凡人'}`,
    `⭐ 等级：Lv.${p.level}`,
    `⚔️ 战力：${formatNumber(combatPower)}`,
    `🔄 转世：${p.reincarnations ?? 0}次`,
    `✨ 超越：${p.transcendCount ?? 0}次`,
    `💀 击杀：${formatNumber(p.totalKills ?? 0)}`,
    `🕐 时长：${formatTime(totalPlayTime)}`,
    `━━━━━━━━━━━━━━━━`,
    `🌐 https://legendfz.github.io/idleGame/`,
    `来挑战我吧！`,
  ];
  return lines.join('\n');
}

/** Generate a Canvas-based image card */
async function generateShareImage(p: any, realm: any, combatPower: number, totalPlayTime: number): Promise<Blob | null> {
  const W = 400, H = 520;
  const canvas = document.createElement('canvas');
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  // Background gradient
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, '#1a0a2e');
  bg.addColorStop(0.5, '#2d1b4e');
  bg.addColorStop(1, '#0d0618');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Border
  ctx.strokeStyle = '#c084fc';
  ctx.lineWidth = 3;
  ctx.strokeRect(4, 4, W - 8, H - 8);

  // Inner glow line
  ctx.strokeStyle = 'rgba(192,132,252,0.3)';
  ctx.lineWidth = 1;
  ctx.strokeRect(10, 10, W - 20, H - 20);

  // Title
  ctx.textAlign = 'center';
  ctx.fillStyle = '#fbbf24';
  ctx.font = 'bold 26px sans-serif';
  ctx.fillText('西游·悟空传', W / 2, 50);

  ctx.fillStyle = '#a78bfa';
  ctx.font = '14px sans-serif';
  ctx.fillText('— 战绩分享 —', W / 2, 72);

  // Divider
  ctx.strokeStyle = '#7c3aed';
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(40, 85); ctx.lineTo(W - 40, 85); ctx.stroke();

  // Stats
  const stats = [
    ['🏷️ 境界', realm?.name ?? '凡人'],
    ['⭐ 等级', `Lv.${p.level}`],
    ['⚔️ 战力', formatNumber(combatPower)],
    ['🔄 转世', `${p.reincarnations ?? 0}次`],
    ['✨ 超越', `${p.transcendCount ?? 0}次`],
    ['💀 击杀', formatNumber(p.totalKills ?? 0)],
    ['🏆 最高等级', `Lv.${p.highestLevelEver ?? p.level}`],
    ['🕐 游戏时长', formatTime(totalPlayTime)],
    ['🔥 最高连杀', `${p.bestKillStreak ?? 0}`],
    ['🐉 灵兽数', `${(p.pets ?? []).filter((x: any) => x.unlocked).length}/5`],
  ];

  ctx.textAlign = 'left';
  let y = 115;
  for (const [label, value] of stats) {
    ctx.fillStyle = '#d4d4d8';
    ctx.font = '16px sans-serif';
    ctx.fillText(label, 35, y);
    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(String(value), W - 35, y);
    ctx.textAlign = 'left';
    y += 36;
  }

  // Divider
  ctx.strokeStyle = '#7c3aed';
  ctx.beginPath(); ctx.moveTo(40, y + 5); ctx.lineTo(W - 40, y + 5); ctx.stroke();

  // URL
  ctx.textAlign = 'center';
  ctx.fillStyle = '#a78bfa';
  ctx.font = '13px sans-serif';
  ctx.fillText('legendfz.github.io/idleGame', W / 2, y + 30);
  ctx.fillStyle = '#fbbf24';
  ctx.font = 'bold 14px sans-serif';
  ctx.fillText('来挑战我吧！🔥', W / 2, y + 52);

  return new Promise(res => canvas.toBlob(b => res(b), 'image/png'));
}

export function ShareCard({ onClose }: { onClose: () => void }) {
  const p = useGameStore(s => s.player);
  const getEffectiveStats = useGameStore(s => s.getEffectiveStats);
  const totalPlayTime = useGameStore(s => s.totalPlayTime);
  const realm = REALMS[p.realmIndex] ?? REALMS[0];
  const es = getEffectiveStats();
  const combatPower = Math.floor(es.attack * (1 + es.critRate * es.critDmg) + es.maxHp * 0.05);

  const [copied, setCopied] = useState(false);
  const [imgUrl, setImgUrl] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleCopyText = useCallback(async () => {
    const text = generateShareText(p, realm, combatPower, totalPlayTime);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* fallback */ }
  }, [p, realm, combatPower, totalPlayTime]);

  const handleGenImage = useCallback(async () => {
    const blob = await generateShareImage(p, realm, combatPower, totalPlayTime);
    if (blob) {
      const url = URL.createObjectURL(blob);
      setImgUrl(url);
    }
  }, [p, realm, combatPower, totalPlayTime]);

  const handleDownload = useCallback(() => {
    if (!imgUrl) return;
    const a = document.createElement('a');
    a.href = imgUrl;
    a.download = `悟空传-Lv${p.level}-战绩.png`;
    a.click();
  }, [imgUrl, p.level]);

  const handleShareNative = useCallback(async () => {
    if (!navigator.share) return;
    const text = generateShareText(p, realm, combatPower, totalPlayTime);
    try {
      await navigator.share({ title: '西游·悟空传 战绩', text, url: 'https://legendfz.github.io/idleGame/' });
    } catch { /* cancelled */ }
  }, [p, realm, combatPower, totalPlayTime]);

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 20000,
      background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 16,
    }} onClick={onClose}>
      <div style={{
        background: 'linear-gradient(135deg, #1a0a2e, #2d1b4e)',
        borderRadius: 16, border: '2px solid #7c3aed', padding: 20,
        maxWidth: 420, width: '100%', maxHeight: '90vh', overflowY: 'auto',
      }} onClick={e => e.stopPropagation()}>
        <h3 style={{ textAlign: 'center', color: '#fbbf24', margin: '0 0 16px' }}>📜 战绩分享</h3>

        {/* Preview */}
        <div style={{
          background: 'rgba(0,0,0,0.4)', borderRadius: 12, padding: 16, marginBottom: 16,
          border: '1px solid rgba(124,58,237,0.3)', fontSize: 14, lineHeight: 1.8,
        }}>
          <div style={{ textAlign: 'center', color: '#fbbf24', fontWeight: 'bold', fontSize: 18, marginBottom: 8 }}>
            西游·悟空传
          </div>
          {[
            ['境界', realm?.name ?? '凡人'],
            ['等级', `Lv.${p.level}`],
            ['战力', formatNumber(combatPower)],
            ['转世', `${p.reincarnations ?? 0}次`],
            ['超越', `${p.transcendCount ?? 0}次`],
            ['击杀', formatNumber(p.totalKills ?? 0)],
          ].map(([k, v]) => (
            <div key={k} style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#a1a1aa' }}>{k}</span>
              <span style={{ color: '#fbbf24' }}>{v}</span>
            </div>
          ))}
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button onClick={handleCopyText} style={{
            padding: '10px 0', borderRadius: 8, border: 'none', fontWeight: 'bold',
            background: copied ? '#22c55e' : 'linear-gradient(135deg, #7c3aed, #a78bfa)',
            color: '#fff', fontSize: 15, cursor: 'pointer',
          }}>
            {copied ? '✅ 已复制' : '📋 复制文字版'}
          </button>

          {!imgUrl ? (
            <button onClick={handleGenImage} style={{
              padding: '10px 0', borderRadius: 8, border: 'none', fontWeight: 'bold',
              background: 'linear-gradient(135deg, #d97706, #fbbf24)',
              color: '#1a0a2e', fontSize: 15, cursor: 'pointer',
            }}>
              🖼️ 生成图片版
            </button>
          ) : (
            <>
              <img src={imgUrl} alt="战绩卡" style={{ width: '100%', borderRadius: 8 }} />
              <button onClick={handleDownload} style={{
                padding: '10px 0', borderRadius: 8, border: 'none', fontWeight: 'bold',
                background: 'linear-gradient(135deg, #d97706, #fbbf24)',
                color: '#1a0a2e', fontSize: 15, cursor: 'pointer',
              }}>
                💾 保存图片
              </button>
            </>
          )}

          {typeof navigator.share === 'function' && (
            <button onClick={handleShareNative} style={{
              padding: '10px 0', borderRadius: 8, border: 'none', fontWeight: 'bold',
              background: 'linear-gradient(135deg, #2563eb, #60a5fa)',
              color: '#fff', fontSize: 15, cursor: 'pointer',
            }}>
              🔗 系统分享
            </button>
          )}

          <button onClick={onClose} style={{
            padding: '8px 0', borderRadius: 8, border: '1px solid #52525b',
            background: 'transparent', color: '#a1a1aa', fontSize: 14, cursor: 'pointer',
          }}>
            关闭
          </button>
        </div>
      </div>
    </div>
  );
}
