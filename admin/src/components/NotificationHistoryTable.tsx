import React from 'react';
import { NotificationLog } from '../types';
import { CheckCircle2, XCircle, Trash2, History } from 'lucide-react';

interface NotificationHistoryTableProps {
  history: NotificationLog[];
  onClearHistory: () => void;
}

export const NotificationHistoryTable: React.FC<NotificationHistoryTableProps> = ({
  history,
  onClearHistory,
}) => {
  return (
    <div className="bg-[#151c2c] border border-[#2a364f] rounded-2xl p-6 shadow-xl mb-8">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <History className="w-4 h-4 text-indigo-400" /> Riwayat Notifikasi Terkirim (ORM Log)
          </h3>
          <p className="text-xs text-slate-400">Log pengiriman tersimpan di database PostgreSQL via Prisma ORM</p>
        </div>
        {history.length > 0 && (
          <button
            onClick={onClearHistory}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl text-xs font-semibold transition"
          >
            <Trash2 className="w-3.5 h-3.5" /> Bersihkan Log
          </button>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-900/60 border-b border-[#2a364f] text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <th className="p-3.5 rounded-l-xl">Status Send</th>
              <th className="p-3.5">Judul & Pesan Notifikasi</th>
              <th className="p-3.5">Penerima</th>
              <th className="p-3.5">Custom Payload</th>
              <th className="p-3.5 rounded-r-xl">Waktu Pengiriman</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#2a364f] text-xs">
            {history.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center text-slate-500 py-10 italic">
                  Belum ada riwayat notifikasi dikirim. Gunakan tombol "Kirim Notifikasi" di bagian atas!
                </td>
              </tr>
            ) : (
              history.map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/40 transition">
                  <td className="p-3.5">
                    {log.status === 'SUCCESS' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-[10px] font-bold">
                        <CheckCircle2 className="w-3 h-3" /> Sukses
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-500/10 text-red-400 border border-red-500/20 rounded-full text-[10px] font-bold">
                        <XCircle className="w-3 h-3" /> Gagal
                      </span>
                    )}
                  </td>
                  <td className="p-3.5 max-w-sm">
                    <div className="font-bold text-slate-100 mb-0.5">{log.title}</div>
                    <div className="text-slate-300 text-[11px] line-clamp-2">{log.body}</div>
                  </td>
                  <td className="p-3.5">
                    <span className="font-semibold text-slate-200">
                      {log.user ? log.user.name : '📢 Broadcast / Direct'}
                    </span>
                  </td>
                  <td className="p-3.5">
                    {log.data ? (
                      <span className="font-mono bg-slate-900 text-emerald-400 px-2 py-1 rounded border border-slate-800 text-[10px] block max-w-[180px] truncate" title={log.data}>
                        {log.data}
                      </span>
                    ) : (
                      <span className="text-slate-600">-</span>
                    )}
                  </td>
                  <td className="p-3.5 text-slate-400">
                    {new Date(log.sentAt).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    })}
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
