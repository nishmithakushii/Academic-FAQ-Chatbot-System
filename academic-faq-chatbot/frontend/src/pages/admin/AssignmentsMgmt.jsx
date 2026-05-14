import React, { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2, ClipboardList } from 'lucide-react';
import Modal from '../../components/Modal';

const EMPTY = { subject: '', description: '', deadline: '', department: 'All', semester: 'All' };

export default function AssignmentsMgmt() {
  const [items, setItems] = useState([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(false);

  const load = () => axios.get('/assignments').then(r => setItems(r.data));
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!form.subject || !form.description || !form.deadline) return toast.error('Fill required fields');
    setLoading(true);
    try {
      if (editing) { await axios.put(`/assignments/${editing}`, form); toast.success('Assignment updated'); }
      else { await axios.post('/assignments', form); toast.success('Assignment added'); }
      setModal(false); setEditing(null); setForm(EMPTY); load();
    } catch { toast.error('Error'); } finally { setLoading(false); }
  };

  const del = async (id) => {
    if (!confirm('Delete?')) return;
    await axios.delete(`/assignments/${id}`); toast.success('Deleted'); load();
  };

  const openEdit = (item) => {
    setForm({ subject: item.subject, description: item.description, deadline: item.deadline, department: item.department, semester: item.semester });
    setEditing(item.id); setModal(true);
  };

  const daysLeft = (deadline) => {
    const d = Math.ceil((new Date(deadline) - new Date()) / 86400000);
    return d;
  };

  return (
    <div className="p-6 space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">Assignments</h1>
          <p className="text-sm text-slate-500 mt-0.5">{items.length} assignments</p>
        </div>
        <button className="btn-primary" onClick={() => { setForm(EMPTY); setEditing(null); setModal(true); }}>
          <Plus className="w-4 h-4" /> Add Assignment
        </button>
      </div>

      <div className="space-y-3">
        {items.length === 0 && (
          <div className="card p-12 text-center">
            <ClipboardList className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">No assignments</p>
          </div>
        )}
        {items.map(item => {
          const days = daysLeft(item.deadline);
          return (
            <div key={item.id} className="card p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="badge badge-normal">{item.subject}</span>
                    <span className={`badge ${days < 0 ? 'bg-red-100 text-red-700' : days <= 2 ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}`}>
                      {days < 0 ? 'Overdue' : days === 0 ? 'Due today' : `${days}d left`}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{item.description}</p>
                  <p className="text-xs text-slate-400 mt-2">📅 Deadline: {item.deadline}</p>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <button onClick={() => openEdit(item)} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-primary-600 transition-colors">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button onClick={() => del(item.id)} className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <Modal open={modal} onClose={() => { setModal(false); setEditing(null); }} title={editing ? 'Edit Assignment' : 'Add Assignment'}>
        <div className="p-6 space-y-4">
          <div><label className="label">Subject *</label>
            <input className="input" value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} placeholder="Subject name" /></div>
          <div><label className="label">Description *</label>
            <textarea className="input min-h-24 resize-none" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Assignment instructions..." /></div>
          <div><label className="label">Deadline *</label>
            <input type="date" className="input" value={form.deadline} onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Department</label>
              <input className="input" value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))} /></div>
            <div><label className="label">Semester</label>
              <input className="input" value={form.semester} onChange={e => setForm(f => ({ ...f, semester: e.target.value }))} /></div>
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
