import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { RingChart, SplitChart } from '@/components/charts';
import { Screen } from '@/components/layout/Screen';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { Input } from '@/components/ui/Input';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Scale } from '@/components/ui/Scale';
import { ARCHETYPES } from '@/content/archetypes';
import { useDbQuery } from '@/hooks/useDb';
import {
  createGoal,
  getReview,
  GOAL_STATUS_LABELS,
  listGoals,
  saveReview,
  type Goal,
  type GoalStatus,
  type Review,
} from '@/services/journal.service';
import { useTheme } from '@/theme/ThemeContext';
import { spacing } from '@/theme';
import {
  PERIOD_LABELS,
  PERIODS,
  periodKey,
  periodTitle,
  shiftPeriod,
  type Period,
} from '@/utils/dates';
import {
  averageGoalProgress,
  buildGoalStatusSplit,
  buildRing,
} from '@/utils/stats';

const REVIEW_PROMPTS: Record<Period, string> = {
  day: "Comment s'est passée cette journée ?",
  week: 'Bilan de la semaine : victoires, échecs, ajustements…',
  month: 'Bilan du mois : quelles habitudes se sont installées ?',
  quarter: 'Bilan du trimestre : où en suis-je par rapport à ma vision ?',
  year: "Vision de l'année : qui je veux devenir, ce que je veux bâtir…",
};

export function GoalsScreen() {
  const { colors, typography } = useTheme();
  const styles = useMemo(
    () => createStyles(colors, typography),
    [colors, typography],
  );
  const [period, setPeriod] = useState<Period>('week');
  const [ref, setRef] = useState(() => new Date());
  const [title, setTitle] = useState('');
  const key = periodKey(period, ref);

  const data = useDbQuery(
    () => ({ goals: listGoals(period, key), review: getReview(period, key) }),
    [period, key],
  );

  const statusColors: Record<GoalStatus, string> = {
    done: colors.success,
    doing: colors.accent,
    todo: colors.primary,
    dropped: colors.mutedForeground,
  };
  const done = data.goals.filter(g => g.status === 'done').length;
  const ring = buildRing(
    done,
    Math.max(data.goals.length, 1),
    'atteints',
    `${done}/${data.goals.length}`,
  );
  const split = buildGoalStatusSplit(
    data.goals,
    GOAL_STATUS_LABELS,
    statusColors,
  );
  const avgProgress = averageGoalProgress(data.goals);

  const add = async () => {
    const trimmed = title.trim();
    if (!trimmed) return;
    setTitle('');
    await createGoal(period, key, trimmed);
  };

  const isCurrent = key === periodKey(period, new Date());

  return (
    <Screen title="Objectifs" subtitle="Du quotidien à la vision annuelle">
      <View style={styles.wrapRow}>
        {PERIODS.map(p => (
          <Chip
            key={p}
            label={PERIOD_LABELS[p]}
            selected={p === period}
            onPress={() => setPeriod(p)}
          />
        ))}
      </View>

      <Card style={styles.card}>
        <View style={styles.nav}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Période précédente"
            hitSlop={10}
            onPress={() => setRef(shiftPeriod(period, ref, -1))}
          >
            <Text style={styles.arrow}>‹</Text>
          </Pressable>
          <View style={styles.navCenter}>
            <Text style={styles.navTitle}>{periodTitle(period, ref)}</Text>
            {!isCurrent ? (
              <Pressable onPress={() => setRef(new Date())}>
                <Text style={styles.link}>Revenir à la période en cours</Text>
              </Pressable>
            ) : null}
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Période suivante"
            hitSlop={10}
            onPress={() => setRef(shiftPeriod(period, ref, 1))}
          >
            <Text style={styles.arrow}>›</Text>
          </Pressable>
        </View>

        {data.goals.length > 0 ? (
          <View style={styles.charts}>
            <RingChart model={ring} color={colors.success} size={104} />
            <View style={styles.flex}>
              <Text style={styles.caption}>
                Progression moyenne : {Math.round(avgProgress)} %
              </Text>
              <ProgressBar value={avgProgress} color={colors.accent} />
              <View style={styles.spacer} />
              <SplitChart model={split} height={10} />
            </View>
          </View>
        ) : (
          <Text style={styles.muted}>
            Aucun objectif pour cette période. Ajoute le premier ci-dessous.
          </Text>
        )}
      </Card>

      <Card style={styles.card}>
        <Input
          placeholder={`Nouvel objectif (${PERIOD_LABELS[
            period
          ].toLowerCase()})…`}
          value={title}
          onChangeText={setTitle}
          onSubmitEditing={add}
          returnKeyType="done"
        />
        <Button title="Ajouter" onPress={add} disabled={!title.trim()} />
      </Card>

      {data.goals.map(g => (
        <GoalRow key={g.id} goal={g} statusColor={statusColors[g.status]} />
      ))}

      <ReviewCard
        key={`${period}:${key}:${data.review?.note ?? ''}`}
        period={period}
        periodKey={key}
        initial={data.review}
      />
    </Screen>
  );
}

