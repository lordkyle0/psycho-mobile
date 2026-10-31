import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Appearance, StatusBar } from 'react-native';
import { darkColors, lightColors, ThemeColors } from './colors';
import { createTypography, ThemeTypography } from './typography';
import { ThemeMode, useThemeStore } from '@/stores/theme.store';

type ThemeContextValue = {
  colors: ThemeColors;
  typography: ThemeTypography;
  isDark: boolean;
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => Promise<void>;
  toggleTheme: () => Promise<void>;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const mode = useThemeStore(state => state.mode);
  const hydrate = useThemeStore(state => state.hydrate);
  const setMode = useThemeStore(state => state.setMode);
  const toggle = useThemeStore(state => state.toggle);

  const [systemScheme, setSystemScheme] = useState(Appearance.getColorScheme());

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    const sub = Appearance.addChangeListener(({ colorScheme }) => {
      setSystemScheme(colorScheme);
    });
    return () => sub.remove();
  }, []);

  const isDark = useMemo(() => {
    if (mode === 'system') {
      return systemScheme === 'dark';
    }
    return mode === 'dark';
  }, [mode, systemScheme]);

  const colors = isDark ? darkColors : lightColors;
  const typography = useMemo(() => createTypography(colors), [colors]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      colors,
      typography,
      isDark,
      mode,
      setMode,
      toggleTheme: toggle,
    }),
    [colors, typography, isDark, mode, setMode, toggle],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

/** Force le thème clair (onboarding / auth) sans toucher au mode global. */
export function LightThemeScope({ children }: { children: ReactNode }) {
  const parent = useTheme();
  const lightTypography = useMemo(() => createTypography(lightColors), []);

  const value = useMemo<ThemeContextValue>(
    () => ({
      ...parent,
      colors: lightColors,
      typography: lightTypography,
      isDark: false,
    }),
    [parent, lightTypography],
  );

  useEffect(() => {
    StatusBar.setBarStyle('dark-content', true);
    return () => {
      StatusBar.setBarStyle(
        parent.isDark ? 'light-content' : 'dark-content',
        true,
      );
    };
  }, [parent.isDark]);

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return ctx;
}
