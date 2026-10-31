import AsyncStorage from '@react-native-async-storage/async-storage';
import { nowIso } from '@/utils/dates';

type ColType = 'text' | 'int' | 'real';

/**
 * Tables synchronisées avec Google Sheets (une feuille par table).
 * Chaque ligne possède aussi : id, updated_at, deleted, dirty.
 */
export const SYNC_TABLES = {
  checkins: {
    date: 'text',
    mood: 'int',
    energy: 'int',
    stress: 'int',
    sleep_hours: 'real',
    intention: 'text',
    gratitude: 'text',
    wins: 'text',
    lessons: 'text',
    notes: 'text',
    morning_done: 'int',
    evening_done: 'int',
  },
  archetype_scores: {
    date: 'text',
    archetype: 'text',
    plenitude: 'int',
    shadow: 'int',
    note: 'text',
  },
  program_log: {
    date: 'text',
    item_id: 'text',
    kind: 'text',
    title: 'text',
    done: 'int',
  },
  goals: {
    period: 'text',
    period_key: 'text',
    title: 'text',
    notes: 'text',
    status: 'text',
    progress: 'int',
    archetype: 'text',
    created_at: 'text',
  },
  reviews: { period: 'text', period_key: 'text', rating: 'int', note: 'text' },
} as const satisfies Record<string, Record<string, ColType>>;

export type SyncTable = keyof typeof SYNC_TABLES;
export const SYNC_TABLE_NAMES = Object.keys(SYNC_TABLES) as SyncTable[];

export type Value = string | number | null;
export type Row = { id: string; updated_at: string; deleted: number } & Record<
  string,
  Value
>;
type StoredRow = Row & { dirty: number };

const KEY_PREFIX = '@psycho/db/';
const rowKey = (table: SyncTable, id: string) => `${KEY_PREFIX}${table}/${id}`;

const tables = Object.fromEntries(
  SYNC_TABLE_NAMES.map(t => [t, new Map<string, StoredRow>()]),
) as Record<SyncTable, Map<string, StoredRow>>;

let hydrating: Promise<void> | null = null;

/** (Re)charge toutes les lignes depuis le stockage ; les appels simultanés partagent le même chargement. */
export function hydrateDb(): Promise<void> {
  if (!hydrating) {
    hydrating = loadAll().finally(() => {
      hydrating = null;
    });
  }
  return hydrating;
}

async function loadAll(): Promise<void> {
  const loaded = Object.fromEntries(
    SYNC_TABLE_NAMES.map(t => [t, new Map<string, StoredRow>()]),
  ) as Record<SyncTable, Map<string, StoredRow>>;
  const keys = (await AsyncStorage.getAllKeys()).filter(k =>
    k.startsWith(KEY_PREFIX),
  );
  for (let i = 0; i < keys.length; i += 500) {
    const values = await AsyncStorage.getMany(keys.slice(i, i + 500));
    for (const [key, raw] of Object.entries(values)) {
      if (!raw) continue;
      const [table] = key.slice(KEY_PREFIX.length).split('/');
      const map = loaded[table as SyncTable];
      if (!map) continue;
      try {
        const row = JSON.parse(raw) as StoredRow;
        map.set(row.id, row);
      } catch {
        // Ligne illisible ignorée : la prochaine synchronisation la réécrira.
      }
    }
  }
  for (const t of SYNC_TABLE_NAMES) {
    tables[t].clear();
    loaded[t].forEach((row, id) => tables[t].set(id, row));
  }
  emit('remote');
}

// ---------- Notification de changements ----------

export type ChangeSource = 'local' | 'remote';
type Listener = (source: ChangeSource) => void;
const listeners = new Set<Listener>();
let version = 0;

export function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Compteur incrémenté à chaque modification, pour les hooks React. */
export function getDbVersion(): number {
  return version;
}

function emit(source: ChangeSource) {
  version++;
  listeners.forEach(l => l(source));
}

async function persist(table: SyncTable, row: StoredRow) {
  await AsyncStorage.setItem(rowKey(table, row.id), JSON.stringify(row));
}

