import NetInfo, { type NetInfoState } from '@react-native-community/netinfo';
import { AppState } from 'react-native';
import { z } from 'zod';
import { env } from '@/config/env';
import { useSettingsStore } from '@/stores/settings.store';
import { useSyncStore, type SyncResult } from '@/stores/sync.store';
import {
  applyRemoteRows,
  getDirtyRows,
  markClean,
  subscribe as subscribeDb,
  SYNC_TABLE_NAMES,
  type Row,
  type SyncTable,
} from './local-db.service';

const serverResponseSchema = z.object({
  ok: z.boolean(),
  error: z.string().optional(),
  serverTime: z.string().optional(),
  changes: z
    .record(z.string(), z.array(z.record(z.string(), z.unknown())))
    .optional(),
});

function log(...args: unknown[]) {
  if (env.syncDebug) console.log('[sync]', ...args);
}

function isConnected(state: NetInfoState): boolean {
  if (state.isConnected == null) return true;
  if (state.isInternetReachable === false) return false;
  return state.isConnected;
}

async function fetchWithTimeout(
  url: string,
  init: RequestInit,
  ms: number,
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

let inFlight: Promise<SyncResult> | null = null;

/** Envoie les modifications locales puis récupère celles du Google Sheet (fusion par updated_at). */
export function syncNow(): Promise<SyncResult> {
  if (!inFlight) {
    inFlight = runSync().finally(() => {
      inFlight = null;
    });
  }
  return inFlight;
}

async function runSync(): Promise<SyncResult> {
  const { syncUrl, syncToken: token, isSyncConfigured } = env;
  const {
    lastSyncAt: savedSince,
    lastSyncTarget,
    update,
  } = useSettingsStore.getState();
  if (!isSyncConfigured) {
    return {
      ok: false,
      skipped: true,
      pushed: 0,
      pulled: 0,
      message:
        'Synchronisation non configurée (PSYCHO_SHEETS_SYNC_URL / PSYCHO_SHEETS_SYNC_TOKEN dans .env)',
    };
  }
  // Nouvelle feuille dans .env : on repart de zéro pour tout récupérer.
  const lastSyncAt = lastSyncTarget === syncUrl ? savedSince : null;
  if (!isConnected(await NetInfo.fetch())) {
    return {
      ok: false,
      skipped: true,
      pushed: 0,
      pulled: 0,
      message: 'Hors ligne — les données restent sauvegardées sur le téléphone',
    };
  }

  const syncStore = useSyncStore.getState();
  syncStore.setSyncing(true);
  let result: SyncResult;
  try {
    const changes: Partial<Record<SyncTable, Row[]>> = {};
    let pushed = 0;
    for (const table of SYNC_TABLE_NAMES) {
      const rows = getDirtyRows(table);
      if (rows.length) {
        changes[table] = rows;
        pushed += rows.length;
      }
    }
    log('envoi', pushed, 'ligne(s), since =', lastSyncAt);

    const res = await fetchWithTimeout(
      syncUrl,
      {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ token, since: lastSyncAt, changes }),
      },
      45_000,
    );
    const text = await res.text();
    let json: unknown;
    try {
      json = JSON.parse(text);
    } catch {
      throw new Error(
        `Réponse inattendue (HTTP ${res.status}). Vérifiez que le script est déployé en « Application Web » avec l'accès « Tout le monde ».`,
      );
    }
    const data = serverResponseSchema.parse(json);
    if (!data.ok || !data.serverTime) {
      throw new Error(data.error ?? 'Erreur inconnue du script');
    }

    for (const table of SYNC_TABLE_NAMES) {
      await markClean(table, changes[table] ?? []);
    }
    let pulled = 0;
    for (const table of SYNC_TABLE_NAMES) {
      pulled += await applyRemoteRows(table, data.changes?.[table] ?? []);
    }

    const message = `Synchronisé : ${pushed} envoyé(s), ${pulled} reçu(s)`;
    log(message);
    await update({
      lastSyncAt: data.serverTime,
      lastSyncTarget: syncUrl,
      lastSyncMessage: message,
    });
    result = { ok: true, pushed, pulled, message };
  } catch (e) {
    const message =
      e instanceof Error
        ? e.name === 'AbortError'
          ? 'Délai dépassé'
          : e.message
        : String(e);
    log('échec', message);
    await update({ lastSyncMessage: `Échec : ${message}` });
    result = { ok: false, pushed: 0, pulled: 0, message };
  }
  syncStore.setSyncing(false);
  syncStore.setLastResult(result);
  return result;
}

/**
 * Déclenche une synchronisation :
 *  - au retour de la connexion réseau,
 *  - au retour de l'app au premier plan,
 *  - quelques secondes après une modification locale.
 */
export function startSyncMonitoring(): () => void {
  let debounce: ReturnType<typeof setTimeout> | null = null;
  let wasOnline: boolean | null = null;

  const unsubNet = NetInfo.addEventListener(state => {
    const online = isConnected(state);
    useSyncStore.getState().setOnline(online);
    if (online && wasOnline !== true) syncNow();
    wasOnline = online;
  });

  const appSub = AppState.addEventListener('change', s => {
    if (s === 'active') syncNow();
  });

  const unsubDb = subscribeDb(source => {
    if (source !== 'local') return;
    if (debounce) clearTimeout(debounce);
    debounce = setTimeout(() => syncNow(), 5_000);
  });

  return () => {
    unsubNet();
    appSub.remove();
    unsubDb();
    if (debounce) clearTimeout(debounce);
  };
}
