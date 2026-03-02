/**
 * useGameLoop — 接入 TickEngine 的 React hook
 */
import { useEffect, useRef } from 'react';
import { tickEngine } from '../engine';

export function useGameLoop() {
  const started = useRef(false);

  useEffect(() => {
    if (!started.current) {
      tickEngine.start();
      started.current = true;
    }
    return () => {
      tickEngine.stop();
      started.current = false;
    };
  }, []);

  return { running: tickEngine.running, elapsed: tickEngine.elapsed };
}
