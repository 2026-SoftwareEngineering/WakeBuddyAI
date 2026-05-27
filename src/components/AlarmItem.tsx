import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Alarm } from '../types';

const DAYS: Record<number, string> = { 1: '일', 2: '월', 3: '화', 4: '수', 5: '목', 6: '금', 7: '토' };

type Props = { alarm: Alarm; onToggle: () => void; onEdit: () => void; onDelete: () => void };

export default function AlarmItem({ alarm, onToggle, onEdit, onDelete }: Props) {
  const time = `${String(alarm.hour).padStart(2, '0')}:${String(alarm.minute).padStart(2, '0')}`;
  const repeat = alarm.repeatDays.length === 0 ? '반복 없음' : alarm.repeatDays.sort().map((d) => DAYS[d]).join(', ');

  return (
    <View style={[styles.card, !alarm.enabled && styles.cardOff]}>
      <TouchableOpacity onPress={onToggle} activeOpacity={0.7} style={styles.main}>
        <View style={styles.row}>
          <Text style={[styles.time, !alarm.enabled && styles.timeOff]}>{time}</Text>
          <View style={[styles.badge, alarm.enabled ? styles.badgeOn : styles.badgeOff]}>
            <Text style={styles.badgeText}>{alarm.enabled ? 'ON' : 'OFF'}</Text>
          </View>
        </View>
        <Text style={styles.title}>{alarm.title}</Text>
        <Text style={styles.repeat}>{repeat}</Text>
      </TouchableOpacity>
      <View style={styles.btns}>
        <TouchableOpacity onPress={onEdit} style={styles.editBtn}><Text style={styles.btnText}>✏️ 수정</Text></TouchableOpacity>
        <TouchableOpacity onPress={onDelete} style={styles.delBtn}><Text style={styles.btnText}>🗑 삭제</Text></TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#e5e5e5', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 },
  cardOff: { backgroundColor: '#f9f9f9' },
  main: { marginBottom: 12 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  time: { fontSize: 36, fontWeight: '700', color: '#111', letterSpacing: -1 },
  timeOff: { color: '#bbb' },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeOn: { backgroundColor: '#111' },
  badgeOff: { backgroundColor: '#ccc' },
  badgeText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
  title: { fontSize: 16, fontWeight: '600', marginTop: 4, color: '#222' },
  repeat: { color: '#888', marginTop: 3, fontSize: 13 },
  btns: { flexDirection: 'row', gap: 8 },
  editBtn: { flex: 1, backgroundColor: '#333', padding: 10, borderRadius: 10, alignItems: 'center' },
  delBtn: { flex: 1, backgroundColor: '#e03535', padding: 10, borderRadius: 10, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
});
