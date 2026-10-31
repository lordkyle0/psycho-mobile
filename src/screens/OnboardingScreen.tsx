import React, { useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text } from 'react-native';
import { Screen } from '@/components/layout/Screen';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { TimeStepper } from '@/components/ui/TimeStepper';
import {
  archetypesForProfile,
  PROFILE_LABELS,
  type Profile,
} from '@/content/archetypes';
import { scheduleReminders } from '@/services/notifications.service';
import { DEFAULT_SETTINGS, useSettingsStore } from '@/stores/settings.store';
import { useTheme } from '@/theme/ThemeContext';
import { radii, spacing } from '@/theme';

const PROFILES: Profile[] = ['masculin', 'feminin', 'integral'];

export function OnboardingScreen() {
  const { colors, typography } = useTheme();
  const styles = useMemo(
    () => createStyles(colors, typography),
    [colors, typography],
  );
  const update = useSettingsStore(s => s.update);
  const [name, setName] = useState('');
  const [profile, setProfile] = useState<Profile>('masculin');
  const [morning, setMorning] = useState(DEFAULT_SETTINGS.morning);
  const [evening, setEvening] = useState(DEFAULT_SETTINGS.evening);
  const [saving, setSaving] = useState(false);

  const start = async () => {
    setSaving(true);
    const trimmed = name.trim();
    try {
      const granted = await scheduleReminders({
        name: trimmed,
        morning,
        evening,
      });
      if (!granted) {
        Alert.alert(
          'Notifications désactivées',
          'Tu pourras les autoriser plus tard dans les réglages du téléphone, puis dans Réglages > Rappels.',
        );
      }
    } finally {
      // Le profil renseigné fait basculer la navigation vers les onglets.
      await update({ name: trimmed, profile, morning, evening });
      setSaving(false);
    }
  };

  return (
    <Screen
      title="Bienvenue 🌿"
      subtitle="Maîtrise de soi · archétypes · Parole · sagesse"
    >
      <Text style={styles.body}>
        Chaque jour : un programme (respiration, lecture biblique, lecture
        philosophique, exercice d'archétype, activité physique, examen du soir),
        un bilan de ton état intérieur, des graphiques de progression et tes
        objectifs du jour à l'année.
      </Text>

      <Card style={styles.card}>
        <Input
          label="Ton prénom"
          placeholder="Prénom"
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
        />
      </Card>

      <Card style={styles.card}>
        <Text style={styles.h3}>Ton profil d'archétypes</Text>
        {PROFILES.map(p => {
          const selected = p === profile;
          return (
            <Pressable
              key={p}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              onPress={() => setProfile(p)}
              style={[styles.option, selected && styles.optionOn]}
            >
              <Text style={styles.label}>{PROFILE_LABELS[p]}</Text>
              <Text style={styles.emojis}>
                {archetypesForProfile(p)
                  .map(a => a.emoji)
                  .join('  ')}
              </Text>
            </Pressable>
          );
        })}
        <Text style={styles.muted}>
          Le profil intégral suit aussi les archétypes du pôle opposé (anima /
          animus, selon Jung).
        </Text>
      </Card>

      <Card style={styles.card}>
        <Text style={styles.h3}>Rappels quotidiens</Text>
        <Text style={styles.muted}>Matin : programme du jour</Text>
        <TimeStepper
          hour={morning.hour}
          minute={morning.minute}
          onChange={(hour, minute) => setMorning({ ...morning, hour, minute })}
        />
        <Text style={styles.muted}>Soir : bilan et examen</Text>
        <TimeStepper
          hour={evening.hour}
          minute={evening.minute}
          onChange={(hour, minute) => setEvening({ ...evening, hour, minute })}
        />
      </Card>

      <Button title="Commencer" onPress={start} loading={saving} />
    </Screen>
  );
}

function createStyles(
  colors: ReturnType<typeof useTheme>['colors'],
  typography: ReturnType<typeof useTheme>['typography'],
) {
  return StyleSheet.create({
    card: { gap: spacing.md },
    h3: typography.h3,
    body: typography.body,
    label: typography.label,
    muted: typography.bodySmall,
    emojis: { fontSize: 18 },
    option: {
      borderWidth: 1.5,
      borderColor: colors.border,
      borderRadius: radii.lg,
      padding: spacing.md,
      gap: spacing.xs,
    },
    optionOn: {
      borderColor: colors.primary,
      backgroundColor: colors.primarySoft,
    },
  });
}
