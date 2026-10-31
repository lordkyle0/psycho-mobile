import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Profile } from '@/content/archetypes';

const STORAGE_KEY = '@psycho/settings';

export type ReminderTime = {
  enabled: boolean;
  hour: number;
  minute: number;
};

export type AppSettings = {
  name: string;
  profile: Profile | null;
  morning: ReminderTime;
  evening: ReminderTime;
  /** Horodatage serveur de la dernière synchronisation réussie. */
  lastSyncAt: string | null;
  /** URL de la feuille synchronisée à lastSyncAt (une autre URL dans .env relance une synchro complète). */
  lastSyncTarget: string | null;
  lastSyncMessage: string | null;
};

export const DEFAULT_SETTINGS: AppSettings = {
  name: '',
  profile: null,
  morning: { enabled: true, hour: 7, minute: 0 },
  evening: { enabled: true, hour: 21, minute: 30 },
  lastSyncAt: null,
  lastSyncTarget: null,
  lastSyncMessage: null,
};

const SETTINGS_KEYS = Object.keys(DEFAULT_SETTINGS) as (keyof AppSettings)[];

type SettingsState = AppSettings & {
  isHydrated: boolean;
  hydrate: () => Promise<void>;
  update: (patch: Partial<AppSettings>) => Promise<void>;
};

/** Ne garde que les clés connues (ignore les anciennes, ex. syncUrl). */
function pickSettings(
  source: Partial<Record<string, unknown>>,
): Partial<AppSettings> {
  const out: Partial<Record<keyof AppSettings, unknown>> = {};
  for (const key of SETTINGS_KEYS) {
    if (key in source) out[key] = source[key];
  }
  return out as Partial<AppSettings>;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  ...DEFAULT_SETTINGS,
  isHydrated: false,

  hydrate: async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      const stored = raw ? pickSettings(JSON.parse(raw)) : {};
      set({ ...DEFAULT_SETTINGS, ...stored, isHydrated: true });
    } catch {
      set({ isHydrated: true });
    }
  },

  update: async patch => {
    set(patch);
    await AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(pickSettings(get())),
    );
  },
}));
