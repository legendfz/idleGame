/**
 * v2.0 Game Loop Hook — drives tick via rAF or setInterval
 */

import { useEffect, useRef } from 'react';
import { usePlayerStore } from '../store/playerStore';

export function useGameLoop() {
  const tick = usePlayerStore(s => s.tick);
  const lastTickRef = useRef(Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const dt = (now - lastTickRef.current) / 1000;
      lastTickRef.current = now;
      tick(Math.min(dt, 1)); // cap to 1s per tick
    }, 1000);
    return () => clearInterval(interval);
  }, [tick]);
}
