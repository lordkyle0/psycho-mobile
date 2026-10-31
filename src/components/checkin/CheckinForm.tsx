import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { Input } from '@/components/ui/Input';
import { Scale } from '@/components/ui/Scale';
import { archetypesForProfile, type ArchetypeKey } from '@/content/archetypes';
import {
  getArchetypeScores,
  getCheckin,
  saveArchetypeScore,
  saveCheckin,
  type ArchetypeScore,
  type CheckinInput,
} from '@/services/journal.service';
import { subscribe } from '@/services/local-db.service';
import { useSettingsStore } from '@/stores/settings.store';
import { useTheme } from '@/theme/ThemeContext';
import { spacing } from '@/theme';

const SLEEP_OPTIONS = [4, 5, 6, 7, 8, 9, 10];

type Scores = Partial<Record<ArchetypeKey, ArchetypeScore>>;
type TextField = 'intention' | 'gratitude' | 'wins' | 'lessons' | 'notes';

export function CheckinForm({ date }: { date: string }) {
  // Remonte le formulaire uniquement quand une synchronisation apporte des données distantes.
  const [remoteRevision, setRemoteRevision] = useState(0);
  useEffect(
    () =>
      subscribe(source => {
        if (source === 'remote') setRemoteRevision(r => r + 1);
      }),
    [],
  );
  return <Form key={`${date}:${remoteRevision}`} date={date} />;
}

