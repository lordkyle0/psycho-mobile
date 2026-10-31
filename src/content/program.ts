import {
  archetypesForProfile,
  type Archetype,
  type ArchetypeKey,
  type Profile,
} from './archetypes';
import { ARCHETYPE_EXERCISES, BODY, BREATHING, EVENING } from './exercises';
import {
  biblePlan,
  PHILOSOPHY,
  VERSES,
  type BiblePlan,
  type PhilosophyReading,
  type Verse,
} from './readings';
import { dayOfYear, parseDayKey } from '@/utils/dates';

export type ProgramKind =
  | 'respiration'
  | 'bible'
  | 'philo'
  | 'archetype'
  | 'corps'
  | 'soir';
export type Moment = 'matin' | 'journee' | 'soir';

export interface ProgramItem {
  id: string;
  kind: ProgramKind;
  moment: Moment;
  title: string;
  detail: string;
  minutes?: number;
}

export interface DailyProgram {
  date: string;
  focus: Archetype;
  focusReason: string;
  verse: Verse;
  bible: BiblePlan;
  philosophy: PhilosophyReading;
  items: ProgramItem[];
}

export const MOMENT_LABELS: Record<Moment, string> = {
  matin: '🌅 Matin',
  journee: '☀️ Journée',
  soir: '🌙 Soir',
};

const pick = <T>(list: T[], seed: number): T =>
  list[((seed % list.length) + list.length) % list.length];

function chooseFocus(
  archetypes: Archetype[],
  doy: number,
  recent: Partial<Record<ArchetypeKey, number>>,
): { focus: Archetype; reason: string } {
  const rated = archetypes.filter(a => recent[a.key] != null);
  // Un jour sur deux : on travaille l'archétype le plus faible des 7 derniers jours.
  if (doy % 2 === 0 && rated.length > 0) {
    const unrated = archetypes.filter(a => recent[a.key] == null);
    if (unrated.length > 0) {
      return {
        focus: pick(unrated, doy),
        reason: "Archétype non évalué récemment : à explorer aujourd'hui.",
      };
    }
    const weakest = [...rated].sort(
      (a, b) => (recent[a.key] ?? 0) - (recent[b.key] ?? 0),
    )[0];
    return {
      focus: weakest,
      reason: `Plénitude moyenne la plus basse sur 7 jours (${(
        recent[weakest.key] ?? 0
      ).toFixed(1)}/5).`,
    };
  }
  return {
    focus: pick(archetypes, doy),
    reason: 'Rotation quotidienne des archétypes de ton profil.',
  };
}

export function buildProgram(
  date: string,
  profile: Profile,
  recent: Partial<Record<ArchetypeKey, number>> = {},
): DailyProgram {
  const d = parseDayKey(date);
  const doy = dayOfYear(d);
  const seed = doy + d.getFullYear() * 7;
  const { focus, reason } = chooseFocus(
    archetypesForProfile(profile),
    doy,
    recent,
  );

  const verses = VERSES.filter(v => v.archetypes.includes(focus.key));
  const verse = pick(verses.length ? verses : VERSES, seed);
  const philos = PHILOSOPHY.filter(p => p.archetypes.includes(focus.key));
  const philosophy = pick(philos.length ? philos : PHILOSOPHY, seed);
  const bible = biblePlan(d.getDate(), doy);

  const breathing = pick(BREATHING, seed);
  const archetypeEx = pick(ARCHETYPE_EXERCISES[focus.key], seed);
  const body = pick(BODY, seed + 3);
  const evening = pick(EVENING, seed);

  const items: ProgramItem[] = [
    {
      id: breathing.id,
      kind: 'respiration',
      moment: 'matin',
      title: breathing.title,
      detail: breathing.instructions,
      minutes: breathing.minutes,
    },
    {
      id: 'bible',
      kind: 'bible',
      moment: 'matin',
      title: 'Lecture biblique',
      detail: `${bible.proverbs} · ${bible.psalm} · ${bible.gospel}`,
      minutes: 15,
    },
    {
      id: 'philo',
      kind: 'philo',
      moment: 'matin',
      title: `Lecture philosophique — ${philosophy.author}`,
      detail: `${philosophy.source}. ${philosophy.reflection}`,
      minutes: 10,
    },
    {
      id: archetypeEx.id,
      kind: 'archetype',
      moment: 'journee',
      title: `${focus.emoji} ${archetypeEx.title}`,
      detail: archetypeEx.instructions,
      minutes: archetypeEx.minutes,
    },
    {
      id: body.id,
      kind: 'corps',
      moment: 'journee',
      title: body.title,
      detail: body.instructions,
      minutes: body.minutes,
    },
    {
      id: evening.id,
      kind: 'soir',
      moment: 'soir',
      title: evening.title,
      detail: evening.instructions,
      minutes: evening.minutes,
    },
  ];

  return { date, focus, focusReason: reason, verse, bible, philosophy, items };
}
