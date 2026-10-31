import type { ArchetypeKey } from '@/content/archetypes';
import {
  addDays,
  nowIso,
  parseDayKey,
  toDayKey,
  type Period,
} from '@/utils/dates';
import { uuid } from '@/utils/uuid';
import { getRow, listRows, softDelete, upsert } from './local-db.service';

// ---------- Bilan quotidien ----------

export interface Checkin {
  id: string;
  date: string;
  mood: number | null;
  energy: number | null;
  stress: number | null;
  sleep_hours: number | null;
  intention: string | null;
  gratitude: string | null;
  wins: string | null;
  lessons: string | null;
  notes: string | null;
  morning_done: number | null;
  evening_done: number | null;
  updated_at: string;
}

export type CheckinInput = Partial<Omit<Checkin, 'id' | 'date' | 'updated_at'>>;

export function getCheckin(date: string): Checkin | null {
  return getRow<Checkin>('checkins', date);
}

export function saveCheckin(date: string, values: CheckinInput): Promise<void> {
  return upsert('checkins', date, { date, ...values });
}

export function listCheckins(from: string, to: string): Checkin[] {
  return listRows<Checkin>(
    'checkins',
    c => c.date >= from && c.date <= to,
  ).sort((a, b) => b.date.localeCompare(a.date));
}

// ---------- Archétypes ----------

export interface ArchetypeScore {
  plenitude: number | null;
  shadow: number | null;
}

interface ScoreRow extends ArchetypeScore {
  date: string;
  archetype: ArchetypeKey;
}

export function getArchetypeScores(
  date: string,
): Partial<Record<ArchetypeKey, ArchetypeScore>> {
  const out: Partial<Record<ArchetypeKey, ArchetypeScore>> = {};
  for (const r of listRows<ScoreRow>(
    'archetype_scores',
    s => s.date === date,
  )) {
    out[r.archetype] = { plenitude: r.plenitude, shadow: r.shadow };
  }
  return out;
}

export function saveArchetypeScore(
  date: string,
  archetype: ArchetypeKey,
  score: Partial<ArchetypeScore>,
): Promise<void> {
  return upsert('archetype_scores', `${date}:${archetype}`, {
    date,
    archetype,
    ...score,
  });
}

export interface ArchetypeAverage {
  archetype: ArchetypeKey;
  plenitude: number | null;
  shadow: number | null;
  days: number;
}

export function mean(values: (number | null)[]): number | null {
  const nums = values.filter((v): v is number => v != null);
  return nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : null;
}

export function archetypeAverages(
  from: string,
  to: string,
): ArchetypeAverage[] {
  const groups = new Map<ArchetypeKey, ScoreRow[]>();
  for (const r of listRows<ScoreRow>(
    'archetype_scores',
    s => s.date >= from && s.date <= to,
  )) {
    groups.set(r.archetype, [...(groups.get(r.archetype) ?? []), r]);
  }
  return [...groups.entries()].map(([archetype, rows]) => ({
    archetype,
    plenitude: mean(rows.map(r => r.plenitude)),
    shadow: mean(rows.map(r => r.shadow)),
    days: rows.length,
  }));
}

