import React, { ReactNode, useMemo } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/theme/ThemeContext';
import { spacing } from '@/theme';

type ScreenProps = {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  headerRight?: ReactNode;
  /** When true, skip top safe-area (native stack header already handles it). */
  nested?: boolean;
};

export function Screen({
  title,
  subtitle,
  children,
  headerRight,
  nested = false,
}: ScreenProps) {
  const { colors, typography } = useTheme();
  const styles = useMemo(
    () => createStyles(colors, typography),
    [colors, typography],
  );

  return (
    <SafeAreaView
      style={styles.safe}
      edges={nested ? ['left', 'right'] : ['top', 'left', 'right']}
    >
      <View pointerEvents="none" style={styles.ambientOne} />
      <View pointerEvents="none" style={styles.ambientTwo} />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.content, nested && styles.contentNested]}>
            {(title || subtitle || headerRight) && (
              <View style={styles.header}>
                <View style={styles.headerText}>
                  {title ? <Text style={styles.title}>{title}</Text> : null}
                  {subtitle ? (
                    <Text style={styles.subtitle}>{subtitle}</Text>
                  ) : null}
                </View>
                {headerRight}
              </View>
            )}
            {children}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export function LoadingScreen({
  message = 'Chargement...',
}: {
  message?: string;
}) {
  const { colors, typography } = useTheme();
  const styles = useMemo(
    () => createStyles(colors, typography),
    [colors, typography],
  );

  return (
    <SafeAreaView style={styles.loading}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={styles.loadingText}>{message}</Text>
    </SafeAreaView>
  );
}

function createStyles(
  colors: ReturnType<typeof useTheme>['colors'],
  typography: ReturnType<typeof useTheme>['typography'],
) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.backgroundSecondary },
    flex: { flex: 1 },
    scroll: { flexGrow: 1, paddingBottom: 108 },
    content: {
      paddingHorizontal: spacing.xl,
      paddingTop: spacing.xl,
      gap: spacing.lg,
    },
    contentNested: { paddingTop: spacing.md },
    header: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: spacing.md,
    },
    headerText: { flex: 1, gap: spacing.xs },
    title: { ...typography.h2, fontSize: 26, lineHeight: 32 },
    subtitle: typography.bodySmall,
    loading: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.md,
      backgroundColor: colors.backgroundSecondary,
    },
    loadingText: typography.bodySmall,
    ambientOne: {
      position: 'absolute',
      width: 230,
      height: 230,
      borderRadius: 115,
      right: -120,
      top: -90,
      backgroundColor: colors.primarySoft,
      opacity: 0.65,
    },
    ambientTwo: {
      position: 'absolute',
      width: 150,
      height: 150,
      borderRadius: 75,
      left: -110,
      top: 300,
      backgroundColor: colors.violetSoft,
      opacity: 0.35,
    },
  });
}
