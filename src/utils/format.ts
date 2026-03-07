/** Format number with Chinese units: 1.2万, 3.4亿, 1.5兆 */
export function formatNumber(n: number): string {
  if (!Number.isFinite(n)) return '0';
  if (n < 0) return '-' + formatNumber(-n);
  if (n < 10000) return Math.floor(n).toLocaleString('zh-CN');
  if (n < 100_000_000) {
    const wan = n / 10000;
    return wan < 10 ? wan.toFixed(1) + '万' : Math.floor(wan).toLocaleString('zh-CN') + '万';
  }
  if (n < 1_000_000_000_000) {
    const yi = n / 100_000_000;
    return yi < 10 ? yi.toFixed(1) + '亿' : Math.floor(yi).toLocaleString('zh-CN') + '亿';
  }
  const zhao = n / 1_000_000_000_000;
  return zhao < 10 ? zhao.toFixed(1) + '兆' : Math.floor(zhao).toLocaleString('zh-CN') + '兆';
}

/** Sanitize a numeric value — clamp NaN/Infinity to 0 */
export function safeNum(n: number): number {
  return Number.isFinite(n) ? n : 0;
}

export function expForLevel(level: number): number {
  return Math.floor(10 * Math.pow(level, 1.5));
}

export function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}h ${m}m ${s}s`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}小时${m}分`;
  return `${m}分钟`;
}
