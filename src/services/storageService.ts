import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProfile, Alarm, FriendRequest, Friend } from '../types';

const USERS_KEY = '@wb:users';
const ALARMS_KEY = (uid: string) => `@wb:alarms:${uid}`;
const REQUESTS_KEY = '@wb:requests';
const FRIENDS_KEY = (uid: string) => `@wb:friends:${uid}`;

async function getJSON<T>(key: string): Promise<T | null> {
  const raw = await AsyncStorage.getItem(key);
  return raw ? (JSON.parse(raw) as T) : null;
}
async function setJSON<T>(key: string, value: T): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

export async function getAllUsers(): Promise<UserProfile[]> {
  return (await getJSON<UserProfile[]>(USERS_KEY)) ?? [];
}
export async function getUserById(uid: string): Promise<UserProfile | null> {
  return (await getAllUsers()).find((u) => u.uid === uid) ?? null;
}
export async function getUserByEmail(email: string): Promise<UserProfile | null> {
  return (await getAllUsers()).find((u) => u.email.toLowerCase() === email.toLowerCase()) ?? null;
}
export async function saveUser(user: UserProfile): Promise<void> {
  const users = await getAllUsers();
  const idx = users.findIndex((u) => u.uid === user.uid);
  if (idx >= 0) users[idx] = user; else users.push(user);
  await setJSON(USERS_KEY, users);
}

export async function getAlarms(ownerId: string): Promise<Alarm[]> {
  return (await getJSON<Alarm[]>(ALARMS_KEY(ownerId))) ?? [];
}
export async function getAlarmById(ownerId: string, alarmId: string): Promise<Alarm | null> {
  return (await getAlarms(ownerId)).find((a) => a.id === alarmId) ?? null;
}
export async function saveAlarm(alarm: Alarm): Promise<void> {
  const alarms = await getAlarms(alarm.ownerId);
  const idx = alarms.findIndex((a) => a.id === alarm.id);
  if (idx >= 0) alarms[idx] = alarm; else alarms.push(alarm);
  await setJSON(ALARMS_KEY(alarm.ownerId), alarms);
}
export async function deleteAlarmById(ownerId: string, alarmId: string): Promise<void> {
  const alarms = await getAlarms(ownerId);
  await setJSON(ALARMS_KEY(ownerId), alarms.filter((a) => a.id !== alarmId));
}

export async function getAllRequests(): Promise<FriendRequest[]> {
  return (await getJSON<FriendRequest[]>(REQUESTS_KEY)) ?? [];
}
export async function saveRequest(req: FriendRequest): Promise<void> {
  const reqs = await getAllRequests();
  const idx = reqs.findIndex((r) => r.id === req.id);
  if (idx >= 0) reqs[idx] = req; else reqs.push(req);
  await setJSON(REQUESTS_KEY, reqs);
}
export async function getPendingRequests(uid: string): Promise<FriendRequest[]> {
  return (await getAllRequests()).filter((r) => r.toUid === uid && r.status === 'pending');
}

export async function getFriends(uid: string): Promise<Friend[]> {
  return (await getJSON<Friend[]>(FRIENDS_KEY(uid))) ?? [];
}
export async function addFriend(uid: string, friend: Friend): Promise<void> {
  const friends = await getFriends(uid);
  if (!friends.find((f) => f.uid === friend.uid)) {
    friends.push(friend);
    await setJSON(FRIENDS_KEY(uid), friends);
  }
}
