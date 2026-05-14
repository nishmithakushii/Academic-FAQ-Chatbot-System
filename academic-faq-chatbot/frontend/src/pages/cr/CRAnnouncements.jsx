import React, { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Plus, Clock, CheckCircle, XCircle, Megaphone } from 'lucide-react';
import Modal from '../../components/Modal';
import { useAuth } from '../../contexts/AuthContext';

const EMPTY = { title: '', message: '', priority: 'normal', date: new Date().toISOString().split('T')[0] };

export default function CRAnnouncements() {
  const [items, setItems] = useState([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const load = () => axios.get('/announcements/cr').then(r => setItems(r.data));
  useEffect(() => { load(); }, []);

  const submit = async () => {
    if (!form.title || !form.message || !form.date) return toast.error('Fill all fields');
    setLoading(true);
    try {
      await axios.post('/announcements/cr', form);
      toast.success('Submitted for admin approval!');
      setModal(false); setForm(EMPTY); load();
    } catch (e) { toast.error('Error submitting'); }
    finally { setLoading(false); }
  };

  const statusIcon = (s) => {
    if (s === 'approved') return <CheckCircle className="w-4 h-4 text-green-500" />;
    if (s === 'rejected') return <XCircle className="w-4 h-4 text-red-500" />;
    return <Clock className="w-4 h-4 text-amber-500" />;
  };

  return (
    <div className="p-6 space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">My Announcements</h1>
          <p className="text-sm text-slate-500 mt-0.5">{items.length} total submissions</p>
        </div>
        <button className="btn-primary" onClick={() => { setForm(EMPTY); setModal(true); }}>
          <Plus className="w-4 h-4" /> Create Announcement
        </button>
      </div>

      <div className="space-y-3">
        {items.length === 0 && (
          <div className="card p-12 text-center">
            <Megaphone className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">No announcements yet</p>
            <p className="text-slate-400 text-sm mt-1">Create one to notify students after admin approval</p>
          </div>
        )}
        {items.map(item => (
          <div key={item.id} className={`card p-5 border-l-4 ${item.status === 'approved' ? 'border-green-400' : item.status === 'rejected' ? 'border-red-400' : 'border-amber-400'}`}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  {statusIcon(item.status)}
                  <span className={`badge badge-${item.status}`}>{item.status.charAt(0).toUpperCase() + item.status.slice(1)}</span>
                  <span className={`badge badge-${item.priority || 'normal'}`}>{item.priority || 'Normal'}</span>
                </div>
                <h3 className="font-semibold text-slate-900 dark:text-white">{item.title}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{item.message}</p>
                <p className="text-xs text-slate-400 mt-2">📅 {item.date}</p>
                {item.admin_note && (
                  <div className="mt-2 p-2 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <p className="text-xs text-slate-500"><span className="font-medium">Admin note:</span> {item.admin_note}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title="Create Announcement">
        <div className="p-6 space-y-4">
          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-xl p-3">
            <p className="text-xs text-amber-700 dark:text-amber-400">
              ⚠️ Your announcement will be reviewed by admin before appearing to students.
            </p>
          </div>
          <div>
            <label className="label">Title *</label>
            <input className="input" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Announcement title" />
          </div>
          <div>
            <label className="label">Message *</label>
            <textarea className="input min-h-28 resize-none" value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} placeholder="What do you want to announce?" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Priority</label>
              <select className="input" value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}>
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <div>
              <label className="label">Date *</label>
              <input type="date" className="input" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button className="btn-secondary" onClick={() => setModal(false)}>Cancel</button>
            <button className="btn-primary" onClick={submit} disabled={loading}>
              {loading ? 'Submitting...' : 'Submit for Approval'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
