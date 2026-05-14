import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import SidebarLayout from '../../components/SidebarLayout';
import {
  LayoutDashboard, Megaphone, BookOpen, ClipboardList,
  Calendar, Users, BarChart3, MessageSquare, CheckCircle
} from 'lucide-react';

import AdminHome from './AdminHome';
import AnnouncementsMgmt from './AnnouncementsMgmt';
import ExamsMgmt from './ExamsMgmt';
import AssignmentsMgmt from './AssignmentsMgmt';
import EventsMgmt from './EventsMgmt';
import StudentMatrix from './StudentMatrix';
import CRApprovals from './CRApprovals';
import Analytics from './Analytics';

const NAV = [
  { path: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { path: '/admin/announcements', label: 'Announcements', icon: Megaphone },
  { path: '/admin/exams', label: 'Examinations', icon: BookOpen },
  { path: '/admin/assignments', label: 'Assignments', icon: ClipboardList },
  { path: '/admin/events', label: 'Events', icon: Calendar },
  { path: '/admin/matrix', label: 'Student Matrix', icon: Users },
  { path: '/admin/cr-approvals', label: 'CR Approvals', icon: CheckCircle },
  { path: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
];

export default function AdminDashboard() {
  return (
    <SidebarLayout navItems={NAV} title="Admin" role="admin">
      <Routes>
        <Route index element={<AdminHome />} />
        <Route path="announcements" element={<AnnouncementsMgmt />} />
        <Route path="exams" element={<ExamsMgmt />} />
        <Route path="assignments" element={<AssignmentsMgmt />} />
        <Route path="events" element={<EventsMgmt />} />
        <Route path="matrix" element={<StudentMatrix />} />
        <Route path="cr-approvals" element={<CRApprovals />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </SidebarLayout>
  );
}
