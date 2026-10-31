import { createNavigationContainerRef } from '@react-navigation/native';
import type { MainTabParamList, RootStackParamList } from './types';

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

let pendingTab: keyof MainTabParamList | null = null;

/** Ouvre un onglet ; si la navigation n'est pas encore prête (démarrage à froid), l'ouverture est différée. */
export function openTab(tab: keyof MainTabParamList): void {
  if (navigationRef.isReady()) {
    navigationRef.navigate('Main', { screen: tab });
  } else {
    pendingTab = tab;
  }
}

/** À appeler dans NavigationContainer.onReady. */
export function flushPendingNavigation(): void {
  if (pendingTab && navigationRef.isReady()) {
    const tab = pendingTab;
    pendingTab = null;
    navigationRef.navigate('Main', { screen: tab });
  }
}