function GoalRow({ goal, statusColor }: { goal: Goal; statusColor: string }) {
  const { colors, typography } = useTheme();
  const styles = useMemo(
    () => createStyles(colors, typography),
    [colors, typography],
  );
  const navigation = useNavigation();
  const a = goal.archetype ? ARCHETYPES[goal.archetype] : null;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Objectif ${goal.title}, ${
        GOAL_STATUS_LABELS[goal.status]
      }`}
      onPress={() => navigation.navigate('GoalDetail', { goalId: goal.id })}
    >
      <Card style={[styles.card, { borderLeftColor: a?.color ?? statusColor }]}>
        <View style={styles.between}>
          <Text
            style={[
              styles.label,
              styles.flex,
              goal.status === 'dropped' && styles.strike,
            ]}
          >
            {a ? `${a.emoji} ` : ''}
            {goal.title}
          </Text>
          <Text style={[styles.status, { color: statusColor }]}>
            {GOAL_STATUS_LABELS[goal.status]}
          </Text>
        </View>
        <ProgressBar
          value={goal.status === 'done' ? 100 : goal.progress}
          color={statusColor}
        />
        {goal.notes ? (
          <Text style={styles.muted} numberOfLines={2}>
            {goal.notes}
          </Text>
        ) : null}
      </Card>
    </Pressable>
  );
}

function ReviewCard({
  period,
  periodKey: key,
  initial,
}: {
  period: Period;
  periodKey: string;
  initial: Review | null;
}) {
  const { colors, typography } = useTheme();
  const styles = useMemo(
    () => createStyles(colors, typography),
    [colors, typography],
  );
  const [rating, setRating] = useState<number | null>(initial?.rating ?? null);
  const [note, setNote] = useState(initial?.note ?? '');

  return (
    <Card style={[styles.card, { borderLeftColor: colors.accent }]}>
      <Text style={styles.h3}>
        📝 Notes et bilan — {PERIOD_LABELS[period].toLowerCase()}
      </Text>
      <Scale
        label="Évaluation globale"
        value={rating}
        onChange={v => {
          setRating(v);
          saveReview(period, key, { rating: v });
        }}
        lowLabel="Difficile"
        highLabel="Excellente"
      />
      <Input
        placeholder={REVIEW_PROMPTS[period]}
        value={note}
        onChangeText={setNote}
        onBlur={() => saveReview(period, key, { note })}
        multiline
        style={styles.multiline}
      />
    </Card>
  );
}

function createStyles(
  colors: ReturnType<typeof useTheme>['colors'],
  typography: ReturnType<typeof useTheme>['typography'],
) {
  return StyleSheet.create({
    flex: { flex: 1 },
    spacer: { height: spacing.sm },
    wrapRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
    card: {
      gap: spacing.sm,
      borderLeftWidth: 4,
      borderLeftColor: colors.border,
    },
    nav: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
    navCenter: { flex: 1, alignItems: 'center', gap: 2 },
    navTitle: { ...typography.label, color: colors.title, textAlign: 'center' },
    arrow: {
      fontSize: 30,
      color: colors.primary,
      paddingHorizontal: spacing.sm,
    },
    charts: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
    h3: typography.h3,
    label: typography.label,
    caption: typography.caption,
    muted: typography.bodySmall,
    link: { ...typography.caption, color: colors.primary },
    status: { ...typography.caption, fontWeight: '700' },
    strike: { textDecorationLine: 'line-through', opacity: 0.7 },
    between: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: spacing.sm,
    },
    multiline: {
      minHeight: 100,
      textAlignVertical: 'top',
      paddingTop: spacing.md,
    },
  });
}
