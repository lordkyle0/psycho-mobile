import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { Screen } from '@/components/layout/Screen';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { Input } from '@/components/ui/Input';
import { TimeStepper } from '@/components/ui/TimeStepper';
import { env } from '@/config/env';
import { PROFILE_LABELS, type Profile } from '@/content/archetypes';
import { useDbQuery } from '@/hooks/useDb';
import { countDirty } from '@/services/local-db.service';
import {
  formatTime,
  openExactAlarmSettings,
  scheduleReminders,
} from '@/services/notifications.service';
import { syncNow } from '@/services/sync.service';
import { useSettingsStore, type ReminderTime } from '@/stores/settings.store';
import { useSyncStore } from '@/stores/sync.store';
import type { ThemeMode } from '@/stores/theme.store';
import { useTheme } from '@/theme/ThemeContext';
import { spacing } from '@/theme';

const PROFILES: Profile[] = ['masculin', 'feminin', 'integral'];
const THEME_MODES: Array<{ mode: ThemeMode; label: string }> = [
  { mode: 'system', label: 'Système' },
  { mode: 'light', label: 'Clair' },
  { mode: 'dark', label: 'Sombre' },
];

/** Affiche l'URL du script sans révéler l'identifiant complet. */
function maskSyncUrl(url: string): string {
  const match = url.match(/\/macros\/s\/([^/]+)\/exec$/);
  if (!match) return url;
  const id = match[1];
  return `…/macros/s/${id.slice(0, 6)}…${id.slice(-4)}/exec`;
}

