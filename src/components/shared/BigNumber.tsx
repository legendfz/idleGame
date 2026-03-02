/** 大数字显示组件 */
import { formatBigNum, bn } from '../../engine';

interface BigNumberProps {
  value: string;
  decimals?: number;
  className?: string;
}

export function BigNumber({ value, decimals = 2, className }: BigNumberProps) {
  return <span className={className}>{formatBigNum(bn(value), decimals)}</span>;
}
