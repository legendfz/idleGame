/**
 * ReincarnationPanel — 六道轮回选择界面
 */
import { useReincarnationStore } from '../../store/reincarnation';
import { DAOS, reincarnationCost, canReincarnate, getDaoDef, DAO_FRUITS } from '../../engine/reincarnation';
import { usePlayerStore } from '../../store/player';
import { getRealmConfig } from '../../data/config';

const BUFF_LABELS: Record<string, string> = {
  atkPercent: '攻击', defPercent: '防御', xiuweiPercent: '修为', coinPercent: '金币',
  critDmg: '暴伤', hpPercent: '生命', gatherSpeed: '采集',
};

export function ReincarnationPanel() {
  const state = useReincarnationStore(s => s.state);
  const reincarnate = useReincarnationStore(s => s.reincarnate);
  const buffs = useReincarnationStore(s => s.getBuffs());
  const player = usePlayerStore(s => s.player);
  const realm = getRealmConfig(player.realmId);

  const activeBuffs = Object.entries(buffs).filter(([, v]) => v > 0);

  return (
    <div style={{ padding: 16, height: '100%', overflow: 'auto' }}>
      <h2>🔄 六道轮回</h2>
      <div style={{ fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 8 }}>
        轮回次数: {state.totalReincarnations} · 功德: {state.merit}
      </div>

      {activeBuffs.length > 0 && (
        <div style={{ background: 'rgba(255,165,0,0.1)', border: '1px solid var(--color-accent)', borderRadius: 10, padding: '6px 12px', marginBottom: 10, fontSize: 12 }}>
          🔥 轮回加成: {activeBuffs.map(([k, v]) => `${BUFF_LABELS[k] ?? k}+${v}%`).join('　')}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
        {DAOS.map(dao => {
          const count = state.daoCounts[dao.id] ?? 0;
          const cost = reincarnationCost(dao, state.totalReincarnations);
          const check = canReincarnate(state, dao, realm?.order ?? 1);

          return (
            <div key={dao.id} style={{
              background: 'var(--color-bg-elevated)', borderRadius: 10, padding: '10px 12px',
              border: count > 0 ? '1px solid var(--color-accent)' : '1px solid var(--color-border, #333)',
              display: 'flex', gap: 10, alignItems: 'center',
            }}>
              <span style={{ fontSize: 28 }}>{dao.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 'bold', fontSize: 13 }}>
                  {dao.name} <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>×{count}</span>
                </div>
                <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{dao.desc}</div>
                <div style={{ fontSize: 10, color: 'var(--color-accent)', marginTop: 2 }}>
                  {Object.entries(dao.buffs).map(([k, v]) => `${BUFF_LABELS[k] ?? k}+${v}%`).join(' ')}
                  · 需功德 {cost}
                </div>
              </div>
              <button disabled={!check.ok} style={{
                padding: '5px 12px',
                background: check.ok ? 'var(--color-primary)' : 'var(--color-bg-muted)',
                border: 'none', borderRadius: 8, color: '#fff', fontSize: 11,
                cursor: check.ok ? 'pointer' : 'not-allowed',
              }} onClick={() => reincarnate(dao.id)}>轮回</button>
            </div>
          );
        })}
      </div>

      <h3 style={{ fontSize: 14, marginBottom: 8 }}>🍎 道果</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {DAO_FRUITS.map((fruit, i) => {
          const count = state.daoCounts[fruit.dao] ?? 0;
          const unlocked = count >= fruit.count;
          const dao = getDaoDef(fruit.dao);
          return (
            <div key={i} style={{
              fontSize: 12, padding: '4px 8px', borderRadius: 6,
              background: unlocked ? 'rgba(76,175,80,0.1)' : 'transparent',
              color: unlocked ? '#4caf50' : 'var(--color-text-muted)',
            }}>
              {unlocked ? '✅' : '🔒'} {fruit.name} ({dao?.name}{fruit.count}次) — {BUFF_LABELS[fruit.buff.type] ?? fruit.buff.type}+{fruit.buff.value}%
            </div>
          );
        })}
      </div>
    </div>
  );
}
