import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, Alert, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { useAuth } from '../contexts/AuthContext';

type Props = NativeStackScreenProps<RootStackParamList, 'Register'>;

export default function RegisterScreen({ navigation }: Props) {
  const { register } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  const onRegister = async () => {
    if (!email.trim() || !password) { Alert.alert('확인', '이메일과 비밀번호를 입력하세요.'); return; }
    if (password !== confirm) { Alert.alert('확인', '비밀번호가 일치하지 않습니다.'); return; }
    setLoading(true);
    try { await register(email.trim(), password); }
    catch (e: any) { Alert.alert('회원가입 실패', e.message); }
    finally { setLoading(false); }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={s.container} keyboardShouldPersistTaps="handled">
        <Text style={s.title}>회원가입</Text>
        <Text style={s.sub}>WakeBuddy에 오신 것을 환영합니다</Text>
        <TextInput style={s.input} placeholder="이메일" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} placeholderTextColor="#aaa" />
        <TextInput style={s.input} placeholder="비밀번호 (6자 이상)" secureTextEntry value={password} onChangeText={setPassword} placeholderTextColor="#aaa" />
        <TextInput style={s.input} placeholder="비밀번호 확인" secureTextEntry value={confirm} onChangeText={setConfirm} placeholderTextColor="#aaa" />
        <TouchableOpacity style={[s.btn, loading && s.btnOff]} onPress={onRegister} disabled={loading}>
          <Text style={s.btnText}>{loading ? '처리 중...' : '가입하기'}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={s.link}>이미 계정이 있으신가요? <Text style={s.linkBold}>로그인</Text></Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, padding: 28, justifyContent: 'center', backgroundColor: '#f7f7f7' },
  title: { fontSize: 30, fontWeight: '800', color: '#111', letterSpacing: -1, marginBottom: 6 },
  sub: { color: '#777', fontSize: 14, marginBottom: 32 },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e5e5e5', borderRadius: 12, padding: 15, marginBottom: 12, fontSize: 15, color: '#111' },
  btn: { backgroundColor: '#111', padding: 17, borderRadius: 12, alignItems: 'center', marginTop: 8 },
  btnOff: { backgroundColor: '#555' },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  link: { marginTop: 22, textAlign: 'center', color: '#777', fontSize: 14 },
  linkBold: { color: '#111', fontWeight: '700' },
});
