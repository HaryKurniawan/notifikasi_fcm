import React from 'react';
import { UserDevice } from '../types';
import { Send, Trash2, Smartphone, Monitor, Apple } from 'lucide-react';

interface DevicesTableProps {
  devices: UserDevice[];
  onSelectDeviceToSend: (device: UserDevice) => void;
  onDeleteDevice: (id: string) => void;
}

export const DevicesTable: React.FC<DevicesTableProps> = ({
  devices,
  onSelectDeviceToSend,
  onDeleteDevice,
}) => {
  const getDeviceIcon = (type: string) => {
    if (type.toLowerCase() === 'ios') return <Apple className="w-3.5 h-3.5" />;
    if (type.toLowerCase() === 'web') return <Monitor className="w-3.5 h-3.5" />;
    return <Smartphone className="w-3.5 h-3.5" />;
  };

  return (
    <div className="bg-[#151c2c] border border-[#2a364f] rounded-2xl p-6 shadow-xl mb-8">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            📱 Registered Devices (PostgreSQL DB via Prisma ORM)
          </h3>
          <p className="text-xs text-slate-400">Daftar perangkat pengguna yang menerima push notification</p>
        </div>
        <span className="text-xs font-semibold px-3 py-1 bg-slate-800 text-slate-300 rounded-full border border-slate-700">
          Total: {devices.length} Devices
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-900/60 border-b border-[#2a364f] text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <th className="p-3.5 rounded-l-xl">Nama Pengguna</th>
              <th className="p-3.5">OS / Device</th>
              <th className="p-3.5">FCM / Push Token</th>
              <th className="p-3.5">Notif Terkirim</th>
              <th className="p-3.5">Terdaftar Sejak</th>
              <th className="p-3.5 rounded-r-xl text-right">Aksi Admin</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#2a364f] text-xs">
            {devices.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center text-slate-500 py-10 italic">
                  Belum ada device terdaftar di database PostgreSQL. Buka aplikasi Mobile untuk mendaftarkan token!
                </td>
              </tr>
            ) : (
              devices.map((device) => (
                <tr key={device.id} className="hover:bg-slate-800/40 transition">
                  <td className="p-3.5 font-bold text-slate-100">{device.name}</td>
                  <td className="p-3.5">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                        device.deviceType.toLowerCase() === 'ios'
                          ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                          : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                      }`}
                    >
                      {getDeviceIcon(device.deviceType)}
                      {device.deviceType.toUpperCase()}
                    </span>
                  </td>
                  <td className="p-3.5">
                    <span className="font-mono bg-slate-900 border border-slate-800 text-sky-400 px-2 py-1 rounded-md text-[11px] max-w-[220px] truncate block" title={device.deviceToken}>
                      {device.deviceToken}
                    </span>
                  </td>
                  <td className="p-3.5 font-black text-indigo-400">
                    {device._count?.notifications ?? 0}
                  </td>
                  <td className="p-3.5 text-slate-400">
                    {new Date(device.createdAt).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                  <td className="p-3.5 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => onSelectDeviceToSend(device)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-md shadow-indigo-600/20 transition active:scale-95"
                        title="Kirim Notifikasi Langsung ke Device Ini"
                      >
                        <Send className="w-3 h-3" /> Kirim
                      </button>
                      <button
                        onClick={() => onDeleteDevice(device.id)}
                        className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-lg transition"
                        title="Hapus Device dari DB"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
