import React, { useCallback, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, StyleSheet, RefreshControl } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { RootStackParamList, Alarm } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { fetchAlarms, deleteAlarm, toggleAlarm } from '../services/alarmService';
import AlarmItem from '../components/AlarmItem';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export default function HomeScreen({ navigation }: Props) {
  const { user, logout } = useAuth();
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    setAlarms(await fetchAlarms(user.uid));
  }, [user]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  if (!user) return null;

  const onDelete = (alarm: Alarm) => Alert.alert('알람 삭제', `"${alarm.title}"을 삭제할까요?`, [
    { text: '취소', style: 'cancel' },
    { text: '삭제', style: 'destructive', onPress: async () => { await deleteAlarm(user.uid, user.uid, alarm); load(); } },
  ]);

  return (
    <View style={s.container}>
      <View style={s.header}>
        <View>
          <Text style={s.greeting}>안녕하세요 👋</Text>
          <Text style={s.email}>{user.email}</Text>
        </View>
        <View style={s.headerBtns}>
          <TouchableOpacity style={s.hBtn} onPress={() => navigation.navigate('Friends')}>
            <Text style={s.hBtnText}>👥 친구</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[s.hBtn, { backgroundColor: '#555' }]} onPress={() => Alert.alert('로그아웃', '로그아웃 할까요?', [{ text: '취소', style: 'cancel' }, { text: '확인', onPress: logout }])}>
            <Text style={s.hBtnText}>로그아웃</Text>
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity style={s.addBtn} onPress={() => navigation.navigate('AlarmForm', { ownerId: user.uid })}>
        <Text style={s.addBtnText}>+ 내 알람 추가</Text>
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
            <Text style={s.emptySub}>위 버튼을 눌러 첫 알람을 추가해보세요</Text>
          </View>
        }
        renderItem={({ item }) => (
          <AlarmItem alarm={item}
            onToggle={async () => { await toggleAlarm(user.uid, user.uid, item); load(); }}
            onEdit={() => navigation.navigate('AlarmForm', { ownerId: user.uid, alarmId: item.id })}
            onDelete={() => onDelete(item)}
          />
        )}
      />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f7f7' },
  header: { backgroundColor: '#111', padding: 20, paddingTop: 56, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  greeting: { color: '#ccc', fontSize: 13 },
  email: { color: '#fff', fontWeight: '700', fontSize: 15, marginTop: 2 },
  headerBtns: { flexDirection: 'row', gap: 8 },
  hBtn: { backgroundColor: '#333', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8 },
  hBtnText: { color: '#fff', fontWeight: '600', fontSize: 13 },
  addBtn: { backgroundColor: '#111', margin: 16, padding: 16, borderRadius: 14, alignItems: 'center' },
  addBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  empty: { alignItems: 'center', marginTop: 60 },
  emptyText: { fontSize: 16, fontWeight: '600', color: '#555', marginTop: 12 },
  emptySub: { color: '#aaa', marginTop: 6, fontSize: 13 },
});
