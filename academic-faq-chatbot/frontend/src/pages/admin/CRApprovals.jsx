import React, { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { CheckCircle, XCircle, Clock } from 'lucide-react';

export default function CRApprovals() {
  const [items, setItems] = useState([]);
  const [note, setNote] = useState({});

  const load = () => axios.get('/announcements/cr').then(r => setItems(r.data));
  useEffect(() => { load(); }, []);

  const action = async (id, status) => {
    try {
      await axios.put(`/announcements/cr/${id}/status`, { status, admin_note: note[id] || '' });
      toast.success(`Announcement ${status}`);
      load();
    } catch { toast.error('Error'); }
  };

  const pending = items.filter(i => i.status === 'pending');
  const resolved = items.filter(i => i.status !== 'pending');

  const statusBadge = (s) => (
    <span className={`badge badge-${s}`}>{s.charAt(0).toUpperCase() + s.slice(1)}</span>
  );

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">CR Announcement Approvals</h1>
        <p className="text-sm text-slate-500 mt-0.5">{pending.length} pending approval</p>
      </div>

      {pending.length === 0 && (
        <div className="card p-12 text-center">
          <CheckCircle className="w-10 h-10 text-green-400 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">All caught up! No pending approvals.</p>
        </div>
      )}

      <div className="space-y-3">
        {pending.map(item => (
          <div key={item.id} className="card p-5 border-l-4 border-amber-400 animate-slide-up">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="badge badge-pending flex items-center gap-1"><Clock className="w-3 h-3" /> Pending</span>
                  <span className={`badge badge-${item.priority || 'normal'}`}>{item.priority || 'Normal'}</span>
                </div>
                <h3 className="font-semibold text-slate-900 dark:text-white">{item.title}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{item.message}</p>
                <p className="text-xs text-slate-400 mt-2">By {item.cr_name} • {item.date}</p>
              </div>
            </div>
            <div className="mt-4 flex flex-col sm:flex-row gap-2">
              <input
                className="input flex-1 text-sm"
                placeholder="Admin note (optional)..."
                value={note[item.id] || ''}
                onChange={e => setNote(n => ({ ...n, [item.id]: e.target.value }))}
              />
              <div className="flex gap-2">
                <button onClick={() => action(item.id, 'approved')} className="btn-primary bg-green-600 hover:bg-green-700">
                  <CheckCircle className="w-4 h-4" /> Approve
                </button>
                <button onClick={() => action(item.id, 'rejected')} className="btn-danger">
                  <XCircle className="w-4 h-4" /> Reject
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {resolved.length > 0 && (
        <div>
          <h2 className="font-semibold text-slate-700 dark:text-slate-300 mb-3 text-sm uppercase tracking-wider">Previously Resolved</h2>
          <div className="space-y-2">
            {resolved.map(item => (
              <div key={item.id} className="card p-4 opacity-70">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-slate-800 dark:text-white text-sm">{item.title}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">By {item.cr_name} • {item.date}</p>
                    {item.admin_note && <p className="text-xs text-slate-500 mt-1 italic">Note: {item.admin_note}</p>}
                  </div>
                  {statusBadge(item.status)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
