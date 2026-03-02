/**
 * JourneyMap — 取经地图
 */
import { useJourneyStore } from '../../store/journey';
import { getAllStages } from '../../data/config';

export function JourneyMap() {
  const journey = useJourneyStore(s => s.journey);
  const stages = getAllStages();

  return (
    <div className="view-journey">
      <h2>🗺️ 取经路 — {journey.currentStage - 1}/81 难</h2>
      <div className="journey-bar">
        <div className="journey-fill" style={{ width: `${((journey.currentStage - 1) / 81) * 100}%` }} />
      </div>
      <div className="stage-list">
        {stages.map(stage => {
          const record = journey.stages[stage.id];
          const cleared = record && record.stars > 0;
          const locked = stage.id > journey.currentStage;
          return (
            <div key={stage.id} className={`stage-node ${cleared ? 'cleared' : ''} ${locked ? 'locked' : ''}`}>
              <span>{stage.boss.icon} {stage.name}</span>
              {cleared && <span>{'⭐'.repeat(record!.stars)}</span>}
              {locked && <span>🔒</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
