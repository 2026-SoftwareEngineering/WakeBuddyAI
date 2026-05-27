export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Home: undefined;
  AlarmForm: { ownerId: string; alarmId?: string };
  Friends: undefined;
  FriendAlarms: { friendId: string; friendEmail: string };
};

export type UserProfile = {
  uid: string;
  email: string;
  password: string;
  createdAt: number;
};

export type Alarm = {
  id: string;
  ownerId: string;
  title: string;
  hour: number;
  minute: number;
  repeatDays: number[];
  enabled: boolean;
  createdBy: string;
  createdAt: number;
  updatedAt: number;
  notificationIds?: string[];
};

export type FriendRequest = {
  id: string;
  fromUid: string;
  fromEmail: string;
  toUid: string;
  toEmail: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: number;
};

export type Friend = {
  uid: string;
  email: string;
};
