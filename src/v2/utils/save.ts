/**
 * v2.0 Save Manager
 */

import { SaveDataV2 } from '../types';

const SAVE_KEY = 'xiyou-idle-v2';

export const SaveManager = {
  save(data: SaveDataV2): void {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Save failed:', e);
    }
  },

  load(): SaveDataV2 | null {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return null;
      const data = JSON.parse(raw) as SaveDataV2;
      // Future: version migration here
      return data;
    } catch (e) {
      console.error('Load failed:', e);
      return null;
    }
  },

  exportSave(): string {
    return localStorage.getItem(SAVE_KEY) || '';
  },

  importSave(json: string): SaveDataV2 | null {
    try {
      const data = JSON.parse(json) as SaveDataV2;
      if (data.version !== 'v2.0') {
        console.warn('Unknown save version:', data.version);
        return null;
      }
      return data;
    } catch {
      return null;
    }
  },

  deleteSave(): void {
    localStorage.removeItem(SAVE_KEY);
  },
};
