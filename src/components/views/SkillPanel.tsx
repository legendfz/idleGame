/**
 * SkillPanel — 神通技能卡片
 */
import { useSkillStore } from '../../store/skill';
import { SKILLS, getSkillDef } from '../../engine/skill';
import { useState, useEffect } from 'react';

export function SkillPanel() {
  const instances = useSkillStore(s => s.instances);
  const wudao = useSkillStore(s => s.wudao);
  const upgrade = useSkillStore(s => s.upgrade);
  const activate = useSkillStore(s => s.activate);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <div>
      <div style={{ fontSize: 13, marginBottom: 8 }}>悟道值: <span style={{ color: 'var(--color-accent)', fontWeight: 'bold' }}>{wudao}</span></div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
        {SKILLS.map(def => {
          const inst = instances[def.id];
          const level = inst?.level ?? 0;
          const cost = level < def.maxLevel ? (def.wudaoCost[level] ?? '?') : '满级';
          const cdEnd = inst?.cooldownEnd ?? 0;
          const onCd = cdEnd > now;
          const cdSec = onCd ? Math.ceil((cdEnd - now) / 1000) : 0;

          return (
            <div key={def.id} style={{
              background: 'var(--color-bg-elevated)', borderRadius: 10, padding: 10,
              border: level > 0 ? '1px solid var(--color-accent)' : '1px solid var(--color-border, #333)',
            }}>
              <div style={{ textAlign: 'center', fontSize: 28 }}>{def.icon}</div>
              <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: 12, marginTop: 4 }}>
                {def.name} <span style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>Lv.{level}/{def.maxLevel}</span>
              </div>
              <div style={{ fontSize: 10, color: 'var(--color-text-muted)', textAlign: 'center', marginTop: 2 }}>{def.desc}</div>
              {def.active && level > 0 && (
                <button disabled={onCd} style={{
                  width: '100%', marginTop: 6, padding: 4, border: 'none', borderRadius: 6,
                  background: onCd ? 'var(--color-bg-muted)' : '#e67e22', color: '#fff', fontSize: 10, cursor: onCd ? 'not-allowed' : 'pointer',
                }} onClick={() => activate(def.id)}>
                  {onCd ? `CD ${cdSec}s` : `🔥 ${def.active.desc}`}
                </button>
              )}
              {level < def.maxLevel && (
                <button disabled={wudao < (def.wudaoCost[level] ?? 9999)} style={{
                  width: '100%', marginTop: 4, padding: 4, border: 'none', borderRadius: 6,
                  background: wudao >= (def.wudaoCost[level] ?? 9999) ? 'var(--color-primary)' : 'var(--color-bg-muted)',
                  color: '#fff', fontSize: 10, cursor: wudao >= (def.wudaoCost[level] ?? 9999) ? 'pointer' : 'not-allowed',
                }} onClick={() => upgrade(def.id)}>
                  升级 ({cost}悟道)
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
