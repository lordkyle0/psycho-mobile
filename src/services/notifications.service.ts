import notifee, {
  AndroidImportance,
  AuthorizationStatus,
  EventType,
  RepeatFrequency,
  TriggerType,
  type Event,
} from 'react-native-notify-kit';
import { Platform } from 'react-native';
import { openTab } from '@/navigation/navigation-ref';
import type { MainTabParamList } from '@/navigation/types';
import type { AppSettings, ReminderTime } from '@/stores/settings.store';

const CHANNEL_ID = 'rituels';
const MORNING_ID = 'psycho-morning';
const EVENING_ID = 'psycho-evening';

function tabFromEvent(event: Event): keyof MainTabParamList | null {
  const tab = event.detail.notification?.data?.tab;
  return tab === 'Today' || tab === 'Checkin' ? tab : null;
}

/** Ouvre l'onglet ciblé quand l'utilisateur touche un rappel. À appeler au démarrage. */
export function setupNotificationHandlers(): () => void {
  notifee
    .getInitialNotification()
    .then(initial => {
      const tab = initial?.notification.data?.tab;
      if (tab === 'Today' || tab === 'Checkin') openTab(tab);
    })
    .catch(() => undefined);

  return notifee.onForegroundEvent(event => {
    if (event.type !== EventType.PRESS) return;
    const tab = tabFromEvent(event);
    if (tab) openTab(tab);
  });
}

/** Rien à faire en arrière-plan : l'ouverture est gérée par getInitialNotification. */
export async function handleBackgroundEvent(_event: Event): Promise<void> {}

async function ensurePermission(): Promise<boolean> {
  const settings = await notifee.requestPermission();
  return (
    settings.authorizationStatus === AuthorizationStatus.AUTHORIZED ||
    settings.authorizationStatus === AuthorizationStatus.PROVISIONAL
  );
}

/** Prochaine occurrence de hh:mm (aujourd'hui si encore à venir, sinon demain). */
export function nextOccurrence(time: ReminderTime, now = new Date()): number {
  const next = new Date(now);
  next.setHours(time.hour, time.minute, 0, 0);
  if (next.getTime() <= now.getTime()) next.setDate(next.getDate() + 1);
  return next.getTime();
}

async function scheduleDaily(
  id: string,
  time: ReminderTime,
  title: string,
  body: string,
  tab: keyof MainTabParamList,
) {
  await notifee.cancelTriggerNotification(id);
  if (!time.enabled) return;
  await notifee.createTriggerNotification(
    {
      id,
      title,
      body,
      data: { tab },
      android: {
        channelId: CHANNEL_ID,
        smallIcon: 'ic_stat_psycho',
        pressAction: { id: 'default' },
      },
    },
    {
      type: TriggerType.TIMESTAMP,
      timestamp: nextOccurrence(time),
      repeatFrequency: RepeatFrequency.DAILY,
      alarmManager: { allowWhileIdle: true },
    },
  );
}

/** (Re)programme les rappels natifs du matin et du soir. Retourne false si la permission est refusée. */
export async function scheduleReminders(
  settings: Pick<AppSettings, 'morning' | 'evening' | 'name'>,
): Promise<boolean> {
  const wantsAny = settings.morning.enabled || settings.evening.enabled;
  if (wantsAny && !(await ensurePermission())) return false;
  if (Platform.OS === 'android') {
    await notifee.createChannel({
      id: CHANNEL_ID,
      name: 'Rituels du matin et du soir',
      importance: AndroidImportance.HIGH,
      vibration: true,
    });
  }
  const hello = settings.name ? `, ${settings.name}` : '';
  await scheduleDaily(
    MORNING_ID,
    settings.morning,
    `🌅 Bonjour${hello}`,
    "Ton programme t'attend : respiration, lectures biblique et philosophique, archétype du jour.",
    'Today',
  );
  await scheduleDaily(
    EVENING_ID,
    settings.evening,
    '🌙 Bilan du soir',
    '5 minutes pour faire le point : humeur, archétypes, gratitude et leçons de la journée.',
    'Checkin',
  );
  return true;
}

/** Android 12+ : ouvre le réglage « Alarmes et rappels » pour des rappels à l'heure exacte. */
export function openExactAlarmSettings(): Promise<void> {
  return notifee.openAlarmPermissionSettings();
}

export function formatTime(t: { hour: number; minute: number }): string {
  return `${String(t.hour).padStart(2, '0')}:${String(t.minute).padStart(
    2,
    '0',
  )}`;
}
