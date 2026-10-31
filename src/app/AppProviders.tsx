import React, { useEffect, useMemo, useState } from 'react';
import { StatusBar } from 'react-native';
import {
  DarkTheme,
  DefaultTheme,
  NavigationContainer,
} from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { LoadingScreen } from '@/components/layout/Screen';
import {
  flushPendingNavigation,
  navigationRef,
} from '@/navigation/navigation-ref';
import { RootNavigator } from '@/navigation/RootNavigator';
import { hydrateDb } from '@/services/local-db.service';
import { setupNotificationHandlers } from '@/services/notifications.service';
import { startSyncMonitoring } from '@/services/sync.service';
import { useSettingsStore } from '@/stores/settings.store';
import { ThemeProvider, useTheme } from '@/theme';

function AppContent() {
  const { colors, isDark } = useTheme();
  const settingsHydrated = useSettingsStore(s => s.isHydrated);
  const hydrateSettings = useSettingsStore(s => s.hydrate);
  const [dbReady, setDbReady] = useState(false);

  useEffect(() => {
    hydrateSettings();
    hydrateDb()
      .catch(e => console.warn('Lecture de la base locale impossible', e))
      .finally(() => setDbReady(true));
  }, [hydrateSettings]);

  const ready = settingsHydrated && dbReady;

  useEffect(() => {
    if (!ready) return;
    const stopSync = startSyncMonitoring();
    const stopNotifications = setupNotificationHandlers();
    return () => {
      stopSync();
      stopNotifications();
    };
  }, [ready]);

  const navigationTheme = useMemo(() => {
    const base = isDark ? DarkTheme : DefaultTheme;
    return {
      ...base,
      colors: {
        ...base.colors,
        primary: colors.primary,
        background: colors.backgroundSecondary,
        card: colors.card,
        text: colors.title,
        border: colors.border,
      },
    };
  }, [isDark, colors]);

  if (!ready) return <LoadingScreen />;

  return (
    <>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.backgroundSecondary}
      />
      <NavigationContainer
        ref={navigationRef}
        theme={navigationTheme}
        onReady={flushPendingNavigation}
      >
        <RootNavigator />
      </NavigationContainer>
    </>
  );
}

export function AppProviders() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
