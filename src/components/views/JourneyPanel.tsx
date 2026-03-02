/**
 * JourneyPanel — 取经进度面板
 */
import { useJourneyStore } from '../../store/journey';

export function JourneyPanel() {
  const journey = useJourneyStore(s => s.journey);

  return (
    <div className="journey-panel">
      <h3>取经进度</h3>
      <div>当前难数: {journey.currentStage} / 81</div>
      <div>已通关: {Object.values(journey.stages).filter(s => s.stars > 0).length}</div>
    </div>
  );
}
