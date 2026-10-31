import { TextStyle } from 'react-native';
import type { ThemeColors } from './colors';
import { lightColors } from './colors';

export function createTypography(colors: ThemeColors) {
  return {
    h1: {
      fontSize: 30,
      fontWeight: '800',
      color: colors.title,
      letterSpacing: -0.8,
      lineHeight: 36,
    } as TextStyle,
    h2: {
      fontSize: 22,
      fontWeight: '800',
      color: colors.title,
      letterSpacing: -0.3,
      lineHeight: 28,
    } as TextStyle,
    h3: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.title,
      lineHeight: 24,
    } as TextStyle,
    body: {
      fontSize: 16,
      fontWeight: '400',
      color: colors.foreground,
      lineHeight: 24,
    } as TextStyle,
    bodySmall: {
      fontSize: 14,
      fontWeight: '400',
      color: colors.mutedForeground,
      lineHeight: 20,
    } as TextStyle,
    label: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.foreground,
      lineHeight: 20,
    } as TextStyle,
    caption: {
      fontSize: 12,
      fontWeight: '500',
      color: colors.mutedForeground,
      lineHeight: 16,
    } as TextStyle,
    overline: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.mutedForeground,
      letterSpacing: 0.8,
      textTransform: 'uppercase',
      lineHeight: 16,
    } as TextStyle,
    value: {
      fontSize: 24,
      fontWeight: '700',
      color: colors.title,
      letterSpacing: -0.4,
      lineHeight: 30,
    } as TextStyle,
  } as const;
}

export type ThemeTypography = ReturnType<typeof createTypography>;

/** @deprecated Use useTheme().typography instead */
export const typography = createTypography(lightColors);
