import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { RingChart, StatsChart } from '@/components/charts';
import { Screen } from '@/components/layout/Screen';
import { Card } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { archetypesForProfile } from '@/content/archetypes';
import { useDbQuery } from '@/hooks/useDb';
import {
  archetypeAverages,
  goalStats,
  listCheckins,
  mean,
  programCompletion,
} from '@/services/journal.service';
import { useSettingsStore } from '@/stores/settings.store';
import { useTheme } from '@/theme/ThemeContext';
import { spacing } from '@/theme';
import {
  addDays,
  formatShortDate,
  parseDayKey,
  PERIOD_LABELS,
  PERIODS,
  toDayKey,
} from '@/utils/dates';
import {
  buildArchetypeProgress,
  buildMetricLine,
  buildPracticeBars,
  buildRing,
  type ProgressChartModel,
} from '@/utils/stats';

const RANGES = [7, 30, 90];
const PRACTICES_PER_DAY = 6;

export function ProgressScreen() {
  const { colors, typography } = useTheme();
  const styles = useMemo(
    () => createStyles(colors, typography),
    [colors, typography],
  );
  const navigation = useNavigation();
  const profile = useSettingsStore(s => s.profile) ?? 'integral';
  const [range, setRange] = useState(30);
  const today = toDayKey();
  const from = toDayKey(addDays(parseDayKey(today), -(range - 1)));

  const data = useDbQuery(
    () => ({
      checkins: listCheckins(from, today),
      archetypes: archetypeAverages(from, today),
      practices: programCompletion(
        toDayKey(addDays(parseDayKey(today), -6)),
        today,
      ),
      goals: goalStats(),
    }),
    [from, today],
  );

  const archetypes = archetypesForProfile(profile);
  const daysWithCheckin = data.checkins.filter(
    c => c.morning_done || c.evening_done,
  ).length;
  const avg = (field: 'mood' | 'energy' | 'stress' | 'sleep_hours') =>
    mean(data.checkins.map(c => c[field]));
  const scope = range <= 7 ? 'par jour' : 'moyenne par semaine';

  const goalsModel: ProgressChartModel = {
    type: 'progress',
    max: 100,
    points: PERIODS.map(p => {
      const s = data.goals[p];
      return {
        label: `${PERIOD_LABELS[p]} (${s ? `${s.done}/${s.total}` : '0'})`,
        value: s && s.total ? (s.done / s.total) * 100 : 0,
        color: colors.success,
      };
    }),
  };

  return (
    <Screen title="Progrès" subtitle="Ton évolution intérieure">
      <View style={styles.wrapRow}>
        {RANGES.map(r => (
          <Chip
            key={r}
            label={`${r} jours`}
            selected={r === range}
            onPress={() => setRange(r)}
          />
        ))}
      </View>

      <Card style={styles.summary}>
        <RingChart
          model={buildRing(daysWithCheckin, range, 'jours avec bilan')}
          color={colors.primary}
          size={116}
        />
        <View style={styles.stats}>
          <Stat label="Humeur" value={avg('mood')} suffix="/5" />
          <Stat label="Énergie" value={avg('energy')} suffix="/5" />
          <Stat label="Stress" value={avg('stress')} suffix="/5" />
          <Stat label="Sommeil" value={avg('sleep_hours')} suffix="h" />
        </View>
      </Card>

      <StatsChart
        title="😊 Humeur"
        subtitle={`1 = très basse · 5 = excellente (${scope})`}
        model={buildMetricLine(data.checkins, 'mood', from, range)}
        color={colors.success}
      />
      <StatsChart
        title="⚡ Énergie"
        subtitle={`1 = épuisé · 5 = plein d'énergie (${scope})`}
        model={buildMetricLine(data.checkins, 'energy', from, range)}
        color={colors.accent}
      />
      <StatsChart
        title="🌪️ Stress"
        subtitle={`1 = serein · 5 = très stressé (${scope})`}
        model={buildMetricLine(data.checkins, 'stress', from, range)}
        color={colors.danger}
      />
      <StatsChart
        title="😴 Sommeil"
        subtitle={`Heures de sommeil (${scope})`}
        model={buildMetricLine(data.checkins, 'sleep_hours', from, range)}
        color={colors.violet}
      />

      <StatsChart
        title="☀️ Plénitude des archétypes"
        subtitle={`Moyenne /5 sur ${range} jours — forme mature incarnée`}
        model={buildArchetypeProgress(archetypes, data.archetypes, 'plenitude')}
      />
      <StatsChart
        title="🌑 Ombre des archétypes"
        subtitle={`Moyenne /5 sur ${range} jours — plus c'est bas, mieux c'est`}
        model={buildArchetypeProgress(
          archetypes,
          data.archetypes,
          'shadow',
          colors.mutedForeground,
        )}
      />

      <StatsChart
        title="✅ Pratiques quotidiennes"
        subtitle={`Pratiques cochées sur ${PRACTICES_PER_DAY}, 7 derniers jours`}
        model={buildPracticeBars(
          data.practices,
          today,
          PRACTICES_PER_DAY,
          ratio =>
            ratio >= 1
              ? colors.success
              : ratio >= 0.5
              ? colors.accent
              : colors.primary,
        )}
      />

      <StatsChart
        title="🎯 Objectifs atteints"
        subtitle="Taux de réussite par horizon (depuis le début)"
        model={goalsModel}
      />

      <Card style={styles.card}>
        <Text style={styles.h3}>Historique</Text>
        {data.checkins.length === 0 ? (
          <Text style={styles.muted}>Aucun bilan sur cette période.</Text>
        ) : null}
        {data.checkins.map(c => (
          <Pressable
            key={c.date}
            accessibilityRole="button"
            accessibilityLabel={`Bilan du ${formatShortDate(
              parseDayKey(c.date),
            )}`}
            onPress={() => navigation.navigate('DayCheckin', { date: c.date })}
            style={styles.historyRow}
          >
            <View style={styles.between}>
              <Text style={styles.label}>
                {formatShortDate(parseDayKey(c.date))}
              </Text>
              <Text style={styles.caption}>
                {c.mood != null ? `humeur ${c.mood}/5 ` : ''}
                {c.morning_done ? '🌅' : ''}
                {c.evening_done ? '🌙' : ''}
              </Text>
            </View>
            {c.intention ? (
              <Text style={styles.muted} numberOfLines={1}>
                {c.intention}
              </Text>
            ) : null}
          </Pressable>
        ))}
      </Card>
    </Screen>
  );
}

function Stat({
  label,
  value,
  suffix,
}: {
  label: string;
  value: number | null;
  suffix: string;
}) {
  const { colors, typography } = useTheme();
  const styles = useMemo(
    () => createStyles(colors, typography),
    [colors, typography],
  );
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>
        {value != null ? value.toFixed(1) : '—'}
        {value != null ? <Text style={styles.caption}>{suffix}</Text> : null}
      </Text>
      <Text style={styles.caption}>{label}</Text>
    </View>
  );
}

function createStyles(
  colors: ReturnType<typeof useTheme>['colors'],
  typography: ReturnType<typeof useTheme>['typography'],
) {
  return StyleSheet.create({
    wrapRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
    summary: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
    stats: {
      flex: 1,
      flexDirection: 'row',
      flexWrap: 'wrap',
      rowGap: spacing.md,
    },
    stat: { width: '50%', alignItems: 'center' },
    statValue: typography.value,
    card: { gap: spacing.sm },
    h3: typography.h3,
    label: typography.label,
    caption: typography.caption,
    muted: typography.bodySmall,
    between: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    historyRow: {
      paddingVertical: spacing.sm,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
    },
  });
}
