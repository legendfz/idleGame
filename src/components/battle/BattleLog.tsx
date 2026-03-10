import { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { Card } from '../../pages/shared';

type LogFilter = 'all' | 'drop' | 'levelup' | 'boss' | 'crit';

export function BattleLog() {
  const log = useGameStore(s => s.battle.log);
  const [logFilter, setLogFilter] = useState<LogFilter>('all');

  const filteredLog = log.filter(e => {
    if (logFilter === 'all') return true;
    if (logFilter === 'drop') return e.type === 'drop';
    if (logFilter === 'levelup') return e.type === 'levelup';
    if (logFilter === 'boss') return e.type === 'boss';
    if (logFilter === 'crit') return e.type === 'crit';
    return true;
  });
  const visibleLog = filteredLog.slice(-10);

  return (
    <Card className="battle-log-card">
      <div className="log-filter-tabs">
        {([['all','全部'],['drop','掉落'],['levelup','升级'],['crit','暴击'],['boss','Boss']] as const).map(([k,l]) => (
          <button key={k} className={`log-filter-btn${logFilter===k?' active':''}`} onClick={()=>setLogFilter(k as LogFilter)}>{l}</button>
        ))}
      </div>
      <div className="battle-log">
        {visibleLog.map(entry => (
          <div key={entry.id} className={`log-${entry.type}`}>{entry.text}</div>
        ))}
      </div>
    </Card>
  );
}
