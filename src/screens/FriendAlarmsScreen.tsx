import React, { useCallback, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, StyleSheet, RefreshControl } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { RootStackParamList, Alarm } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { fetchAlarms, deleteAlarm, toggleAlarm } from '../services/alarmService';
import AlarmItem from '../components/AlarmItem';

type Props = NativeStackScreenProps<RootStackParamList, 'FriendAlarms'>;

export default function FriendAlarmsScreen({ route, navigation }: Props) {
  const { user } = useAuth();
  const { friendId, friendEmail } = route.params;
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => { setAlarms(await fetchAlarms(friendId)); }, [friendId]);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  if (!user) return null;

  return (
    <View style={s.container}>
      <View style={s.banner}>
        <Text style={s.bannerText}>🤝 {friendEmail}의 알람을 관리 중</Text>
        <Text style={s.bannerSub}>추가한 알람은 친구 기기에서 울립니다</Text>
      </View>

      <TouchableOpacity style={s.addBtn} onPress={() => navigation.navigate('AlarmForm', { ownerId: friendId })}>
        <Text style={s.addBtnText}>+ 친구 알람 추가</Text>
      </TouchableOpacity>

      <FlatList
        data={alarms}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, paddingTop: 4 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await load(); setRefreshing(false); }} />}
        ListEmptyComponent={
          <View style={s.empty}>
            <Text style={{ fontSize: 48 }}>⏰</Text>
            <Text style={s.emptyText}>등록된 알람이 없습니다</Text>
          </View>
        }
        renderItem={({ item }) => (
          <AlarmItem alarm={item}
            onToggle={async () => { await toggleAlarm(friendId, user.uid, item); load(); }}
            onEdit={() => navigation.navigate('AlarmForm', { ownerId: friendId, alarmId: item.id })}
            onDelete={() => Alert.alert('삭제', `"${item.title}"을 삭제할까요?`, [
              { text: '취소', style: 'cancel' },
              { text: '삭제', style: 'destructive', onPress: async () => { await deleteAlarm(friendId, user.uid, item); load(); } },
            ])}
          />
        )}
      />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f7f7' },
  banner: { backgroundColor: '#222', padding: 16 },
  bannerText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  bannerSub: { color: '#aaa', fontSize: 12, marginTop: 3 },
  addBtn: { backgroundColor: '#111', margin: 16, marginBottom: 8, padding: 16, borderRadius: 14, alignItems: 'center' },
  addBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  empty: { alignItems: 'center', marginTop: 60 },
  emptyText: { fontSize: 16, fontWeight: '600', color: '#555', marginTop: 12 },
});
