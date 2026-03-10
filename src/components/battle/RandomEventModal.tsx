import { useState, useEffect, useCallback, useRef } from 'react';
import { useGameStore } from '../../store/gameStore';
import { getRandomEvent, resolveChoice, type RandomEvent, type EventChoice } from '../../data/randomEvents';
import { formatNumber } from '../../utils/format';

export function RandomEventModal() {
  const player = useGameStore(s => s.player);
  const activeStory = useGameStore(s => s.activeStory);
  const autoEvent = useGameStore(s => s.autoEvent);
  const totalKills = player.totalKills;

  const [activeEvent, setActiveEvent] = useState<RandomEvent | null>(null);
  const [eventResult, setEventResult] = useState<{ success: boolean; rewards: Record<string, number>; message: string } | null>(null);
  const lastEventKills = useRef(0);

  useEffect(() => {
    if (totalKills > 0 && totalKills - lastEventKills.current >= 80 && !activeEvent && !activeStory) {
      const evt = getRandomEvent(player.level);
      if (evt) {
        setActiveEvent(evt);
        lastEventKills.current = totalKills;
      }
    }
  }, [totalKills, player.level, activeEvent, activeStory]);

  const handleEventChoice = useCallback((choice: EventChoice) => {
    const result = resolveChoice(choice, player.level);
    setEventResult(result);
    const state = useGameStore.getState();
    const p = { ...state.player };
    if (result.rewards.lingshi) p.lingshi = Math.max(0, p.lingshi + result.rewards.lingshi);
    if (result.rewards.exp) p.exp += result.rewards.exp;
    if (result.rewards.pantao) p.pantao = Math.max(0, p.pantao + result.rewards.pantao);
    if (result.rewards.shards) p.hongmengShards += result.rewards.shards;
    if (result.rewards.scrolls) p.tianmingScrolls += result.rewards.scrolls;
    if (result.rewards.daoPoints) p.daoPoints = (p.daoPoints ?? 0) + result.rewards.daoPoints;
    useGameStore.setState({ player: p });
  }, [player.level]);

  const dismissEvent = useCallback(() => {
    setActiveEvent(null);
    setEventResult(null);
  }, []);

  // Auto-event
  useEffect(() => {
    if (autoEvent && activeEvent && !eventResult) {
      const timer = setTimeout(() => handleEventChoice(activeEvent.choices[0]), 100);
      return () => clearTimeout(timer);
    }
  }, [autoEvent, activeEvent, eventResult, handleEventChoice]);
  useEffect(() => {
    if (autoEvent && eventResult) {
      const timer = setTimeout(dismissEvent, 300);
      return () => clearTimeout(timer);
    }
  }, [autoEvent, eventResult, dismissEvent]);

  if (!activeEvent) return null;

  return (
    <div className="event-modal-overlay" onClick={eventResult ? dismissEvent : undefined}>
      <div className="event-modal" onClick={e => e.stopPropagation()}>
        <div className="event-emoji">{activeEvent.emoji}</div>
        <div className="event-title">{activeEvent.name}</div>
        <div className="event-desc">{activeEvent.description}</div>
        {!eventResult ? (
          <div className="event-choices">
            {activeEvent.choices.map((c, i) => (
              <button key={i} className="event-choice-btn" onClick={() => handleEventChoice(c)}>
                <span className="event-choice-label">{c.label}</span>
                <span className="event-choice-desc">{c.description}</span>
              </button>
            ))}
          </div>
        ) : (
          <div className="event-result">
            <div className={`event-result-msg ${eventResult.success ? 'success' : 'fail'}`}>
              {eventResult.success ? '✅' : '❌'} {eventResult.message}
            </div>
            {Object.entries(eventResult.rewards).filter(([,v]) => v !== 0).length > 0 && (
              <div className="event-rewards">
                {Object.entries(eventResult.rewards).filter(([,v]) => v !== 0).map(([k, v]) => (
                  <span key={k} className={`event-reward-tag ${v > 0 ? 'gain' : 'loss'}`}>
                    {k === 'lingshi' ? '💰' : k === 'exp' ? '📖' : k === 'pantao' ? '🍑' : k === 'shards' ? '💎' : k === 'scrolls' ? '📜' : '🎁'}
                    {v > 0 ? '+' : ''}{formatNumber(v)}
                  </span>
                ))}
              </div>
            )}
            <button className="event-dismiss-btn" onClick={dismissEvent}>继续冒险</button>
          </div>
        )}
      </div>
    </div>
  );
}
