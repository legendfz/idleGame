/**
 * OfflineModal — 离线收益弹窗 (BUG-06 fix)
 */
import { useUIStore } from '../../store/ui';

export function OfflineModal() {
  const modal = useUIStore(s => s.modalContent);
  const setModal = useUIStore(s => s.setModal);

  if (!modal) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
    }} onClick={() => setModal(null)}>
      <div style={{
        background: 'var(--color-bg-elevated)', border: '2px solid var(--color-accent)',
        borderRadius: 16, padding: '24px 32px', maxWidth: '85%', textAlign: 'center',
      }} onClick={e => e.stopPropagation()}>
        {modal.split('\n').map((line, i) => (
          <div key={i} style={{
            fontSize: i === 0 ? 20 : 14,
            fontWeight: i === 0 ? 'bold' : 'normal',
            color: line.includes('🎁') ? 'var(--color-accent)' : 'var(--color-text)',
            marginBottom: 6,
          }}>{line}</div>
        ))}
        <button style={{
          marginTop: 16, padding: '10px 32px', background: 'var(--color-primary)',
          color: '#fff', border: 'none', borderRadius: 10, fontSize: 16, fontWeight: 'bold', cursor: 'pointer',
        }} onClick={() => setModal(null)}>
          领取
        </button>
      </div>
    </div>
  );
}
