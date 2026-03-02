/**
 * v2.0 UI Store — navigation and transient UI state
 */

import { create } from 'zustand';

export type TabId = 'cultivate' | 'battle' | 'character' | 'inventory' | 'journey';

interface UIStore {
  activeTab: TabId;
  setTab: (tab: TabId) => void;
  toastQueue: { id: number; text: string; type: 'success' | 'info' | 'warn' | 'error' }[];
  addToast: (text: string, type?: 'success' | 'info' | 'warn' | 'error') => void;
  consumeToast: () => void;
}

let toastId = 0;

export const useUIStore = create<UIStore>((set, get) => ({
  activeTab: 'cultivate',
  setTab: (tab) => set({ activeTab: tab }),
  toastQueue: [],
  addToast: (text, type = 'info') => set({ toastQueue: [...get().toastQueue, { id: ++toastId, text, type }] }),
  consumeToast: () => set({ toastQueue: get().toastQueue.slice(1) }),
}));
