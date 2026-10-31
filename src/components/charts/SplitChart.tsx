import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/theme/ThemeContext';
import { radii, spacing } from '@/theme';
import type { SplitDonutModel } from '@/utils/stats';

type Props = {
  model: SplitDonutModel;
  height?: number;
};

/** Répartition horizontale type “donut aplati” + légende */
export function SplitChart({ model, height = 14 }: Props) {
  const { colors, typography } = useTheme();
  const styles = useMemo(() => createStyles(typography), [typography]);
  const segments = model.segments.filter(
    segment => Number.isFinite(segment.value) && segment.value > 0,
  );
  const total = segments.reduce((sum, segment) => sum + segment.value, 0);

  if (!total) {
    return (
      <Text style={[typography.bodySmall, { color: colors.mutedForeground }]}>
        Aucune donnée
      </Text>
    );
  }

  return (
    <View style={styles.wrap}>
      <View style={[styles.track, { height, backgroundColor: colors.muted }]}>
        {segments.map((segment, index) => (
          <View
            key={`${segment.label}-segment-${index}`}
            style={[
              styles.segment,
              {
                width: `${(segment.value / total) * 100}%`,
                backgroundColor: segment.color,
              },
            ]}
          />
        ))}
      </View>
      <View style={styles.legend}>
        {segments.map((segment, index) => (
          <View
            key={`${segment.label}-legend-${index}`}
            style={styles.legendItem}
          >
            <View style={[styles.dot, { backgroundColor: segment.color }]} />
            <Text style={styles.legendText}>
              {segment.label} · {formatCompact(segment.value)}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function formatCompact(value: number): string {
  if (value >= 1000) {
    return `${Math.round(value / 1000)}k`;
  }
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

function createStyles(typography: ReturnType<typeof useTheme>['typography']) {
  return StyleSheet.create({
    wrap: { gap: spacing.md },
    track: {
      width: '100%',
      borderRadius: radii.full,
      overflow: 'hidden',
      flexDirection: 'row',
    },
    segment: { height: '100%' },
    legend: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.md,
    },
    legendItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    dot: {
      width: 8,
      height: 8,
      borderRadius: radii.full,
    },
    legendText: typography.caption,
  });
}
