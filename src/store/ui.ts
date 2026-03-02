/**
 * UIStore — UI 状态（当前页面、弹窗、动画队列）
 */
import { StateCreator } from 'zustand';

export type ViewId = 'idle' | 'battle' | 'character' | 'inventory' | 'journey';

export interface UISlice {
  currentView: ViewId;
  modalOpen: string | null;
  setView: (view: ViewId) => void;
  openModal: (id: string) => void;
  closeModal: () => void;
}

export const createUISlice: StateCreator<UISlice> = (set) => ({
  currentView: 'idle',
  modalOpen: null,
  setView: (view) => set({ currentView: view }),
  openModal: (id) => set({ modalOpen: id }),
  closeModal: () => set({ modalOpen: null }),
});
