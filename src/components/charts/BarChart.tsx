import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/theme/ThemeContext';
import { radii, spacing } from '@/theme';
import type { BarChartModel } from '@/utils/stats';

type Props = {
  model: BarChartModel;
  color?: string;
  height?: number;
};

export function BarChart({ model, color, height = 140 }: Props) {
  const { colors, typography } = useTheme();
  const styles = useMemo(() => createStyles(typography), [typography]);
  const accent = color ?? colors.primary;
  const max = model.max ?? Math.max(...model.points.map(p => p.value), 1);

  return (
    <View style={[styles.wrap, { height }]}>
      <View style={styles.bars}>
        {model.points.map((point, index) => {
          const ratio = max > 0 ? Math.max(0.04, point.value / max) : 0.04;
          return (
            <View key={`${point.label}-${index}`} style={styles.col}>
              <Text style={[styles.value, { color: colors.mutedForeground }]}>
                {point.value > 0 ? point.value : ''}
              </Text>
              <View style={[styles.track, { backgroundColor: colors.muted }]}>
                <View
                  style={[
                    styles.fill,
                    {
                      height: `${ratio * 100}%`,
                      backgroundColor: point.color ?? accent,
                    },
                  ]}
                />
              </View>
              <Text style={[styles.label, { color: colors.mutedForeground }]}>
                {point.label}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

function createStyles(typography: ReturnType<typeof useTheme>['typography']) {
  return StyleSheet.create({
    wrap: { width: '100%' },
    bars: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'flex-end',
      gap: spacing.sm,
    },
    col: {
      flex: 1,
      alignItems: 'center',
      gap: spacing.xs,
      height: '100%',
    },
    value: {
      ...typography.caption,
      fontSize: 10,
      minHeight: 14,
    },
    track: {
      flex: 1,
      width: '70%',
      maxWidth: 28,
      borderRadius: radii.sm,
      overflow: 'hidden',
      justifyContent: 'flex-end',
    },
    fill: {
      width: '100%',
      borderRadius: radii.sm,
      minHeight: 4,
    },
    label: {
      ...typography.caption,
      fontSize: 11,
    },
  });
}
