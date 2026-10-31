import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/theme/ThemeContext';
import { spacing } from '@/theme';
import type { RingChartModel } from '@/utils/stats';

type Props = {
  model: RingChartModel;
  color?: string;
  size?: number;
  segments?: number;
};

/** Anneau segmenté — compatible RN sans SVG */
export function RingChart({ model, color, size = 124, segments = 36 }: Props) {
  const { colors, typography } = useTheme();
  const styles = useMemo(() => createStyles(typography), [typography]);
  const accent = color ?? colors.primary;
  const ratio =
    model.max > 0 ? Math.max(0, Math.min(1, model.value / model.max)) : 0;
  const filledCount = Math.round(ratio * segments);
  const radius = size * 0.38;
  const center = size / 2;
  const tickW = Math.max(3, size * 0.035);
  const tickH = Math.max(8, size * 0.1);

  return (
    <View style={[styles.wrap, { width: size, height: size }]}>
      {Array.from({ length: segments }).map((_, index) => {
        const angle = (index / segments) * Math.PI * 2 - Math.PI / 2;
        const x = center + Math.cos(angle) * radius - tickW / 2;
        const y = center + Math.sin(angle) * radius - tickH / 2;
        const filled = index < filledCount;
        return (
          <View
            key={index}
            style={[
              styles.tick,
              {
                width: tickW,
                height: tickH,
                left: x,
                top: y,
                backgroundColor: filled ? accent : colors.muted,
                transform: [{ rotate: `${(angle * 180) / Math.PI + 90}deg` }],
              },
            ]}
          />
        );
      })}
      <View style={styles.center}>
        <Text style={[styles.value, { color: colors.title }]}>
          {model.label ?? `${Math.round(ratio * 100)}%`}
        </Text>
        {model.subtitle ? (
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
            {model.subtitle}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

function createStyles(typography: ReturnType<typeof useTheme>['typography']) {
  return StyleSheet.create({
    wrap: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    tick: {
      position: 'absolute',
      borderRadius: 99,
    },
    center: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: spacing.sm,
      gap: 2,
    },
    value: {
      ...typography.h3,
      fontSize: 22,
    },
    subtitle: {
      ...typography.caption,
      textAlign: 'center',
    },
  });
}
