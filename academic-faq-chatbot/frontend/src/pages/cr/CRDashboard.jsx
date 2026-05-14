import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import SidebarLayout from '../../components/SidebarLayout';
import { LayoutDashboard, Megaphone, PlusCircle } from 'lucide-react';
import CRHome from './CRHome';
import CRAnnouncements from './CRAnnouncements';

const NAV = [
  { path: '/cr', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { path: '/cr/announcements', label: 'My Announcements', icon: Megaphone },
];

export default function CRDashboard() {
  return (
    <SidebarLayout navItems={NAV} title="Class Rep" role="cr">
      <Routes>
        <Route index element={<CRHome />} />
        <Route path="announcements" element={<CRAnnouncements />} />
        <Route path="*" element={<Navigate to="/cr" replace />} />
      </Routes>
    </SidebarLayout>
  );
}
