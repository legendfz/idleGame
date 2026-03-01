import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { REALMS } from '../data/realms';
import { formatTime } from '../utils/format';

/**
 * v1.1 Feedback form — sends to Google Apps Script → Google Sheet.
 * If APPS_SCRIPT_URL is not set, falls back to mailto: link.
 */

// TODO: Replace with actual Google Apps Script deployment URL
const APPS_SCRIPT_URL = '';

type FeedbackType = 'bug' | 'suggestion' | 'experience';

export default function FeedbackForm() {
  const [type, setType] = useState<FeedbackType>('suggestion');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(false);

  const player = useGameStore(s => s.player);
  const totalPlayTime = useGameStore(s => s.totalPlayTime);

  const gameInfo = `Lv.${player.level} ${REALMS[player.realmIndex]?.name ?? '?'} | 游戏时间 ${formatTime(totalPlayTime)}`;

  const submit = async () => {
    if (!message.trim()) return;
    setSending(true);
    setError(false);

    if (APPS_SCRIPT_URL) {
      try {
        await fetch(APPS_SCRIPT_URL, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type,
            message: message.trim(),
            gameInfo,
            timestamp: new Date().toISOString(),
          }),
        });
        setSent(true);
        setMessage('');
      } catch {
        setError(true);
      }
    } else {
      // GitHub Issues with templates
      const labels: Record<FeedbackType, string> = { bug: 'bug', suggestion: 'enhancement', experience: 'feedback' };
      const titles: Record<FeedbackType, string> = { bug: '🐛 Bug报告', suggestion: '💡 功能建议', experience: '🎮 体验反馈' };
      const templates: Record<FeedbackType, string> = {
        bug: `### Bug 描述\n${message}\n\n### 复现步骤\n1. \n\n### 游戏信息\n${gameInfo}`,
        suggestion: `### 建议内容\n${message}\n\n### 期望效果\n\n\n### 游戏信息\n${gameInfo}`,
        experience: `### 体验描述\n${message}\n\n### 改进建议\n\n\n### 游戏信息\n${gameInfo}`,
      };
      const title = encodeURIComponent(titles[type]);
      const body = encodeURIComponent(templates[type]);
      const label = encodeURIComponent(labels[type]);
      window.open(`https://github.com/legendfz/idleGame/issues/new?title=${title}&body=${body}&labels=${label}`, '_blank');
      setSent(true);
      setMessage('');
    }

    setSending(false);
  };

  if (sent) {
    return (
      <div className="feedback-section">
        <h3 style={{ textAlign: 'center', color: '#4caf50' }}>✅ 感谢反馈！</h3>
        <p style={{ textAlign: 'center', color: '#8b8b9e', fontSize: 12, marginTop: 8 }}>
          你的意见对我们很重要
        </p>
        <button
          className="feedback-btn"
          onClick={() => setSent(false)}
          style={{ marginTop: 12 }}
        >
          📝 继续反馈
        </button>
      </div>
    );
  }

  return (
    <div className="feedback-section">
      <h3 style={{ color: '#f0c040', marginBottom: 8 }}>📝 反馈</h3>

      <div className="feedback-type-row">
        {([['bug', '🐛 Bug'], ['suggestion', '💡 建议'], ['experience', '🎮 体验']] as const).map(([key, label]) => (
          <button
            key={key}
            className={`filter-btn ${type === key ? 'active' : ''}`}
            onClick={() => setType(key)}
          >
            {label}
          </button>
        ))}
      </div>

      <textarea
        className="feedback-textarea"
        value={message}
        onChange={e => setMessage(e.target.value)}
        placeholder="说点什么…"
        rows={3}
        maxLength={500}
      />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 11, color: '#8b8b9e' }}>
          {message.length}/500 · 附带 {gameInfo}
        </span>
        <button
          className="feedback-btn"
          onClick={submit}
          disabled={sending || !message.trim()}
        >
          {sending ? '⏳ 发送中...' : '📤 发送'}
        </button>
      </div>

      {error && (
        <div style={{ color: '#f44336', fontSize: 12, marginTop: 4 }}>
          ❌ 发送失败，请重试
        </div>
      )}
    </div>
  );
}
