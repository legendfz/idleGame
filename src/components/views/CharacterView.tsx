/**
 * CharacterView — 角色面板
 */
import { getAllCharacters } from '../../data/config';

export function CharacterView() {
  const characters = getAllCharacters();

  return (
    <div className="view-character">
      <h2>🐒 角色</h2>
      {characters.map(c => (
        <div key={c.id} className="char-card">
          <span>{c.icon} {c.name}</span>
          <span className="char-role">{c.role}</span>
          <p className="char-passive">{c.passive.name}：{c.passive.description}</p>
          <div className="char-stats">
            攻:{c.baseAtk} 防:{c.baseDef} 血:{c.baseHp}
          </div>
        </div>
      ))}
    </div>
  );
}
