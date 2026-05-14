import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { CheckCircle, Clock, XCircle, Megaphone, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function CRHome() {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState([]);

  useEffect(() => {
    axios.get('/announcements/cr').then(r => setAnnouncements(r.data));
  }, []);

  const pending = announcements.filter(a => a.status === 'pending').length;
  const approved = announcements.filter(a => a.status === 'approved').length;
  const rejected = announcements.filter(a => a.status === 'rejected').length;

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
          Welcome, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p className="text-slate-500 text-sm mt-1">Class Representative — {user?.department}, Sem {user?.semester}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card p-5 text-center">
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center mx-auto mb-2">
            <Clock className="w-5 h-5 text-amber-600" />
          </div>
          <p className="text-2xl font-display font-bold text-slate-900 dark:text-white">{pending}</p>
          <p className="text-xs text-slate-500 mt-0.5">Pending</p>
        </div>
        <div className="card p-5 text-center">
          <div className="w-10 h-10 rounded-xl bg-green-50 dark:bg-green-950/30 flex items-center justify-center mx-auto mb-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-2xl font-display font-bold text-slate-900 dark:text-white">{approved}</p>
          <p className="text-xs text-slate-500 mt-0.5">Approved</p>
        </div>
        <div className="card p-5 text-center">
          <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-950/30 flex items-center justify-center mx-auto mb-2">
            <XCircle className="w-5 h-5 text-red-600" />
          </div>
          <p className="text-2xl font-display font-bold text-slate-900 dark:text-white">{rejected}</p>
          <p className="text-xs text-slate-500 mt-0.5">Rejected</p>
        </div>
      </div>

      {/* Info box */}
      <div className="bg-violet-50 dark:bg-violet-950/30 border border-violet-200 dark:border-violet-800/50 rounded-2xl p-5">
        <div className="flex items-start gap-3">
          <Megaphone className="w-5 h-5 text-violet-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-violet-800 dark:text-violet-300 text-sm">How CR Announcements Work</p>
            <p className="text-violet-600 dark:text-violet-400 text-xs mt-1 leading-relaxed">
              Create an announcement → It goes to Admin for review → Once approved, it appears on student dashboards and the chatbot. Rejected announcements will include admin feedback.
            </p>
          </div>
        </div>
      </div>

      <Link to="/cr/announcements" className="btn-primary w-full justify-center py-3">
        <Megaphone className="w-4 h-4" /> Manage My Announcements <ArrowRight className="w-4 h-4" />
      </Link>

      {/* Recent */}
      {announcements.length > 0 && (
        <div className="card p-5">
          <h2 className="font-display font-semibold text-slate-900 dark:text-white mb-4">Recent Submissions</h2>
          <div className="space-y-3">
            {announcements.slice(0, 3).map(a => (
              <div key={a.id} className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800 last:border-0">
                <div>
                  <p className="text-sm font-medium text-slate-800 dark:text-white">{a.title}</p>
                  <p className="text-xs text-slate-400">{a.date}</p>
                </div>
                <span className={`badge badge-${a.status}`}>{a.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
