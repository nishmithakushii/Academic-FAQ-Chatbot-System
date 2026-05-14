import React from 'react';

export default function StatCard({ icon: Icon, label, value, sub, color = 'primary', trend }) {
  const colors = {
    primary: 'bg-primary-50 dark:bg-primary-950/30 text-primary-600',
    green: 'bg-green-50 dark:bg-green-950/30 text-green-600',
    amber: 'bg-amber-50 dark:bg-amber-950/30 text-amber-600',
    red: 'bg-red-50 dark:bg-red-950/30 text-red-600',
    violet: 'bg-violet-50 dark:bg-violet-950/30 text-violet-600',
    blue: 'bg-blue-50 dark:bg-blue-950/30 text-blue-600',
  };

  return (
    <div className="card p-5 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${colors[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
        {trend !== undefined && (
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${trend >= 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
            {trend >= 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
      <div className="mt-3">
        <p className="text-2xl font-display font-bold text-slate-900 dark:text-white">{value}</p>
        <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mt-0.5">{label}</p>
        {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}
