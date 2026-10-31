import type { NavigatorScreenParams } from '@react-navigation/native';
import type { ArchetypeKey } from '@/content/archetypes';

export type MainTabParamList = {
  Today: undefined;
  Checkin: undefined;
  Goals: undefined;
  Progress: undefined;
  Settings: undefined;
};

export type RootStackParamList = {
  Onboarding: undefined;
  Main: NavigatorScreenParams<MainTabParamList> | undefined;
  GoalDetail: { goalId: string };
  Archetype: { archetypeKey: ArchetypeKey };
  DayCheckin: { date: string };
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
