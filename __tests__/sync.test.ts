import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { getCheckin, listGoals, saveCheckin } from '@/services/journal.service';
import {
  applyRemoteRows,
  countDirty,
  getDirtyRows,
  hydrateDb,
  markClean,
} from '@/services/local-db.service';
import { syncNow } from '@/services/sync.service';
import { useSettingsStore } from '@/stores/settings.store';

const SYNC_URL = 'https://script.google.com/macros/s/TEST/exec';

// react-native-dotenv injecte le .env local à la compilation : on fixe la configuration du test.
jest.mock('@/config/env', () => ({
  env: {
    syncUrl: 'https://script.google.com/macros/s/TEST/exec',
    syncToken: 'secret',
    isSyncConfigured: true,
    syncDebug: false,
  },
}));

beforeEach(async () => {
  // Stockage vide puis rechargement : chaque test part d'une base vierge.
  await AsyncStorage.clear();
  await hydrateDb();
});

describe('base locale', () => {
  it('marque les écritures à synchroniser et les recharge depuis le stockage', async () => {
    await saveCheckin('2026-10-31', { mood: 4, intention: 'Être présent' });
    expect(getDirtyRows('checkins')).toHaveLength(1);

    await hydrateDb();
    expect(getCheckin('2026-10-31')).toMatchObject({
      mood: 4,
      intention: 'Être présent',
    });
    expect(countDirty()).toBe(1);
  });

  it("garde une ligne à synchroniser si elle a changé pendant l'envoi", async () => {
    await saveCheckin('2026-10-30', { mood: 2 });
    const sent = getDirtyRows('checkins');
    await new Promise<void>(resolve => setTimeout(() => resolve(), 2));
    await saveCheckin('2026-10-30', { mood: 3 });
    await markClean('checkins', sent);
    expect(getDirtyRows('checkins').map(r => r.id)).toContain('2026-10-30');
  });

  it('applique la version distante la plus récente seulement', async () => {
    await applyRemoteRows('checkins', [
      {
        id: '2026-10-29',
        date: '2026-10-29',
        mood: '5',
        updated_at: '2026-10-29T10:00:00.000Z',
        deleted: '0',
      },
    ]);
    const applied = await applyRemoteRows('checkins', [
      {
        id: '2026-10-29',
        date: '2026-10-29',
        mood: '1',
        updated_at: '2026-10-29T09:00:00.000Z',
        deleted: '0',
      },
    ]);
    expect(applied).toBe(0);
    expect(getCheckin('2026-10-29')?.mood).toBe(5);
  });
});

describe('synchronisation Google Sheets', () => {
  const fetchMock = jest.fn();

  beforeEach(async () => {
    (globalThis as unknown as { fetch: jest.Mock }).fetch = fetchMock;
    fetchMock.mockReset();
    await useSettingsStore
      .getState()
      .update({ lastSyncAt: null, lastSyncTarget: null });
  });

  it("repart de zéro quand l'URL de la feuille change dans .env", async () => {
    await useSettingsStore.getState().update({
      lastSyncAt: '2026-10-30T12:00:00.000Z',
      lastSyncTarget: 'https://script.google.com/macros/s/ANCIENNE/exec',
    });
    fetchMock.mockResolvedValue({
      status: 200,
      text: async () =>
        JSON.stringify({ ok: true, serverTime: '2026-10-31T12:00:00.000Z' }),
    });
    await syncNow();
    expect(fetchMock.mock.calls[0][0]).toBe(SYNC_URL);
    expect(JSON.parse(fetchMock.mock.calls[0][1].body).since).toBeNull();
    expect(useSettingsStore.getState().lastSyncTarget).toBe(SYNC_URL);
  });

  it('envoie les modifications puis récupère celles de la feuille', async () => {
    await saveCheckin('2026-10-31', { mood: 4 });
    fetchMock.mockResolvedValue({
      status: 200,
      text: async () =>
        JSON.stringify({
          ok: true,
          serverTime: '2026-10-31T12:00:00.000Z',
          changes: {
            goals: [
              {
                id: 'g1',
                period: 'week',
                period_key: '2026-W44',
                title: 'Lire 3 chapitres',
                status: 'doing',
                progress: '40',
                notes: '',
                archetype: '',
                created_at: '2026-10-30T08:00:00.000Z',
                updated_at: '2026-10-30T08:00:00.000Z',
                deleted: '0',
              },
            ],
          },
        }),
    });

    const result = await syncNow();

    expect(result).toMatchObject({ ok: true, pushed: 1, pulled: 1 });
    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body.token).toBe('secret');
    expect(body.changes.checkins[0]).toMatchObject({
      id: '2026-10-31',
      mood: 4,
    });
    expect(countDirty()).toBe(0);
    expect(listGoals('week', '2026-W44')[0]).toMatchObject({
      title: 'Lire 3 chapitres',
      progress: 40,
    });
    expect(useSettingsStore.getState().lastSyncAt).toBe(
      '2026-10-31T12:00:00.000Z',
    );
  });

  it('signale une erreur du script sans perdre les données locales', async () => {
    await saveCheckin('2026-10-31', { mood: 4 });
    fetchMock.mockResolvedValue({
      status: 200,
      text: async () => JSON.stringify({ ok: false, error: 'Jeton invalide' }),
    });
    const result = await syncNow();
    expect(result).toMatchObject({ ok: false, message: 'Jeton invalide' });
    expect(countDirty()).toBe(1);
  });

  it('ne tente rien hors ligne', async () => {
    (NetInfo.fetch as jest.Mock).mockResolvedValueOnce({
      isConnected: false,
      isInternetReachable: false,
    });
    const result = await syncNow();
    expect(result.skipped).toBe(true);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
