import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { User, Trophy, TrendingUp, BookOpen, GraduationCap } from 'lucide-react';

export default function StudentProfile() {
  const { user } = useAuth();
  const [matrix, setMatrix] = useState(null);

  useEffect(() => {
    axios.get('/matrix').then(r => setMatrix(r.data)).catch(() => {});
  }, []);

  const feeColor = { paid: 'text-green-600 bg-green-50', pending: 'text-amber-600 bg-amber-50', partial: 'text-orange-600 bg-orange-50' };
  const initials = (name) => name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'S';

  return (
    <div className="p-6 space-y-6 animate-fade-in max-w-2xl mx-auto">
      <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">My Profile</h1>

      {/* Profile Card */}
      <div className="card p-6">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary-500 to-violet-600 flex items-center justify-center shadow-xl flex-shrink-0">
            <span className="text-2xl font-display font-bold text-white">{initials(user?.name)}</span>
          </div>
          <div>
            <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white">{user?.name}</h2>
            <p className="text-slate-500 text-sm mt-0.5">{user?.student_id}</p>
            <div className="flex flex-wrap gap-2 mt-2">
              <span className="badge badge-normal">{user?.department}</span>
              <span className="badge bg-violet-100 text-violet-700">Semester {user?.semester}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Academic Stats */}
      {matrix && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="card p-4 text-center">
              <Trophy className="w-5 h-5 text-yellow-600 mx-auto mb-1" />
              <p className="text-xl font-display font-bold text-slate-900 dark:text-white">#{matrix.rank}</p>
              <p className="text-xs text-slate-500">Class Rank</p>
            </div>
            <div className="card p-4 text-center">
              <TrendingUp className="w-5 h-5 text-primary-600 mx-auto mb-1" />
              <p className="text-xl font-display font-bold text-slate-900 dark:text-white">{matrix.cgpa}</p>
              <p className="text-xs text-slate-500">CGPA</p>
            </div>
            <div className="card p-4 text-center">
              <BookOpen className="w-5 h-5 text-green-600 mx-auto mb-1" />
              <p className={`text-xl font-display font-bold ${matrix.attendance >= 75 ? 'text-slate-900 dark:text-white' : 'text-red-600'}`}>{matrix.attendance}%</p>
              <p className="text-xs text-slate-500">Attendance</p>
            </div>
            <div className={`card p-4 text-center`}>
              <GraduationCap className="w-5 h-5 text-slate-500 mx-auto mb-1" />
              <p className={`text-sm font-bold capitalize mt-1 ${matrix.fee_status === 'paid' ? 'text-green-600' : 'text-amber-600'}`}>{matrix.fee_status}</p>
              <p className="text-xs text-slate-500">Fee Status</p>
            </div>
          </div>

          {/* Subject Marks Table */}
          {matrix.marks_data && Object.keys(matrix.marks_data).length > 0 && (
            <div className="card overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800">
                <h2 className="font-display font-semibold text-slate-900 dark:text-white">Academic Marks</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                      <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Subject</th>
                      <th className="text-center px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Marks</th>
                      <th className="text-center px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Grade</th>
                      <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Performance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(matrix.marks_data).map(([subject, marks]) => {
                      const grade = marks >= 90 ? 'O' : marks >= 80 ? 'A+' : marks >= 70 ? 'A' : marks >= 60 ? 'B+' : marks >= 50 ? 'B' : 'F';
                      const gradeColor = marks >= 75 ? 'text-green-600' : marks >= 60 ? 'text-amber-600' : 'text-red-600';
                      return (
                        <tr key={subject} className="border-b border-slate-100 dark:border-slate-800 last:border-0">
                          <td className="px-5 py-3 font-medium text-slate-800 dark:text-white">{subject}</td>
                          <td className={`px-5 py-3 text-center font-bold ${gradeColor}`}>{marks}/100</td>
                          <td className={`px-5 py-3 text-center font-bold ${gradeColor}`}>{grade}</td>
                          <td className="px-5 py-3">
                            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5">
                              <div className={`h-1.5 rounded-full ${marks >= 75 ? 'bg-green-500' : marks >= 60 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${marks}%` }} />
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {!matrix && (
        <div className="card p-8 text-center">
          <User className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500">Academic records not found. Please contact the admin to update your data.</p>
        </div>
      )}
    </div>
  );
}
