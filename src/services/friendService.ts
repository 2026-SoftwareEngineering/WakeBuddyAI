import { Friend, FriendRequest } from '../types';
import { getUserByEmail, getAllRequests, saveRequest, getPendingRequests, getFriends, addFriend } from './storageService';

function genId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export async function sendFriendRequest(fromUid: string, fromEmail: string, toEmail: string): Promise<void> {
  const target = await getUserByEmail(toEmail);
  if (!target) throw new Error('해당 이메일의 사용자를 찾을 수 없습니다.');
  if (target.uid === fromUid) throw new Error('본인에게 요청을 보낼 수 없습니다.');
  const reqs = await getAllRequests();
  if (reqs.find((r) => r.fromUid === fromUid && r.toUid === target.uid && r.status === 'pending'))
    throw new Error('이미 보낸 친구 요청입니다.');
  const friends = await getFriends(fromUid);
  if (friends.find((f) => f.uid === target.uid)) throw new Error('이미 친구입니다.');
  await saveRequest({ id: genId(), fromUid, fromEmail, toUid: target.uid, toEmail: target.email, status: 'pending', createdAt: Date.now() });
}

export async function getIncomingRequests(uid: string): Promise<FriendRequest[]> {
  return getPendingRequests(uid);
}

export async function acceptRequest(req: FriendRequest): Promise<void> {
  await saveRequest({ ...req, status: 'accepted' });
  await addFriend(req.fromUid, { uid: req.toUid, email: req.toEmail });
  await addFriend(req.toUid, { uid: req.fromUid, email: req.fromEmail });
}

export async function rejectRequest(req: FriendRequest): Promise<void> {
  await saveRequest({ ...req, status: 'rejected' });
}

export async function fetchFriends(uid: string): Promise<Friend[]> {
  return getFriends(uid);
}