function Form({ date }: { date: string }) {
  const { colors, typography } = useTheme();
  const styles = useMemo(
    () => createStyles(colors, typography),
    [colors, typography],
  );
  const navigation = useNavigation();
  const profile = useSettingsStore(s => s.profile);
  const archetypes = archetypesForProfile(profile ?? 'integral');
  const [c, setC] = useState<CheckinInput>(() => getCheckin(date) ?? {});
  const [scores, setScores] = useState<Scores>(() => getArchetypeScores(date));

  // Texte : sauvegarde différée pendant la frappe, immédiate à la perte du focus ou au démontage.
  const pending = useRef<Partial<Record<TextField, string>>>({});
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const flush = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    const patch = pending.current;
    pending.current = {};
    if (Object.keys(patch).length) saveCheckin(date, patch);
  }, [date]);
  useEffect(() => flush, [flush]);

  const set = (patch: CheckinInput) => {
    setC(prev => ({ ...prev, ...patch }));
    saveCheckin(date, patch);
  };

  const edit = (field: TextField) => (v: string) => {
    setC(prev => ({ ...prev, [field]: v }));
    pending.current[field] = v;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(flush, 1500);
  };

  const setScore = (key: ArchetypeKey, patch: Partial<ArchetypeScore>) => {
    setScores(prev => ({
      ...prev,
      [key]: { plenitude: null, shadow: null, ...prev[key], ...patch },
    }));
    saveArchetypeScore(date, key, patch);
  };

  const textField = (field: TextField, label: string, placeholder: string) => (
    <Input
      label={label}
      placeholder={placeholder}
      value={c[field] ?? ''}
      onChangeText={edit(field)}
      onBlur={flush}
      multiline
      style={styles.multiline}
    />
  );

  const validateEvening = () => {
    flush();
    const done = c.evening_done ? 0 : 1;
    set({ evening_done: done });
    if (done) {
      Alert.alert(
        'Bilan enregistré',
        'Belle journée de travail sur toi. Repose-toi bien. 🌙',
      );
    }
  };

  return (
    <View style={styles.list}>
      <Card style={[styles.card, { borderLeftColor: colors.accent }]}>
        <Text style={styles.h3}>🌅 Matin</Text>
        {textField(
          'intention',
          'Intention du jour',
          "Aujourd'hui, je choisis de…",
        )}
        <Text style={styles.label}>Heures de sommeil</Text>
        <View style={styles.wrapRow}>
          {SLEEP_OPTIONS.map(h => (
            <Chip
              key={h}
              label={`${h}h`}
              selected={c.sleep_hours === h}
              onPress={() =>
                set({ sleep_hours: c.sleep_hours === h ? null : h })
              }
            />
          ))}
        </View>
        <Scale
          label="Énergie"
          value={c.energy ?? null}
          onChange={v => set({ energy: v })}
          lowLabel="Épuisé"
          highLabel="Plein d'énergie"
        />
        <Button
          title={c.morning_done ? '✓ Matin validé' : 'Valider le matin'}
          variant={c.morning_done ? 'outline' : 'primary'}
          onPress={() => {
            flush();
            set({ morning_done: c.morning_done ? 0 : 1 });
          }}
        />
      </Card>

      <Card style={styles.card}>
        <Text style={styles.h3}>🧭 Archétypes</Text>
        <Text style={styles.muted}>
          Plénitude : à quel point as-tu incarné la forme mature ? Ombre : à
          quel point ses pôles d'ombre se sont-ils manifestés ?
        </Text>
      </Card>

      {archetypes.map(a => {
        const s = scores[a.key];
        return (
          <Card key={a.key} style={[styles.card, { borderLeftColor: a.color }]}>
            <View style={styles.between}>
              <Text style={styles.h3}>
                {a.emoji} {a.name}
              </Text>
              <Pressable
                accessibilityRole="link"
                accessibilityLabel={`Détails de l'archétype ${a.name}`}
                hitSlop={8}
                onPress={() =>
                  navigation.navigate('Archetype', { archetypeKey: a.key })
                }
              >
                <Text style={styles.link}>Détails ›</Text>
              </Pressable>
            </View>
            <Text style={styles.muted}>{a.question}</Text>
            <Scale
              label="Plénitude"
              color={a.color}
              value={s?.plenitude ?? null}
              onChange={v => setScore(a.key, { plenitude: v })}
            />
            <Scale
              label={`Ombre (${a.shadowActive.name} / ${a.shadowPassive.name})`}
              color={colors.mutedForeground}
              value={s?.shadow ?? null}
              onChange={v => setScore(a.key, { shadow: v })}
              lowLabel="Absente"
              highLabel="Dominante"
            />
          </Card>
        );
      })}

      <Card style={[styles.card, { borderLeftColor: colors.violet }]}>
        <Text style={styles.h3}>🌙 Soir</Text>
        <Scale
          label="Humeur"
          value={c.mood ?? null}
          onChange={v => set({ mood: v })}
          lowLabel="Très basse"
          highLabel="Excellente"
        />
        <Scale
          label="Stress"
          value={c.stress ?? null}
          onChange={v => set({ stress: v })}
          lowLabel="Serein"
          highLabel="Très stressé"
          color={colors.danger}
        />
        {textField(
          'gratitude',
          'Gratitudes',
          'Trois choses pour lesquelles je suis reconnaissant(e)…',
        )}
        {textField('wins', 'Victoires', "Ce que j'ai bien fait aujourd'hui…")}
        {textField(
          'lessons',
          'Leçons / à corriger',
          "Ce que j'ai mal fait ou omis, et ce que je change demain…",
        )}
        {textField(
          'notes',
          'Notes libres',
          'Journal, émotions, rêves, prières…',
        )}
        <Button
          title={c.evening_done ? '✓ Soir validé' : 'Valider le bilan du soir'}
          variant={c.evening_done ? 'outline' : 'primary'}
          onPress={validateEvening}
        />
      </Card>
    </View>
  );
}

function createStyles(
  colors: ReturnType<typeof useTheme>['colors'],
  typography: ReturnType<typeof useTheme>['typography'],
) {
  return StyleSheet.create({
    list: { gap: spacing.lg },
    card: {
      gap: spacing.md,
      borderLeftWidth: 4,
      borderLeftColor: colors.border,
    },
    h3: typography.h3,
    label: typography.label,
    muted: typography.bodySmall,
    link: { ...typography.label, color: colors.primary },
    between: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    wrapRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
    multiline: {
      minHeight: 90,
      textAlignVertical: 'top',
      paddingTop: spacing.md,
    },
  });
}
