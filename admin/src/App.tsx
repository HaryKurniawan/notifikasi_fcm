import React, { useEffect, useState, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { StatsCard } from './components/StatsCard';
import { DevicesTable } from './components/DevicesTable';
import { NotificationHistoryTable } from './components/NotificationHistoryTable';
import { SendNotificationModal } from './components/SendNotificationModal';
import { UserDevice, NotificationLog } from './types';
import { Smartphone, Send, CheckCircle2, Server } from 'lucide-react';

export const App: React.FC = () => {
  const [serverUrl, setServerUrl] = useState<string>('http://localhost:5000');
  const [devices, setDevices] = useState<UserDevice[]>([]);
  const [history, setHistory] = useState<NotificationLog[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedDevice, setSelectedDevice] = useState<UserDevice | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Fetch devices
      const userRes = await fetch(`${serverUrl}/api/users`);
      if (userRes.ok) {
        const userData = await userRes.json();
        if (userData.success) {
          setDevices(userData.data);
        }
      }

      // Fetch history
      const historyRes = await fetch(`${serverUrl}/api/notifications/history`);
      if (historyRes.ok) {
        const historyData = await historyRes.json();
        if (historyData.success) {
          setHistory(historyData.data);
        }
      }
    } catch (err: any) {
      console.warn('Gagal koneksi ke server backend:', err.message);
    } finally {
      setIsLoading(false);
    }
  }, [serverUrl]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSendNotification = async (payload: {
    targetType: 'all' | 'single';
    deviceToken?: string;
    title: string;
    body: string;
    payloadData?: any;
  }) => {
    const endpoint =
      payload.targetType === 'all'
        ? `${serverUrl}/api/notifications/send-all`
        : `${serverUrl}/api/notifications/send`;

    const bodyData = {
      deviceToken: payload.deviceToken,
      title: payload.title,
      body: payload.body,
      payloadData: payload.payloadData,
    };

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bodyData),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Gagal mengirim notifikasi.');
    }

    showToast(
      payload.targetType === 'all'
        ? '🚀 Notifikasi Broadcast berhasil dikirim ke seluruh device!'
        : `✅ Notifikasi FCM berhasil dikirim ke ${selectedDevice?.name || 'device target'}!`
    );

    fetchData();
  };

  const handleDeleteDevice = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus device ini dari database?')) return;
    try {
      const res = await fetch(`${serverUrl}/api/users/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showToast('Device berhasil dihapus dari database.');
        fetchData();
      }
    } catch (err: any) {
      alert('Gagal menghapus device: ' + err.message);
    }
  };

  const handleClearHistory = async () => {
    if (!confirm('Apakah Anda yakin ingin membersihkan seluruh riwayat notifikasi?')) return;
    try {
      const res = await fetch(`${serverUrl}/api/notifications/history`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showToast('Riwayat notifikasi telah dibersihkan.');
        fetchData();
      }
    } catch (err: any) {
      alert('Gagal membersihkan riwayat: ' + err.message);
    }
  };

  const successCount = history.filter((h) => h.status === 'SUCCESS').length;

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto font-sans">
      <Navbar
        serverUrl={serverUrl}
        setServerUrl={setServerUrl}
        onOpenSendModal={() => {
          setSelectedDevice(null);
          setIsModalOpen(true);
        }}
        onRefresh={fetchData}
        isLoading={isLoading}
      />

      {/* Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard
          icon={<Smartphone className="w-6 h-6 text-indigo-400" />}
          iconBgClass="bg-indigo-500/10 border border-indigo-500/20"
          value={devices.length}
          label="Device Terdaftar (PostgreSQL DB)"
        />
        <StatsCard
          icon={<Send className="w-6 h-6 text-sky-400" />}
          iconBgClass="bg-sky-500/10 border border-sky-500/20"
          value={history.length}
          label="Total Push Sent"
        />
        <StatsCard
          icon={<CheckCircle2 className="w-6 h-6 text-emerald-400" />}
          iconBgClass="bg-emerald-500/10 border border-emerald-500/20"
          value={successCount}
          label="Terkirim Sukses"
        />
        <StatsCard
          icon={<Server className="w-6 h-6 text-purple-400" />}
          iconBgClass="bg-purple-500/10 border border-purple-500/20"
          value="FCM / Expo"
          label="Protocol Engine"
        />
      </div>

      {/* Main Tables */}
      <DevicesTable
        devices={devices}
        onSelectDeviceToSend={(device) => {
          setSelectedDevice(device);
          setIsModalOpen(true);
        }}
        onDeleteDevice={handleDeleteDevice}
      />

      <NotificationHistoryTable history={history} onClearHistory={handleClearHistory} />

      {/* Modal Kirim Notifikasi */}
      <SendNotificationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        devices={devices}
        selectedDevice={selectedDevice}
        onSend={handleSendNotification}
      />

      {/* Toast Alert Popup */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 bg-[#151c2c] border border-indigo-500/50 text-white px-5 py-3.5 rounded-2xl shadow-2xl z-50 flex items-center gap-3 animate-in slide-in-from-bottom duration-300">
          <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-ping" />
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
