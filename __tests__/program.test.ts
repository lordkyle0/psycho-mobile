import { archetypesForProfile, type Profile } from '@/content/archetypes';
import {
  ARCHETYPE_EXERCISES,
  BODY,
  BREATHING,
  EVENING,
} from '@/content/exercises';
import { buildProgram } from '@/content/program';
import { biblePlan } from '@/content/readings';
import {
  addDays,
  dayOfYear,
  parseDayKey,
  periodKey,
  shiftPeriod,
  toDayKey,
} from '@/utils/dates';

describe('dates', () => {
  it('calcule les clés de période', () => {
    expect(toDayKey(new Date(2026, 9, 31, 23, 59))).toBe('2026-10-31');
    expect(periodKey('week', new Date(2026, 9, 31))).toBe('2026-W44');
    expect(periodKey('week', new Date(2027, 0, 1))).toBe('2026-W53');
    expect(periodKey('week', new Date(2026, 0, 1))).toBe('2026-W01');
    expect(periodKey('quarter', new Date(2026, 9, 31))).toBe('2026-Q4');
    expect(periodKey('year', new Date(2026, 9, 31))).toBe('2026');
  });

  it('décale les périodes sans débordement de fin de mois', () => {
    expect(
      periodKey('month', shiftPeriod('month', new Date(2026, 0, 31), 1)),
    ).toBe('2026-02');
    expect(
      periodKey('quarter', shiftPeriod('quarter', new Date(2026, 10, 30), 1)),
    ).toBe('2027-Q1');
  });

  it("gère le jour de l'année et le changement d'heure", () => {
    expect(dayOfYear(new Date(2026, 0, 1))).toBe(1);
    expect(dayOfYear(new Date(2026, 11, 31))).toBe(365);
    expect(toDayKey(addDays(parseDayKey('2026-03-28'), 2))).toBe('2026-03-30');
  });
});

describe('programme du jour', () => {
  const profiles: Profile[] = ['masculin', 'feminin', 'integral'];

  it.each(profiles)(
    'propose chaque jour 6 pratiques et une rotation complète (%s)',
    profile => {
      const allowed = new Set(archetypesForProfile(profile).map(a => a.key));
      const seen = new Set<string>();
      for (let i = 0; i < 366; i++) {
        const day = toDayKey(addDays(new Date(2026, 0, 1, 12), i));
        const program = buildProgram(day, profile);
        expect(allowed.has(program.focus.key)).toBe(true);
        expect(program.items).toHaveLength(6);
        expect(new Set(program.items.map(x => x.id)).size).toBe(6);
        expect(program.verse.text).toBeTruthy();
        expect(program.philosophy.text).toBeTruthy();
        seen.add(program.focus.key);
      }
      expect(seen.size).toBe(allowed.size);
    },
  );

  it('est déterministe pour une date donnée', () => {
    const a = buildProgram('2026-10-31', 'integral');
    const b = buildProgram('2026-10-31', 'integral');
    expect(a.items.map(i => i.id)).toEqual(b.items.map(i => i.id));
  });

  it("cible l'archétype le plus faible un jour sur deux", () => {
    const even = '2026-01-02';
    expect(
      buildProgram(even, 'masculin', {
        roi: 4,
        guerrier: 2.5,
        magicien: 3,
        amant: 4.5,
      }).focus.key,
    ).toBe('guerrier');
    expect(
      buildProgram(even, 'masculin', { roi: 4, guerrier: 2.5, magicien: 3 })
        .focus.key,
    ).toBe('amant');
  });

  it("n'a pas d'identifiants d'exercice dupliqués", () => {
    const ids = [
      ...BREATHING,
      ...BODY,
      ...EVENING,
      ...Object.values(ARCHETYPE_EXERCISES).flat(),
    ].map(e => e.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('suit le plan de lecture biblique', () => {
    expect(biblePlan(1, 1).gospel).toBe('Matthieu 1');
    expect(biblePlan(1, 29).gospel).toBe('Marc 1');
    expect(biblePlan(1, 89).gospel).toBe('Jean 21');
    expect(biblePlan(1, 90).gospel).toBe('Matthieu 1');
    expect(biblePlan(31, 365).psalm).toBe('Psaume 65');
  });
});
