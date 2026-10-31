import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RingChart } from '@/components/charts';
import { Screen } from '@/components/layout/Screen';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { Input } from '@/components/ui/Input';
import { ARCHETYPES, archetypesForProfile } from '@/content/archetypes';
import type { RootStackParamList } from '@/navigation/types';
import {
  deleteGoal,
  getGoal,
  GOAL_STATUS_LABELS,
  updateGoal,
  type Goal,
  type GoalStatus,
} from '@/services/journal.service';
import { useSettingsStore } from '@/stores/settings.store';
import { useTheme } from '@/theme/ThemeContext';
import { spacing } from '@/theme';
import { PERIOD_LABELS } from '@/utils/dates';
import { buildRing } from '@/utils/stats';

type Props = NativeStackScreenProps<RootStackParamList, 'GoalDetail'>;

const STATUSES: GoalStatus[] = ['todo', 'doing', 'done', 'dropped'];

export function GoalDetailScreen({ route, navigation }: Props) {
  const { typography } = useTheme();
  const goal = useMemo(
    () => getGoal(route.params.goalId),
    [route.params.goalId],
  );

  useEffect(() => {
    if (goal) {
      navigation.setOptions({
        title: `${PERIOD_LABELS[goal.period]} · ${goal.period_key}`,
      });
    }
  }, [goal, navigation]);

  if (!goal) {
    return (
      <Screen nested>
        <Text style={typography.bodySmall}>Objectif introuvable.</Text>
      </Screen>
    );
  }
  return <Editor goal={goal} onDeleted={() => navigation.goBack()} />;
}

function Editor({ goal, onDeleted }: { goal: Goal; onDeleted: () => void }) {
  const { colors, typography } = useTheme();
  const styles = useMemo(
    () => createStyles(colors, typography),
    [colors, typography],
  );
  const profile = useSettingsStore(s => s.profile) ?? 'integral';
  const [title, setTitle] = useState(goal.title);
  const [notes, setNotes] = useState(goal.notes ?? '');
  const [status, setStatus] = useState(goal.status);
  const [progress, setProgress] = useState(goal.progress ?? 0);
  const [archetype, setArchetype] = useState(goal.archetype);
  const deleted = useRef(false);

  // Enregistre le texte en cours si l'on quitte l'écran sans perte de focus.
  const latest = useRef({ title, notes });
  useEffect(() => {
    latest.current = { title, notes };
  }, [title, notes]);
  useEffect(
    () => () => {
      if (deleted.current) return;
      const { title: t, notes: n } = latest.current;
      if (n !== (goal.notes ?? '') || (t.trim() && t.trim() !== goal.title)) {
        updateGoal(goal.id, { notes: n, title: t.trim() || goal.title });
      }
    },
    [goal],
  );

  const changeStatus = (s: GoalStatus) => {
    setStatus(s);
    if (s === 'done') {
      setProgress(100);
      updateGoal(goal.id, { status: s, progress: 100 });
    } else {
      updateGoal(goal.id, { status: s });
    }
  };

  const changeProgress = (delta: number) => {
    const p = Math.max(0, Math.min(100, progress + delta));
    const s: GoalStatus =
      p === 100 ? 'done' : p > 0 && status === 'todo' ? 'doing' : status;
    setProgress(p);
    setStatus(s);
    updateGoal(goal.id, { progress: p, status: s });
  };

  const remove = () => {
    Alert.alert('Supprimer cet objectif ?', goal.title, [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: async () => {
          deleted.current = true;
          await deleteGoal(goal.id);
          onDeleted();
        },
      },
    ]);
  };

  const accent = archetype ? ARCHETYPES[archetype].color : colors.primary;

  return (
    <Screen nested>
      <Card style={styles.card}>
        <Input
          label="Intitulé"
          value={title}
          onChangeText={setTitle}
          onBlur={() =>
            title.trim() && updateGoal(goal.id, { title: title.trim() })
          }
        />
      </Card>

      <Card style={styles.card}>
        <Text style={styles.h3}>Statut et progression</Text>
        <View style={styles.wrapRow}>
          {STATUSES.map(s => (
            <Chip
              key={s}
              label={GOAL_STATUS_LABELS[s]}
              selected={status === s}
              onPress={() => changeStatus(s)}
            />
          ))}
        </View>
        <View style={styles.progressRow}>
          <RingChart
            model={buildRing(progress, 100, 'progression')}
            color={status === 'done' ? colors.success : accent}
            size={110}
          />
          <View style={styles.steps}>
            <Button
              title="+10 %"
              variant="outline"
              onPress={() => changeProgress(10)}
            />
            <Button
              title="+25 %"
              variant="outline"
              onPress={() => changeProgress(25)}
            />
            <Button
              title="−10 %"
              variant="ghost"
              onPress={() => changeProgress(-10)}
            />
          </View>
        </View>
      </Card>

      <Card style={styles.card}>
        <Text style={styles.h3}>Archétype associé</Text>
        <View style={styles.wrapRow}>
          <Chip
            label="Aucun"
            selected={archetype == null}
            onPress={() => {
              setArchetype(null);
              updateGoal(goal.id, { archetype: null });
            }}
          />
          {archetypesForProfile(profile).map(a => (
            <Chip
              key={a.key}
              label={`${a.emoji} ${a.name}`}
              color={a.color}
              selected={archetype === a.key}
              onPress={() => {
                setArchetype(a.key);
                updateGoal(goal.id, { archetype: a.key });
              }}
            />
          ))}
        </View>
        {archetype ? (
          <Text style={styles.muted}>{ARCHETYPES[archetype].essence}</Text>
        ) : null}
      </Card>

      <Card style={styles.card}>
        <Input
          label="Notes"
          placeholder="Pourquoi cet objectif ? Étapes, obstacles, apprentissages…"
          value={notes}
          onChangeText={setNotes}
          onBlur={() => updateGoal(goal.id, { notes })}
          multiline
          style={styles.multiline}
        />
      </Card>

      <Button title="Supprimer l'objectif" variant="danger" onPress={remove} />
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
    muted: typography.bodySmall,
    wrapRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
    progressRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.lg,
    },
    steps: { flex: 1, gap: spacing.sm },
    multiline: {
      minHeight: 160,
      textAlignVertical: 'top',
      paddingTop: spacing.md,
      color: colors.foreground,
    },
  });
}
