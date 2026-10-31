import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/theme/ThemeContext';
import { radii, spacing } from '@/theme';
import type { ProgressChartModel } from '@/utils/stats';

type Props = {
  model: ProgressChartModel;
  color?: string;
};

export function ProgressBarsChart({ model, color }: Props) {
  const { colors, typography } = useTheme();
  const styles = useMemo(() => createStyles(typography), [typography]);
  const accent = color ?? colors.primary;
  const max = model.max ?? Math.max(...model.points.map(p => p.value), 1);

  if (!model.points.length) {
    return (
      <Text style={[typography.bodySmall, { color: colors.mutedForeground }]}>
        Aucune donnée à afficher
      </Text>
    );
  }

  return (
    <View style={styles.list}>
      {model.points.map((point, index) => {
        const ratio = max > 0 ? Math.max(0, Math.min(1, point.value / max)) : 0;
        return (
          <View key={`${point.label}-${index}`} style={styles.row}>
            <View style={styles.meta}>
              <Text style={styles.label} numberOfLines={1}>
                {point.label}
              </Text>
              <Text style={[styles.value, { color: point.color ?? accent }]}>
                {model.max === 20
                  ? `${point.value.toFixed(1)} / 20`
                  : model.max === 100
                  ? `${Math.round(point.value)} %`
                  : Number.isInteger(point.value)
                  ? point.value
                  : point.value.toFixed(1)}
              </Text>
            </View>
            <View style={[styles.track, { backgroundColor: colors.muted }]}>
              <View
                style={[
                  styles.fill,
                  {
                    width: `${ratio * 100}%`,
                    backgroundColor: point.color ?? accent,
                  },
                ]}
              />
            </View>
          </View>
        );
      })}
    </View>
  );
}

function createStyles(typography: ReturnType<typeof useTheme>['typography']) {
  return StyleSheet.create({
    list: { gap: spacing.md },
    row: { gap: spacing.sm },
    meta: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: spacing.md,
    },
    label: { ...typography.label, flex: 1 },
    value: typography.caption,
    track: {
      height: 8,
      borderRadius: radii.full,
      overflow: 'hidden',
    },
    fill: {
      height: '100%',
      borderRadius: radii.full,
    },
  });
}
