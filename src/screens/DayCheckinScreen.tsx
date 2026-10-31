import React from 'react';
import { Text } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CheckinForm } from '@/components/checkin/CheckinForm';
import { Screen } from '@/components/layout/Screen';
import type { RootStackParamList } from '@/navigation/types';
import { useTheme } from '@/theme/ThemeContext';

type Props = NativeStackScreenProps<RootStackParamList, 'DayCheckin'>;

export function DayCheckinScreen({ route }: Props) {
  const { typography } = useTheme();
  const { date } = route.params;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return (
      <Screen nested>
        <Text style={typography.bodySmall}>Date invalide.</Text>
      </Screen>
    );
  }
  return (
    <Screen nested>
      <CheckinForm date={date} />
    </Screen>
  );
}