/** Notes quotidiennes d'un archétype sur la période. */
export function archetypeHistory(
  archetype: ArchetypeKey,
  from: string,
  to: string,
): Array<{ date: string } & ArchetypeScore> {
  return listRows<ScoreRow>(
    'archetype_scores',
    s => s.archetype === archetype && s.date >= from && s.date <= to,
  )
    .map(({ date, plenitude, shadow }) => ({ date, plenitude, shadow }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

/** Plénitude moyenne des N derniers jours (aujourd'hui exclu), pour choisir l'archétype à travailler. */
export function recentPlenitude(
  days: number,
  today: string,
): Partial<Record<ArchetypeKey, number>> {
  const to = toDayKey(addDays(parseDayKey(today), -1));
  const from = toDayKey(addDays(parseDayKey(today), -days));
  const out: Partial<Record<ArchetypeKey, number>> = {};
  for (const r of archetypeAverages(from, to)) {
    if (r.plenitude != null) out[r.archetype] = r.plenitude;
  }
  return out;
}

// ---------- Programme du jour ----------

interface LogRow {
  date: string;
  item_id: string;
  done: number;
}

export function getProgramLog(date: string): Record<string, boolean> {
  const out: Record<string, boolean> = {};
  for (const r of listRows<LogRow>('program_log', l => l.date === date)) {
    out[r.item_id] = r.done === 1;
  }
  return out;
}

export function setProgramItemDone(
  date: string,
  item: { id: string; kind: string; title: string },
  done: boolean,
): Promise<void> {
  return upsert('program_log', `${date}:${item.id}`, {
    date,
    item_id: item.id,
    kind: item.kind,
    title: item.title,
    done: done ? 1 : 0,
  });
}

/** Nombre de pratiques cochées par jour sur la période : { '2026-10-31': 4 }. */
export function programCompletion(
  from: string,
  to: string,
): Record<string, number> {
  const byDay: Record<string, number> = {};
  for (const r of listRows<LogRow>(
    'program_log',
    l => l.date >= from && l.date <= to,
  )) {
    byDay[r.date] = (byDay[r.date] ?? 0) + (r.done === 1 ? 1 : 0);
  }
  return byDay;
}

// ---------- Objectifs ----------

export type GoalStatus = 'todo' | 'doing' | 'done' | 'dropped';

export const GOAL_STATUS_LABELS: Record<GoalStatus, string> = {
  todo: 'À faire',
  doing: 'En cours',
  done: 'Atteint',
  dropped: 'Abandonné',
};

const STATUS_ORDER: Record<GoalStatus, number> = {
  doing: 0,
  todo: 1,
  done: 2,
  dropped: 3,
};

export interface Goal {
  id: string;
  period: Period;
  period_key: string;
  title: string;
  notes: string | null;
  status: GoalStatus;
  progress: number;
  archetype: ArchetypeKey | null;
  created_at: string;
  updated_at: string;
}

export function listGoals(period: Period, periodKey: string): Goal[] {
  return listRows<Goal>(
    'goals',
    g => g.period === period && g.period_key === periodKey,
  ).sort(
    (a, b) =>
      STATUS_ORDER[a.status] - STATUS_ORDER[b.status] ||
      a.created_at.localeCompare(b.created_at),
  );
}

export function getGoal(id: string): Goal | null {
  return getRow<Goal>('goals', id);
}

export async function createGoal(
  period: Period,
  periodKey: string,
  title: string,
  archetype: ArchetypeKey | null = null,
): Promise<string> {
  const id = uuid();
  await upsert('goals', id, {
    period,
    period_key: periodKey,
    title,
    notes: '',
    status: 'todo',
    progress: 0,
    archetype,
    created_at: nowIso(),
  });
  return id;
}

export function updateGoal(
  id: string,
  values: Partial<
    Pick<Goal, 'title' | 'notes' | 'status' | 'progress' | 'archetype'>
  >,
): Promise<void> {
  return upsert('goals', id, values);
}

export function deleteGoal(id: string): Promise<void> {
  return softDelete('goals', id);
}

export function goalStats(): Partial<
  Record<Period, { total: number; done: number }>
> {
  const out: Partial<Record<Period, { total: number; done: number }>> = {};
  for (const g of listRows<Goal>('goals')) {
    const s = (out[g.period] ??= { total: 0, done: 0 });
    s.total++;
    if (g.status === 'done') s.done++;
  }
  return out;
}

// ---------- Bilans de période (notes) ----------

export interface Review {
  rating: number | null;
  note: string | null;
}

export function getReview(period: Period, periodKey: string): Review | null {
  return getRow<Review>('reviews', `${period}:${periodKey}`);
}

export function saveReview(
  period: Period,
  periodKey: string,
  values: Partial<Review>,
): Promise<void> {
  return upsert('reviews', `${period}:${periodKey}`, {
    period,
    period_key: periodKey,
    ...values,
  });
}

// ---------- Régularité ----------

/** Jours consécutifs (jusqu'à aujourd'hui ou hier) avec un bilan validé. */
export function currentStreak(today: string): number {
  const dates = new Set(
    listRows<Checkin>(
      'checkins',
      c => !!(c.morning_done || c.evening_done),
    ).map(c => c.date),
  );
  let cursor = parseDayKey(today);
  if (!dates.has(today)) cursor = addDays(cursor, -1);
  let streak = 0;
  while (dates.has(toDayKey(cursor))) {
    streak++;
    cursor = addDays(cursor, -1);
  }
  return streak;
}
