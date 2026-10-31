import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { TabIcon } from '@/components/layout/TabIcon';
import { CheckinScreen } from '@/screens/CheckinScreen';
import { GoalsScreen } from '@/screens/GoalsScreen';
import { ProgressScreen } from '@/screens/ProgressScreen';
import { SettingsScreen } from '@/screens/SettingsScreen';
import { TodayScreen } from '@/screens/TodayScreen';
import { useTheme } from '@/theme/ThemeContext';
import type { MainTabParamList } from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();

type TabBarIconProps = { focused: boolean; color: string };

/** Crée un composant d'icône stable (défini hors rendu) pour un emoji donné. */
function emojiIcon(label: string) {
  return function EmojiTabIcon({ focused, color }: TabBarIconProps) {
    const { colors } = useTheme();
    return (
      <TabIcon
        label={label}
        focused={focused}
        color={color}
        activeBackground={colors.primarySoft}
      />
    );
  };
}

const TodayIcon = emojiIcon('☀️');
const CheckinIcon = emojiIcon('🧭');
const GoalsIcon = emojiIcon('🎯');
const ProgressIcon = emojiIcon('📈');
const SettingsIcon = emojiIcon('⚙️');

export function MainTabs() {
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.mutedForeground,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: 'transparent',
          height: 72,
          paddingBottom: 10,
          paddingTop: 10,
          marginHorizontal: 14,
          marginBottom: 10,
          borderRadius: 24,
          position: 'absolute',
          shadowColor: colors.shadow,
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.12,
          shadowRadius: 18,
          elevation: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="Today"
        component={TodayScreen}
        options={{ title: "Aujourd'hui", tabBarIcon: TodayIcon }}
      />
      <Tab.Screen
        name="Checkin"
        component={CheckinScreen}
        options={{ title: 'Bilan', tabBarIcon: CheckinIcon }}
      />
      <Tab.Screen
        name="Goals"
        component={GoalsScreen}
        options={{ title: 'Objectifs', tabBarIcon: GoalsIcon }}
      />
      <Tab.Screen
        name="Progress"
        component={ProgressScreen}
        options={{ title: 'Progrès', tabBarIcon: ProgressIcon }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ title: 'Réglages', tabBarIcon: SettingsIcon }}
      />
    </Tab.Navigator>
  );
}
