import React, { useCallback, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, Alert, StyleSheet, RefreshControl } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { RootStackParamList, Friend, FriendRequest } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { sendFriendRequest, getIncomingRequests, acceptRequest, rejectRequest, fetchFriends } from '../services/friendService';

type Props = NativeStackScreenProps<RootStackParamList, 'Friends'>;

export default function FriendsScreen({ navigation }: Props) {
  const { user } = useAuth();
  const [email, setEmail] = useState('');
  const [friends, setFriends] = useState<Friend[]>([]);
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [sending, setSending] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    const [f, r] = await Promise.all([fetchFriends(user.uid), getIncomingRequests(user.uid)]);
    setFriends(f); setRequests(r);
  }, [user]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  if (!user) return null;

  const onSend = async () => {
    if (!email.trim()) return;
    setSending(true);
    try { await sendFriendRequest(user.uid, user.email, email.trim()); setEmail(''); Alert.alert('완료', '친구 요청을 보냈습니다.'); }
    catch (e: any) { Alert.alert('실패', e.message); }
    finally { setSending(false); }
  };

  return (
    <View style={s.container}>
      <View style={s.section}>
        <Text style={s.sTitle}>친구 추가</Text>
        <View style={s.row}>
          <TextInput style={s.input} placeholder="친구 이메일" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} placeholderTextColor="#aaa" />
          <TouchableOpacity style={[s.sendBtn, sending && s.btnOff]} onPress={onSend} disabled={sending}>
            <Text style={s.sendBtnText}>{sending ? '...' : '요청'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={[]}
        renderItem={null}
        keyExtractor={(_, i) => String(i)}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await load(); setRefreshing(false); }} />}
        ListHeaderComponent={<>
          {requests.length > 0 && (
            <View style={s.section}>
              <Text style={s.sTitle}>📬 받은 요청 ({requests.length})</Text>
              {requests.map((r) => (
                <View key={r.id} style={s.card}>
                  <Text style={s.cardEmail}>{r.fromEmail}</Text>
                  <View style={s.cardBtns}>
                    <TouchableOpacity style={s.acceptBtn} onPress={async () => { await acceptRequest(r); load(); Alert.alert('완료', `${r.fromEmail}님과 친구가 되었습니다.`); }}>
                      <Text style={s.btnText}>✅ 수락</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={s.rejectBtn} onPress={() => Alert.alert('거절', '거절할까요?', [{ text: '취소', style: 'cancel' }, { text: '거절', style: 'destructive', onPress: async () => { await rejectRequest(r); load(); } }])}>
                      <Text style={s.btnText}>❌ 거절</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}
          <View style={s.section}>
            <Text style={s.sTitle}>👥 친구 목록 ({friends.length})</Text>
            {friends.length === 0
              ? <View style={s.empty}><Text style={s.emptyText}>아직 친구가 없어요</Text><Text style={s.emptySub}>이메일로 친구를 찾아보세요</Text></View>
              : friends.map((f) => (
                <TouchableOpacity key={f.uid} style={s.friendCard} onPress={() => navigation.navigate('FriendAlarms', { friendId: f.uid, friendEmail: f.email })}>
                  <View style={s.avatar}><Text style={s.avatarText}>{f.email[0].toUpperCase()}</Text></View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.friendEmail}>{f.email}</Text>
                    <Text style={s.friendHint}>탭하여 알람 관리하기 →</Text>
                  </View>
                </TouchableOpacity>
              ))}
          </View>
        </>}
      />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f7f7' },
  section: { padding: 16, paddingBottom: 4 },
  sTitle: { fontSize: 16, fontWeight: '700', marginBottom: 10, color: '#222' },
  row: { flexDirection: 'row', gap: 8 },
  input: { flex: 1, backgroundColor: '#fff', borderWidth: 1, borderColor: '#e5e5e5', borderRadius: 12, padding: 12, fontSize: 14, color: '#111' },
  sendBtn: { backgroundColor: '#111', paddingHorizontal: 18, borderRadius: 12, justifyContent: 'center' },
  btnOff: { backgroundColor: '#555' },
  sendBtnText: { color: '#fff', fontWeight: '700' },
  card: { backgroundColor: '#fff', padding: 14, borderRadius: 12, marginBottom: 8, borderWidth: 1, borderColor: '#e5e5e5' },
  cardEmail: { fontWeight: '600', color: '#222', marginBottom: 10 },
  cardBtns: { flexDirection: 'row', gap: 8 },
  acceptBtn: { flex: 1, backgroundColor: '#1a8a1a', padding: 10, borderRadius: 8, alignItems: 'center' },
  rejectBtn: { flex: 1, backgroundColor: '#e03535', padding: 10, borderRadius: 8, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: '700' },
  friendCard: { backgroundColor: '#fff', padding: 14, borderRadius: 12, marginBottom: 8, borderWidth: 1, borderColor: '#e5e5e5', flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#111', alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontWeight: '700', fontSize: 18 },
  friendEmail: { fontWeight: '700', color: '#111' },
  friendHint: { color: '#888', fontSize: 12, marginTop: 2 },
  empty: { paddingVertical: 20, alignItems: 'center' },
  emptyText: { fontWeight: '600', color: '#666' },
  emptySub: { color: '#aaa', fontSize: 12, marginTop: 4 },
});