export function SettingsScreen() {
  const { colors, typography, mode, setMode } = useTheme();
  const styles = useMemo(
    () => createStyles(colors, typography),
    [colors, typography],
  );
  const settings = useSettingsStore();
  const isSyncing = useSyncStore(s => s.isSyncing);
  const isOnline = useSyncStore(s => s.isOnline);
  const pending = useDbQuery(countDirty, []);

  const [name, setName] = useState(settings.name);
  const [morning, setMorning] = useState(settings.morning);
  const [evening, setEvening] = useState(settings.evening);
  const remindersChanged =
    JSON.stringify(morning) !== JSON.stringify(settings.morning) ||
    JSON.stringify(evening) !== JSON.stringify(settings.evening);

  const saveReminders = async () => {
    const ok = await scheduleReminders({
      name: settings.name,
      morning,
      evening,
    });
    await settings.update({ morning, evening });
    Alert.alert(
      ok ? 'Rappels programmés' : 'Permission refusée',
      ok
        ? `Matin : ${
            morning.enabled ? formatTime(morning) : 'désactivé'
          }\nSoir : ${evening.enabled ? formatTime(evening) : 'désactivé'}`
        : "Autorise les notifications pour l'application dans les réglages du téléphone.",
    );
  };

  const runSync = async () => {
    const res = await syncNow();
    Alert.alert(
      res.ok ? 'Synchronisation réussie' : 'Synchronisation',
      res.message,
    );
  };

  return (
    <Screen title="Réglages">
      <Card style={styles.card}>
        <Text style={styles.h3}>Profil</Text>
        <Input
          label="Prénom"
          value={name}
          onChangeText={setName}
          onBlur={() => settings.update({ name: name.trim() })}
        />
        <Text style={styles.label}>Archétypes suivis</Text>
        <View style={styles.list}>
          {PROFILES.map(p => (
            <Chip
              key={p}
              label={PROFILE_LABELS[p]}
              selected={settings.profile === p}
              onPress={() => settings.update({ profile: p })}
            />
          ))}
        </View>
        <Text style={styles.label}>Thème</Text>
        <View style={styles.wrapRow}>
          {THEME_MODES.map(t => (
            <Chip
              key={t.mode}
              label={t.label}
              selected={mode === t.mode}
              onPress={() => setMode(t.mode)}
            />
          ))}
        </View>
      </Card>

      <Card style={styles.card}>
        <Text style={styles.h3}>Rappels (notifications natives)</Text>
        <ReminderEditor
          label="🌅 Matin — programme du jour"
          value={morning}
          onChange={setMorning}
        />
        <ReminderEditor
          label="🌙 Soir — bilan et examen"
          value={evening}
          onChange={setEvening}
        />
        <Button
          title="Enregistrer les rappels"
          onPress={saveReminders}
          disabled={!remindersChanged}
        />
        {Platform.OS === 'android' ? (
          <Button
            title="Autoriser les alarmes exactes"
            variant="ghost"
            onPress={() => openExactAlarmSettings()}
          />
        ) : null}
      </Card>

      <Card style={styles.card}>
        <Text style={styles.h3}>Synchronisation Google Sheets</Text>
        <Text style={styles.muted}>
          Tes données sont toujours enregistrées sur le téléphone. Dès qu'une
          connexion est disponible, elles sont envoyées vers ta feuille Google,
          et les modifications faites ailleurs sont récupérées.
        </Text>
        <Text style={styles.label}>
          {env.isSyncConfigured
            ? `✅ Feuille configurée : ${maskSyncUrl(env.syncUrl)}`
            : '⚠️ Non configurée : renseigne PSYCHO_SHEETS_SYNC_URL et PSYCHO_SHEETS_SYNC_TOKEN dans le fichier .env, puis reconstruis l’application.'}
        </Text>
        <Text style={styles.muted}>
          {isOnline ? '🟢 En ligne' : '🔴 Hors ligne'} · {pending}{' '}
          modification(s) en attente
          {settings.lastSyncAt
            ? ` · dernière synchro ${new Date(
                settings.lastSyncAt,
              ).toLocaleString('fr-FR')}`
            : ''}
        </Text>
        {settings.lastSyncMessage ? (
          <Text style={styles.muted}>{settings.lastSyncMessage}</Text>
        ) : null}
        {isSyncing ? <ActivityIndicator color={colors.primary} /> : null}
        <Button
          title="Synchroniser maintenant"
          onPress={runSync}
          disabled={isSyncing || !env.isSyncConfigured}
        />
      </Card>

      <Text style={[styles.muted, styles.center]}>
        Cet outil d'introspection ne remplace pas un accompagnement médical ou
        psychologique. En cas de détresse, contacte un professionnel de santé ou
        les services d'urgence de ton pays.
      </Text>
    </Screen>
  );
}

function ReminderEditor({
  label,
  value,
  onChange,
}: {
  label: string;
  value: ReminderTime;
  onChange: (v: ReminderTime) => void;
}) {
  const { colors, typography } = useTheme();
  const styles = useMemo(
    () => createStyles(colors, typography),
    [colors, typography],
  );
  return (
    <View style={styles.reminder}>
      <View style={styles.between}>
        <Text style={styles.label}>{label}</Text>
        <Switch
          accessibilityLabel={label}
          value={value.enabled}
          onValueChange={enabled => onChange({ ...value, enabled })}
          trackColor={{ true: colors.primary, false: colors.border }}
        />
      </View>
      {value.enabled ? (
        <TimeStepper
          hour={value.hour}
          minute={value.minute}
          onChange={(hour, minute) => onChange({ ...value, hour, minute })}
        />
      ) : null}
    </View>
  );
}

function createStyles(
  colors: ReturnType<typeof useTheme>['colors'],
  typography: ReturnType<typeof useTheme>['typography'],
) {
  return StyleSheet.create({
    card: { gap: spacing.md },
    list: { gap: spacing.sm },
    wrapRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
    reminder: { gap: spacing.sm },
    h3: typography.h3,
    label: { ...typography.label, flexShrink: 1 },
    muted: typography.bodySmall,
    center: { textAlign: 'center' },
    between: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: spacing.sm,
    },
  });
}
