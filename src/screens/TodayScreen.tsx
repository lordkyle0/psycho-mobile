import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { BarChart, RingChart } from '@/components/charts';
import { Screen } from '@/components/layout/Screen';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { buildProgram, MOMENT_LABELS, type Moment } from '@/content/program';
import { useDbQuery } from '@/hooks/useDb';
import {
  currentStreak,
  getCheckin,
  getProgramLog,
  listGoals,
  programCompletion,
  recentPlenitude,
  setProgramItemDone,
  updateGoal,
  type Goal,
} from '@/services/journal.service';
import { useSettingsStore } from '@/stores/settings.store';
import { useTheme } from '@/theme/ThemeContext';
import { radii, spacing } from '@/theme';
import { addDays, formatLongDate, parseDayKey, toDayKey } from '@/utils/dates';
import { buildPracticeBars, buildRing } from '@/utils/stats';

const MOMENTS: Moment[] = ['matin', 'journee', 'soir'];

export function TodayScreen() {
  const { colors, typography } = useTheme();
  const styles = useMemo(
    () => createStyles(colors, typography),
    [colors, typography],
  );
  const navigation = useNavigation();
  const name = useSettingsStore(s => s.name);
  const profile = useSettingsStore(s => s.profile) ?? 'integral';
  const today = toDayKey();
  const [expanded, setExpanded] = useState<string | null>(null);

  const data = useDbQuery(
    () => ({
      recent: recentPlenitude(7, today),
      log: getProgramLog(today),
      week: programCompletion(toDayKey(addDays(parseDayKey(today), -6)), today),
      goals: listGoals('day', today),
      streak: currentStreak(today),
      checkin: getCheckin(today),
    }),
    [today],
  );

  const program = useMemo(
    () => buildProgram(today, profile, data.recent),
    [today, profile, data.recent],
  );
  const total = program.items.length;
  const doneCount = program.items.filter(i => data.log[i.id]).length;
  const { focus } = program;

  const ring = buildRing(
    doneCount,
    total,
    'pratiques',
    `${doneCount}/${total}`,
  );
  const bars = buildPracticeBars(data.week, today, total, ratio =>
    ratio >= 1 ? colors.success : ratio >= 0.5 ? colors.accent : colors.primary,
  );

  const toggleGoal = (g: Goal) => {
    const done = g.status === 'done';
    updateGoal(g.id, {
      status: done ? 'todo' : 'done',
      progress: done ? g.progress : 100,
    });
  };

  return (
    <Screen
      title={`Bonjour${name ? `, ${name}` : ''} ☀️`}
      subtitle={formatLongDate(parseDayKey(today))}
    >
      <Card style={styles.summary}>
        <RingChart model={ring} color={colors.primary} size={112} />
        <View style={styles.summaryText}>
          <Text style={styles.badge}>
            🔥 {data.streak} jour{data.streak > 1 ? 's' : ''} de suite
          </Text>
          <Text style={styles.badge}>
            {data.checkin?.evening_done ? '🌙 Bilan fait' : '🌙 Bilan à faire'}
          </Text>
          <Text style={styles.muted}>Pratiques des 7 derniers jours</Text>
          <BarChart model={bars} height={90} />
        </View>
      </Card>

      <Card style={[styles.card, { borderLeftColor: focus.color }]}>
        <Text style={styles.overline}>Archétype du jour</Text>
        <Text style={styles.h3}>
          {focus.emoji} {focus.name}
        </Text>
        <Text style={styles.body}>{focus.essence}</Text>
        <Text style={styles.muted}>{program.focusReason}</Text>
        <Text style={[styles.body, styles.italic]}>« {focus.question} »</Text>
        <Pressable
          accessibilityRole="link"
          onPress={() =>
            navigation.navigate('Archetype', { archetypeKey: focus.key })
          }
        >
          <Text style={styles.link}>Plénitude et ombres ›</Text>
        </Pressable>
      </Card>

      <Card style={[styles.card, { borderLeftColor: colors.accent }]}>
        <Text style={styles.overline}>Parole du jour</Text>
        <Text style={styles.quote}>« {program.verse.text} »</Text>
        <Text style={styles.muted}>— {program.verse.ref} (Segond 1910)</Text>
        <Text style={styles.muted}>
          Plan de lecture : {program.bible.proverbs} · {program.bible.psalm} ·{' '}
          {program.bible.gospel}
        </Text>
      </Card>

      <Card style={[styles.card, { borderLeftColor: colors.violet }]}>
        <Text style={styles.overline}>Sagesse du jour</Text>
        <Text style={styles.quote}>« {program.philosophy.text} »</Text>
        <Text style={styles.muted}>
          — {program.philosophy.author}, {program.philosophy.source}
        </Text>
        <Text style={styles.label}>💭 {program.philosophy.reflection}</Text>
      </Card>

      <Card style={styles.card}>
        <Text style={styles.h3}>Programme du jour</Text>
        {MOMENTS.map(m => (
          <View key={m} style={styles.moment}>
            <Text style={styles.overline}>{MOMENT_LABELS[m]}</Text>
            {program.items
              .filter(i => i.moment === m)
              .map(item => {
                const done = !!data.log[item.id];
                const open = expanded === item.id;
                return (
                  <View key={item.id} style={styles.item}>
                    <View style={styles.itemRow}>
                      <Pressable
                        accessibilityRole="checkbox"
                        accessibilityState={{ checked: done }}
                        accessibilityLabel={item.title}
                        hitSlop={8}
                        onPress={() => setProgramItemDone(today, item, !done)}
                        style={[styles.check, done && styles.checkOn]}
                      >
                        <Text style={styles.checkMark}>{done ? '✓' : ''}</Text>
                      </Pressable>
                      <Pressable
                        style={styles.flex}
                        accessibilityRole="button"
                        accessibilityHint="Afficher les instructions"
                        onPress={() => setExpanded(open ? null : item.id)}
                      >
                        <Text style={[styles.label, done && styles.strike]}>
                          {item.title}
                        </Text>
                        {item.minutes ? (
                          <Text style={styles.caption}>{item.minutes} min</Text>
                        ) : null}
                      </Pressable>
                      <Text style={styles.caption}>{open ? '▲' : '▼'}</Text>
                    </View>
                    {open ? (
                      <Text style={[styles.body, styles.detail]}>
                        {item.detail}
                      </Text>
                    ) : null}
                  </View>
                );
              })}
          </View>
        ))}
      </Card>

      <Card style={styles.card}>
        <View style={styles.between}>
          <Text style={styles.h3}>Objectifs du jour</Text>
          <Pressable
            accessibilityRole="link"
            onPress={() => navigation.navigate('Main', { screen: 'Goals' })}
          >
            <Text style={styles.link}>Tous ›</Text>
          </Pressable>
        </View>
        {data.goals.length === 0 ? (
          <Text style={styles.muted}>
            Aucun objectif pour aujourd'hui. Ajoutes-en dans l'onglet Objectifs.
          </Text>
        ) : null}
        {data.goals.map(g => (
          <View key={g.id} style={styles.itemRow}>
            <Pressable
              accessibilityRole="checkbox"
              accessibilityState={{ checked: g.status === 'done' }}
              accessibilityLabel={g.title}
              hitSlop={8}
              onPress={() => toggleGoal(g)}
              style={[styles.check, g.status === 'done' && styles.checkOn]}
            >
              <Text style={styles.checkMark}>
                {g.status === 'done' ? '✓' : ''}
              </Text>
            </Pressable>
            <Pressable
              style={styles.flex}
              onPress={() =>
                navigation.navigate('GoalDetail', { goalId: g.id })
              }
            >
              <Text style={[styles.body, g.status === 'done' && styles.strike]}>
                {g.title}
              </Text>
            </Pressable>
          </View>
        ))}
      </Card>

      <Button
        title={
          data.checkin?.evening_done ? 'Revoir mon bilan' : 'Faire mon bilan'
        }
        onPress={() => navigation.navigate('Main', { screen: 'Checkin' })}
      />
    </Screen>
  );
}

