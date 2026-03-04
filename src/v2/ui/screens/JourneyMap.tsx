import { useJourneyStore } from '../../store/journeyStore';

export default function JourneyMap() {
  const journey = useJourneyStore(s => s.journey);

  return (
    <div className="v2-screen">
      <h3>[图] 取经地图</h3>
      <div className="v2-journey-info">
        当前：第 {journey.currentStage} 难 / 81
      </div>
      <div className="v2-journey-bar">
        <div className="v2-journey-fill" style={{ width: `${(journey.currentStage / 81) * 100}%` }} />
      </div>
      <div className="v2-placeholder"><p>M2 完善路线图 UI</p></div>
    </div>
  );
}
