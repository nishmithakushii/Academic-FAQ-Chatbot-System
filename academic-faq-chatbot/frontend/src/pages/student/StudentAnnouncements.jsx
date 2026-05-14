import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Megaphone, Users } from 'lucide-react';

export default function StudentAnnouncements() {
  const [admin, setAdmin] = useState([]);
  const [cr, setCr] = useState([]);
  const [tab, setTab] = useState('all');

  useEffect(() => {
    axios.get('/announcements').then(r => setAdmin(r.data));
    axios.get('/announcements/cr').then(r => setCr(r.data));
  }, []);

  const all = [
    ...admin.map(a => ({ ...a, source: 'admin' })),
    ...cr.map(a => ({ ...a, source: 'cr', description: a.message })),
  ].sort((a, b) => new Date(b.date) - new Date(a.date));

  const filtered = tab === 'all' ? all : tab === 'admin' ? all.filter(a => a.source === 'admin') : all.filter(a => a.source === 'cr');

  const priorityBar = (p) => ({ urgent: 'bg-red-500', high: 'bg-orange-400', normal: 'bg-blue-400', low: 'bg-slate-300' }[p] || 'bg-slate-300');

  return (
    <div className="p-6 space-y-5 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">Announcements</h1>
        <p className="text-sm text-slate-500 mt-0.5">{all.length} announcements</p>
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-100 dark:bg-slate-800 rounded-xl p-1 gap-1 w-fit">
        {['all', 'admin', 'cr'].map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${tab === t ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>
            {t === 'all' ? 'All' : t === 'admin' ? '🛡 Admin' : '👥 CR'}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="card p-12 text-center">
            <Megaphone className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">No announcements</p>
          </div>
        )}
        {filtered.map(item => (
          <div key={`${item.source}-${item.id}`} className="card p-5 flex items-start gap-4 hover:shadow-md transition-shadow animate-slide-up">
            <div className={`w-1.5 rounded-full flex-shrink-0 self-stretch ${priorityBar(item.priority)}`} />
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${item.source === 'admin' ? 'bg-primary-50 dark:bg-primary-950/30' : 'bg-violet-50 dark:bg-violet-950/30'}`}>
                {item.source === 'admin' ? <Megaphone className="w-4 h-4 text-primary-600" /> : <Users className="w-4 h-4 text-violet-600" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h3 className="font-semibold text-slate-900 dark:text-white text-sm">{item.title}</h3>
                  <span className={`badge badge-${item.priority || 'normal'}`}>{item.priority || 'Normal'}</span>
                  <span className={`badge ${item.source === 'admin' ? 'bg-primary-100 text-primary-700' : 'bg-violet-100 text-violet-700'}`}>
                    {item.source === 'admin' ? 'Admin' : `CR: ${item.cr_name || 'CR'}`}
                  </span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{item.description}</p>
                <p className="text-xs text-slate-400 mt-2">📅 {item.date}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
