import React, { useEffect } from 'react';
import { Alert } from 'react-native';
import { AuthProvider } from './src/contexts/AuthContext';
import RootNavigator from './src/navigation/RootNavigator';
import { requestPermission } from './src/services/notificationService';

export default function App() {
  useEffect(() => {
    (async () => {
      const granted = await requestPermission();
      if (!granted) {
        Alert.alert('알림 권한 필요', '알람이 울리려면 알림 권한을 허용해주세요.\n설정 > WakeBuddy > 알림에서 켜주세요.');
      }
    })();
  }, []);
  return (
    <AuthProvider>
      <RootNavigator />
    </AuthProvider>
  );
}
