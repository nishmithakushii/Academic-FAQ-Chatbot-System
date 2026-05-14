import React, { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2, Megaphone } from 'lucide-react';
import Modal from '../../components/Modal';

const EMPTY = { title: '', description: '', priority: 'normal', date: new Date().toISOString().split('T')[0] };

export default function AnnouncementsMgmt() {
  const [items, setItems] = useState([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(false);

  const load = () => axios.get('/announcements').then(r => setItems(r.data));
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!form.title || !form.description || !form.date) return toast.error('Fill all required fields');
    setLoading(true);
    try {
      if (editing) {
        await axios.put(`/announcements/${editing}`, form);
        toast.success('Announcement updated');
      } else {
        await axios.post('/announcements', form);
        toast.success('Announcement created');
      }
      setModal(false); setEditing(null); setForm(EMPTY);
      load();
    } catch (e) { toast.error(e.response?.data?.error || 'Error'); }
    finally { setLoading(false); }
  };

  const del = async (id) => {
    if (!confirm('Delete this announcement?')) return;
    await axios.delete(`/announcements/${id}`);
    toast.success('Deleted'); load();
  };

  const openEdit = (item) => { setForm({ title: item.title, description: item.description, priority: item.priority, date: item.date }); setEditing(item.id); setModal(true); };

  const priorityBadge = (p) => <span className={`badge-${p} badge`}>{p.charAt(0).toUpperCase() + p.slice(1)}</span>;

  return (
    <div className="p-6 space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">Announcements</h1>
          <p className="text-sm text-slate-500 mt-0.5">{items.length} active announcements</p>
        </div>
        <button className="btn-primary" onClick={() => { setForm(EMPTY); setEditing(null); setModal(true); }}>
          <Plus className="w-4 h-4" /> New Announcement
        </button>
      </div>

      <div className="space-y-3">
        {items.length === 0 && (
          <div className="card p-12 text-center">
            <Megaphone className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">No announcements yet</p>
          </div>
        )}
        {items.map(item => (
          <div key={item.id} className="card p-5 flex items-start gap-4 hover:shadow-md transition-shadow">
            <div className={`w-2 h-full rounded-full flex-shrink-0 mt-1 ${item.priority === 'urgent' ? 'bg-red-500' : item.priority === 'high' ? 'bg-orange-400' : item.priority === 'low' ? 'bg-slate-300' : 'bg-blue-400'}`} style={{ minHeight: 40 }} />
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 flex-wrap">
                <h3 className="font-semibold text-slate-900 dark:text-white">{item.title}</h3>
                <div className="flex items-center gap-2">
                  {priorityBadge(item.priority)}
                  <span className="text-xs text-slate-400">{item.date}</span>
                </div>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">{item.description}</p>
            </div>
            <div className="flex gap-1 flex-shrink-0">
              <button onClick={() => openEdit(item)} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-primary-600 transition-colors">
                <Pencil className="w-4 h-4" />
              </button>
              <button onClick={() => del(item.id)} className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 text-slate-500 hover:text-red-600 transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <Modal open={modal} onClose={() => { setModal(false); setEditing(null); }} title={editing ? 'Edit Announcement' : 'New Announcement'}>
        <div className="p-6 space-y-4">
          <div>
            <label className="label">Title *</label>
            <input className="input" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Announcement title" />
          </div>
          <div>
            <label className="label">Description *</label>
            <textarea className="input min-h-24 resize-none" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Announcement details..." />
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
            <button className="btn-primary" onClick={save} disabled={loading}>
              {loading ? 'Saving...' : editing ? 'Update' : 'Create'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
