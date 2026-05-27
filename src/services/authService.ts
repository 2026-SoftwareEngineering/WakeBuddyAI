import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProfile } from '../types';
import { getUserByEmail, saveUser, getUserById } from './storageService';

const SESSION_KEY = '@wb:session';

function uid(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export async function getCurrentUser(): Promise<UserProfile | null> {
  const id = await AsyncStorage.getItem(SESSION_KEY);
  if (!id) return null;
  return getUserById(id);
}

export async function register(email: string, password: string): Promise<UserProfile> {
  if (await getUserByEmail(email)) throw new Error('이미 사용 중인 이메일입니다.');
  if (password.length < 6) throw new Error('비밀번호는 6자 이상이어야 합니다.');
  const user: UserProfile = { uid: uid(), email: email.trim().toLowerCase(), password, createdAt: Date.now() };
  await saveUser(user);
  await AsyncStorage.setItem(SESSION_KEY, user.uid);
  return user;
}

export async function login(email: string, password: string): Promise<UserProfile> {
  const user = await getUserByEmail(email);
  if (!user || user.password !== password) throw new Error('이메일 또는 비밀번호가 올바르지 않습니다.');
  await AsyncStorage.setItem(SESSION_KEY, user.uid);
  return user;
}

export async function logout(): Promise<void> {
  await AsyncStorage.removeItem(SESSION_KEY);
}
