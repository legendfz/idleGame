/**
 * SaveManager — 存档读写、导入导出、版本迁移
 */

const SAVE_KEY = 'xiyou-idle-v2';
const SAVE_VERSION = 1;

export interface SaveData {
  version: number;
  timestamp: number;
  state: Record<string, unknown>;
}

export function exportSave(): string {
  const raw = localStorage.getItem(SAVE_KEY);
  if (!raw) return '';
  const data: SaveData = {
    version: SAVE_VERSION,
    timestamp: Date.now(),
    state: JSON.parse(raw),
  };
  return btoa(JSON.stringify(data));
}

export function importSave(encoded: string): boolean {
  try {
    const json = atob(encoded);
    const data: SaveData = JSON.parse(json);
    if (data.version > SAVE_VERSION) {
      console.warn('Save version newer than current');
    }
    localStorage.setItem(SAVE_KEY, JSON.stringify(data.state));
    return true;
  } catch {
    return false;
  }
}

export function clearSave(): void {
  localStorage.removeItem(SAVE_KEY);
}

export function getLastSaveTime(): number | null {
  const raw = localStorage.getItem(SAVE_KEY);
  if (!raw) return null;
  try {
    const state = JSON.parse(raw);
    return state?.state?.timestamp || null;
  } catch {
    return null;
  }
}
