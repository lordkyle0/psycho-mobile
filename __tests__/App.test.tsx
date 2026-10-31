/**
 * @format
 */

import React from 'react';
import { Text } from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import App from '../App';
import { ProgressScreen } from '@/screens/ProgressScreen';
import { TodayScreen } from '@/screens/TodayScreen';
import { saveArchetypeScore, saveCheckin } from '@/services/journal.service';
import { hydrateDb } from '@/services/local-db.service';
import { useSettingsStore } from '@/stores/settings.store';
import { ThemeProvider } from '@/theme';
import { addDays, toDayKey } from '@/utils/dates';

// Les rendus complets d'écran sont lents sur une machine chargée (CI, build Gradle en parallèle).
jest.setTimeout(20_000);

jest.mock('@/navigation/RootNavigator', () => ({
  RootNavigator: () => null,
}));

jest.mock('@react-navigation/native', () => {
  const actual = jest.requireActual('@react-navigation/native');
  return { ...actual, useNavigation: () => ({ navigate: jest.fn() }) };
});

async function render(element: React.ReactElement) {
  let renderer: ReactTestRenderer.ReactTestRenderer | undefined;
  await ReactTestRenderer.act(async () => {
    renderer = ReactTestRenderer.create(element);
  });
  return renderer!;
}

function allText(renderer: ReactTestRenderer.ReactTestRenderer): string {
  return renderer.root
    .findAllByType(Text)
    .map(t => t.props.children)
    .flat(Infinity)
    .join(' ');
}

test("l'application démarre", async () => {
  const renderer = await render(<App />);
  expect(renderer.toJSON()).toBeTruthy();
  // Arrête la surveillance réseau / synchronisation démarrée par l'app.
  await ReactTestRenderer.act(async () => renderer.unmount());
});

describe('écrans avec graphiques', () => {
  beforeAll(async () => {
    await hydrateDb();
    await useSettingsStore
      .getState()
      .update({ profile: 'masculin', name: 'Test' });
    for (let i = 0; i < 10; i++) {
      const day = toDayKey(addDays(new Date(), -i));
      await saveCheckin(day, {
        mood: (i % 5) + 1,
        energy: 3,
        stress: 2,
        sleep_hours: 7,
        evening_done: 1,
      });
      await saveArchetypeScore(day, 'roi', { plenitude: 4, shadow: 2 });
    }
  });

  test("l'écran Progrès affiche les courbes et les barres", async () => {
    const renderer = await render(
      <ThemeProvider>
        <ProgressScreen />
      </ThemeProvider>,
    );
    const texts = allText(renderer);
    expect(texts).toContain('Humeur');
    expect(texts).toContain('Plénitude des archétypes');
    expect(texts).toContain('jours avec bilan');
  });

  test("l'écran Aujourd'hui affiche l'anneau des pratiques", async () => {
    const renderer = await render(
      <ThemeProvider>
        <TodayScreen />
      </ThemeProvider>,
    );
    const texts = allText(renderer);
    expect(texts).toContain('0/6');
    expect(texts).toContain('Programme du jour');
  });
});
