import React from 'react';
import { Bell, Server, PlusCircle, RefreshCw } from 'lucide-react';

interface NavbarProps {
  serverUrl: string;
  setServerUrl: (url: string) => void;
  onOpenSendModal: () => void;
  onRefresh: () => void;
  isLoading: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  serverUrl,
  setServerUrl,
  onOpenSendModal,
  onRefresh,
  isLoading,
}) => {
  return (
    <header className="flex flex-col md:flex-row justify-between items-center bg-[#151c2c]/80 backdrop-blur-md border border-[#2a364f] p-4 md:px-6 rounded-2xl mb-8 gap-4 shadow-xl">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
          <Bell className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
            FCM Admin Portal
          </h1>
          <p className="text-xs text-slate-400">PostgreSQL + Prisma ORM + Push Notification</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
        <div className="flex items-center gap-2 bg-slate-900/80 border border-[#2a364f] px-3 py-2 rounded-xl text-xs">
          <Server className="w-4 h-4 text-sky-400" />
          <span className="text-slate-400 hidden sm:inline">Backend API:</span>
          <input
            type="text"
            className="bg-transparent text-sky-400 font-mono font-semibold focus:outline-none w-44"
            value={serverUrl}
            onChange={(e) => setServerUrl(e.target.value)}
            placeholder="http://localhost:5000"
          />
        </div>

        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-[#2a364f] px-4 py-2 rounded-xl text-sm font-semibold transition active:scale-95 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-indigo-400' : ''}`} />
          Refresh
        </button>

        <button
          onClick={onOpenSendModal}
          className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white px-5 py-2 rounded-xl text-sm font-bold shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition active:scale-95"
        >
          <PlusCircle className="w-5 h-5" />
          Kirim Notifikasi
        </button>
      </div>
    </header>
  );
};
