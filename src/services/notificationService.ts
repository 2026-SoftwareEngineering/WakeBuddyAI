import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { Alarm } from '../types';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export async function requestPermission(): Promise<boolean> {
  const { status: existing } = await Notifications.getPermissionsAsync();
  let finalStatus = existing;
  if (existing !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync({
      ios: { allowAlert: true, allowBadge: true, allowSound: true },
    });
    finalStatus = status;
  }
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('alarm', {
      name: 'WakeBuddy 알람',
      importance: Notifications.AndroidImportance.MAX,
      sound: 'default',
      vibrationPattern: [0, 500, 300, 500],
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
      bypassDnd: true,
    });
  }
  return finalStatus === 'granted';
}

export async function cancelNotifications(ids?: string[]): Promise<void> {
  if (!ids || ids.length === 0) return;
  for (const id of ids) {
    try { await Notifications.cancelScheduledNotificationAsync(id); } catch (_) {}
  }
}

export async function scheduleNotifications(alarm: Alarm): Promise<string[]> {
  if (!alarm.enabled) return [];
  const ids: string[] = [];
  try {
    if (alarm.repeatDays.length === 0) {
      const now = new Date();
      const target = new Date(now.getFullYear(), now.getMonth(), now.getDate(), alarm.hour, alarm.minute, 0, 0);
      if (target.getTime() <= now.getTime()) target.setDate(target.getDate() + 1);
      const seconds = Math.max(1, Math.floor((target.getTime() - Date.now()) / 1000));
      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: '⏰ 알람',
          body: alarm.title,
          sound: 'default',
          priority: Notifications.AndroidNotificationPriority.MAX,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds,
          repeats: false,
          channelId: Platform.OS === 'android' ? 'alarm' : undefined,
        } as any,
      });
      ids.push(id);
    } else {
      for (const weekday of alarm.repeatDays) {
        const id = await Notifications.scheduleNotificationAsync({
          content: {
            title: '⏰ 반복 알람',
            body: alarm.title,
            sound: 'default',
            priority: Notifications.AndroidNotificationPriority.MAX,
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
            weekday,
            hour: alarm.hour,
            minute: alarm.minute,
            channelId: Platform.OS === 'android' ? 'alarm' : undefined,
          } as any,
        });
        ids.push(id);
      }
    }
  } catch (e) {
    console.warn('알림 예약 실패:', e);
  }
  return ids;
}
