import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { createAlarm, fetchAlarm, updateAlarm } from '../services/alarmService';

type Props = NativeStackScreenProps<RootStackParamList, 'AlarmForm'>;

const DAYS = [{ label: '일', value: 1 }, { label: '월', value: 2 }, { label: '화', value: 3 }, { label: '수', value: 4 }, { label: '목', value: 5 }, { label: '금', value: 6 }, { label: '토', value: 7 }];

export default function AlarmFormScreen({ route, navigation }: Props) {
  const { user } = useAuth();
  const { ownerId, alarmId } = route.params;
  const [title, setTitle] = useState('알람');
  const [hour, setHour] = useState('7');
  const [minute, setMinute] = useState('00');
  const [repeatDays, setRepeatDays] = useState<number[]>([]);
  const [enabled, setEnabled] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!alarmId) return;
    fetchAlarm(ownerId, alarmId).then((a) => {
      if (!a) return;
      setTitle(a.title); setHour(String(a.hour)); setMinute(String(a.minute).padStart(2, '0'));
      setRepeatDays(a.repeatDays); setEnabled(a.enabled);
    });
  }, [ownerId, alarmId]);

  if (!user) return null;

  const toggle = (d: number) => setRepeatDays((p) => p.includes(d) ? p.filter((x) => x !== d) : [...p, d]);

  const onSave = async () => {
    const h = Number(hour), m = Number(minute);
    if (!title.trim()) { Alert.alert('확인', '제목을 입력하세요.'); return; }
    if (isNaN(h) || h < 0 || h > 23) { Alert.alert('확인', '시간은 0~23 사이로 입력하세요.'); return; }
    if (isNaN(m) || m < 0 || m > 59) { Alert.alert('확인', '분은 0~59 사이로 입력하세요.'); return; }
    setSaving(true);
    try {
      const payload = { title: title.trim(), hour: h, minute: m, repeatDays: [...repeatDays].sort(), enabled };
      if (alarmId) await updateAlarm(ownerId, user.uid, alarmId, payload);
      else await createAlarm(ownerId, user.uid, payload);
      navigation.goBack();
    } catch (e: any) { Alert.alert('저장 실패', e.message); }
    finally { setSaving(false); }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={s.container} keyboardShouldPersistTaps="handled">
        <Text style={s.label}>알람 제목</Text>
        <TextInput style={s.input} value={title} onChangeText={setTitle} placeholder="알람 이름" placeholderTextColor="#aaa" />

        <Text style={s.label}>시간 설정</Text>
        <View style={s.timeRow}>
          <View style={s.timeWrap}>
            <TextInput style={s.timeInput} keyboardType="number-pad" value={hour} onChangeText={setHour} maxLength={2} placeholder="07" placeholderTextColor="#ccc" />
            <Text style={s.unit}>시</Text>
          </View>
          <Text style={s.colon}>:</Text>
          <View style={s.timeWrap}>
            <TextInput style={s.timeInput} keyboardType="number-pad" value={minute} onChangeText={setMinute} maxLength={2} placeholder="00" placeholderTextColor="#ccc" />
            <Text style={s.unit}>분</Text>
          </View>
        </View>

        <Text style={s.label}>반복 요일</Text>
        <View style={s.dayRow}>
          {DAYS.map((d) => (
            <TouchableOpacity key={d.value} onPress={() => toggle(d.value)} style={[s.day, repeatDays.includes(d.value) && s.dayOn]}>
              <Text style={[s.dayText, repeatDays.includes(d.value) && s.dayTextOn]}>{d.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
        {repeatDays.length === 0 && <Text style={s.hint}>선택 안 하면 일회성 알람으로 등록됩니다</Text>}

        <Text style={s.label}>알람 상태</Text>
        <TouchableOpacity style={[s.statusBtn, enabled ? s.statusOn : s.statusOff]} onPress={() => setEnabled((p) => !p)}>
          <Text style={s.statusText}>{enabled ? '✅ 활성화' : '⏸ 비활성화'}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[s.saveBtn, saving && s.saveBtnOff]} onPress={onSave} disabled={saving}>
          <Text style={s.saveBtnText}>{saving ? '저장 중...' : '저장하기'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#f7f7f7', flexGrow: 1, paddingBottom: 40 },
  label: { fontWeight: '700', marginBottom: 8, marginTop: 20, fontSize: 14, color: '#444' },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e5e5e5', borderRadius: 12, padding: 14, fontSize: 15, color: '#111' },
  timeRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  timeWrap: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 },
  timeInput: { flex: 1, backgroundColor: '#fff', borderWidth: 1, borderColor: '#e5e5e5', borderRadius: 12, padding: 14, textAlign: 'center', fontSize: 28, fontWeight: '700', color: '#111' },
  unit: { fontSize: 16, color: '#666', fontWeight: '600' },
  colon: { fontSize: 32, fontWeight: '700', color: '#111' },
  dayRow: { flexDirection: 'row', justifyContent: 'space-between' },
  day: { width: 42, height: 42, borderRadius: 21, borderWidth: 1.5, borderColor: '#ddd', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' },
  dayOn: { backgroundColor: '#111', borderColor: '#111' },
  dayText: { color: '#666', fontWeight: '700' },
  dayTextOn: { color: '#fff' },
  hint: { color: '#aaa', fontSize: 12, marginTop: 8 },
  statusBtn: { padding: 15, borderRadius: 12, alignItems: 'center' },
  statusOn: { backgroundColor: '#1a8a1a' },
  statusOff: { backgroundColor: '#999' },
  statusText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  saveBtn: { marginTop: 28, backgroundColor: '#111', padding: 17, borderRadius: 14, alignItems: 'center' },
  saveBtnOff: { backgroundColor: '#555' },
  saveBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
