/**
 * useGameLoop — 接入 TickEngine 的 React hook
 */
import { useEffect, useRef } from 'react';
import { usePlayerStore } from '../store/player';
import { useBattleStore } from '../store/battle';
import { SaveManager } from '../data/save';

export function useGameLoop() {
  const tick = usePlayerStore(s => s.tick);
  const tickBattle = useBattleStore(s => s.tickBattle);
  const lastTickRef = useRef(Date.now());

  useEffect(() => {
    // Idle tick (1Hz)
    const idleInterval = setInterval(() => {
      const now = Date.now();
      const dt = (now - lastTickRef.current) / 1000;
      lastTickRef.current = now;
      tick(Math.min(dt, 2));
    }, 1000);

    // Battle tick (60Hz)
    let running = true;
    let lastBattle = Date.now();
    const battleLoop = () => {
      if (!running) return;
      const now = Date.now();
      const dtMs = now - lastBattle;
      lastBattle = now;
      tickBattle(Math.min(dtMs, 100));
      requestAnimationFrame(battleLoop);
    };
    requestAnimationFrame(battleLoop);

    // Auto-save (30s)
    const stopAutoSave = SaveManager.startAutoSave(() => ({
      player: usePlayerStore.getState().player,
    }));

    return () => {
      clearInterval(idleInterval);
      running = false;
      stopAutoSave();
    };
  }, [tick, tickBattle]);
}
