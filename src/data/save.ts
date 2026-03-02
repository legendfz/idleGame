/**
 * SaveManager — 存档读写、导入导出、版本迁移
 * 基于 TECH-SPEC §4.2, §5.3
 */
import { eventBus } from '../engine/events';

const SAVE_KEY = 'xiyou_idle_save';
const SAVE_VERSION = 1;

export interface SaveFile {
  magic: 'XIYOU_IDLE';
  version: number;
  timestamp: number;
  data: string; // JSON.stringify(GameState)
}

export const SaveManager = {
  /**
   * 保存到 localStorage
   */
  save(state: any): void {
    try {
      const saveFile: SaveFile = {
        magic: 'XIYOU_IDLE',
        version: SAVE_VERSION,
        timestamp: Date.now(),
        data: JSON.stringify(state),
      };
      localStorage.setItem(SAVE_KEY, JSON.stringify(saveFile));
      eventBus.emit({ type: 'SAVE_COMPLETE' });
    } catch (e) {
      const error = e instanceof Error ? e.message : String(e);
      console.error('Save failed:', error);
      eventBus.emit({ type: 'SAVE_ERROR', error });
    }
  },

  /**
   * 从 localStorage 加载
   */
  load(): any | null {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return null;
      const saveFile = JSON.parse(raw) as SaveFile;
      if (saveFile.magic !== 'XIYOU_IDLE') {
        console.warn('Invalid save file magic');
        return null;
      }
      const data = JSON.parse(saveFile.data);
      return this.migrateIfNeeded(data, saveFile.version);
    } catch (e) {
      console.error('Load failed:', e);
      return null;
    }
  },

  /**
   * 导出为 JSON Blob
   */
  exportToFile(): Blob {
    const raw = localStorage.getItem(SAVE_KEY) || '{}';
    return new Blob([raw], { type: 'application/json' });
  },

  /**
   * 从文件导入
   */
  async importFromFile(file: File): Promise<any> {
    const text = await file.text();
    const saveFile = JSON.parse(text) as SaveFile;
    if (saveFile.magic !== 'XIYOU_IDLE') throw new Error('Invalid save file');
    const data = JSON.parse(saveFile.data);
    return this.migrateIfNeeded(data, saveFile.version);
  },

  /**
   * 删除存档
   */
  deleteSave(): void {
    localStorage.removeItem(SAVE_KEY);
  },

  /**
   * 获取最后保存时间
   */
  getLastSaveTime(): number | null {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return null;
      const saveFile = JSON.parse(raw) as SaveFile;
      return saveFile.timestamp;
    } catch {
      return null;
    }
  },

  /**
   * 版本迁移
   */
  migrateIfNeeded(data: any, fromVersion: number): any {
    if (fromVersion === SAVE_VERSION) return data;
    // Future migrations here
    console.log(`Migrating save from v${fromVersion} to v${SAVE_VERSION}`);
    return data;
  },

  /**
   * 自动保存间隔 (30s)
   */
  startAutoSave(getState: () => any, intervalMs: number = 30000): () => void {
    const id = setInterval(() => {
      this.save(getState());
    }, intervalMs);

    // 页面关闭前保存
    const beforeUnload = () => this.save(getState());
    window.addEventListener('beforeunload', beforeUnload);

    return () => {
      clearInterval(id);
      window.removeEventListener('beforeunload', beforeUnload);
    };
  },
};
