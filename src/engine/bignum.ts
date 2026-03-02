/**
 * BigNum — Decimal 封装 + 格式化
 * v2.0 Engine Layer
 */
import Decimal from 'break_infinity.js';

export type BigNum = Decimal;

export const ZERO = new Decimal(0);
export const ONE = new Decimal(1);

export function bn(value: number | string | Decimal): Decimal {
  return new Decimal(value);
}

const SUFFIXES = ['', 'K', 'M', 'B', 'T', 'aa', 'ab', 'ac', 'ad', 'ae', 'af'];

/**
 * 格式化大数字为可读字符串
 * e.g. 1234 -> "1.23K", 1e12 -> "1.00T"
 */
export function formatBigNum(value: Decimal, decimals = 2): string {
  if (value.lt(1000)) {
    return value.toFixed(decimals);
  }
  const exp = Math.floor(value.log10().toNumber());
  const tier = Math.floor(exp / 3);
  if (tier < SUFFIXES.length) {
    const scaled = value.div(Decimal.pow(10, tier * 3));
    return scaled.toFixed(decimals) + SUFFIXES[tier];
  }
  return value.toExponential(decimals);
}

export { Decimal };
