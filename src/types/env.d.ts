declare module '@env' {
  /** URL du Web App Google Apps Script (…/exec) qui synchronise la feuille */
  export const PSYCHO_SHEETS_SYNC_URL: string | undefined;
  /** Jeton partagé, identique à la propriété SYNC_TOKEN du script */
  export const PSYCHO_SHEETS_SYNC_TOKEN: string | undefined;
  /** true = logs détaillés de la synchronisation (défaut: __DEV__) */
  export const PSYCHO_SYNC_DEBUG: string | undefined;
}
