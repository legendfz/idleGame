/**
 * useIdleCalc — 修为计算 hook
 */
import { useCallback } from 'react';
import useGameStore from '../store';
import { formatBigNum, bn } from '../engine';

export function useIdleCalc() {
  const xiuwei = useGameStore((s) => s.xiuwei);
  const addXiuwei = useGameStore((s) => s.addXiuwei);

  const formattedXiuwei = formatBigNum(bn(xiuwei || '0'));

  const tap = useCallback(() => {
    addXiuwei('1');
  }, [addXiuwei]);

  return { xiuwei, formattedXiuwei, tap };
}
