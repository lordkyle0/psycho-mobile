import { archetypesForProfile } from '@/content/archetypes';
import type { Checkin, Goal } from '@/services/journal.service';
import {
  averageGoalProgress,
  buildArchetypeProgress,
  buildGoalStatusSplit,
  buildMetricLine,
  buildPracticeBars,
} from '@/utils/stats';

function checkin(date: string, mood: number | null): Checkin {
  return {
    id: date,
    date,
    mood,
    energy: null,
    stress: null,
    sleep_hours: null,
    intention: null,
    gratitude: null,
    wins: null,
    lessons: null,
    notes: null,
    morning_done: null,
    evening_done: 1,
    updated_at: '2026-10-31T10:00:00.000Z',
  };
}

function goal(status: Goal['status'], progress: number): Goal {
  return {
    id: `${status}-${progress}`,
    period: 'week',
    period_key: '2026-W44',
    title: 'x',
    notes: null,
    status,
    progress,
    archetype: null,
    created_at: '',
    updated_at: '',
  };
}

describe('graphiques', () => {
  it('trace un point par jour sur 7 jours, en ignorant les jours vides', () => {
    const model = buildMetricLine(
      [checkin('2026-10-26', 3), checkin('2026-10-28', 5)],
      'mood',
      '2026-10-25',
      7,
    );
    expect(model).toMatchObject({ type: 'line', min: 1, max: 5 });
    expect(model.points.map(p => p.value)).toEqual([3, 5]);
    expect(model.points.map(p => p.label)).toEqual(['L', 'M']);
  });

  it('agrège par semaine ISO au-delà de 7 jours', () => {
    const model = buildMetricLine(
      [
        checkin('2026-10-26', 2), // semaine 44
        checkin('2026-10-27', 4), // semaine 44
        checkin('2026-10-19', 5), // semaine 43
      ],
      'mood',
      '2026-10-02',
      30,
    );
    expect(model.points).toEqual([
      { label: 'S43', value: 5 },
      { label: 'S44', value: 3 },
    ]);
  });

  it('construit les barres des pratiques sur 7 jours', () => {
    const model = buildPracticeBars(
      { '2026-10-31': 6, '2026-10-30': 3 },
      '2026-10-31',
      6,
      ratio => (ratio >= 1 ? 'full' : 'partial'),
    );
    expect(model.points).toHaveLength(7);
    expect(model.points[6]).toEqual({ label: 'Auj.', value: 6, color: 'full' });
    expect(model.points[5].value).toBe(3);
    expect(model.max).toBe(6);
  });

  it('colore la plénitude avec la couleur de chaque archétype', () => {
    const archetypes = archetypesForProfile('masculin');
    const model = buildArchetypeProgress(
      archetypes,
      [{ archetype: 'roi', plenitude: 4, shadow: 1, days: 3 }],
      'plenitude',
    );
    expect(model.points).toHaveLength(4);
    expect(model.points[0]).toMatchObject({
      value: 4,
      color: archetypes[0].color,
    });
    expect(model.points[1].value).toBe(0);
  });

  it('répartit les objectifs par statut et calcule la progression moyenne', () => {
    const goals = [goal('done', 100), goal('doing', 50), goal('dropped', 10)];
    const split = buildGoalStatusSplit(
      goals,
      {
        todo: 'À faire',
        doing: 'En cours',
        done: 'Atteint',
        dropped: 'Abandonné',
      },
      { todo: 'a', doing: 'b', done: 'c', dropped: 'd' },
    );
    expect(split.segments.map(s => s.value)).toEqual([1, 1, 0, 1]);
    expect(averageGoalProgress(goals)).toBe(75);
  });
});
