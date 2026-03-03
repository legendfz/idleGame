/**
 * 触觉/音效反馈工具
 */
export function vibrate(pattern: number | number[] = 50) {
  try { navigator?.vibrate?.(pattern); } catch {}
}

export function vibrateSuccess() { vibrate([30, 50, 30]); }
export function vibrateFail() { vibrate(100); }
export function vibrateBoss() { vibrate([50, 30, 50, 30, 100]); }
