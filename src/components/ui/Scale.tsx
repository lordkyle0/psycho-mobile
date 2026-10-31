import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/theme/ThemeContext';
import { radii, spacing } from '@/theme';

type ScaleProps = {
  label?: string;
  value: number | null;
  onChange: (value: number | null) => void;
  max?: number;
  lowLabel?: string;
  highLabel?: string;
  color?: string;
};

/** Échelle de notation 1..max ; un second appui sur la valeur la remet à vide. */
export function Scale({
  label,
  value,
  onChange,
  max = 5,
  lowLabel,
  highLabel,
  color,
}: ScaleProps) {
  const { colors, typography } = useTheme();
  const styles = useMemo(
    () => createStyles(colors, typography),
    [colors, typography],
  );
  const active = color ?? colors.primary;

  return (
    <View style={styles.wrap}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={styles.row}>
        {Array.from({ length: max }, (_, i) => i + 1).map(n => {
          const selected = value != null && n <= value;
          return (
            <Pressable
              key={n}
              accessibilityRole="button"
              accessibilityLabel={`${label ?? ''} ${n} sur ${max}`}
              accessibilityState={{ selected: value === n }}
              onPress={() => onChange(value === n ? null : n)}
              style={[
                styles.item,
                selected && { backgroundColor: active, borderColor: active },
              ]}
            >
              <Text style={[styles.itemText, selected && styles.itemTextOn]}>
                {n}
              </Text>
            </Pressable>
          );
        })}
      </View>
      {lowLabel || highLabel ? (
        <View style={styles.hints}>
          <Text style={styles.hint}>{lowLabel}</Text>
          <Text style={styles.hint}>{highLabel}</Text>
        </View>
      ) : null}
    </View>
  );
}

function createStyles(
  colors: ReturnType<typeof useTheme>['colors'],
  typography: ReturnType<typeof useTheme>['typography'],
) {
  return StyleSheet.create({
    wrap: { gap: spacing.sm },
    label: typography.label,
    row: { flexDirection: 'row', gap: spacing.sm },
    item: {
      flex: 1,
      height: 40,
      borderRadius: radii.md,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.muted,
      alignItems: 'center',
      justifyContent: 'center',
    },
    itemText: { ...typography.label, color: colors.mutedForeground },
    itemTextOn: { color: colors.white },
    hints: { flexDirection: 'row', justifyContent: 'space-between' },
    hint: { ...typography.caption, fontSize: 11 },
  });
}
