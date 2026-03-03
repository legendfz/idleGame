/**
 * StrategyPanel — 战斗策略选择
 */
import { useStrategyStore } from '../../store/strategy';
import { STRATEGIES, canUnlockStrategy } from '../../engine/strategy';
import { usePlayerStore } from '../../store/player';
import { getRealmConfig } from '../../data/config';

const BUFF_LABELS: Record<string, string> = {
  atkPercent: '攻击', defPercent: '防御', critRate: '暴击率', hpPercent: '生命',
};

export function StrategyPanel() {
  const activeId = useStrategyStore(s => s.activeStrategyId);
  const setStrategy = useStrategyStore(s => s.setStrategy);
  const player = usePlayerStore(s => s.player);
  const realm = getRealmConfig(player.realmId);
  const realmOrder = realm?.order ?? 1;

  return (
    <div>
      <div style={{ fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 8 }}>
        当前策略: {STRATEGIES.find(s => s.id === activeId)?.name}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {STRATEGIES.map(def => {
          const unlocked = canUnlockStrategy(def, realmOrder);
          const isActive = activeId === def.id;
          const bonusEntries = Object.entries(def.bonuses);

          return (
            <div key={def.id} style={{
              background: 'var(--color-bg-elevated)', borderRadius: 10, padding: '10px 12px',
              border: isActive ? '1px solid var(--color-accent)' : '1px solid var(--color-border, #333)',
              opacity: unlocked ? 1 : 0.4, display: 'flex', gap: 10, alignItems: 'center',
            }}>
              <span style={{ fontSize: 28 }}>{def.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 'bold', fontSize: 13 }}>{def.name}</div>
                <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{def.desc}</div>
                {bonusEntries.length > 0 && (
                  <div style={{ fontSize: 10, color: 'var(--color-accent)', marginTop: 2 }}>
                    {bonusEntries.map(([k, v]) => `${BUFF_LABELS[k] ?? k}+${v}%`).join(' ')}
                  </div>
                )}
                {!unlocked && <div style={{ fontSize: 10, color: '#e74c3c' }}>需{def.unlockRealm}境解锁</div>}
              </div>
              {unlocked && !isActive && (
                <button style={{
                  padding: '5px 12px', background: 'var(--color-primary)', border: 'none', borderRadius: 8,
                  color: '#fff', fontSize: 11, cursor: 'pointer',
                }} onClick={() => setStrategy(def.id)}>选择</button>
              )}
              {isActive && <span style={{ color: 'var(--color-accent)', fontSize: 12 }}>✅ 使用中</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
