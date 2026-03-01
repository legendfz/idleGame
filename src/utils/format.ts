/**
 * 大数格式化工具
 */

const SUFFIXES = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc'];

/** 格式化大数字：1234567 → "1.23M" */
export function formatNumber(n: number): string {
  if (n < 1000) return Math.floor(n).toString();

  let tier = 0;
  let scaled = n;
  while (scaled >= 1000 && tier < SUFFIXES.length - 1) {
    scaled /= 1000;
    tier++;
  }

  return scaled < 10
    ? scaled.toFixed(2) + SUFFIXES[tier]
    : scaled < 100
    ? scaled.toFixed(1) + SUFFIXES[tier]
    : Math.floor(scaled) + SUFFIXES[tier];
}

/** 格式化时间：秒 → "8小时23分" */
export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);

  if (h > 0) return `${h}小时${m}分`;
  if (m > 0) return `${m}分${s}秒`;
  return `${s}秒`;
}

/** HP 进度条 */
export function hpBar(current: number, max: number, width: number = 10): string {
  const ratio = Math.max(0, Math.min(1, current / max));
  const filled = Math.round(ratio * width);
  return '█'.repeat(filled) + '░'.repeat(width - filled);
}
