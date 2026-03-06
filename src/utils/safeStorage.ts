/** Safe localStorage wrapper for restricted WebViews (e.g. Telegram) */

let _available: boolean | null = null;

function isAvailable(): boolean {
  if (_available !== null) return _available;
  try {
    const key = '__test__';
    localStorage.setItem(key, '1');
    localStorage.removeItem(key);
    _available = true;
  } catch {
    _available = false;
  }
  return _available;
}

export const safeStorage = {
  getItem(key: string): string | null {
    if (!isAvailable()) return null;
    try { return localStorage.getItem(key); } catch { return null; }
  },
  setItem(key: string, value: string): void {
    if (!isAvailable()) return;
    try { localStorage.setItem(key, value); } catch {}
  },
  removeItem(key: string): void {
    if (!isAvailable()) return;
    try { localStorage.removeItem(key); } catch {}
  },
};
