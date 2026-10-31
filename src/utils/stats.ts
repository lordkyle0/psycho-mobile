import type { Archetype } from '@/content/archetypes';
import type {
  ArchetypeAverage,
  Checkin,
  Goal,
  GoalStatus,
} from '@/services/journal.service';
import { addDays, isoWeek, parseDayKey, toDayKey } from './dates';

// ---------- Modèles de graphiques (identiques à kelasi-mobile) ----------

export type ChartPoint = {
  label: string;
  value: number;
  color?: string;
};

export type RingChartModel = {
  type: 'ring';
  value: number;
  max: number;
  label?: string;
  subtitle?: string;
};

export type BarChartModel = {
  type: 'bars';
  points: ChartPoint[];
  max?: number;
};

export type LineChartModel = {
  type: 'line';
  points: ChartPoint[];
  max?: number;
  min?: number;
};

export type ProgressChartModel = {
  type: 'progress';
  points: ChartPoint[];
  max?: number;
};

export type SplitDonutModel = {
  type: 'split';
  segments: Array<{ label: string; value: number; color: string }>;
};

export type ChartModel =
  | RingChartModel
  | BarChartModel
  | LineChartModel
  | ProgressChartModel
  | SplitDonutModel;

// ---------- Constructeurs Psycho ----------

const WEEKDAY_INITIALS = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];

export type CheckinMetric = 'mood' | 'energy' | 'stress' | 'sleep_hours';

function average(values: number[]): number | null {
  return values.length
    ? values.reduce((a, b) => a + b, 0) / values.length
    : null;
}

/**
 * Courbe d'une mesure du bilan : un point par jour sur 7 jours,
 * une moyenne par semaine ISO au-delà. Les jours sans valeur sont ignorés.
 */
export function buildMetricLine(
  checkins: Checkin[],
  metric: CheckinMetric,
  from: string,
  days: number,
): LineChartModel {
  return buildDailyLine(
    new Map(checkins.map(c => [c.date, c[metric]])),
    from,
    days,
    metric === 'sleep_hours' ? { min: 3, max: 11 } : { min: 1, max: 5 },
  );
}

/** Courbe à partir de valeurs indexées par jour ('2026-10-31' → 4). */
export function buildDailyLine(
  byDate: Map<string, number | null>,
  from: string,
  days: number,
  scale: { min: number; max: number },
): LineChartModel {
  const start = parseDayKey(from);
  const points: ChartPoint[] = [];

  if (days <= 7) {
    for (let i = 0; i < days; i++) {
      const d = addDays(start, i);
      const v = byDate.get(toDayKey(d));
      if (v != null) {
        points.push({ label: WEEKDAY_INITIALS[d.getDay()], value: v });
      }
    }
    return { type: 'line', points, ...scale };
  }

  const weeks = new Map<string, number[]>();
  for (let i = 0; i < days; i++) {
    const d = addDays(start, i);
    const v = byDate.get(toDayKey(d));
    const label = `S${isoWeek(d).week}`;
    const values = weeks.get(label) ?? [];
    if (v != null) values.push(v);
    weeks.set(label, values);
  }
  weeks.forEach((values, label) => {
    const avg = average(values);
    if (avg != null) points.push({ label, value: Math.round(avg * 10) / 10 });
  });
  return { type: 'line', points, ...scale };
}

/** Pratiques cochées sur les 7 derniers jours (aujourd'hui inclus). */
export function buildPracticeBars(
  countsByDate: Record<string, number>,
  today: string,
  total: number,
  color: (ratio: number) => string,
): BarChartModel {
  const end = parseDayKey(today);
  const points: ChartPoint[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = addDays(end, -i);
    const value = countsByDate[toDayKey(d)] ?? 0;
    points.push({
      label: i === 0 ? 'Auj.' : WEEKDAY_INITIALS[d.getDay()],
      value,
      color: color(value / total),
    });
  }
  return { type: 'bars', points, max: total };
}

export function buildRing(
  value: number,
  max: number,
  subtitle: string,
  label?: string,
): RingChartModel {
  return { type: 'ring', value, max, subtitle, label };
}

/** Plénitude (ou ombre) moyenne par archétype, aux couleurs de chaque archétype. */
export function buildArchetypeProgress(
  archetypes: Archetype[],
  averages: ArchetypeAverage[],
  field: 'plenitude' | 'shadow',
  shadowColor?: string,
): ProgressChartModel {
  const byKey = new Map(averages.map(a => [a.archetype, a]));
  return {
    type: 'progress',
    max: 5,
    points: archetypes.map(a => ({
      label: `${a.emoji} ${a.name}`,
      value: byKey.get(a.key)?.[field] ?? 0,
      color: field === 'shadow' ? shadowColor : a.color,
    })),
  };
}

export const GOAL_STATUS_ORDER: GoalStatus[] = [
  'done',
  'doing',
  'todo',
  'dropped',
];

export function buildGoalStatusSplit(
  goals: Goal[],
  labels: Record<GoalStatus, string>,
  colors: Record<GoalStatus, string>,
): SplitDonutModel {
  const counts: Record<GoalStatus, number> = {
    todo: 0,
    doing: 0,
    done: 0,
    dropped: 0,
  };
  for (const g of goals) counts[g.status]++;
  return {
    type: 'split',
    segments: GOAL_STATUS_ORDER.map(s => ({
      label: labels[s],
      value: counts[s],
      color: colors[s],
    })),
  };
}

/** Progression moyenne des objectifs (0–100), objectifs abandonnés exclus. */
export function averageGoalProgress(goals: Goal[]): number {
  const active = goals.filter(g => g.status !== 'dropped');
  return (
    average(active.map(g => (g.status === 'done' ? 100 : g.progress ?? 0))) ?? 0
  );
}
