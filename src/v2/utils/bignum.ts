/**
 * v2.0 BigNumber wrapper over break_infinity.js
 */

import Decimal from 'break_infinity.js';

export { Decimal };

/** Create Decimal from string/number */
export function D(val: string | number | Decimal): Decimal {
  if (val instanceof Decimal) return val;
  return new Decimal(val);
}

/** Decimal → serializable string */
export function toDecStr(d: Decimal): string {
  return d.toString();
}

/** String → Decimal */
export function fromDecStr(s: string): Decimal {
  return new Decimal(s);
}

/** Safe add */
export function add(a: string | Decimal, b: string | Decimal): Decimal {
  return D(a).add(D(b));
}

/** Safe subtract (floor at 0) */
export function sub(a: string | Decimal, b: string | Decimal): Decimal {
  const result = D(a).sub(D(b));
  return result.lt(0) ? D(0) : result;
}

/** Safe multiply */
export function mul(a: string | Decimal, b: string | Decimal): Decimal {
  return D(a).mul(D(b));
}

/** Safe divide */
export function div(a: string | Decimal, b: string | Decimal): Decimal {
  const bD = D(b);
  if (bD.eq(0)) return D(0);
  return D(a).div(bD);
}

/** a >= b */
export function gte(a: string | Decimal, b: string | Decimal): boolean {
  return D(a).gte(D(b));
}

/** a < b */
export function lt(a: string | Decimal, b: string | Decimal): boolean {
  return D(a).lt(D(b));
}

/** floor */
export function floor(a: string | Decimal): Decimal {
  return D(a).floor();
}

/** max */
export function max(a: string | Decimal, b: string | Decimal): Decimal {
  return Decimal.max(D(a), D(b));
}

/** Format big number for display: 1234 → "1,234", 12345 → "12.3K", etc. */
export function formatBig(d: string | Decimal): string {
  const val = D(d);
  if (val.lt(1e4)) {
    return val.floor().toNumber().toLocaleString();
  }
  if (val.lt(1e6)) return (val.toNumber() / 1e3).toFixed(1) + 'K';
  if (val.lt(1e9)) return (val.toNumber() / 1e6).toFixed(2) + 'M';
  if (val.lt(1e12)) return (val.toNumber() / 1e9).toFixed(2) + 'B';
  if (val.lt(1e15)) return (val.toNumber() / 1e12).toFixed(2) + 'T';
  // Scientific notation for very large
  const exp = Math.floor(val.log10());
  const mantissa = val.div(Decimal.pow(10, exp)).toNumber();
  return `${mantissa.toFixed(2)}e${exp}`;
}
