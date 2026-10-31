export type Period = 'day' | 'week' | 'month' | 'quarter' | 'year';

export const PERIODS: Period[] = ['day', 'week', 'month', 'quarter', 'year'];

export const PERIOD_LABELS: Record<Period, string> = {
  day: 'Jour',
  week: 'Semaine',
  month: 'Mois',
  quarter: 'Trimestre',
  year: 'Année',
};

const MONTHS = [
  'janvier',
  'février',
  'mars',
  'avril',
  'mai',
  'juin',
  'juillet',
  'août',
  'septembre',
  'octobre',
  'novembre',
  'décembre',
];
const WEEKDAYS = [
  'dimanche',
  'lundi',
  'mardi',
  'mercredi',
  'jeudi',
  'vendredi',
  'samedi',
];

const pad = (n: number) => String(n).padStart(2, '0');

/** Clé de jour en heure locale : 2026-10-31. */
export function toDayKey(d: Date = new Date()): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** Midi local, pour éviter les décalages liés aux changements d'heure. */
export function parseDayKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d, 12);
}

export function addDays(d: Date, days: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + days);
  return r;
}

export function dayOfYear(d: Date): number {
  const start = new Date(d.getFullYear(), 0, 1, 12);
  const noon = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 12);
  return Math.round((noon.getTime() - start.getTime()) / 86_400_000) + 1;
}

export function isoWeek(d: Date): { year: number; week: number } {
  const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = t.getUTCDay() || 7;
  t.setUTCDate(t.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
  const week = Math.ceil(
    ((t.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7,
  );
  return { year: t.getUTCFullYear(), week };
}

export function periodKey(period: Period, d: Date): string {
  switch (period) {
    case 'day':
      return toDayKey(d);
    case 'week': {
      const { year, week } = isoWeek(d);
      return `${year}-W${pad(week)}`;
    }
    case 'month':
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
    case 'quarter':
      return `${d.getFullYear()}-Q${Math.floor(d.getMonth() / 3) + 1}`;
    case 'year':
      return String(d.getFullYear());
  }
}

export function shiftPeriod(period: Period, d: Date, delta: number): Date {
  const r = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 12);
  switch (period) {
    case 'day':
      return addDays(r, delta);
    case 'week':
      return addDays(r, delta * 7);
    case 'month':
      r.setDate(1);
      r.setMonth(r.getMonth() + delta);
      return r;
    case 'quarter':
      r.setDate(1);
      r.setMonth(r.getMonth() + delta * 3);
      return r;
    case 'year':
      r.setDate(1);
      r.setFullYear(r.getFullYear() + delta);
      return r;
  }
}

export function formatLongDate(d: Date): string {
  return `${WEEKDAYS[d.getDay()]} ${d.getDate()} ${
    MONTHS[d.getMonth()]
  } ${d.getFullYear()}`;
}

export function formatShortDate(d: Date): string {
  return `${WEEKDAYS[d.getDay()].slice(0, 3)}. ${d.getDate()} ${MONTHS[
    d.getMonth()
  ].slice(0, 4)}.`;
}

export function periodTitle(period: Period, d: Date): string {
  switch (period) {
    case 'day':
      return formatLongDate(d);
    case 'week': {
      const { year, week } = isoWeek(d);
      const monday = addDays(d, -((d.getDay() + 6) % 7));
      const sunday = addDays(monday, 6);
      return `Semaine ${week} (${year}) · ${monday.getDate()} ${MONTHS[
        monday.getMonth()
      ].slice(0, 4)}. → ${sunday.getDate()} ${MONTHS[sunday.getMonth()].slice(
        0,
        4,
      )}.`;
    }
    case 'month':
      return `${MONTHS[d.getMonth()][0].toUpperCase()}${MONTHS[
        d.getMonth()
      ].slice(1)} ${d.getFullYear()}`;
    case 'quarter':
      return `T${Math.floor(d.getMonth() / 3) + 1} ${d.getFullYear()}`;
    case 'year':
      return `Année ${d.getFullYear()}`;
  }
}

export function nowIso(): string {
  return new Date().toISOString();
}
