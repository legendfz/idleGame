/**
 * 副本列表页
 */

import { DUNGEONS } from '../data/dungeons';
import { useDungeonStore } from '../store/dungeonStore';
import { useGameStore } from '../store/gameStore';
import { REALMS } from '../data/realms';
import { formatNumber } from '../utils/format';

interface Props {
  onStartDungeon: (id: string) => void;
}

export default function DungeonList({ onStartDungeon }: Props) {
  const player = useGameStore(s => s.player);
  const progress = useDungeonStore(s => s.progress);
  const dailyAttempts = useDungeonStore(s => s.dailyAttempts);
  const canEnter = useDungeonStore(s => s.canEnterDungeon);

  return (
    <div className="dungeon-list">
      <h3 style={{ textAlign: 'center', color: '#f0c040', marginBottom: 16 }}>取经副本</h3>

      {DUNGEONS.map(d => {
        const prog = progress[d.id];
        const isCleared = prog?.cleared ?? false;
        const attempts = dailyAttempts[d.id] ?? 0;
        const canGo = canEnter(d.id, player.level, player.realmIndex);
        const realmName = REALMS[d.requiredRealmIndex]?.name ?? '?';

        let lockReason = '';
        if (player.level < d.requiredLevel) lockReason = `需要 Lv.${d.requiredLevel}`;
        else if (player.realmIndex < d.requiredRealmIndex) lockReason = `需要 ${realmName}`;
        else if (d.prerequisite && !progress[d.prerequisite]?.cleared) lockReason = '需通关前置副本';
        else if (isCleared && attempts >= d.dailyLimit) lockReason = `今日已挑战 ${d.dailyLimit}/${d.dailyLimit}`;

        return (
          <div
            key={d.id}
            className="dungeon-card"
            style={{
              opacity: canGo ? 1 : 0.5,
              borderLeft: `3px solid ${isCleared ? '#4caf50' : canGo ? '#f0c040' : '#555'}`,
              marginBottom: 10,
            }}
          >
            <div className="dungeon-header">
              <span className="dungeon-icon">{d.icon}</span>
              <div className="dungeon-info">
                <div className="dungeon-name">
                  {isCleared && '[通关] '}{d.name}
                  <span style={{ fontSize: 11, color: '#8b8b9e', marginLeft: 4 }}>
                    第{d.chapter}难
                  </span>
                </div>
                <div style={{ fontSize: 11, color: '#8b8b9e', marginTop: 2 }}>
                  Lv.{d.requiredLevel} · {realmName} · Boss: {d.boss.name}
                </div>
              </div>
            </div>

            <div style={{ fontSize: 11, color: '#8b8b9e', margin: '6px 0' }}>
              {d.description}
            </div>

            <div style={{ fontSize: 11, color: '#8b8b9e' }}>
              灵石 {formatNumber(d.rewards.lingshi[0])}~{formatNumber(d.rewards.lingshi[1])} · 蟠桃 x{d.rewards.pantao}
              {isCleared && ` · 通关 ${prog!.clearCount}次`}
              {prog?.bestTime != null && ` · 最快 ${Math.floor(prog.bestTime)}秒`}
            </div>

            <div style={{ marginTop: 8 }}>
              {canGo ? (
                <button className="small-btn accent" onClick={() => onStartDungeon(d.id)}>
                  {isCleared ? `挑战 (${attempts}/${d.dailyLimit})` : '首次挑战'}
                </button>
              ) : (
                <span style={{ fontSize: 11, color: '#f44336' }}>[锁定] {lockReason}</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
