import { Alarm } from '../types';
import { getAlarms, getAlarmById, saveAlarm, deleteAlarmById } from './storageService';
import { cancelNotifications, scheduleNotifications } from './notificationService';

function genId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export type AlarmPayload = {
  title: string; hour: number; minute: number; repeatDays: number[]; enabled: boolean;
};

export async function fetchAlarms(ownerId: string): Promise<Alarm[]> {
  const alarms = await getAlarms(ownerId);
  return alarms.sort((a, b) => a.hour * 60 + a.minute - (b.hour * 60 + b.minute));
}

export async function fetchAlarm(ownerId: string, alarmId: string): Promise<Alarm | null> {
  return getAlarmById(ownerId, alarmId);
}

export async function createAlarm(ownerId: string, currentUserId: string, payload: AlarmPayload): Promise<void> {
  const alarm: Alarm = {
    id: genId(), ownerId, ...payload,
    createdBy: currentUserId, createdAt: Date.now(), updatedAt: Date.now(), notificationIds: [],
  };
  const notificationIds = ownerId === currentUserId ? await scheduleNotifications(alarm) : [];
  await saveAlarm({ ...alarm, notificationIds });
}

export async function updateAlarm(ownerId: string, currentUserId: string, alarmId: string, payload: AlarmPayload): Promise<void> {
  const old = await getAlarmById(ownerId, alarmId);
  if (old && ownerId === currentUserId) await cancelNotifications(old.notificationIds);
  const alarm: Alarm = {
    id: alarmId, ownerId, ...payload,
    createdBy: old?.createdBy ?? currentUserId,
    createdAt: old?.createdAt ?? Date.now(),
    updatedAt: Date.now(), notificationIds: [],
  };
  const notificationIds = ownerId === currentUserId ? await scheduleNotifications(alarm) : old?.notificationIds ?? [];
  await saveAlarm({ ...alarm, notificationIds });
}

export async function toggleAlarm(ownerId: string, currentUserId: string, alarm: Alarm): Promise<void> {
  await updateAlarm(ownerId, currentUserId, alarm.id, {
    title: alarm.title, hour: alarm.hour, minute: alarm.minute,
    repeatDays: alarm.repeatDays, enabled: !alarm.enabled,
  });
}

export async function deleteAlarm(ownerId: string, currentUserId: string, alarm: Alarm): Promise<void> {
  if (ownerId === currentUserId) await cancelNotifications(alarm.notificationIds);
  await deleteAlarmById(ownerId, alarm.id);
}
