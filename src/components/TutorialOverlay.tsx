/**
 * TutorialOverlay — 新手引导浮层
 */
import { useGameStore } from '../store/gameStore';

const STEPS = [
  { id: 1, icon: '·', title: '开始修炼', desc: '战斗会自动进行，每秒获取灵石和经验。观察你的角色自动战斗吧！', tab: 'battle' as const },
  { id: 2, icon: '·', title: '初战告捷', desc: '你已经在战斗了！击败敌人获取灵石和装备，变得更强！', tab: 'battle' as const },
  { id: 3, icon: '·', title: '装备强化', desc: '打开背包查看获得的装备，装备它们提升战力！', tab: 'bag' as const },
  { id: 4, icon: '·', title: '境界突破', desc: '等级和蟠桃足够后，点击突破提升境界，属性大幅增长！', tab: 'battle' as const },
  { id: 5, icon: '·', title: '踏上征途', desc: '查看成就系统，完成挑战获取额外奖励！', tab: 'achievement' as const },
];

export function TutorialOverlay() {
  const tutorialStep = useGameStore(s => s.player.tutorialStep);
  const tutorialDone = useGameStore(s => s.player.tutorialDone);
  const advance = useGameStore(s => s.advanceTutorial);
  const skip = useGameStore(s => s.skipTutorial);
  const setTab = useGameStore(s => s.setTab);

  if (tutorialDone || tutorialStep > 5) return null;
  const step = STEPS.find(s => s.id === tutorialStep);
  if (!step) return null;

  return (
    <div style={{
      position: 'fixed', bottom: 70, left: 12, right: 12, zIndex: 1000,
      background: 'linear-gradient(135deg, #1a1a2e, #16213e)',
      border: '1px solid var(--accent, #f0c040)',
      borderRadius: 12, padding: 16, boxShadow: '0 4px 20px rgba(0,0,0,0.6)',
    }}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 10 }}>
        <span style={{ fontSize: 16, color: 'var(--accent)' }}>{step.icon}</span>
        <div>
          <div style={{ fontWeight: 'bold', fontSize: 14, color: '#fff' }}>
            步骤 {step.id}/5: {step.title}
          </div>
          <div style={{ fontSize: 12, color: '#aaa', marginTop: 2 }}>{step.desc}</div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={() => { setTab(step.tab); advance(); }} style={{
          flex: 1, padding: 8, border: 'none', borderRadius: 8,
          background: 'var(--accent, #f0c040)', color: '#000', fontSize: 12, fontWeight: 'bold', cursor: 'pointer',
        }}>
          知道了
        </button>
        <button onClick={skip} style={{
          padding: '8px 12px', border: '1px solid #444', borderRadius: 8,
          background: 'transparent', color: '#888', fontSize: 11, cursor: 'pointer',
        }}>
          跳过
        </button>
      </div>
    </div>
  );
}
