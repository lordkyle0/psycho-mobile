import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/theme/ThemeContext';
import { radii, spacing } from '@/theme';

type TimeStepperProps = {
  hour: number;
  minute: number;
  onChange: (hour: number, minute: number) => void;
};

const STEPS: Array<{ label: string; minutes: number }> = [
  { label: '−1h', minutes: -60 },
  { label: '−15', minutes: -15 },
  { label: '+15', minutes: 15 },
  { label: '+1h', minutes: 60 },
];

/** Sélecteur d'heure simple (boutons −/+), sans dépendance native supplémentaire. */
export function TimeStepper({ hour, minute, onChange }: TimeStepperProps) {
  const { colors, typography } = useTheme();
  const styles = useMemo(
    () => createStyles(colors, typography),
    [colors, typography],
  );

  const step = (delta: number) => {
    const total = (((hour * 60 + minute + delta) % 1440) + 1440) % 1440;
    onChange(Math.floor(total / 60), total % 60);
  };

  const renderStep = (s: (typeof STEPS)[number]) => (
    <Pressable
      key={s.label}
      accessibilityRole="button"
      accessibilityLabel={`${s.minutes > 0 ? 'Ajouter' : 'Retirer'} ${Math.abs(
        s.minutes,
      )} minutes`}
      onPress={() => step(s.minutes)}
      style={({ pressed }) => [styles.step, pressed && styles.pressed]}
    >
      <Text style={styles.stepText}>{s.label}</Text>
    </Pressable>
  );

  return (
    <View style={styles.row}>
      {STEPS.slice(0, 2).map(renderStep)}
      <Text style={styles.time}>
        {String(hour).padStart(2, '0')}:{String(minute).padStart(2, '0')}
      </Text>
      {STEPS.slice(2).map(renderStep)}
    </View>
  );
}

function createStyles(
  colors: ReturnType<typeof useTheme>['colors'],
  typography: ReturnType<typeof useTheme>['typography'],
) {
  return StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: spacing.xs,
    },
    step: {
      borderRadius: radii.md,
      borderWidth: 1,
      borderColor: colors.primary,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.sm,
    },
    pressed: { opacity: 0.8 },
    stepText: {
      ...typography.caption,
      color: colors.primary,
      fontWeight: '700',
    },
    time: { ...typography.value, minWidth: 76, textAlign: 'center' },
  });
}
