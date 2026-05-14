import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { Trophy, TrendingUp, AlertCircle, CheckCircle, BookOpen, ClipboardList, Calendar, Megaphone, Bot, ArrowRight } from 'lucide-react';

export default function StudentHome() {
  const { user } = useAuth();
  const [matrix, setMatrix] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [exams, setExams] = useState([]);
  const [assignments, setAssignments] = useState([]);

  useEffect(() => {
    axios.get('/matrix').then(r => setMatrix(r.data)).catch(() => {});
    axios.get('/announcements').then(r => setAnnouncements(r.data.slice(0, 3)));
    axios.get('/exams').then(r => setExams(r.data.slice(0, 3)));
    axios.get('/assignments').then(r => setAssignments(r.data.slice(0, 3)));
  }, []);

  const greeting = () => {
    const h = new Date().getHours();
    return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
  };

  const feeColor = { paid: 'text-green-600', pending: 'text-amber-600', partial: 'text-orange-600' };
  const feeIcon = { paid: <CheckCircle className="w-4 h-4" />, pending: <AlertCircle className="w-4 h-4" />, partial: <AlertCircle className="w-4 h-4" /> };

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Greeting */}
      <div>
        <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
          {greeting()}, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p className="text-slate-500 text-sm mt-1">{user?.department} • Semester {user?.semester} • {user?.student_id}</p>
      </div>

      {/* Personal Matrix Cards */}
      {matrix && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="card p-4 text-center">
            <div className="w-10 h-10 rounded-xl bg-yellow-50 dark:bg-yellow-950/30 flex items-center justify-center mx-auto mb-2">
              <Trophy className="w-5 h-5 text-yellow-600" />
            </div>
            <p className="text-2xl font-display font-bold text-slate-900 dark:text-white">#{matrix.rank}</p>
            <p className="text-xs text-slate-500">Class Rank</p>
          </div>
          <div className="card p-4 text-center">
            <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-950/30 flex items-center justify-center mx-auto mb-2">
              <TrendingUp className="w-5 h-5 text-primary-600" />
            </div>
            <p className="text-2xl font-display font-bold text-slate-900 dark:text-white">{matrix.cgpa}</p>
            <p className="text-xs text-slate-500">CGPA</p>
          </div>
          <div className="card p-4 text-center">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2 ${matrix.attendance >= 75 ? 'bg-green-50 dark:bg-green-950/30' : 'bg-red-50 dark:bg-red-950/30'}`}>
              <TrendingUp className={`w-5 h-5 ${matrix.attendance >= 75 ? 'text-green-600' : 'text-red-600'}`} />
            </div>
            <p className={`text-2xl font-display font-bold ${matrix.attendance >= 75 ? 'text-slate-900 dark:text-white' : 'text-red-600'}`}>{matrix.attendance}%</p>
            <p className="text-xs text-slate-500">Attendance</p>
            {matrix.attendance < 75 && <p className="text-xs text-red-500 mt-0.5">⚠ Below 75%</p>}
          </div>
          <div className="card p-4 text-center">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2 ${matrix.fee_status === 'paid' ? 'bg-green-50 dark:bg-green-950/30' : 'bg-amber-50 dark:bg-amber-950/30'}`}>
              <span className={feeColor[matrix.fee_status]}>{feeIcon[matrix.fee_status]}</span>
            </div>
            <p className={`text-sm font-bold capitalize ${feeColor[matrix.fee_status]}`}>{matrix.fee_status}</p>
            <p className="text-xs text-slate-500">Fee Status</p>
          </div>
        </div>
      )}

      {/* Subject Marks */}
      {matrix?.marks_data && Object.keys(matrix.marks_data).length > 0 && (
        <div className="card p-5">
          <h2 className="font-display font-semibold text-slate-900 dark:text-white mb-4">📊 Subject-wise Marks</h2>
          <div className="space-y-3">
            {Object.entries(matrix.marks_data).map(([subject, marks]) => (
              <div key={subject} className="flex items-center gap-3">
                <p className="text-sm text-slate-700 dark:text-slate-300 w-40 flex-shrink-0 font-medium">{subject}</p>
                <div className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-500 ${marks >= 75 ? 'bg-green-500' : marks >= 60 ? 'bg-amber-500' : 'bg-red-500'}`}
                    style={{ width: `${marks}%` }}
                  />
                </div>
                <span className={`text-sm font-bold w-10 text-right flex-shrink-0 ${marks >= 75 ? 'text-green-600' : marks >= 60 ? 'text-amber-600' : 'text-red-600'}`}>{marks}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { to: '/student/announcements', icon: Megaphone, label: 'Announcements', count: announcements.length, color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/30' },
          { to: '/student/exams', icon: BookOpen, label: 'Exams', count: exams.length, color: 'text-violet-600 bg-violet-50 dark:bg-violet-950/30' },
          { to: '/student/assignments', icon: ClipboardList, label: 'Assignments', count: assignments.length, color: 'text-orange-600 bg-orange-50 dark:bg-orange-950/30' },
          { to: '/student/chatbot', icon: Bot, label: 'Ask AI', count: null, color: 'text-primary-600 bg-primary-50 dark:bg-primary-950/30' },
        ].map(item => (
          <Link key={item.to} to={item.to} className="card p-4 hover:shadow-md transition-all hover:-translate-y-0.5 flex flex-col items-center text-center gap-2">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${item.color}`}>
              <item.icon className="w-5 h-5" />
            </div>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{item.label}</p>
            {item.count !== null && <span className="text-xs text-slate-400">{item.count} items</span>}
          </Link>
        ))}
      </div>

      {/* Latest Announcements Preview */}
      {announcements.length > 0 && (
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-slate-900 dark:text-white">Latest Announcements</h2>
            <Link to="/student/announcements" className="text-xs text-primary-600 hover:text-primary-700 flex items-center gap-1">View all <ArrowRight className="w-3 h-3" /></Link>
          </div>
          <div className="space-y-3">
            {announcements.map(a => (
              <div key={a.id} className="flex items-start gap-3 py-2 border-b border-slate-100 dark:border-slate-800 last:border-0">
                <span className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 ${a.priority === 'urgent' ? 'bg-red-500' : a.priority === 'high' ? 'bg-orange-400' : 'bg-blue-400'}`} />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-800 dark:text-white truncate">{a.title}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{a.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
