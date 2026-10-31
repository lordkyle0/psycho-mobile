import React, { useMemo, useState } from 'react';
import { LayoutChangeEvent, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/theme/ThemeContext';
import { radii, spacing } from '@/theme';
import type { LineChartModel } from '@/utils/stats';

type Props = {
  model: LineChartModel;
  color?: string;
  height?: number;
};

export function LineChart({ model, color, height = 160 }: Props) {
  const { colors, typography } = useTheme();
  const styles = useMemo(() => createStyles(typography), [typography]);
  const accent = color ?? colors.primary;
  const [width, setWidth] = useState(0);

  const points = model.points;
  const min =
    model.min ?? (points.length ? Math.min(...points.map(p => p.value)) : 0);
  const max =
    model.max ?? (points.length ? Math.max(...points.map(p => p.value)) : 1);
  const range = Math.max(max - min, 0.0001);
  const chartH = height - 36;

  const coords = useMemo(() => {
    if (!points.length || width <= 0) return [];
    return points.map((point, index) => {
      const x =
        points.length === 1
          ? width / 2
          : (index / (points.length - 1)) * (width - 16) + 8;
      const y = chartH - ((point.value - min) / range) * (chartH - 16) - 8;
      return { x, y, ...point };
    });
  }, [points, width, chartH, min, range]);

  const onLayout = (e: LayoutChangeEvent) => {
    setWidth(e.nativeEvent.layout.width);
  };

  if (!points.length) {
    return (
      <View style={[styles.empty, { height }]}>
        <Text style={[typography.bodySmall, { color: colors.mutedForeground }]}>
          Pas encore assez de données
        </Text>
      </View>
    );
  }

  return (
    <View style={{ height }} onLayout={onLayout}>
      <View style={[styles.plot, { height: chartH }]}>
        {coords.map((point, index) => {
          const barH = Math.max(4, chartH - point.y);
          return (
            <View
              key={`area-${point.label}-${index}`}
              style={[
                styles.area,
                {
                  left: point.x - 6,
                  bottom: 0,
                  height: barH,
                  backgroundColor: accent,
                },
              ]}
            />
          );
        })}

        {coords.slice(0, -1).map((from, index) => {
          const to = coords[index + 1];
          const dx = to.x - from.x;
          const dy = to.y - from.y;
          const length = Math.sqrt(dx * dx + dy * dy);
          const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
          return (
            <View
              key={`line-${index}`}
              style={[
                styles.line,
                {
                  width: length,
                  left: from.x,
                  top: from.y,
                  backgroundColor: accent,
                  transform: [{ rotate: `${angle}deg` }],
                },
              ]}
            />
          );
        })}

        {coords.map((point, index) => (
          <View
            key={`dot-${point.label}-${index}`}
            style={[styles.dotWrap, { left: point.x - 16, top: point.y - 22 }]}
          >
            <Text style={[styles.dotValue, { color: accent }]}>
              {point.value.toFixed(1)}
            </Text>
            <View
              style={[
                styles.dot,
                { backgroundColor: accent, borderColor: colors.card },
              ]}
            />
          </View>
        ))}
      </View>

      <View style={styles.labels}>
        {points.map((point, index) => (
          <Text
            key={`${point.label}-${index}`}
            style={[styles.label, { color: colors.mutedForeground }]}
            numberOfLines={1}
          >
            {point.label}
          </Text>
        ))}
      </View>
    </View>
  );
}

function createStyles(typography: ReturnType<typeof useTheme>['typography']) {
  return StyleSheet.create({
    empty: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    plot: {
      width: '100%',
      position: 'relative',
      overflow: 'hidden',
      borderRadius: radii.lg,
    },
    area: {
      position: 'absolute',
      width: 12,
      opacity: 0.12,
      borderTopLeftRadius: radii.sm,
      borderTopRightRadius: radii.sm,
    },
    line: {
      position: 'absolute',
      height: 2.5,
      borderRadius: 2,
      transformOrigin: 'left center',
    },
    dotWrap: {
      position: 'absolute',
      width: 32,
      alignItems: 'center',
      gap: 2,
    },
    dot: {
      width: 10,
      height: 10,
      borderRadius: radii.full,
      borderWidth: 2,
    },
    dotValue: {
      ...typography.caption,
      fontSize: 10,
      fontWeight: '700',
    },
    labels: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: spacing.sm,
      gap: spacing.xs,
    },
    label: {
      ...typography.caption,
      flex: 1,
      textAlign: 'center',
      fontSize: 11,
    },
  });
}
