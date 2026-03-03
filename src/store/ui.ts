/**
 * UIStore — UI 状态（当前页面、弹窗、动画队列）
 */
import { create } from 'zustand';

export type ViewId = 'idle' | 'battle' | 'character' | 'inventory' | 'journey' | 'forge' | 'gather' | 'dungeon' | 'cultivation' | 'quest' | 'stats';

interface Toast {
  id: number;
  text: string;
  type: 'success' | 'info' | 'warn' | 'error';
}

interface UIStore {
  currentView: ViewId;
  showOfflineReward: boolean;
  toasts: Toast[];
  modalContent: string | null;

  setView: (view: ViewId) => void;
  showOffline: (show: boolean) => void;
  addToast: (text: string, type?: Toast['type']) => void;
  removeToast: (id: number) => void;
  setModal: (content: string | null) => void;
}

let toastId = 0;

export const useUIStore = create<UIStore>((set, get) => ({
  currentView: 'idle',
  showOfflineReward: false,
  toasts: [],
  modalContent: null,

  setView: (view) => set({ currentView: view }),
  showOffline: (show) => set({ showOfflineReward: show }),

  addToast: (text, type = 'info') => {
    const id = ++toastId;
    set(s => ({ toasts: [...s.toasts, { id, text, type }] }));
    setTimeout(() => get().removeToast(id), 3000);
  },

  removeToast: (id) => set(s => ({ toasts: s.toasts.filter(t => t.id !== id) })),
  setModal: (content) => set({ modalContent: content }),
}));
