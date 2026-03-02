/**
 * ToastContainer — 全局 Toast 弹出通知
 */
import { useUIStore } from '../../store/ui';

const TYPE_COLORS: Record<string, string> = {
  success: 'var(--color-success)',
  info: 'var(--color-info)',
  warn: 'var(--color-warning)',
  error: 'var(--color-danger)',
};

export function ToastContainer() {
  const toasts = useUIStore(s => s.toasts);
  if (toasts.length === 0) return null;

  return (
    <div style={{
      position: 'fixed', top: 60, left: '50%', transform: 'translateX(-50%)',
      zIndex: 999, display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'center',
    }}>
      {toasts.map(t => (
        <div key={t.id} style={{
          background: TYPE_COLORS[t.type] || TYPE_COLORS.info,
          color: '#fff', padding: '8px 20px', borderRadius: 8,
          fontSize: 13, fontWeight: 'bold', boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
          animation: 'fadeInDown 0.3s ease',
        }}>
          {t.text}
        </div>
      ))}
    </div>
  );
}
