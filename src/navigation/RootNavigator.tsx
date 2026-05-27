import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View } from 'react-native';
import { RootStackParamList } from '../types';
import { useAuth } from '../contexts/AuthContext';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';
import AlarmFormScreen from '../screens/AlarmFormScreen';
import FriendsScreen from '../screens/FriendsScreen';
import FriendAlarmsScreen from '../screens/FriendAlarmsScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><ActivityIndicator size="large" color="#111" /></View>;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerStyle: { backgroundColor: '#111' }, headerTintColor: '#fff', headerTitleStyle: { fontWeight: 'bold' } }}>
        {!user ? (
          <>
            <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: false }} />
          </>
        ) : (
          <>
            <Stack.Screen name="Home" component={HomeScreen} options={{ title: '내 알람', headerBackVisible: false }} />
            <Stack.Screen name="AlarmForm" component={AlarmFormScreen} options={{ title: '알람 설정' }} />
            <Stack.Screen name="Friends" component={FriendsScreen} options={{ title: '친구 관리' }} />
            <Stack.Screen name="FriendAlarms" component={FriendAlarmsScreen} options={({ route }) => ({ title: `${route.params.friendEmail}의 알람` })} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
