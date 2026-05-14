import React, { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2, BookOpen, MapPin, Clock } from 'lucide-react';
import Modal from '../../components/Modal';

const EMPTY = { subject: '', exam_date: '', time: '', venue: '', department: 'All', semester: 'All' };

export default function ExamsMgmt() {
  const [items, setItems] = useState([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(false);

  const load = () => axios.get('/exams').then(r => setItems(r.data));
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!form.subject || !form.exam_date || !form.time || !form.venue) return toast.error('Fill all required fields');
    setLoading(true);
    try {
      if (editing) { await axios.put(`/exams/${editing}`, form); toast.success('Exam updated'); }
      else { await axios.post('/exams', form); toast.success('Exam added'); }
      setModal(false); setEditing(null); setForm(EMPTY); load();
    } catch (e) { toast.error('Error saving exam'); }
    finally { setLoading(false); }
  };

  const del = async (id) => {
    if (!confirm('Delete exam?')) return;
    await axios.delete(`/exams/${id}`); toast.success('Deleted'); load();
  };

  const openEdit = (item) => {
    setForm({ subject: item.subject, exam_date: item.exam_date, time: item.time, venue: item.venue, department: item.department || 'All', semester: item.semester || 'All' });
    setEditing(item.id); setModal(true);
  };

  return (
    <div className="p-6 space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">Examination Schedule</h1>
          <p className="text-sm text-slate-500 mt-0.5">{items.length} exams scheduled</p>
        </div>
        <button className="btn-primary" onClick={() => { setForm(EMPTY); setEditing(null); setModal(true); }}>
          <Plus className="w-4 h-4" /> Add Exam
        </button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.length === 0 && (
          <div className="col-span-full card p-12 text-center">
            <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">No exams scheduled</p>
          </div>
        )}
        {items.map(item => (
          <div key={item.id} className="card p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-950/30 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-primary-600" />
              </div>
              <div className="flex gap-1">
                <button onClick={() => openEdit(item)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-primary-600 transition-colors">
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => del(item.id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 text-slate-400 hover:text-red-600 transition-colors">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            <h3 className="font-semibold text-slate-900 dark:text-white text-sm">{item.subject}</h3>
            <div className="mt-3 space-y-1.5">
              <p className="flex items-center gap-2 text-xs text-slate-500">
                <span className="font-medium text-slate-700 dark:text-slate-300">📅</span> {item.exam_date}
              </p>
              <p className="flex items-center gap-2 text-xs text-slate-500">
                <Clock className="w-3 h-3" /> {item.time}
              </p>
              <p className="flex items-center gap-2 text-xs text-slate-500">
                <MapPin className="w-3 h-3" /> {item.venue}
              </p>
            </div>
          </div>
        ))}
      </div>

      <Modal open={modal} onClose={() => { setModal(false); setEditing(null); }} title={editing ? 'Edit Exam' : 'Add Exam'}>
        <div className="p-6 space-y-4">
          <div><label className="label">Subject *</label>
            <input className="input" value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} placeholder="e.g. Database Management Systems" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Exam Date *</label>
              <input type="date" className="input" value={form.exam_date} onChange={e => setForm(f => ({ ...f, exam_date: e.target.value }))} /></div>
            <div><label className="label">Time *</label>
              <input className="input" value={form.time} onChange={e => setForm(f => ({ ...f, time: e.target.value }))} placeholder="e.g. 10:00 AM - 1:00 PM" /></div>
          </div>
          <div><label className="label">Venue *</label>
            <input className="input" value={form.venue} onChange={e => setForm(f => ({ ...f, venue: e.target.value }))} placeholder="e.g. Hall A - Block 2" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Department</label>
              <input className="input" value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))} placeholder="All" /></div>
            <div><label className="label">Semester</label>
              <input className="input" value={form.semester} onChange={e => setForm(f => ({ ...f, semester: e.target.value }))} placeholder="All" /></div>
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
