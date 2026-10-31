import React, { useMemo } from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { Card } from '@/components/ui/Card';
import { RingChart } from '@/components/charts/RingChart';
import { BarChart } from '@/components/charts/BarChart';
import { LineChart } from '@/components/charts/LineChart';
import { ProgressBarsChart } from '@/components/charts/ProgressBarsChart';
import { SplitChart } from '@/components/charts/SplitChart';
import { useTheme } from '@/theme/ThemeContext';
import { spacing } from '@/theme';
import type { ChartModel } from '@/utils/stats';

type Props = {
  title: string;
  subtitle?: string;
  model: ChartModel;
  color?: string;
  style?: ViewStyle;
};

/** Sélecteur de modèle : ring | bars | line | progress | split */
export function StatsChart({ title, subtitle, model, color, style }: Props) {
  const { colors, typography } = useTheme();
  const styles = useMemo(() => createStyles(typography), [typography]);

  return (
    <Card style={[styles.card, style]}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? (
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
            {subtitle}
          </Text>
        ) : null}
      </View>

      {model.type === 'ring' ? (
        <View style={styles.center}>
          <RingChart model={model} color={color} />
        </View>
      ) : null}
      {model.type === 'bars' ? <BarChart model={model} color={color} /> : null}
      {model.type === 'line' ? <LineChart model={model} color={color} /> : null}
      {model.type === 'progress' ? (
        <ProgressBarsChart model={model} color={color} />
      ) : null}
      {model.type === 'split' ? <SplitChart model={model} /> : null}
    </Card>
  );
}

function createStyles(typography: ReturnType<typeof useTheme>['typography']) {
  return StyleSheet.create({
    card: { gap: spacing.lg },
    header: { gap: spacing.xs },
    title: typography.h3,
    subtitle: typography.bodySmall,
    center: { alignItems: 'center' },
  });
}
