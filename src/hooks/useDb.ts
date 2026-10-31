import { useMemo, useSyncExternalStore, type DependencyList } from 'react';
import { getDbVersion, subscribe } from '@/services/local-db.service';

/** Version de la base locale : change à chaque écriture locale ou synchronisation. */
export function useDbVersion(): number {
  return useSyncExternalStore(subscribe, getDbVersion);
}

/** Exécute une requête sur la base locale et la recalcule à chaque modification des données. */
export function useDbQuery<T>(query: () => T, deps: DependencyList): T {
  const version = useDbVersion();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(query, [version, ...deps]);
}
