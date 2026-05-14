import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import StatCard from '../../components/StatCard';
import { Users, AlertTriangle, TrendingUp, BookOpen } from 'lucide-react';

const PIE_COLORS = ['#22c55e', '#f59e0b', '#f97316'];
const BAR_COLORS = ['#6366f1', '#8b5cf6', '#a78bfa', '#c4b5fd'];

export default function Analytics() {
  const [data, setData] = useState(null);

  useEffect(() => {
    axios.get('/analytics').then(r => setData(r.data)).catch(() => {});
  }, []);

  if (!data) return (
    <div className="p-6 flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">Analytics Dashboard</h1>
        <p className="text-sm text-slate-500 mt-0.5">Academic performance overview</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Total Students" value={data.totalStudents} color="primary" />
        <StatCard icon={AlertTriangle} label="Fee Pending" value={data.feePending} color="amber" />
        <StatCard icon={TrendingUp} label="Avg Attendance" value={`${data.avgAttendance}%`} color="green" />
        <StatCard icon={BookOpen} label="Avg CGPA" value={data.avgCGPA} color="blue" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Attendance Distribution */}
        <div className="card p-5">
          <h2 className="font-display font-semibold text-slate-900 dark:text-white mb-4">Attendance Distribution</h2>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={data.attendanceBuckets} margin={{ top: 5, right: 5, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
              <Bar dataKey="count" fill="#6366f1" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Fee Status */}
        <div className="card p-5">
          <h2 className="font-display font-semibold text-slate-900 dark:text-white mb-4">Fee Status Breakdown</h2>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={data.feeData} dataKey="count" nameKey="label" cx="50%" cy="50%" outerRadius={80} label={({ label, percent }) => `${label} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                {data.feeData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 12, border: 'none' }} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* CGPA Distribution */}
        <div className="card p-5">
          <h2 className="font-display font-semibold text-slate-900 dark:text-white mb-4">CGPA Distribution</h2>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={data.cgpaBuckets} margin={{ top: 5, right: 5, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
              <Bar dataKey="count" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top Rankers */}
        <div className="card p-5">
          <h2 className="font-display font-semibold text-slate-900 dark:text-white mb-4">🏆 Top 5 Rankers</h2>
          <div className="space-y-3">
            {data.topRankers.map((s, i) => (
              <div key={s.student_id} className="flex items-center gap-3">
                <span className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold flex-shrink-0 ${i === 0 ? 'bg-yellow-100 text-yellow-700' : i === 1 ? 'bg-slate-100 text-slate-600' : i === 2 ? 'bg-amber-100 text-amber-700' : 'bg-primary-50 text-primary-600'}`}>
                  #{s.rank}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{s.name}</p>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 mt-1">
                    <div className="bg-primary-500 h-1.5 rounded-full" style={{ width: `${(s.cgpa / 10) * 100}%` }} />
                  </div>
                </div>
                <span className="text-sm font-bold text-primary-600 flex-shrink-0">{s.cgpa}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
