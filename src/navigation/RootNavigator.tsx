import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ArchetypeScreen } from '@/screens/ArchetypeScreen';
import { DayCheckinScreen } from '@/screens/DayCheckinScreen';
import { GoalDetailScreen } from '@/screens/GoalDetailScreen';
import { OnboardingScreen } from '@/screens/OnboardingScreen';
import { useSettingsStore } from '@/stores/settings.store';
import { useTheme } from '@/theme/ThemeContext';
import { formatShortDate, parseDayKey } from '@/utils/dates';
import { MainTabs } from './MainTabs';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const { colors } = useTheme();
  const onboarded = useSettingsStore(s => s.profile != null);

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.backgroundSecondary },
        headerTintColor: colors.primary,
        headerTitleStyle: { color: colors.title },
        headerShadowVisible: false,
        headerBackTitle: 'Retour',
        animation: 'fade_from_bottom',
      }}
    >
      {onboarded ? (
        <>
          <Stack.Screen
            name="Main"
            component={MainTabs}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="GoalDetail"
            component={GoalDetailScreen}
            options={{ title: 'Objectif' }}
          />
          <Stack.Screen
            name="Archetype"
            component={ArchetypeScreen}
            options={{ title: 'Archétype' }}
          />
          <Stack.Screen
            name="DayCheckin"
            component={DayCheckinScreen}
            options={({ route }) => ({
              title: `Bilan · ${formatShortDate(
                parseDayKey(route.params.date),
              )}`,
            })}
          />
        </>
      ) : (
        <Stack.Screen
          name="Onboarding"
          component={OnboardingScreen}
          options={{ headerShown: false }}
        />
      )}
    </Stack.Navigator>
  );
}