function stripDirty(row: StoredRow): Row {
  const copy: Record<string, Value> = { ...row };
  delete copy.dirty;
  return copy as Row;
}

// ---------- Lecture ----------

export function getRow<T>(table: SyncTable, id: string): T | null {
  const row = tables[table].get(id);
  return row && !row.deleted ? (row as unknown as T) : null;
}

export function listRows<T>(
  table: SyncTable,
  filter?: (row: T) => boolean,
): T[] {
  const out: T[] = [];
  tables[table].forEach(row => {
    if (row.deleted) return;
    const r = row as unknown as T;
    if (!filter || filter(r)) out.push(r);
  });
  return out;
}

// ---------- Écritures locales ----------

function assertColumns(table: SyncTable, values: Record<string, Value>) {
  const allowed = SYNC_TABLES[table] as Record<string, ColType>;
  for (const key of Object.keys(values)) {
    if (!(key in allowed)) throw new Error(`Colonne inconnue ${table}.${key}`);
  }
}

/** Insère ou met à jour partiellement une ligne, et la marque à synchroniser. */
export async function upsert(
  table: SyncTable,
  id: string,
  values: Record<string, Value>,
): Promise<void> {
  assertColumns(table, values);
  const previous = tables[table].get(id);
  const row: StoredRow = {
    ...(previous ?? {}),
    ...values,
    id,
    updated_at: nowIso(),
    deleted: 0,
    dirty: 1,
  };
  tables[table].set(id, row);
  emit('local');
  await persist(table, row);
}

/** Suppression logique, pour que la suppression soit aussi propagée à Google Sheets. */
export async function softDelete(table: SyncTable, id: string): Promise<void> {
  const previous = tables[table].get(id);
  if (!previous) return;
  const row: StoredRow = {
    ...previous,
    updated_at: nowIso(),
    deleted: 1,
    dirty: 1,
  };
  tables[table].set(id, row);
  emit('local');
  await persist(table, row);
}

// ---------- Synchronisation ----------

export function getDirtyRows(table: SyncTable): Row[] {
  const out: Row[] = [];
  tables[table].forEach(row => {
    if (row.dirty) out.push(stripDirty(row));
  });
  return out;
}

export function countDirty(): number {
  return SYNC_TABLE_NAMES.reduce((n, t) => n + getDirtyRows(t).length, 0);
}

/** Ne marque propre que si la ligne n'a pas été modifiée pendant l'envoi. */
export async function markClean(table: SyncTable, rows: Row[]): Promise<void> {
  for (const sent of rows) {
    const current = tables[table].get(sent.id);
    if (current && current.dirty && current.updated_at === sent.updated_at) {
      const row = { ...current, dirty: 0 };
      tables[table].set(sent.id, row);
      await persist(table, row);
    }
  }
}

function coerce(type: ColType, value: unknown): Value {
  if (value === null || value === undefined || value === '') return null;
  if (type === 'int') {
    const n = Number(value);
    return Number.isFinite(n) ? Math.round(n) : null;
  }
  if (type === 'real') {
    const n = Number(String(value).replace(',', '.'));
    return Number.isFinite(n) ? n : null;
  }
  return String(value);
}

/** Fusion « dernier écrit gagne » basée sur updated_at. Retourne le nombre de lignes appliquées. */
export async function applyRemoteRows(
  table: SyncTable,
  rows: Record<string, unknown>[],
): Promise<number> {
  const schema = SYNC_TABLES[table] as Record<string, ColType>;
  let applied = 0;
  for (const remote of rows) {
    const id = coerce('text', remote.id) as string | null;
    const updatedAt = coerce('text', remote.updated_at) as string | null;
    if (!id || !updatedAt) continue;
    const local = tables[table].get(id);
    if (local && local.updated_at >= updatedAt) continue;
    const row: StoredRow = {
      id,
      updated_at: updatedAt,
      deleted: coerce('int', remote.deleted) ? 1 : 0,
      dirty: 0,
    };
    for (const [col, type] of Object.entries(schema)) {
      row[col] = coerce(type, remote[col]);
    }
    tables[table].set(id, row);
    await persist(table, row);
    applied++;
  }
  if (applied > 0) emit('remote');
  return applied;
}
