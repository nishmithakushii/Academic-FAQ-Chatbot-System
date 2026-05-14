import React, { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2, Calendar, MapPin } from 'lucide-react';
import Modal from '../../components/Modal';

const EMPTY = { title: '', description: '', date: '', venue: '' };

export default function EventsMgmt() {
  const [items, setItems] = useState([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(false);

  const load = () => axios.get('/events').then(r => setItems(r.data));
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!form.title || !form.date || !form.venue) return toast.error('Fill required fields');
    setLoading(true);
    try {
      if (editing) { await axios.put(`/events/${editing}`, form); toast.success('Event updated'); }
      else { await axios.post('/events', form); toast.success('Event added'); }
      setModal(false); setEditing(null); setForm(EMPTY); load();
    } catch { toast.error('Error'); } finally { setLoading(false); }
  };

  const del = async (id) => {
    if (!confirm('Delete event?')) return;
    await axios.delete(`/events/${id}`); toast.success('Deleted'); load();
  };

  return (
    <div className="p-6 space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">Events</h1>
          <p className="text-sm text-slate-500 mt-0.5">{items.length} events</p>
        </div>
        <button className="btn-primary" onClick={() => { setForm(EMPTY); setEditing(null); setModal(true); }}>
          <Plus className="w-4 h-4" /> Add Event
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {items.length === 0 && (
          <div className="col-span-full card p-12 text-center">
            <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">No events scheduled</p>
          </div>
        )}
        {items.map(item => (
          <div key={item.id} className="card p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white text-sm">{item.title}</h3>
                  <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                    <span>📅 {item.date}</span>
                    <span>•</span>
                    <MapPin className="w-3 h-3" />
                    <span>{item.venue}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-1">
                <button onClick={() => { setForm({ title: item.title, description: item.description, date: item.date, venue: item.venue }); setEditing(item.id); setModal(true); }} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-primary-600 transition-colors">
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => del(item.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-3 leading-relaxed">{item.description}</p>
          </div>
        ))}
      </div>

      <Modal open={modal} onClose={() => { setModal(false); setEditing(null); }} title={editing ? 'Edit Event' : 'Add Event'}>
        <div className="p-6 space-y-4">
          <div><label className="label">Event Title *</label>
            <input className="input" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} /></div>
          <div><label className="label">Description</label>
            <textarea className="input min-h-20 resize-none" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Date *</label>
              <input type="date" className="input" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} /></div>
            <div><label className="label">Venue *</label>
              <input className="input" value={form.venue} onChange={e => setForm(f => ({ ...f, venue: e.target.value }))} /></div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button className="btn-secondary" onClick={() => setModal(false)}>Cancel</button>
            <button className="btn-primary" onClick={save} disabled={loading}>{loading ? 'Saving...' : editing ? 'Update' : 'Add'}</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
