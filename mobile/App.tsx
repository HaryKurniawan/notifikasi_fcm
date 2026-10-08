import React, { useEffect, useState } from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Alert,
  Platform,
  Vibration,
  TextInput,
} from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import tw from 'twrnc';
import FloatingToast from './components/FloatingToast';

// Handler bagaimana notifikasi ditampilkan ketika app terbuka (foreground)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    priority: Notifications.AndroidNotificationPriority.MAX,
  }),
});

interface ToastState {
  visible: boolean;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

export default function App() {
  const [permissionStatus, setPermissionStatus] = useState<string>('Pending');
  const [pushToken, setPushToken] = useState<string>('');
  const [serverUrl, setServerUrl] = useState<string>('https://notifikasi-fcm.vercel.app');
  const [userName, setUserName] = useState<string>('User Mobile Android');
  const [isRegistered, setIsRegistered] = useState<boolean>(false);
  const [inAppToast, setInAppToast] = useState<ToastState>({
    visible: false,
    title: '',
    message: '',
    type: 'info',
  });
  const [notificationLogs, setNotificationLogs] = useState<string[]>([]);

  useEffect(() => {
    registerForPushNotificationsAsync();

    // Listener 1: Notifikasi diterima saat aplikasi aktif (Foreground)
    const notificationListener = Notifications.addNotificationReceivedListener((notification) => {
      const title = notification.request.content.title || 'Notifikasi Baru';
      const body = notification.request.content.body || '';
      
      addLog(`[DITERIMA FROM ADMIN] ${title}: ${body}`);
      
      // Tampilkan In-App Floating Toast instan dari pesan Admin!
      setInAppToast({
        visible: true,
        title: title,
        message: body,
        type: 'info',
      });
    });

    // Listener 2: Pengguna menekan notifikasi melayang
    const responseListener = Notifications.addNotificationResponseReceivedListener((response) => {
      const title = response.notification.request.content.title;
      addLog(`[DITEKAN USER] Menekan notifikasi: ${title}`);
    });

    return () => {
      notificationListener.remove();
      responseListener.remove();
    };
  }, []);

  const addLog = (message: string) => {
    const time = new Date().toLocaleTimeString('id-ID');
    setNotificationLogs((prev: string[]) => [`[${time}] ${message}`, ...prev.slice(0, 14)]);
  };

  const registerForPushNotificationsAsync = async () => {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Notifikasi FCM Admin',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#2563EB',
        sound: 'default',
        enableVibrate: true,
        showBadge: true,
      });
    }

    if (Device.isDevice || Platform.OS !== 'web') {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      setPermissionStatus(finalStatus === 'granted' ? 'Diberikan ✅' : 'Ditolak ❌');

      if (finalStatus === 'granted') {
        try {
          const projectId =
            Constants.expoConfig?.extra?.eas?.projectId ??
            Constants.easConfig?.projectId ??
            'dfaff941-bd8f-4628-ba64-4486ffccd4cb';

          const tokenData = await Notifications.getExpoPushTokenAsync({ projectId });
          setPushToken(tokenData.data);
          addLog(`Token Push Asli: ${tokenData.data.substring(0, 25)}...`);
        } catch (err: any) {
          addLog(`Gagal Token: ${err.message}`);
          const fallbackToken = `ExponentPushToken[Simulated_${Math.random().toString(36).substring(7)}]`;
          setPushToken(fallbackToken);
        }
      }
    } else {
      setPermissionStatus('Web / Simulator');
      const fallbackToken = `ExpoToken_Web_${Math.random().toString(36).substring(7)}`;
      setPushToken(fallbackToken);
    }
  };

  // Mendaftarkan Token Device ke Database PostgreSQL Backend via Prisma ORM
  const syncTokenToBackend = async () => {
    if (!pushToken) {
      Alert.alert('Error', 'Token Push belum didapatkan. Harap izinkan notifikasi.');
      return;
    }

    try {
      addLog(`Mengirim token ke Backend Express (${serverUrl})...`);
      const res = await fetch(`${serverUrl}/api/users/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: userName,
          deviceToken: pushToken,
          deviceType: Platform.OS,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setIsRegistered(true);
        addLog(`✅ Berhasil terdaftar di DB PostgreSQL Backend! (ID: ${data.data.id})`);
        Alert.alert('Berhasil', 'Device Anda kini terdaftar di Admin Portal & PostgreSQL DB!');
      } else {
        throw new Error(data.message || 'Gagal mendaftar.');
      }
    } catch (error: any) {
      addLog(`❌ Gagal koneksi backend: ${error.message}`);
      Alert.alert(
        'Koneksi Gagal',
        `Tidak dapat mendaftar ke server ${serverUrl}.\nPastikan server backend berjalan dan alamat IP/URL sesuai.`
      );
    }
  };

  // Memicu Notifikasi Lokal Manual untuk Pengujian
  const triggerLocalNotification = async () => {
    Vibration.vibrate([0, 150, 100, 150]);
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🔔 Tes Notifikasi Lokal HP',
        body: 'Ini adalah sampel notifikasi lokal dari dalam aplikasi mobile.',
        sound: true,
        priority: Notifications.AndroidNotificationPriority.MAX,
      },
      trigger: null,
    });
    addLog('Memicu Notifikasi Lokal');
  };

  return (
    <SafeAreaView style={tw`flex-1 bg-[#f0f4f9]`}>
      <StatusBar barStyle="dark-content" backgroundColor="#f0f4f9" />

      {/* Floating In-App Toast untuk Notifikasi dari Admin */}
      <FloatingToast
        visible={inAppToast.visible}
        title={inAppToast.title}
        message={inAppToast.message}
        type={inAppToast.type}
        onClose={() => setInAppToast((prev: ToastState) => ({ ...prev, visible: false }))}
      />

      <ScrollView contentContainerStyle={tw`p-5 pt-8 pb-12`}>
        {/* Header Minimalis */}
        <View style={tw`mb-6 items-center`}>
          <View style={tw`bg-blue-100/80 px-3 py-1 rounded-full mb-2`}>
            <Text style={tw`text-blue-700 text-[11px] font-bold tracking-wider`}>
              REACT NATIVE + EXPO
            </Text>
          </View>
          <Text style={tw`text-2xl font-bold text-slate-800 text-center tracking-tight`}>
            FCM Push Client
          </Text>
          <Text style={tw`text-xs text-slate-500 text-center mt-1 px-4 leading-relaxed`}>
            Aplikasi Penerima Notifikasi FCM dari Admin Portal & PostgreSQL DB
          </Text>
        </View>

        {/* Server Config & Sync Card */}
        <View style={tw`bg-white rounded-2xl p-5 mb-4 border border-slate-200/80 shadow-sm`}>
          <Text style={tw`text-sm font-bold text-slate-800 mb-3`}>
            ⚙️ Konfigurasi Backend & PostgreSQL Sync
          </Text>
          
          <Text style={tw`text-xs font-semibold text-slate-600 mb-1`}>URL Backend API:</Text>
          <TextInput
            style={tw`bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 font-mono text-xs mb-3`}
            value={serverUrl}
            onChangeText={setServerUrl}
            placeholder="http://192.168.1.10:5000"
            placeholderTextColor="#94A3B8"
          />

          <Text style={tw`text-xs font-semibold text-slate-600 mb-1`}>Nama Perangkat / User:</Text>
          <TextInput
            style={tw`bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 text-xs mb-4`}
            value={userName}
            onChangeText={setUserName}
            placeholder="Contoh: Budi - Android HP"
            placeholderTextColor="#94A3B8"
          />

          <TouchableOpacity
            style={tw`py-3 px-4 rounded-xl items-center shadow-sm ${
              isRegistered ? 'bg-emerald-600' : 'bg-blue-600'
            }`}
            onPress={syncTokenToBackend}
            activeOpacity={0.8}
          >
            <Text style={tw`text-white font-bold text-xs`}>
              {isRegistered
                ? '✅ Token Terdaftar di PostgreSQL DB (Update)'
                : '🚀 Daftarkan Device ke Admin Portal DB'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Status Card */}
        <View style={tw`bg-white rounded-2xl p-5 mb-4 border border-slate-200/80 shadow-sm`}>
          <Text style={tw`text-sm font-bold text-slate-800 mb-3`}>📱 Status Perangkat</Text>
          
          <View style={tw`flex-row justify-between items-center py-1.5 border-b border-slate-100`}>
            <Text style={tw`text-slate-500 text-xs`}>Izin Notifikasi HP:</Text>
            <Text style={tw`text-emerald-600 font-bold text-xs bg-emerald-50 px-2 py-0.5 rounded-md`}>
              {permissionStatus}
            </Text>
          </View>
          
          <View style={tw`flex-row justify-between items-center pt-2.5`}>
            <Text style={tw`text-slate-500 text-xs`}>Token Device:</Text>
            <Text style={tw`text-blue-600 font-mono text-[11px] max-w-[180px] bg-blue-50 px-2 py-0.5 rounded-md`} numberOfLines={1}>
              {pushToken || 'Memuat token...'}
            </Text>
          </View>
        </View>

        {/* Actions Section */}
        <View style={tw`bg-white rounded-2xl p-5 mb-4 border border-slate-200/80 shadow-sm`}>
          <Text style={tw`text-sm font-bold text-slate-800 mb-1`}>🧪 Uji Notifikasi Lokal</Text>
          <Text style={tw`text-xs text-slate-500 mb-3`}>
            Gunakan tombol ini untuk menguji suara & tampilan heads-up notifikasi di perangkat.
          </Text>

          <TouchableOpacity
            style={tw`bg-slate-800 py-3 px-4 rounded-xl items-center shadow-sm`}
            onPress={triggerLocalNotification}
            activeOpacity={0.8}
          >
            <Text style={tw`text-white font-bold text-xs`}>🔔 Test Notifikasi Lokal HP</Text>
          </TouchableOpacity>
        </View>

        {/* Realtime Notification Logs from Admin */}
        <View style={tw`bg-white rounded-2xl p-5 mb-4 border border-slate-200/80 shadow-sm`}>
          <View style={tw`flex-row justify-between items-center mb-3`}>
            <Text style={tw`text-sm font-bold text-slate-800`}>📋 Log Pesan Masuk dari Admin</Text>
            {notificationLogs.length > 0 && (
              <TouchableOpacity onPress={() => setNotificationLogs([])}>
                <Text style={tw`text-rose-500 text-xs font-semibold`}>Bersihkan</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={tw`bg-slate-900 rounded-xl p-3 min-h-[100px]`}>
            {notificationLogs.length === 0 ? (
              <Text style={tw`text-slate-500 text-xs text-center mt-7 italic`}>
                Belum ada notifikasi diterima. Kirim notifikasi dari Admin Portal Web!
              </Text>
            ) : (
              notificationLogs.map((log, index) => (
                <Text key={index} style={tw`text-emerald-400 font-mono text-[11px] mb-1.5`}>
                  {log}
                </Text>
              ))
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
