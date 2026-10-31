import React, { useMemo, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from 'react-native';
import { useTheme } from '@/theme/ThemeContext';
import { radii, spacing } from '@/theme';

type InputProps = TextInputProps & {
  label?: string;
  error?: string;
  showPasswordToggle?: boolean;
  icon?: string;
  iconHint?: string;
};

export function Input({
  label,
  error,
  style,
  secureTextEntry,
  showPasswordToggle,
  icon,
  iconHint,
  ...props
}: InputProps) {
  const { colors, typography } = useTheme();
  const styles = useMemo(
    () => createStyles(colors, typography),
    [colors, typography],
  );
  const [visible, setVisible] = useState(false);
  const [utilityHint, setUtilityHint] = useState<string>();
  const isPassword = Boolean(secureTextEntry || showPasswordToggle);
  const passwordActionLabel = visible
    ? 'Masquer le mot de passe'
    : 'Afficher le mot de passe';

  return (
    <View style={styles.wrapper}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={styles.inputWrap}>
        {icon ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={iconHint ?? `Aide pour le champ ${label ?? ''}`}
            accessibilityHint="Maintenez pour afficher son utilité"
            delayLongPress={350}
            onPress={() => iconHint && setUtilityHint(iconHint)}
            onLongPress={() => iconHint && setUtilityHint(iconHint)}
            style={styles.leadingIcon}
          >
            <Text style={styles.leadingIconText}>{icon}</Text>
          </Pressable>
        ) : null}
        <TextInput
          placeholderTextColor={colors.mutedForeground}
          style={[
            styles.input,
            icon && styles.inputWithIcon,
            isPassword && styles.inputWithToggle,
            error && styles.inputError,
            style,
          ]}
          secureTextEntry={isPassword ? !visible : false}
          {...props}
        />
        {isPassword ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={passwordActionLabel}
            accessibilityHint="Maintenez pour afficher l’utilité de ce bouton"
            delayLongPress={350}
            onPress={() => setVisible(v => !v)}
            onLongPress={() => setUtilityHint(passwordActionLabel)}
            style={styles.toggle}
          >
            <Text style={styles.toggleText}>{visible ? '◉' : '◎'}</Text>
          </Pressable>
        ) : null}
      </View>
      {utilityHint ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Fermer l’aide"
          onPress={() => setUtilityHint(undefined)}
          style={styles.hintBubble}
        >
          <Text style={styles.hintText}>{utilityHint}</Text>
          <Text style={styles.hintClose}>×</Text>
        </Pressable>
      ) : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

function createStyles(
  colors: ReturnType<typeof useTheme>['colors'],
  typography: ReturnType<typeof useTheme>['typography'],
) {
  return StyleSheet.create({
    wrapper: { gap: spacing.sm },
    label: typography.label,
    inputWrap: { position: 'relative', justifyContent: 'center' },
    input: {
      minHeight: 54,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radii.md,
      paddingHorizontal: spacing.lg,
      fontSize: 16,
      color: colors.foreground,
      backgroundColor: colors.backgroundSecondary,
    },
    inputWithToggle: {
      paddingRight: 58,
    },
    inputWithIcon: { paddingLeft: 54 },
    inputError: { borderColor: colors.danger },
    toggle: {
      position: 'absolute',
      right: spacing.md,
      minHeight: 44,
      justifyContent: 'center',
      width: 44,
      alignItems: 'center',
    },
    toggleText: {
      color: colors.primary,
      fontSize: 23,
      fontWeight: '700',
    },
    leadingIcon: {
      position: 'absolute',
      left: spacing.sm,
      zIndex: 1,
      width: 40,
      height: 40,
      borderRadius: radii.md,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.primarySoft,
    },
    leadingIconText: {
      color: colors.primary,
      fontSize: 18,
      fontWeight: '800',
    },
    hintBubble: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: radii.md,
      backgroundColor: colors.night,
    },
    hintText: { ...typography.caption, flex: 1, color: colors.white },
    hintClose: { color: colors.white, fontSize: 18 },
    error: { ...typography.caption, color: colors.danger },
  });
}
