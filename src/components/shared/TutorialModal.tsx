/**
 * TutorialModal — 新手引导(3步)
 */
import { useState } from 'react';

const STEPS = [
  { icon: '🧘', title: '修炼', desc: '点击修炼积累修为，达到要求后突破境界！每个境界解锁新功能。' },
  { icon: '⚔️', title: '战斗', desc: '挑战取经路上的妖怪，点击攻击打败Boss！限时内击杀即可通关。' },
  { icon: '📈', title: '成长', desc: '装备强化、锻造神兵、采集材料、挑战秘境——不断变强，西天取经！' },
];

const STORAGE_KEY = 'xiyou_tutorial_done';

export function TutorialModal() {
  const [step, setStep] = useState(0);
  const [dismissed, setDismissed] = useState(() => localStorage.getItem(STORAGE_KEY) === '1');

  if (dismissed) return null;

  const current = STEPS[step];

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000,
    }}>
      <div style={{
        background: 'var(--color-bg-elevated, #1e1e2e)', border: '2px solid var(--color-accent, #ffa500)',
        borderRadius: 16, padding: '28px 24px', maxWidth: '85%', textAlign: 'center',
      }}>
        <div style={{ fontSize: 48, marginBottom: 8 }}>{current.icon}</div>
        <h3 style={{ margin: '0 0 8px', fontSize: 20 }}>{current.title}</h3>
        <p style={{ fontSize: 14, color: 'var(--color-text, #ccc)', lineHeight: 1.6, margin: '0 0 16px' }}>{current.desc}</p>
        <div style={{ fontSize: 12, color: 'var(--color-text-muted, #888)', marginBottom: 12 }}>
          {step + 1} / {STEPS.length}
        </div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
          {step > 0 && (
            <button style={{ padding: '8px 20px', background: 'var(--color-bg-muted, #333)', border: 'none', borderRadius: 8, color: '#ccc', cursor: 'pointer' }}
              onClick={() => setStep(step - 1)}>上一步</button>
          )}
          {step < STEPS.length - 1 ? (
            <button style={{ padding: '8px 24px', background: 'var(--color-primary, #6c5ce7)', border: 'none', borderRadius: 8, color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}
              onClick={() => setStep(step + 1)}>下一步</button>
          ) : (
            <button style={{ padding: '8px 24px', background: 'var(--color-accent, #ffa500)', border: 'none', borderRadius: 8, color: '#000', fontWeight: 'bold', cursor: 'pointer' }}
              onClick={() => { localStorage.setItem(STORAGE_KEY, '1'); setDismissed(true); }}>开始取经！</button>
          )}
        </div>
      </div>
    </div>
  );
}
