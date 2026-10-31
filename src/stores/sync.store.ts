import { create } from 'zustand';

export type SyncResult = {
  ok: boolean;
  skipped?: boolean;
  pushed: number;
  pulled: number;
  message: string;
};

type SyncState = {
  isOnline: boolean;
  isSyncing: boolean;
  lastResult: SyncResult | null;
  setOnline: (isOnline: boolean) => void;
  setSyncing: (isSyncing: boolean) => void;
  setLastResult: (result: SyncResult) => void;
};

export const useSyncStore = create<SyncState>(set => ({
  isOnline: true,
  isSyncing: false,
  lastResult: null,
  setOnline: isOnline => set({ isOnline }),
  setSyncing: isSyncing => set({ isSyncing }),
  setLastResult: lastResult => set({ lastResult }),
}));
