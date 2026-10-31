import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StatsChart } from '@/components/charts';
import { Screen } from '@/components/layout/Screen';
import { Card } from '@/components/ui/Card';
import { ARCHETYPES } from '@/content/archetypes';
import { ARCHETYPE_EXERCISES } from '@/content/exercises';
import { useDbQuery } from '@/hooks/useDb';
import type { RootStackParamList } from '@/navigation/types';
import { archetypeHistory } from '@/services/journal.service';
import { useTheme } from '@/theme/ThemeContext';
import { spacing } from '@/theme';
import { addDays, parseDayKey, toDayKey } from '@/utils/dates';
import { buildDailyLine } from '@/utils/stats';

type Props = NativeStackScreenProps<RootStackParamList, 'Archetype'>;

const DAYS = 30;
const SCALE = { min: 1, max: 5 };

export function ArchetypeScreen({ route }: Props) {
  const { colors, typography } = useTheme();
  const styles = useMemo(
    () => createStyles(colors, typography),
    [colors, typography],
  );
  const a = ARCHETYPES[route.params.archetypeKey];
  const today = toDayKey();
  const from = toDayKey(addDays(parseDayKey(today), -(DAYS - 1)));
  const history = useDbQuery(
    () => archetypeHistory(route.params.archetypeKey, from, today),
    [route.params.archetypeKey, from, today],
  );

  if (!a) {
    return (
      <Screen nested>
        <Text style={styles.muted}>Archétype inconnu.</Text>
      </Screen>
    );
  }

  const plenitudeLine = buildDailyLine(
    new Map(history.map(h => [h.date, h.plenitude])),
    from,
    DAYS,
    SCALE,
  );
  const shadowLine = buildDailyLine(
    new Map(history.map(h => [h.date, h.shadow])),
    from,
    DAYS,
    SCALE,
  );

  return (
    <Screen nested title={`${a.emoji} ${a.name}`}>
      <Card style={[styles.card, { borderLeftColor: a.color }]}>
        <Text style={styles.h3}>Essence</Text>
        <Text style={styles.body}>{a.essence}</Text>
        <Text style={[styles.body, styles.italic]}>« {a.question} »</Text>
        <Text style={styles.muted}>
          {history.length} jour(s) évalué(s) sur les {DAYS} derniers jours
        </Text>
      </Card>

      <StatsChart
        title="☀️ Plénitude"
        subtitle={`Moyenne par semaine, ${DAYS} derniers jours`}
        model={plenitudeLine}
        color={a.color}
      />
      <StatsChart
        title="🌑 Ombre"
        subtitle="Plus la courbe descend, plus l'ombre recule"
        model={shadowLine}
        color={colors.mutedForeground}
      />

      <Card style={[styles.card, { borderLeftColor: a.color }]}>
        <Text style={styles.h3}>☀️ Plénitude (forme mature)</Text>
        {a.plenitude.map(p => (
          <Text key={p} style={styles.body}>
            • {p}
          </Text>
        ))}
      </Card>

      <Card style={[styles.card, { borderLeftColor: colors.mutedForeground }]}>
        <Text style={styles.h3}>🌑 Ombre bipolaire</Text>
        <Text style={styles.label}>Pôle actif — {a.shadowActive.name}</Text>
        <Text style={styles.muted}>{a.shadowActive.signs}</Text>
        <Text style={styles.label}>Pôle passif — {a.shadowPassive.name}</Text>
        <Text style={styles.muted}>{a.shadowPassive.signs}</Text>
        <Text style={styles.muted}>
          L'ombre n'est pas un ennemi : la reconnaître sans jugement est le
          premier pas pour en libérer l'énergie au service de la forme mature.
        </Text>
      </Card>

      <Card style={styles.card}>
        <Text style={styles.h3}>🏋️ Exercices pour l'activer</Text>
        {ARCHETYPE_EXERCISES[a.key].map(e => (
          <View key={e.id} style={styles.exercise}>
            <Text style={styles.label}>
              {e.title} · {e.minutes} min
            </Text>
            <Text style={styles.muted}>{e.instructions}</Text>
          </View>
        ))}
      </Card>
    </Screen>
  );
}

function createStyles(
  colors: ReturnType<typeof useTheme>['colors'],
  typography: ReturnType<typeof useTheme>['typography'],
) {
  return StyleSheet.create({
    card: {
      gap: spacing.sm,
      borderLeftWidth: 4,
      borderLeftColor: colors.border,
    },
    h3: typography.h3,
    body: typography.body,
    label: typography.label,
    muted: typography.bodySmall,
    italic: { fontStyle: 'italic' },
    exercise: { gap: 2, marginBottom: spacing.sm },
  });
}