function createStyles(
  colors: ReturnType<typeof useTheme>['colors'],
  typography: ReturnType<typeof useTheme>['typography'],
) {
  return StyleSheet.create({
    flex: { flex: 1 },
    summary: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
    summaryText: { flex: 1, gap: spacing.xs },
    badge: { ...typography.label, color: colors.title },
    card: {
      gap: spacing.sm,
      borderLeftWidth: 4,
      borderLeftColor: colors.border,
    },
    overline: typography.overline,
    h3: typography.h3,
    body: typography.body,
    label: typography.label,
    caption: typography.caption,
    muted: typography.bodySmall,
    italic: { fontStyle: 'italic' },
    quote: { ...typography.body, fontSize: 17, lineHeight: 25 },
    link: { ...typography.label, color: colors.primary },
    between: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    moment: { gap: spacing.xs, marginTop: spacing.sm },
    item: {
      paddingVertical: spacing.sm,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
    },
    itemRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
    check: {
      width: 26,
      height: 26,
      borderRadius: radii.full,
      borderWidth: 2,
      borderColor: colors.mutedForeground,
      alignItems: 'center',
      justifyContent: 'center',
    },
    checkOn: { backgroundColor: colors.success, borderColor: colors.success },
    checkMark: { color: colors.white, fontWeight: '800' },
    strike: { textDecorationLine: 'line-through', opacity: 0.7 },
    detail: { marginTop: spacing.sm, marginLeft: 38 },
  });
}
