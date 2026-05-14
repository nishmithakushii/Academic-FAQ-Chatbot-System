import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Users, Megaphone, BookOpen, ClipboardList, Calendar, AlertTriangle, CheckCircle, TrendingUp, MessageSquare } from 'lucide-react';
import StatCard from '../../components/StatCard';
import { useAuth } from '../../contexts/AuthContext';

export default function AdminHome() {
  const [analytics, setAnalytics] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    axios.get('/analytics').then(r => setAnalytics(r.data)).catch(() => {});
  }, []);

  const now = new Date();
  const greeting = now.getHours() < 12 ? 'Good morning' : now.getHours() < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
          {greeting}, {user?.name?.split(' ')[0] || 'Admin'} 👋
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Here's your academic system overview for today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Total Students" value={analytics?.totalStudents ?? '—'} color="primary" />
        <StatCard icon={AlertTriangle} label="Fee Pending" value={analytics?.feePending ?? '—'} sub="Students with unpaid fees" color="amber" />
        <StatCard icon={TrendingUp} label="Avg. Attendance" value={analytics ? `${analytics.avgAttendance}%` : '—'} color="green" />
        <StatCard icon={TrendingUp} label="Avg. CGPA" value={analytics?.avgCGPA ?? '—'} color="blue" />
        <StatCard icon={Megaphone} label="Announcements" value={analytics?.totalAnnouncements ?? '—'} color="violet" />
        <StatCard icon={CheckCircle} label="Pending CR Approvals" value={analytics?.pendingCRApprovals ?? '—'} color="amber" />
        <StatCard icon={BookOpen} label="Exams Scheduled" value={analytics?.totalExams ?? '—'} color="primary" />
        <StatCard icon={MessageSquare} label="Chatbot Queries" value={analytics?.totalChatLogs ?? '—'} color="green" />
      </div>

      {/* Top Rankers */}
      {analytics?.topRankers?.length > 0 && (
        <div className="card p-5">
          <h2 className="font-display font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            🏆 Top Rankers
          </h2>
          <div className="space-y-3">
            {analytics.topRankers.map((s, i) => (
              <div key={s.student_id} className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800 last:border-0">
                <div className="flex items-center gap-3">
                  <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? 'bg-yellow-100 text-yellow-700' : i === 1 ? 'bg-slate-100 text-slate-600' : i === 2 ? 'bg-amber-100 text-amber-700' : 'bg-slate-50 text-slate-500'}`}>
                    #{s.rank}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">{s.name}</p>
                    <p className="text-xs text-slate-400">{s.student_id}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-primary-600">{s.cgpa} CGPA</p>
                  <p className="text-xs text-slate-400">{s.attendance}% attendance</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Low attendance alert */}
      {analytics?.lowAttendance > 0 && (
        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-2xl p-4 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-amber-800 dark:text-amber-400">{analytics.lowAttendance} student(s) have attendance below 75%</p>
            <p className="text-xs text-amber-600 dark:text-amber-500 mt-0.5">Consider sending attendance warning notices.</p>
          </div>
        </div>
      )}
    </div>
  );
}
