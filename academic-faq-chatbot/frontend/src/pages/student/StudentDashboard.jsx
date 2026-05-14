import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import SidebarLayout from '../../components/SidebarLayout';
import {
  LayoutDashboard, Megaphone, BookOpen,
  ClipboardList, Calendar, Bot, User
} from 'lucide-react';
import StudentHome from './StudentHome';
import StudentAnnouncements from './StudentAnnouncements';
import StudentExams from './StudentExams';
import StudentAssignments from './StudentAssignments';
import StudentEvents from './StudentEvents';
import StudentChatbot from './StudentChatbot';
import StudentProfile from './StudentProfile';

const NAV = [
  { path: '/student', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { path: '/student/announcements', label: 'Announcements', icon: Megaphone },
  { path: '/student/exams', label: 'Exam Schedule', icon: BookOpen },
  { path: '/student/assignments', label: 'Assignments', icon: ClipboardList },
  { path: '/student/events', label: 'Events', icon: Calendar },
  { path: '/student/chatbot', label: 'AI Chatbot', icon: Bot },
  { path: '/student/profile', label: 'My Profile', icon: User },
];

export default function StudentDashboard() {
  return (
    <SidebarLayout navItems={NAV} title="Student" role="student">
      <Routes>
        <Route index element={<StudentHome />} />
        <Route path="announcements" element={<StudentAnnouncements />} />
        <Route path="exams" element={<StudentExams />} />
        <Route path="assignments" element={<StudentAssignments />} />
        <Route path="events" element={<StudentEvents />} />
        <Route path="chatbot" element={<StudentChatbot />} />
        <Route path="profile" element={<StudentProfile />} />
        <Route path="*" element={<Navigate to="/student" replace />} />
      </Routes>
    </SidebarLayout>
  );
}
