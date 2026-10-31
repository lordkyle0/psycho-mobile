import {
  PSYCHO_SHEETS_SYNC_TOKEN,
  PSYCHO_SHEETS_SYNC_URL,
  PSYCHO_SYNC_DEBUG,
} from '@env';

const syncUrl = (PSYCHO_SHEETS_SYNC_URL ?? '').trim();
const syncToken = (PSYCHO_SHEETS_SYNC_TOKEN ?? '').trim();

export const env = {
  /** URL du Web App Google Apps Script (…/exec), définie dans .env. */
  syncUrl,
  /** Jeton SYNC_TOKEN du script, défini dans .env. */
  syncToken,
  /** La synchronisation n'est active que si l'URL et le jeton sont renseignés. */
  isSyncConfigured:
    /^https:\/\/script\.google\.com\/.+\/exec$/.test(syncUrl) &&
    syncToken.length > 0,
  syncDebug: PSYCHO_SYNC_DEBUG != null ? PSYCHO_SYNC_DEBUG === 'true' : __DEV__,
} as const;
