import { describe, it, expect } from 'vitest';
import { D, add, sub, mul, div, gte, lt, formatBig, toDecStr, fromDecStr } from './bignum';

describe('BigNum', () => {
  it('creates Decimal from number', () => {
    expect(D(42).toNumber()).toBe(42);
  });

  it('creates Decimal from string', () => {
    expect(D('1e100').gt(D(0))).toBe(true);
  });

  it('add', () => {
    expect(add('100', '200').toNumber()).toBe(300);
  });

  it('sub floors at 0', () => {
    expect(sub('50', '100').toNumber()).toBe(0);
  });

  it('sub normal', () => {
    expect(sub('200', '50').toNumber()).toBe(150);
  });

  it('mul', () => {
    expect(mul('10', '20').toNumber()).toBe(200);
  });

  it('div by zero returns 0', () => {
    expect(div('100', '0').toNumber()).toBe(0);
  });

  it('gte', () => {
    expect(gte('100', '50')).toBe(true);
    expect(gte('50', '100')).toBe(false);
    expect(gte('100', '100')).toBe(true);
  });

  it('lt', () => {
    expect(lt('50', '100')).toBe(true);
    expect(lt('100', '50')).toBe(false);
  });

  it('serialization roundtrip', () => {
    const original = D('1.5e50');
    const str = toDecStr(original);
    const restored = fromDecStr(str);
    expect(restored.eq(original)).toBe(true);
  });

  it('formatBig small numbers', () => {
    expect(formatBig('1234')).toBe('1,234');
  });

  it('formatBig K', () => {
    expect(formatBig('12345')).toBe('12.3K');
  });

  it('formatBig M', () => {
    expect(formatBig('1234567')).toBe('1.23M');
  });

  it('formatBig B', () => {
    expect(formatBig('1234567890')).toBe('1.23B');
  });

  it('formatBig T', () => {
    expect(formatBig('1234567890000')).toBe('1.23T');
  });

  it('formatBig scientific', () => {
    const result = formatBig('1e50');
    expect(result).toContain('e50');
  });
});
