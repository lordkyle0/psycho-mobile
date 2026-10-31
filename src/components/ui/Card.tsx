import React, { ReactNode, useMemo } from 'react';
import { StyleSheet, View, ViewProps } from 'react-native';
import { useTheme } from '@/theme/ThemeContext';
import { radii, shadows, spacing } from '@/theme';

type CardProps = ViewProps & {
  children: ReactNode;
  elevated?: boolean;
};

export function Card({
  children,
  style,
  elevated = true,
  ...props
}: CardProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={[styles.card, elevated && styles.elevated, style]} {...props}>
      {children}
    </View>
  );
}

function createStyles(colors: ReturnType<typeof useTheme>['colors']) {
  return StyleSheet.create({
    card: {
      backgroundColor: colors.card,
      borderRadius: radii.xl,
      padding: spacing.lg,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
    },
    elevated: {
      shadowColor: colors.shadow,
      ...shadows.card,
    },
  });
}
