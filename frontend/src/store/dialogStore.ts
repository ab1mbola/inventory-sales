import { create } from 'zustand';

interface DialogState {
  isOpen: boolean;
  title: string;
  message: string;
  type: 'alert' | 'confirm' | 'success';
  resolve: ((value: boolean) => void) | null;
  showAlert: (message: string, title?: string, type?: 'alert' | 'success') => Promise<void>;
  showConfirm: (message: string, title?: string) => Promise<boolean>;
  handleConfirm: () => void;
  handleCancel: () => void;
}

export const useDialogStore = create<DialogState>((set) => ({
  isOpen: false,
  title: '',
  message: '',
  type: 'alert',
  resolve: null,

  showAlert: (message, title = 'Notice', type = 'alert') => {
    return new Promise<void>((resolve) => {
      set({
        isOpen: true,
        title,
        message,
        type,
        resolve: () => resolve(),
      });
    });
  },

  showConfirm: (message, title = 'Confirm Action') => {
    return new Promise<boolean>((resolve) => {
      set({
        isOpen: true,
        title,
        message,
        type: 'confirm',
        resolve,
      });
    });
  },

  handleConfirm: () => {
    set((state) => {
      if (state.resolve) {
        state.resolve(true);
      }
      return { isOpen: false, resolve: null };
    });
  },

  handleCancel: () => {
    set((state) => {
      if (state.resolve) {
        state.resolve(false);
      }
      return { isOpen: false, resolve: null };
    });
  },
}));
