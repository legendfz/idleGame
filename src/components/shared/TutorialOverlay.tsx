/**
 * TutorialOverlay — 新手引导浮层
 */
import { useTutorialStore } from '../../store/tutorial';
import { useUIStore } from '../../store/ui';

export function TutorialOverlay() {
  const step = useTutorialStore(s => s.getCurrentStep());
  const completeStep = useTutorialStore(s => s.completeStep);
  const skip = useTutorialStore(s => s.skip);
  const setView = useUIStore(s => s.setView);

  if (!step) return null;

  return (
    <div style={{
      position: 'fixed', bottom: 80, left: 16, right: 16, zIndex: 1000,
      background: 'linear-gradient(135deg, #1a1a2e, #16213e)',
      border: '1px solid var(--color-accent)',
      borderRadius: 12, padding: 16, boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
    }}>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 8 }}>
        <span style={{ fontSize: 28 }}>{step.icon}</span>
        <div>
          <div style={{ fontWeight: 'bold', fontSize: 14 }}>
            步骤 {step.id}/5: {step.title}
          </div>
          <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{step.desc}</div>
        </div>
      </div>
      {step.reward && (
        <div style={{ fontSize: 11, color: 'var(--color-accent)', marginBottom: 8 }}>
          🎁 奖励: {step.reward.amount} {step.reward.type === 'coins' ? '金币' : step.reward.type === 'xiuwei' ? '修为' : '天赋点'}
        </div>
      )}
      <div style={{ display: 'flex', gap: 8 }}>
        <button style={{
          flex: 1, padding: '8px', border: 'none', borderRadius: 8,
          background: 'var(--color-primary)', color: '#fff', fontSize: 12, fontWeight: 'bold', cursor: 'pointer',
        }} onClick={() => { setView(step.targetTab as any); completeStep(); }}>
          ✅ 完成此步骤
        </button>
        <button style={{
          padding: '8px 12px', border: '1px solid var(--color-border, #333)', borderRadius: 8,
          background: 'transparent', color: 'var(--color-text-muted)', fontSize: 11, cursor: 'pointer',
        }} onClick={skip}>
          跳过引导
        </button>
      </div>
    </div>
  );
}
