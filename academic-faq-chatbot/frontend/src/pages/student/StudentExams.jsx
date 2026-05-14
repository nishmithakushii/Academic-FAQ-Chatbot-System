import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BookOpen, Clock, MapPin } from 'lucide-react';

export function StudentExams() {
  const [exams, setExams] = useState([]);
  useEffect(() => { axios.get('/exams').then(r => setExams(r.data)); }, []);

  const daysUntil = (d) => Math.ceil((new Date(d) - new Date()) / 86400000);

  return (
    <div className="p-6 space-y-5 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">Examination Schedule</h1>
        <p className="text-sm text-slate-500 mt-0.5">{exams.length} exams scheduled</p>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        {exams.length === 0 && (
          <div className="col-span-full card p-12 text-center">
            <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">No exams scheduled yet</p>
          </div>
        )}
        {exams.map(exam => {
          const days = daysUntil(exam.exam_date);
          return (
            <div key={exam.id} className="card p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="w-12 h-12 rounded-2xl bg-primary-50 dark:bg-primary-950/30 flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-primary-600" />
                </div>
                <span className={`badge text-xs ${days < 0 ? 'bg-slate-100 text-slate-500' : days <= 3 ? 'bg-red-100 text-red-700' : days <= 7 ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}`}>
                  {days < 0 ? 'Completed' : days === 0 ? 'Today!' : `${days} days left`}
                </span>
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-white">{exam.subject}</h3>
              <div className="mt-3 space-y-1.5 text-sm text-slate-500">
                <p className="flex items-center gap-2">📅 <span className="font-medium text-slate-700 dark:text-slate-300">{exam.exam_date}</span></p>
                <p className="flex items-center gap-2"><Clock className="w-3.5 h-3.5" /> {exam.time}</p>
                <p className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5" /> {exam.venue}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function StudentAssignments() {
  const [assignments, setAssignments] = useState([]);
  useEffect(() => { axios.get('/assignments').then(r => setAssignments(r.data)); }, []);

  const daysLeft = (d) => Math.ceil((new Date(d) - new Date()) / 86400000);

  return (
    <div className="p-6 space-y-5 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">Assignments</h1>
        <p className="text-sm text-slate-500 mt-0.5">{assignments.length} assignments</p>
      </div>
      <div className="space-y-3">
        {assignments.length === 0 && (
          <div className="card p-12 text-center">
            <p className="text-slate-400">No assignments found</p>
          </div>
        )}
        {assignments.map(a => {
          const days = daysLeft(a.deadline);
          return (
            <div key={a.id} className={`card p-5 border-l-4 ${days < 0 ? 'border-slate-300' : days <= 2 ? 'border-red-400' : 'border-green-400'}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="badge badge-normal">{a.subject}</span>
                    <span className={`badge ${days < 0 ? 'bg-slate-100 text-slate-500' : days === 0 ? 'bg-red-100 text-red-700' : days <= 2 ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}`}>
                      {days < 0 ? 'Past due' : days === 0 ? '⚠ Due today!' : `${days} days left`}
                    </span>
                  </div>
                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{a.description}</p>
                  <p className="text-xs text-slate-400 mt-2">📅 Deadline: <span className="font-medium">{a.deadline}</span></p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function StudentEvents() {
  const [events, setEvents] = useState([]);
  useEffect(() => { axios.get('/events').then(r => setEvents(r.data)); }, []);

  const daysUntil = (d) => Math.ceil((new Date(d) - new Date()) / 86400000);

  return (
    <div className="p-6 space-y-5 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">Events</h1>
        <p className="text-sm text-slate-500 mt-0.5">{events.length} upcoming events</p>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        {events.length === 0 && (
          <div className="col-span-full card p-12 text-center">
            <p className="text-slate-400">No events at the moment</p>
          </div>
        )}
        {events.map(event => {
          const days = daysUntil(event.date);
          return (
            <div key={event.id} className="card p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex flex-col items-center justify-center flex-shrink-0 shadow-lg">
                  <span className="text-white text-lg font-bold leading-none">{new Date(event.date).getDate()}</span>
                  <span className="text-violet-200 text-xs">{new Date(event.date).toLocaleString('default', { month: 'short' })}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-slate-900 dark:text-white text-sm">{event.title}</h3>
                    {days >= 0 && <span className={`badge ${days === 0 ? 'bg-red-100 text-red-700' : days <= 7 ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>{days === 0 ? 'Today' : `${days}d`}</span>}
                  </div>
                  <p className="text-xs text-slate-400 flex items-center gap-1"><MapPin className="w-3 h-3" /> {event.venue}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">{event.description}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default StudentExams;
