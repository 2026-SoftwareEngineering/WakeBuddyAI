import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, Alert, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { useAuth } from '../contexts/AuthContext';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const onLogin = async () => {
    if (!email.trim() || !password) { Alert.alert('확인', '이메일과 비밀번호를 입력하세요.'); return; }
    setLoading(true);
    try { await login(email.trim(), password); }
    catch (e: any) { Alert.alert('로그인 실패', e.message); }
    finally { setLoading(false); }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={s.container} keyboardShouldPersistTaps="handled">
        <View style={s.logo}>
          <Text style={s.emoji}>⏰</Text>
          <Text style={s.title}>WakeBuddy</Text>
          <Text style={s.sub}>친구와 함께 일어나는 공유 알람</Text>
        </View>
        <TextInput style={s.input} placeholder="이메일" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} placeholderTextColor="#aaa" />
        <TextInput style={s.input} placeholder="비밀번호" secureTextEntry value={password} onChangeText={setPassword} placeholderTextColor="#aaa" />
        <TouchableOpacity style={[s.btn, loading && s.btnOff]} onPress={onLogin} disabled={loading}>
          <Text style={s.btnText}>{loading ? '로그인 중...' : '로그인'}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
          <Text style={s.link}>계정이 없으신가요? <Text style={s.linkBold}>회원가입</Text></Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, padding: 28, justifyContent: 'center', backgroundColor: '#f7f7f7' },
  logo: { alignItems: 'center', marginBottom: 40 },
  emoji: { fontSize: 56, marginBottom: 8 },
  title: { fontSize: 32, fontWeight: '800', color: '#111', letterSpacing: -1 },
  sub: { color: '#777', marginTop: 6, fontSize: 14 },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e5e5e5', borderRadius: 12, padding: 15, marginBottom: 12, fontSize: 15, color: '#111' },
  btn: { backgroundColor: '#111', padding: 17, borderRadius: 12, alignItems: 'center', marginTop: 8 },
  btnOff: { backgroundColor: '#555' },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  link: { marginTop: 22, textAlign: 'center', color: '#777', fontSize: 14 },
  linkBold: { color: '#111', fontWeight: '700' },
});
