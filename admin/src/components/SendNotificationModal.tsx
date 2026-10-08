import React, { useState } from 'react';
import { X, Send, Sparkles, Smartphone, Bell, MessageSquare, AlertCircle } from 'lucide-react';
import { UserDevice } from '../types';

interface SendNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  devices: UserDevice[];
  selectedDevice?: UserDevice | null;
  onSend: (data: {
    targetType: 'all' | 'single';
    deviceToken?: string;
    userId?: string;
    title: string;
    body: string;
    payloadData?: any;
  }) => Promise<void>;
}

export const SendNotificationModal: React.FC<SendNotificationModalProps> = ({
  isOpen,
  onClose,
  devices,
  selectedDevice,
  onSend,
}) => {
  const [targetType, setTargetType] = useState<'all' | 'single'>(
    selectedDevice ? 'single' : 'all'
  );
  const [selectedToken, setSelectedToken] = useState<string>(
    selectedDevice ? selectedDevice.deviceToken : devices[0]?.deviceToken || ''
  );

  // Input Teks Bebas yang diisi oleh Admin!
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [customData, setCustomData] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!title.trim() || !body.trim()) {
      setErrorMessage('Judul dan isi notifikasi wajib diisi!');
      return;
    }

    let payloadObj = null;
    if (customData.trim()) {
      try {
        payloadObj = JSON.parse(customData);
      } catch (err) {
        setErrorMessage('Format JSON Payload tidak valid. Harap periksa tanda kutip dan koma.');
        return;
      }
    }

    setIsSending(true);
    try {
      await onSend({
        targetType,
        deviceToken: targetType === 'single' ? selectedToken : undefined,
        title,
        body,
        payloadData: payloadObj,
      });
      setTitle('');
      setBody('');
      setCustomData('');
      onClose();
    } catch (error: any) {
      setErrorMessage(error.message || 'Gagal mengirim notifikasi.');
    } finally {
      setIsSending(false);
    }
  };

  const applyPreset = (presetTitle: string, presetBody: string, presetData?: string) => {
    setTitle(presetTitle);
    setBody(presetBody);
    if (presetData) setCustomData(presetData);
  };

  return (
    <div
      className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-50 p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-[#151c2c] border border-[#2a364f] rounded-3xl w-full max-w-2xl p-6 md:p-8 shadow-2xl relative my-8 animate-in fade-in zoom-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6 border-b border-[#2a364f] pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Kirim Push Notification Custom</h3>
              <p className="text-xs text-slate-400">
                Ketikkan judul & isi pesan bebas untuk dikirimkan ke perangkat seluler user
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMessage && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Form Side */}
          <form onSubmit={handleSubmit} className="lg:col-span-3 space-y-4">
            {/* Target Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                🎯 Target Pengiriman
              </label>
              <div className="grid grid-cols-2 gap-2 mb-3">
                <button
                  type="button"
                  onClick={() => setTargetType('all')}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-2 ${
                    targetType === 'all'
                      ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/30'
                      : 'bg-slate-900 border-[#2a364f] text-slate-400 hover:text-white'
                  }`}
                >
                  📢 Broadcast ({devices.length})
                </button>
                <button
                  type="button"
                  onClick={() => setTargetType('single')}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-2 ${
                    targetType === 'single'
                      ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/30'
                      : 'bg-slate-900 border-[#2a364f] text-slate-400 hover:text-white'
                  }`}
                >
                  📱 Device Spesifik
                </button>
              </div>

              {targetType === 'single' && (
                <select
                  className="w-full bg-slate-900 border border-[#2a364f] rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  value={selectedToken}
                  onChange={(e) => setSelectedToken(e.target.value)}
                >
                  {devices.map((d) => (
                    <option key={d.id} value={d.deviceToken}>
                      {d.name} ({d.deviceType.toUpperCase()}) - {d.deviceToken.substring(0, 15)}...
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Quick Presets */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                ⚡ Preset Teks Cepat
              </label>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() =>
                    applyPreset(
                      '🔥 Flash Sale 50% Berakhir Malam Ini!',
                      'Halo! Jangan lewatkan kesempatan diskon setengah harga khusus hari ini.'
                    )
                  }
                  className="bg-slate-900 hover:bg-slate-800 border border-[#2a364f] hover:border-indigo-500/50 text-slate-300 text-[11px] px-2.5 py-1 rounded-lg transition"
                >
                  🎉 Promo Sale
                </button>
                <button
                  type="button"
                  onClick={() =>
                    applyPreset(
                      '🚀 Fitur Baru Telah Hadir!',
                      'Buka aplikasi sekarang untuk menikmati pengalaman terbaru yang lebih responsif.'
                    )
                  }
                  className="bg-slate-900 hover:bg-slate-800 border border-[#2a364f] hover:border-indigo-500/50 text-slate-300 text-[11px] px-2.5 py-1 rounded-lg transition"
                >
                  ✨ Fitur Baru
                </button>
                <button
                  type="button"
                  onClick={() =>
                    applyPreset(
                      '🔔 Peringatan Keamanan Akun',
                      'Terdeteksi aktivitas masuk baru pada perangkat Anda. Silakan verifikasi.'
                    )
                  }
                  className="bg-slate-900 hover:bg-slate-800 border border-[#2a364f] hover:border-indigo-500/50 text-slate-300 text-[11px] px-2.5 py-1 rounded-lg transition"
                >
                  🔒 Keamanan
                </button>
              </div>
            </div>

            {/* Input Judul Notifikasi */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Judul Notifikasi (Title) *
              </label>
              <input
                type="text"
                className="w-full bg-slate-900 border border-[#2a364f] rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
                placeholder="Contoh: 🔔 Pesanan Anda Dalam Perjalanan!"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            {/* Input Isi Pesan Notifikasi */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Isi Pesan Notifikasi (Body) *
              </label>
              <textarea
                className="w-full bg-slate-900 border border-[#2a364f] rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition min-h-[90px]"
                placeholder="Ketikkan pesan lengkap yang akan tampil di bar notifikasi HP..."
                value={body}
                onChange={(e) => setBody(e.target.value)}
                required
              />
            </div>

            {/* Data Payload Custom JSON */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Data Custom Payload (JSON Optional)
              </label>
              <input
                type="text"
                className="w-full bg-slate-900 border border-[#2a364f] rounded-xl px-3.5 py-2 text-xs font-mono text-emerald-400 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                placeholder='{"url": "/promo/123", "type": "discount"}'
                value={customData}
                onChange={(e) => setCustomData(e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-[#2a364f]">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSending}
                className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-500/25 transition disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                {isSending ? 'Mengirim FCM...' : 'Kirim Ke Mobile User'}
              </button>
            </div>
          </form>

          {/* Live Mobile Notification Preview */}
          <div className="lg:col-span-2 flex flex-col justify-start items-center bg-slate-900/60 border border-[#2a364f] rounded-2xl p-4">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 mb-3">
              <Smartphone className="w-4 h-4 text-indigo-400" />
              <span>Simulasi Live Tampilan di HP</span>
            </div>

            <div className="w-full bg-[#0f172a] border border-slate-700/60 rounded-2xl p-4 shadow-xl relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded-md bg-indigo-600 flex items-center justify-center">
                    <Bell className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-[11px] font-bold text-slate-300">My Mobile App</span>
                </div>
                <span className="text-[10px] text-slate-500">Sekarang</span>
              </div>

              <div>
                <h5 className="text-xs font-bold text-white mb-1 line-clamp-1">
                  {title.trim() || '🔔 Judul Notifikasi...'}
                </h5>
                <p className="text-[11px] text-slate-300 leading-relaxed line-clamp-3">
                  {body.trim() || 'Isi notifikasi akan tampil secara otomatis di sini sesuai teks yang Anda ketikkan.'}
                </p>
              </div>

              {customData.trim() && (
                <div className="mt-3 pt-2 border-t border-slate-800 text-[10px] font-mono text-emerald-400 bg-emerald-950/40 p-1.5 rounded-lg truncate">
                  Data: {customData}
                </div>
              )}
            </div>

            <p className="text-[10px] text-slate-500 text-center mt-3 leading-snug">
              Teks ini langsung terkirim melalui Firebase FCM ke aplikasi React Native Mobile user.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
