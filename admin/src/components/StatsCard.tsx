import React from 'react';

interface StatsCardProps {
  icon: React.ReactNode;
  iconBgClass: string;
  value: number | string;
  label: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({ icon, iconBgClass, value, label }) => {
  return (
    <div className="bg-[#151c2c] border border-[#2a364f] p-5 rounded-2xl flex items-center gap-4 hover:border-indigo-500/50 transition-all duration-200 shadow-lg hover:-translate-y-0.5">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0 ${iconBgClass}`}>
        {icon}
      </div>
      <div>
        <div className="text-2xl font-black text-white tracking-tight">{value}</div>
        <div className="text-xs font-medium text-slate-400">{label}</div>
      </div>
    </div>
  );
};
