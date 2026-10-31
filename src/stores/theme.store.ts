import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appearance, ColorSchemeName } from 'react-native';

export type ThemeMode = 'light' | 'dark' | 'system';

const STORAGE_KEY = '@psycho/theme-mode';

type ThemeState = {
  mode: ThemeMode;
  isHydrated: boolean;
  hydrate: () => Promise<void>;
  setMode: (mode: ThemeMode) => Promise<void>;
  toggle: () => Promise<void>;
  resolveScheme: () => 'light' | 'dark';
};

function resolveScheme(
  mode: ThemeMode,
  systemScheme: ColorSchemeName,
): 'light' | 'dark' {
  if (mode === 'system') {
    return systemScheme === 'dark' ? 'dark' : 'light';
  }
  return mode;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  mode: 'system',
  isHydrated: false,

  hydrate: async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      const mode = (stored as ThemeMode | null) ?? 'system';
      set({ mode, isHydrated: true });
    } catch {
      set({ isHydrated: true });
    }
  },

  setMode: async mode => {
    await AsyncStorage.setItem(STORAGE_KEY, mode);
    set({ mode });
  },

  toggle: async () => {
    const current = get().resolveScheme();
    await get().setMode(current === 'dark' ? 'light' : 'dark');
  },

  resolveScheme: () =>
    resolveScheme(get().mode, Appearance.getColorScheme() ?? 'light'),
}));
